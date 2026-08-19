import {
  CapabilityPurpose,
  type DomainCommand,
  type SystemActor
} from "@neargather/contracts";
import type { ProviderInboundMessageRecord } from "@neargather/db";
import type { InvitationState, NextStep } from "@neargather/domain";
import type {
  InboundSmsClassification,
  NormalizedTwilioInboundMessage
} from "@neargather/providers";

const DELIVERY_WORKER_ACTOR: SystemActor = {
  actorId: "system",
  kind: "SYSTEM",
  subsystem: "DELIVERY_WORKER"
};

const NEUTRAL_SMS_RECOVERY =
  "We couldn't match this message yet. Reply with your invite code or use your invitation link to continue.";

export interface CapabilityAuthorization {
  canReadGuestbook: boolean;
  canSubmitContribution: boolean;
  canUpdateRsvp: boolean;
}

export interface GuestSmsIdentity {
  eventId: string;
  status: "AMBIGUOUS" | "UNKNOWN";
}

export interface VerifiedGuestSmsIdentity {
  eventId: string;
  invitationId: string;
  status: "VERIFIED";
}

export interface ExecuteGuestCommandInput {
  command: DomainCommand;
  providerMessageId: string;
  semanticIdempotencyKey: string;
}

export interface ExecuteGuestCommandResult {
  state: InvitationState;
}

export interface HandleInboundSmsMessageInput {
  executeGuestCommand: (
    input: ExecuteGuestCommandInput
  ) => Promise<ExecuteGuestCommandResult> | ExecuteGuestCommandResult;
  identity: GuestSmsIdentity | VerifiedGuestSmsIdentity;
  inbound: Pick<
    NormalizedTwilioInboundMessage,
    | "body"
    | "classification"
    | "from"
    | "providerMessageId"
    | "rawParameters"
    | "receivedAt"
    | "semanticIdempotencyKey"
    | "to"
  >;
  recordInboundMessage: (
    input: ProviderInboundMessageRecord
  ) => Promise<"RECORDED" | "DUPLICATE"> | "RECORDED" | "DUPLICATE";
  resolveNextStep: (state: InvitationState) => NextStep;
}

export type HandleInboundSmsMessageResult =
  | {
      nextStep: NextStep;
      providerMessageId: string;
      semanticIdempotencyKey: string;
      status: "command_handled";
    }
  | {
      providerMessageId: string;
      semanticIdempotencyKey: string;
      status: "duplicate";
    }
  | {
      replyText: string;
      status: "neutral_recovery";
    };

export function authorizeCapabilityPurpose(
  purpose: CapabilityPurpose
): CapabilityAuthorization {
  switch (purpose) {
    case CapabilityPurpose.INVITATION_RSVP:
      return {
        canReadGuestbook: false,
        canSubmitContribution: true,
        canUpdateRsvp: true
      };
    case CapabilityPurpose.SMS_JOIN:
      return {
        canReadGuestbook: false,
        canSubmitContribution: false,
        canUpdateRsvp: false
      };
    case CapabilityPurpose.MEDIA_UPLOAD:
      return {
        canReadGuestbook: false,
        canSubmitContribution: true,
        canUpdateRsvp: false
      };
    case CapabilityPurpose.ORGANIZER_EXPORT:
      return {
        canReadGuestbook: true,
        canSubmitContribution: false,
        canUpdateRsvp: false
      };
    default: {
      const exhaustive: never = purpose;
      return exhaustive;
    }
  }
}

export function assertGuestInitiatedSmsAllowed(input: {
  authorizationSource: "IMPORTED_PHONE_MATCH" | "VERIFIED_INBOUND";
  verifiedInboundAt?: string;
}): void {
  if (input.authorizationSource === "IMPORTED_PHONE_MATCH") {
    throw new Error(
      "Imported phone numbers never authorize first-touch outbound SMS."
    );
  }

  if (!input.verifiedInboundAt) {
    throw new Error(
      "Outbound SMS requires a verified inbound initiation before any send."
    );
  }
}

export async function handleInboundSmsMessage(
  input: HandleInboundSmsMessageInput
): Promise<HandleInboundSmsMessageResult> {
  const persisted = await input.recordInboundMessage(
    buildInboundMessageRecord(input.inbound, input.identity)
  );

  if (persisted === "DUPLICATE") {
    return {
      providerMessageId: input.inbound.providerMessageId,
      semanticIdempotencyKey: input.inbound.semanticIdempotencyKey,
      status: "duplicate"
    };
  }

  if (input.identity.status !== "VERIFIED") {
    return {
      replyText: NEUTRAL_SMS_RECOVERY,
      status: "neutral_recovery"
    };
  }

  const command = buildGuestCommand(input.identity, input.inbound);

  if (!command) {
    return {
      replyText: NEUTRAL_SMS_RECOVERY,
      status: "neutral_recovery"
    };
  }

  const result = await input.executeGuestCommand({
    command,
    providerMessageId: input.inbound.providerMessageId,
    semanticIdempotencyKey: input.inbound.semanticIdempotencyKey
  });

  return {
    nextStep: input.resolveNextStep(result.state),
    providerMessageId: input.inbound.providerMessageId,
    semanticIdempotencyKey: input.inbound.semanticIdempotencyKey,
    status: "command_handled"
  };
}

function buildInboundMessageRecord(
  inbound: HandleInboundSmsMessageInput["inbound"],
  identity: HandleInboundSmsMessageInput["identity"]
): ProviderInboundMessageRecord {
  return {
    eventId: identity.eventId,
    invitationId: identity.status === "VERIFIED" ? identity.invitationId : null,
    processingStatus: identity.status === "VERIFIED" ? "RECEIVED" : "REJECTED",
    providerInboundMessageId: `${inbound.providerMessageId}:${inbound.semanticIdempotencyKey}`,
    providerMessageId: inbound.providerMessageId,
    providerName: "TWILIO",
    rawReceipt: inbound.rawParameters,
    receivedAt: inbound.receivedAt,
    semanticIdempotencyKey: inbound.semanticIdempotencyKey
  };
}

function buildGuestCommand(
  identity: VerifiedGuestSmsIdentity,
  inbound: HandleInboundSmsMessageInput["inbound"]
): DomainCommand | null {
  switch (inbound.classification.kind) {
    case "ATTENDANCE":
      return buildAttendanceCommand(identity, inbound.classification, inbound);
    case "MESSAGING_KEYWORD":
      return buildOptOutCommand(identity, inbound.classification, inbound);
    case "FREEFORM":
      return null;
  }
}

function buildAttendanceCommand(
  identity: VerifiedGuestSmsIdentity,
  classification: Extract<InboundSmsClassification, { kind: "ATTENDANCE" }>,
  inbound: HandleInboundSmsMessageInput["inbound"]
): DomainCommand {
  return {
    actor: DELIVERY_WORKER_ACTOR,
    channel: "SMS",
    eventId: identity.eventId,
    gatePromptAccepted: false,
    idempotencyKey: inbound.semanticIdempotencyKey,
    invitationId: identity.invitationId,
    response: classification.response,
    type: "attendance.record"
  };
}

function buildOptOutCommand(
  identity: VerifiedGuestSmsIdentity,
  classification: Extract<
    InboundSmsClassification,
    { kind: "MESSAGING_KEYWORD" }
  >,
  inbound: HandleInboundSmsMessageInput["inbound"]
): DomainCommand {
  return {
    actor: DELIVERY_WORKER_ACTOR,
    channel: "SMS",
    eventId: identity.eventId,
    idempotencyKey: inbound.semanticIdempotencyKey,
    invitationId: identity.invitationId,
    keyword: classification.keyword,
    rawInput: inbound.body,
    type: "opt-out.record"
  };
}

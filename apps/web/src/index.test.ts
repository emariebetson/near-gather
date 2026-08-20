import {
  CapabilityPurpose,
  type AdultActor,
  type DomainCommand
} from "@neargather/contracts";
import type { ProviderInboundMessageRecord } from "@neargather/db";
import { RSVPState } from "@neargather/contracts";
import type { InvitationState, NextStep } from "@neargather/domain";
import { describe, expect, it, vi } from "vitest";

import * as webApp from "./index";

interface HandleInboundSmsMessage {
  (input: {
    executeGuestCommand: (input: {
      command: DomainCommand;
      providerMessageId: string;
      semanticIdempotencyKey: string;
    }) => Promise<{ state: InvitationState }> | { state: InvitationState };
    identity:
      | {
          actor: AdultActor;
          eventId: string;
          hasAdultActorAssurance: boolean;
          invitationId: string;
          partySize: "MULTIPLE" | "SINGLE_CONFIRMED" | "UNKNOWN";
          status: "VERIFIED";
        }
      | {
          eventId: string;
          status: "AMBIGUOUS" | "UNKNOWN";
        };
    inbound: {
      body: string;
      classification:
        | { kind: "ATTENDANCE"; response: "YES" | "NO" }
        | { kind: "MESSAGING_KEYWORD"; keyword: "STOP" | "START" | "HELP" }
        | { kind: "FREEFORM"; body: string };
      from: string;
      providerMessageId: string;
      rawParameters: Readonly<Record<string, string>>;
      receivedAt: string;
      semanticIdempotencyKey: string;
      to: string;
    };
    recordInboundMessage: (
      input: ProviderInboundMessageRecord
    ) => Promise<"RECORDED" | "DUPLICATE"> | "RECORDED" | "DUPLICATE";
    resolveNextStep: (state: InvitationState) => NextStep;
  }): Promise<
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
        effect: "HELP" | "RESTORE_SUPPRESSION" | "SUPPRESS";
        providerMessageId: string;
        replyText: string;
        semanticIdempotencyKey: string;
        status: "messaging_only";
      }
    | {
        nextStep: { kind: "COLLECT_ADULT_PARTICIPATION" };
        providerMessageId: string;
        semanticIdempotencyKey: string;
        status: "adult_assurance_required";
      }
    | {
        providerMessageId: string;
        replyText: string;
        semanticIdempotencyKey: string;
        status: "confirmation_required";
      }
    | {
        replyText: string;
        status: "neutral_recovery";
      }
  >;
}

interface CapabilityAuthorizer {
  (purpose: CapabilityPurpose): {
    canReadGuestbook: boolean;
    canSubmitContribution: boolean;
    canUpdateRsvp: boolean;
  };
}

interface GuestInitiatedSmsGuard {
  (input: {
    authorizationSource: "IMPORTED_PHONE_MATCH" | "VERIFIED_INBOUND";
    verifiedInboundAt?: string;
  }): void;
}

function getModule() {
  const module = webApp as unknown as {
    authorizeCapabilityPurpose?: CapabilityAuthorizer;
    assertGuestInitiatedSmsAllowed?: GuestInitiatedSmsGuard;
    handleInboundSmsMessage?: HandleInboundSmsMessage;
  };

  expect(module.handleInboundSmsMessage).toBeTypeOf("function");
  expect(module.assertGuestInitiatedSmsAllowed).toBeTypeOf("function");
  expect(module.authorizeCapabilityPurpose).toBeTypeOf("function");

  return module as {
    authorizeCapabilityPurpose: CapabilityAuthorizer;
    assertGuestInitiatedSmsAllowed: GuestInitiatedSmsGuard;
    handleInboundSmsMessage: HandleInboundSmsMessage;
  };
}

function createState(): InvitationState {
  return {
    answers: [],
    answersComplete: false,
    eventId: "evt_1",
    eventType: "BIRTHDAY",
    gateEvidenceStatus: "PRESENT",
    guardianAuthorityRecords: [],
    honorees: [{ ageCategory: "ADULT", displayName: "Alex", honoreeId: "hon_1" }],
    invitationId: "inv_1",
    onBehalfDisclosureReceipts: [],
    optOutEvents: [],
    policy: {
      adultActorsOnly: true,
      allowImportedPhoneConsent: false,
      allowMinorGuestIdentity: false,
      birthdayFormat: "STANDARD",
      collectChildContactChannels: false,
      eventType: "BIRTHDAY",
      guestInitiatedSmsOnly: true,
      guardianAuthorityRequired: false,
      importedPhonesAreMatchingOnly: true,
      mediaAudience: "HOSTS_ONLY",
      minorHonoreePresent: false,
      minorSubjectsOnly: true,
      prohibitedReuse: ["PUBLIC_POSTING"],
      removalRequestors: ["DEPICTED_PERSON"],
      takedownWorkflowRequired: true
    },
    rsvpGatePromptId: "prompt_rsvp_gate",
    processedIdempotencyKeys: [],
    rsvpState: RSVPState.AWAITING_RESPONSE,
    version: 0
  };
}

const verifiedAdultActor: AdultActor = {
  actorId: "adult_1",
  ageAttested: true,
  role: "RESPONDENT"
};

describe("@neargather/web application services", () => {
  it("deduplicates duplicate webhook keys before executing guest commands", async () => {
    const { handleInboundSmsMessage } = getModule();
    const executeGuestCommand = vi.fn();

    const result = await handleInboundSmsMessage({
      executeGuestCommand,
      identity: {
        actor: verifiedAdultActor,
        eventId: "evt_1",
        hasAdultActorAssurance: true,
        invitationId: "inv_1",
        partySize: "SINGLE_CONFIRMED",
        status: "VERIFIED"
      },
      inbound: {
        body: "NO",
        classification: { kind: "ATTENDANCE", response: "NO" },
        from: "+15550001111",
        providerMessageId: "SM_DUPLICATE",
        rawParameters: {},
        receivedAt: "2026-08-19T13:00:00.000Z",
        semanticIdempotencyKey: "twilio:SM_DUPLICATE:+15550002222",
        to: "+15550002222"
      },
      recordInboundMessage: () => "DUPLICATE",
      resolveNextStep: () => ({ kind: "ASK_ATTENDANCE" })
    });

    expect(result).toEqual({
      providerMessageId: "SM_DUPLICATE",
      semanticIdempotencyKey: "twilio:SM_DUPLICATE:+15550002222",
      status: "duplicate"
    });
    expect(executeGuestCommand).not.toHaveBeenCalled();
  });

  it("rejects outbound SMS unless the guest already initiated a verified inbound exchange", () => {
    const { assertGuestInitiatedSmsAllowed } = getModule();

    expect(() =>
      assertGuestInitiatedSmsAllowed({
        authorizationSource: "IMPORTED_PHONE_MATCH"
      })
    ).toThrow(/imported phone numbers never authorize first-touch outbound sms/i);

    expect(() =>
      assertGuestInitiatedSmsAllowed({
        authorizationSource: "VERIFIED_INBOUND",
        verifiedInboundAt: "2026-08-19T13:05:00.000Z"
      })
    ).not.toThrow();
  });

  it("returns the same neutral recovery for unknown or ambiguous senders and never reveals guest-list membership", async () => {
    const { handleInboundSmsMessage } = getModule();

    async function recover(status: "UNKNOWN" | "AMBIGUOUS") {
      return handleInboundSmsMessage({
        executeGuestCommand: vi.fn(),
        identity: {
          eventId: "evt_1",
          status
        },
        inbound: {
          body: "Hello",
          classification: { kind: "FREEFORM", body: "Hello" },
          from: "+15550003333",
          providerMessageId: `SM_${status}`,
          rawParameters: {},
          receivedAt: "2026-08-19T13:10:00.000Z",
          semanticIdempotencyKey: `twilio:SM_${status}:+15550002222`,
          to: "+15550002222"
        },
        recordInboundMessage: () => "RECORDED",
        resolveNextStep: () => ({ kind: "ASK_ATTENDANCE" })
      });
    }

    const unknown = await recover("UNKNOWN");
    const ambiguous = await recover("AMBIGUOUS");

    expect(unknown).toEqual(ambiguous);
    expect(unknown).toMatchObject({
      status: "neutral_recovery"
    });
    if (unknown.status !== "neutral_recovery") {
      throw new Error("Expected neutral recovery for unmatched senders.");
    }

    expect(unknown.replyText).not.toMatch(/guest list|not invited|invited guest/i);
    expect(unknown.replyText).toMatch(/invite code|invitation link/i);
  });

  it("keeps QR capabilities submit-only and never grants guestbook reads", () => {
    const { authorizeCapabilityPurpose } = getModule();

    expect(authorizeCapabilityPurpose(CapabilityPurpose.MEDIA_UPLOAD)).toEqual({
      canReadGuestbook: false,
      canSubmitContribution: true,
      canUpdateRsvp: false
    });
  });

  it("requires explicit confirmation before a multi-person SMS NO can dispatch attendance.record", async () => {
    const { handleInboundSmsMessage } = getModule();
    const executeGuestCommand = vi.fn();
    const resolveNextStep = vi.fn();

    const result = await handleInboundSmsMessage({
      executeGuestCommand,
      identity: {
        actor: verifiedAdultActor,
        eventId: "evt_1",
        hasAdultActorAssurance: true,
        invitationId: "inv_1",
        partySize: "MULTIPLE",
        status: "VERIFIED"
      },
      inbound: {
        body: "NO",
        classification: { kind: "ATTENDANCE", response: "NO" },
        from: "+15550001111",
        providerMessageId: "SM_NO",
        rawParameters: {},
        receivedAt: "2026-08-19T13:15:00.000Z",
        semanticIdempotencyKey: "twilio:SM_NO:+15550002222",
        to: "+15550002222"
      },
      recordInboundMessage: () => "RECORDED",
      resolveNextStep
    });

    expect(result).toEqual({
      providerMessageId: "SM_NO",
      replyText: expect.stringMatching(/reply\s+NO\s+again|confirm/i),
      semanticIdempotencyKey: "twilio:SM_NO:+15550002222",
      status: "confirmation_required"
    });
    expect(executeGuestCommand).not.toHaveBeenCalled();
    expect(resolveNextStep).not.toHaveBeenCalled();
  });

  it("handles STOP, HELP, and START as messaging-only results without continuing RSVP prompts", async () => {
    const { handleInboundSmsMessage } = getModule();

    async function handleKeyword(keyword: "STOP" | "HELP" | "START") {
      const executeGuestCommand = vi.fn();
      const resolveNextStep = vi.fn();

      const result = await handleInboundSmsMessage({
        executeGuestCommand,
        identity: {
          actor: verifiedAdultActor,
          eventId: "evt_1",
          hasAdultActorAssurance: false,
          invitationId: "inv_1",
          partySize: "SINGLE_CONFIRMED",
          status: "VERIFIED"
        },
        inbound: {
          body: keyword,
          classification: { kind: "MESSAGING_KEYWORD", keyword },
          from: "+15550001111",
          providerMessageId: `SM_${keyword}`,
          rawParameters: {},
          receivedAt: "2026-08-19T13:15:00.000Z",
          semanticIdempotencyKey: `twilio:SM_${keyword}:+15550002222`,
          to: "+15550002222"
        },
        recordInboundMessage: () => "RECORDED",
        resolveNextStep
      });

      expect(executeGuestCommand).not.toHaveBeenCalled();
      expect(resolveNextStep).not.toHaveBeenCalled();

      return result;
    }

    await expect(handleKeyword("STOP")).resolves.toEqual({
      effect: "SUPPRESS",
      providerMessageId: "SM_STOP",
      replyText: expect.stringMatching(/stopped|opted out/i),
      semanticIdempotencyKey: "twilio:SM_STOP:+15550002222",
      status: "messaging_only"
    });
    await expect(handleKeyword("HELP")).resolves.toEqual({
      effect: "HELP",
      providerMessageId: "SM_HELP",
      replyText: expect.stringMatching(/help|stop/i),
      semanticIdempotencyKey: "twilio:SM_HELP:+15550002222",
      status: "messaging_only"
    });
    await expect(handleKeyword("START")).resolves.toEqual({
      effect: "RESTORE_SUPPRESSION",
      providerMessageId: "SM_START",
      replyText: expect.stringMatching(/resumed|started/i),
      semanticIdempotencyKey: "twilio:SM_START:+15550002222",
      status: "messaging_only"
    });
  });

  it("requires adult assurance before verified attendance commands can execute", async () => {
    const { handleInboundSmsMessage } = getModule();
    const executeGuestCommand = vi.fn();
    const resolveNextStep = vi.fn();

    const result = await handleInboundSmsMessage({
      executeGuestCommand,
      identity: {
        actor: verifiedAdultActor,
        eventId: "evt_1",
        hasAdultActorAssurance: false,
        invitationId: "inv_1",
        partySize: "SINGLE_CONFIRMED",
        status: "VERIFIED"
      },
      inbound: {
        body: "YES",
        classification: { kind: "ATTENDANCE", response: "YES" },
        from: "+15550001111",
        providerMessageId: "SM_YES",
        rawParameters: {},
        receivedAt: "2026-08-19T13:20:00.000Z",
        semanticIdempotencyKey: "twilio:SM_YES:+15550002222",
        to: "+15550002222"
      },
      recordInboundMessage: () => "RECORDED",
      resolveNextStep
    });

    expect(result).toEqual({
      nextStep: { kind: "COLLECT_ADULT_PARTICIPATION" },
      providerMessageId: "SM_YES",
      semanticIdempotencyKey: "twilio:SM_YES:+15550002222",
      status: "adult_assurance_required"
    });
    expect(executeGuestCommand).not.toHaveBeenCalled();
    expect(resolveNextStep).not.toHaveBeenCalled();
  });

  it("uses the verified adult actor for single-person attendance commands once adult assurance is present", async () => {
    const { handleInboundSmsMessage } = getModule();
    const executeGuestCommand = vi.fn(() => ({ state: createState() }));
    const resolveNextStep = vi.fn(() => ({ kind: "ASK_ATTENDANCE" as const }));

    const result = await handleInboundSmsMessage({
      executeGuestCommand,
      identity: {
        actor: verifiedAdultActor,
        eventId: "evt_1",
        hasAdultActorAssurance: true,
        invitationId: "inv_1",
        partySize: "SINGLE_CONFIRMED",
        status: "VERIFIED"
      },
      inbound: {
        body: "NO",
        classification: { kind: "ATTENDANCE", response: "NO" },
        from: "+15550001111",
        providerMessageId: "SM_SINGLE_NO",
        rawParameters: {},
        receivedAt: "2026-08-19T13:25:00.000Z",
        semanticIdempotencyKey: "twilio:SM_SINGLE_NO:+15550002222",
        to: "+15550002222"
      },
      recordInboundMessage: () => "RECORDED",
      resolveNextStep
    });

    expect(executeGuestCommand).toHaveBeenCalledWith({
      command: expect.objectContaining({
        actor: verifiedAdultActor,
        channel: "SMS",
        eventId: "evt_1",
        idempotencyKey: "twilio:SM_SINGLE_NO:+15550002222",
        invitationId: "inv_1",
        response: "NO",
        type: "attendance.record"
      }),
      providerMessageId: "SM_SINGLE_NO",
      semanticIdempotencyKey: "twilio:SM_SINGLE_NO:+15550002222"
    });
    expect(resolveNextStep).toHaveBeenCalledWith(createState());
    expect(result).toEqual({
      nextStep: { kind: "ASK_ATTENDANCE" },
      providerMessageId: "SM_SINGLE_NO",
      semanticIdempotencyKey: "twilio:SM_SINGLE_NO:+15550002222",
      status: "command_handled"
    });
  });
});

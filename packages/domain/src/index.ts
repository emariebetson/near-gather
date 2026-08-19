import {
  type AdultActorAssurance,
  type AdultActor,
  type BirthdayFormat,
  type CommandActor,
  type ContributionRef,
  type DomainCommand,
  type EventPolicySnapshot,
  EventType,
  type GuardianAuthorityRecord,
  type Honoree,
  type MessagingSuppression,
  type OnBehalfDisclosureReceipt,
  type OptOutEvent,
  type ProcessingNoticeReceipt,
  type RecordOptOutCommand,
  RSVPState,
  type RSVPState as RSVPStateValue
} from "@neargather/contracts";

const PROHIBITED_REUSE = [
  "PUBLIC_POSTING",
  "MARKETING",
  "AI_TRAINING",
  "TRANSCRIPTION",
  "VOICEPRINT",
  "FACE_RECOGNITION",
  "CLONING",
  "CROSS_PRODUCT_REUSE"
] as const;

const STOP_KEYWORDS = new Set([
  "STOP",
  "QUIT",
  "END",
  "REVOKE",
  "OPT OUT",
  "CANCEL",
  "UNSUBSCRIBE"
]);

export type NextStep =
  | { kind: "COLLECT_ADULT_PARTICIPATION" }
  | { kind: "SHOW_PROCESSING_NOTICE" }
  | { kind: "COLLECT_ON_BEHALF_DISCLOSURE" }
  | { kind: "COLLECT_GUARDIAN_AUTHORITY" }
  | { kind: "ASK_ATTENDANCE" }
  | { kind: "REQUEST_QUALIFYING_CONTRIBUTION" }
  | { kind: "COLLECT_REQUIRED_ANSWERS" }
  | { kind: "CONFIRM_ATTENDING" }
  | { kind: "CONFIRM_EXEMPT" }
  | { kind: "CONFIRM_DECLINED" };

export interface OrganizerExemption {
  grantedAt: string;
  grantedBy: AdultActor;
  reason: string;
}

export interface InvitationState {
  adultActorAssurance?: AdultActorAssurance;
  answers: readonly {
    questionId: string;
    value: string;
  }[];
  answersComplete: boolean;
  attendanceResponse?: "YES" | "NO";
  birthdayFormat?: BirthdayFormat;
  eventId: string;
  eventType: EventType;
  guardianAuthorityRecords: readonly GuardianAuthorityRecord[];
  honorees: readonly Honoree[];
  invitationId: string;
  messagingSuppression?: MessagingSuppression;
  onBehalfDisclosureReceipts: readonly OnBehalfDisclosureReceipt[];
  optOutEvents: readonly OptOutEvent[];
  organizerExemption?: OrganizerExemption;
  policy: EventPolicySnapshot;
  processedIdempotencyKeys: readonly string[];
  processingNoticeReceipt?: ProcessingNoticeReceipt;
  qualifyingContribution?: ContributionRef;
  rsvpGateAcceptedAt?: string;
  rsvpState: RSVPStateValue;
  version: number;
}

export interface CreateInitialInvitationStateInput {
  birthdayFormat?: BirthdayFormat;
  eventId: string;
  eventType: EventType;
  honorees: readonly Honoree[];
  invitationId: string;
}

export function buildEventPolicySnapshot(input: {
  birthdayFormat?: BirthdayFormat;
  eventType: EventType;
  honorees: readonly Honoree[];
}): EventPolicySnapshot {
  const minorHonoreePresent = input.honorees.some(
    (honoree) => honoree.ageCategory === "MINOR"
  );

  return {
    adultActorsOnly: true,
    allowImportedPhoneConsent: false,
    allowMinorGuestIdentity: false,
    collectChildContactChannels: false,
    eventType: input.eventType,
    guestInitiatedSmsOnly: true,
    guardianAuthorityRequired: minorHonoreePresent,
    importedPhonesAreMatchingOnly: true,
    mediaAudience: "HOSTS_ONLY",
    minorHonoreePresent,
    minorSubjectsOnly: true,
    prohibitedReuse: PROHIBITED_REUSE,
    removalRequestors: [
      "PARENT_GUARDIAN",
      "DEPICTED_PERSON",
      "AUTHORIZED_REPRESENTATIVE"
    ],
    takedownWorkflowRequired: true,
    ...(input.eventType === EventType.BIRTHDAY && input.birthdayFormat
      ? { birthdayFormat: input.birthdayFormat }
      : {})
  };
}

export function createInitialInvitationState(
  input: CreateInitialInvitationStateInput
): InvitationState {
  validateInitialInvitationState(input);

  return {
    answers: [],
    answersComplete: false,
    eventId: input.eventId,
    eventType: input.eventType,
    guardianAuthorityRecords: [],
    honorees: input.honorees,
    invitationId: input.invitationId,
    optOutEvents: [],
    onBehalfDisclosureReceipts: [],
    policy: buildEventPolicySnapshot(input),
    processedIdempotencyKeys: [],
    rsvpState: RSVPState.AWAITING_RESPONSE,
    version: 0,
    ...(input.birthdayFormat ? { birthdayFormat: input.birthdayFormat } : {})
  };
}

export function applyCommand(
  state: InvitationState,
  command: DomainCommand
): InvitationState {
  validateEnvelope(state, command);

  if (state.processedIdempotencyKeys.includes(command.idempotencyKey)) {
    return state;
  }

  let nextState = state;

  switch (command.type) {
    case "adult-actor-assurance.record":
    case "adult-participation.record":
      nextState = {
        ...state,
        adultActorAssurance: command.receipt
      };
      break;
    case "processing-notice.record":
      nextState = {
        ...state,
        processingNoticeReceipt: command.receipt
      };
      break;
    case "on-behalf-disclosure.record":
      validateMinorHonoreeReference(state, command.receipt.minorHonoreeId);
      nextState = {
        ...state,
        onBehalfDisclosureReceipts: upsertByMinorHonoreeId(
          state.onBehalfDisclosureReceipts,
          command.receipt
        )
      };
      break;
    case "guardian-authority.record":
      validateMinorHonoreeReference(state, command.receipt.minorHonoreeId);
      if (command.receipt.guardianAdultActorId !== command.receipt.actor.actorId) {
        throw new Error("guardianAdultActorId must reference the attesting adult actor.");
      }

      nextState = {
        ...state,
        guardianAuthorityRecords: upsertByMinorHonoreeId(
          state.guardianAuthorityRecords,
          command.receipt
        )
      };
      break;
    case "attendance.record":
      nextState = command.gatePromptAccepted
        ? {
            ...state,
            attendanceResponse: command.response,
            rsvpGateAcceptedAt: new Date().toISOString()
          }
        : {
            ...state,
            attendanceResponse: command.response
          };
      break;
    case "qualifying-text.accept":
      validateContributionRef(state, command.contribution);
      nextState = {
        ...state,
        qualifyingContribution: command.contribution
      };
      break;
    case "media.finalize":
      validateContributionRef(state, command.contribution);

      if (!command.qualifiesForRsvp) {
        nextState = state;
        break;
      }

      nextState = {
        ...state,
        qualifyingContribution: command.contribution
      };
      break;
    case "answers.record":
      nextState = {
        ...state,
        answers: command.answers,
        answersComplete: command.completedRequiredPrompts
      };
      break;
    case "organizer-exemption.grant":
      if (
        "kind" in command.actor ||
        (command.actor.role !== "ORGANIZER" && command.actor.role !== "COHOST")
      ) {
        throw new Error("Only authenticated organizers or cohosts may grant exemptions.");
      }

      if (command.reason.trim().length === 0) {
        throw new Error("Organizer exemption reason must be non-empty.");
      }

      nextState = {
        ...state,
        organizerExemption: {
          grantedAt: new Date().toISOString(),
          grantedBy: command.actor,
          reason: command.reason.trim()
        }
      };
      break;
    case "opt-out.record":
      nextState = applyOptOut(state, command);
      break;
    default: {
      const exhaustive: never = command;
      return exhaustive;
    }
  }

  return finalizeState(nextState, command.idempotencyKey);
}

export function resolveNextStep(state: InvitationState): NextStep {
  if (!state.adultActorAssurance) {
    return { kind: "COLLECT_ADULT_PARTICIPATION" };
  }

  if (!state.processingNoticeReceipt) {
    return { kind: "SHOW_PROCESSING_NOTICE" };
  }

  if (
    state.policy.guardianAuthorityRequired &&
    !hasCompleteMinorEvidence(state.honorees, state.onBehalfDisclosureReceipts)
  ) {
    return { kind: "COLLECT_ON_BEHALF_DISCLOSURE" };
  }

  if (
    state.policy.guardianAuthorityRequired &&
    !hasCompleteMinorEvidence(state.honorees, state.guardianAuthorityRecords)
  ) {
    return { kind: "COLLECT_GUARDIAN_AUTHORITY" };
  }

  if (state.rsvpState === RSVPState.DECLINED) {
    return { kind: "CONFIRM_DECLINED" };
  }

  if (state.organizerExemption) {
    if (!state.answersComplete) {
      return { kind: "COLLECT_REQUIRED_ANSWERS" };
    }

    return { kind: "CONFIRM_EXEMPT" };
  }

  if (state.attendanceResponse !== "YES") {
    return { kind: "ASK_ATTENDANCE" };
  }

  if (!state.qualifyingContribution) {
    return { kind: "REQUEST_QUALIFYING_CONTRIBUTION" };
  }

  if (!state.answersComplete) {
    return { kind: "COLLECT_REQUIRED_ANSWERS" };
  }

  return { kind: "CONFIRM_ATTENDING" };
}

function applyOptOut(
  state: InvitationState,
  command: RecordOptOutCommand
): InvitationState {
  const keyword = command.keyword.trim().toUpperCase();
  const occurredAt = new Date().toISOString();
  const nextEvent: OptOutEvent = {
    eventId: command.eventId,
    invitationId: command.invitationId,
    keyword,
    occurredAt,
    rawInput: command.rawInput
  };

  if (keyword === "START") {
    const { messagingSuppression: _messagingSuppression, ...rest } = state;

    return {
      ...rest,
      optOutEvents: [...state.optOutEvents, nextEvent]
    };
  }

  if (keyword === "HELP") {
    return {
      ...state,
      optOutEvents: [...state.optOutEvents, nextEvent]
    };
  }

  if (!STOP_KEYWORDS.has(keyword)) {
    throw new Error(`Unsupported messaging keyword: ${command.keyword}`);
  }

  return {
    ...state,
    messagingSuppression: {
      eventId: command.eventId,
      hashedDestination: `suppressed:${command.invitationId}`,
      invitationId: command.invitationId,
      reason: keyword,
      scope: "EVENT",
      suppressedAt: occurredAt
    },
    optOutEvents: [...state.optOutEvents, nextEvent]
  };
}

function finalizeState(
  state: InvitationState,
  idempotencyKey: string
): InvitationState {
  return {
    ...state,
    processedIdempotencyKeys: [...state.processedIdempotencyKeys, idempotencyKey],
    rsvpState: deriveRsvpState(state),
    version: state.version + 1
  };
}

function hasCompleteMinorEvidence<T extends { minorHonoreeId: string }>(
  honorees: readonly Honoree[],
  records: readonly T[]
): boolean {
  const requiredMinorIds = honorees
    .filter((honoree) => honoree.ageCategory === "MINOR")
    .map((honoree) => honoree.honoreeId);

  return requiredMinorIds.every((minorHonoreeId) =>
    records.some((record) => record.minorHonoreeId === minorHonoreeId)
  );
}

function deriveRsvpState(state: InvitationState): RSVPStateValue {
  if (state.attendanceResponse === "NO") {
    return RSVPState.DECLINED;
  }

  if (state.organizerExemption) {
    return state.answersComplete
      ? RSVPState.EXEMPT_COMPLETE
      : RSVPState.EXEMPT_INCOMPLETE;
  }

  if (
    state.attendanceResponse === "YES" &&
    state.qualifyingContribution &&
    state.rsvpGateAcceptedAt
  ) {
    return state.answersComplete
      ? RSVPState.ATTENDING_COMPLETE
      : RSVPState.ATTENDING_INCOMPLETE;
  }

  return RSVPState.AWAITING_RESPONSE;
}

function validateEnvelope(state: InvitationState, command: DomainCommand): void {
  if (command.eventId !== state.eventId || command.invitationId !== state.invitationId) {
    throw new Error("Command envelope must target the same event and invitation.");
  }

  if (
    command.expectedVersion !== undefined &&
    command.expectedVersion !== state.version
  ) {
    throw new Error("Expected version does not match the current invitation state.");
  }

  validateActorBoundary(state.honorees, command.actor);

  switch (command.type) {
    case "adult-actor-assurance.record":
    case "adult-participation.record":
    case "processing-notice.record":
    case "guardian-authority.record":
    case "on-behalf-disclosure.record":
      validateActorBoundary(state.honorees, command.receipt.actor);
      break;
    default:
      break;
  }
}

function validateInitialInvitationState(
  input: CreateInitialInvitationStateInput
): void {
  if (input.eventType === EventType.BIRTHDAY) {
    if (!input.birthdayFormat) {
      throw new Error("birthdayFormat is required for BIRTHDAY events.");
    }

    if (input.honorees.length === 0) {
      throw new Error("Birthday events require at least one honoree.");
    }

    return;
  }

  if (input.birthdayFormat) {
    throw new Error("birthdayFormat may only be supplied for BIRTHDAY events.");
  }
}

function validateActorBoundary(
  honorees: readonly Honoree[],
  actor: CommandActor
): void {
  if ("kind" in actor) {
    return;
  }

  if (!actor.ageAttested) {
    throw new Error("Adult actors must attest that they are 18+.");
  }

  const minorHonoreeIds = new Set(
    honorees
      .filter((honoree) => honoree.ageCategory === "MINOR")
      .map((honoree) => honoree.honoreeId)
  );

  if (minorHonoreeIds.has(actor.actorId)) {
    throw new Error("Minor honorees are subjects only and cannot act in RSVP flows.");
  }
}

function validateContributionRef(
  state: InvitationState,
  contribution: ContributionRef
): void {
  if (
    contribution.eventId !== state.eventId ||
    contribution.invitationId !== state.invitationId
  ) {
    throw new Error(
      "A qualifying contribution must reference the same event and invitation."
    );
  }
}

function validateMinorHonoreeReference(
  state: InvitationState,
  minorHonoreeId: string
): void {
  if (
    !state.honorees.some(
      (honoree) =>
        honoree.honoreeId === minorHonoreeId && honoree.ageCategory === "MINOR"
    )
  ) {
    throw new Error("Minor evidence must target a minor honoree from the same event.");
  }
}

function upsertByMinorHonoreeId<T extends { minorHonoreeId: string }>(
  records: readonly T[],
  nextRecord: T
): readonly T[] {
  const remaining = records.filter(
    (record) => record.minorHonoreeId !== nextRecord.minorHonoreeId
  );

  return [...remaining, nextRecord];
}

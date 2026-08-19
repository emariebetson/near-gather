import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const EventType = {
  WEDDING: "WEDDING",
  BABY_SHOWER: "BABY_SHOWER",
  BIRTHDAY: "BIRTHDAY"
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

export const BirthdayFormat = {
  STANDARD: "STANDARD",
  MILESTONE: "MILESTONE",
  SHARED: "SHARED"
} as const;

export type BirthdayFormat = (typeof BirthdayFormat)[keyof typeof BirthdayFormat];

export const BirthdayPreset = {
  CHILD: BirthdayFormat.STANDARD,
  ADULT: BirthdayFormat.STANDARD,
  MILESTONE: BirthdayFormat.MILESTONE,
  SHARED_HONOREES: BirthdayFormat.SHARED
} as const;

export type BirthdayPreset = BirthdayFormat;

export const RSVPState = {
  AWAITING_RESPONSE: "AWAITING_RESPONSE",
  DECLINED: "DECLINED",
  ATTENDING_INCOMPLETE: "ATTENDING_INCOMPLETE",
  ATTENDING_COMPLETE: "ATTENDING_COMPLETE",
  EXEMPT_INCOMPLETE: "EXEMPT_INCOMPLETE",
  EXEMPT_COMPLETE: "EXEMPT_COMPLETE"
} as const;

export type RSVPState = (typeof RSVPState)[keyof typeof RSVPState];

export const CapabilityPurpose = {
  INVITATION_RSVP: "INVITATION_RSVP",
  SMS_JOIN: "SMS_JOIN",
  MEDIA_UPLOAD: "MEDIA_UPLOAD",
  ORGANIZER_EXPORT: "ORGANIZER_EXPORT"
} as const;

export type CapabilityPurpose =
  (typeof CapabilityPurpose)[keyof typeof CapabilityPurpose];

export type AdultRole =
  | "ORGANIZER"
  | "COHOST"
  | "RESPONDENT"
  | "CONTRIBUTOR"
  | "UPLOADER";

export interface AdultActor {
  actorId: string;
  ageAttested: true;
  role: AdultRole;
}

export interface SystemActor {
  actorId: "system";
  kind: "SYSTEM";
  subsystem: "MEDIA_PIPELINE" | "DELIVERY_WORKER";
}

export type CommandActor = AdultActor | SystemActor;

export type Channel =
  | "WEB"
  | "SMS"
  | "QR"
  | "ORGANIZER_DASHBOARD"
  | "SYSTEM";

export type MessagePurpose = "EVENT_TRANSACTIONAL" | "MARKETING";

export type MediaAudience = "HOSTS_ONLY";

export type ProhibitedReuse =
  | "PUBLIC_POSTING"
  | "MARKETING"
  | "AI_TRAINING"
  | "TRANSCRIPTION"
  | "VOICEPRINT"
  | "FACE_RECOGNITION"
  | "CLONING"
  | "CROSS_PRODUCT_REUSE";

export interface EventPolicySnapshot {
  adultActorsOnly: true;
  allowImportedPhoneConsent: false;
  allowMinorGuestIdentity: false;
  birthdayFormat?: BirthdayFormat;
  collectChildContactChannels: false;
  eventType: EventType;
  guestInitiatedSmsOnly: true;
  guardianAuthorityRequired: boolean;
  importedPhonesAreMatchingOnly: true;
  mediaAudience: MediaAudience;
  minorHonoreePresent: boolean;
  minorSubjectsOnly: true;
  prohibitedReuse: readonly ProhibitedReuse[];
  removalRequestors: readonly DataRightsRequest["requesterType"][];
  takedownWorkflowRequired: true;
}

export interface Honoree {
  ageCategory: "ADULT" | "MINOR";
  displayName: string;
  honoreeId: string;
  milestoneLabel?: string;
}

export interface AdultActorAssurance {
  actor: AdultActor;
  channel: Channel;
  eventId: string;
  invitationId: string;
  receiptId: string;
  recordedAt: string;
  role: AdultRole;
}

export type AdultParticipationReceipt = AdultActorAssurance;

export interface GuardianAuthorityRecord {
  actor: AdultActor;
  childRelationship?: string;
  disclosureAccepted: boolean;
  eventId: string;
  invitationId: string;
  purpose: string;
  receiptId: string;
  recordedAt: string;
}

export type GuardianAuthorityAttestation = GuardianAuthorityRecord;

export interface OnBehalfDisclosureReceipt {
  actor: AdultActor;
  eventId: string;
  invitationId: string;
  receiptId: string;
  recordedAt: string;
  scope:
    | "MINOR_HONOREE_PARTICIPATION"
    | "MINOR_DEPICTED_PERSON_REMOVAL"
    | "MINOR_TAKEDOWN_REQUEST";
}

export interface ProcessingNoticeReceipt {
  actor: AdultActor;
  audience: MediaAudience;
  categories: readonly string[];
  channel: Channel;
  eventId: string;
  invitationId: string;
  noticeVersion: string;
  purpose: MessagePurpose;
  receiptId: string;
  recordedAt: string;
  retentionUntil: string;
}

export interface ConsentGrant {
  actor: AdultActor;
  eventId: string;
  grantedAt: string;
  grantId: string;
  invitationId: string;
  purpose: MessagePurpose;
  withdrawnAt?: string;
}

export interface MediaLicenseReceipt {
  actor: AdultActor;
  audience: MediaAudience;
  eventId: string;
  invitationId: string;
  licenseId: string;
  licensedAt: string;
}

export interface OptOutEvent {
  eventId: string;
  invitationId: string;
  keyword: string;
  occurredAt: string;
  rawInput: string;
}

export interface MessagingSuppression {
  eventId: string;
  hashedDestination: string;
  invitationId: string;
  propagatedAt?: string;
  reason: string;
  scope: "EVENT" | "PROGRAM";
  suppressedAt: string;
}

export interface DataRightsRequest {
  authenticatedActor?: AdultActor;
  eventId: string;
  invitationId: string;
  requestId: string;
  requesterType:
    | "CONTRIBUTOR"
    | "DEPICTED_PERSON"
    | "PARENT_GUARDIAN"
    | "AUTHORIZED_REPRESENTATIVE";
  status: "OPEN" | "IN_REVIEW" | "FULFILLED" | "REJECTED";
  submittedAt: string;
  targetId?: string;
}

export interface ContributionRef {
  acceptedAt: string;
  contributionId: string;
  eventId: string;
  invitationId: string;
  kind: "TEXT" | "MEDIA";
}

export interface CommandEnvelopeBase {
  actor: CommandActor;
  channel: Channel;
  eventId: string;
  expectedVersion?: number;
  idempotencyKey: string;
  invitationId: string;
  type: string;
}

export interface RecordAdultParticipationCommand extends CommandEnvelopeBase {
  receipt: AdultActorAssurance;
  type: "adult-participation.record" | "adult-actor-assurance.record";
}

export interface RecordProcessingNoticeCommand extends CommandEnvelopeBase {
  receipt: ProcessingNoticeReceipt;
  type: "processing-notice.record";
}

export interface RecordGuardianAuthorityCommand extends CommandEnvelopeBase {
  receipt: GuardianAuthorityRecord;
  type: "guardian-authority.record";
}

export interface RecordOnBehalfDisclosureCommand extends CommandEnvelopeBase {
  receipt: OnBehalfDisclosureReceipt;
  type: "on-behalf-disclosure.record";
}

export interface AcceptQualifyingTextContributionCommand
  extends CommandEnvelopeBase {
  contribution: ContributionRef;
  type: "qualifying-text.accept";
}

export interface FinalizeMediaCommand extends CommandEnvelopeBase {
  contribution: ContributionRef;
  qualifiesForRsvp: boolean;
  type: "media.finalize";
}

export interface RecordAttendanceCommand extends CommandEnvelopeBase {
  gatePromptAccepted: boolean;
  response: "YES" | "NO";
  type: "attendance.record";
}

export interface RecordAnswersCommand extends CommandEnvelopeBase {
  answers: readonly {
    questionId: string;
    value: string;
  }[];
  completedRequiredPrompts: boolean;
  type: "answers.record";
}

export interface GrantOrganizerExemptionCommand extends CommandEnvelopeBase {
  reason: string;
  type: "organizer-exemption.grant";
}

export interface RecordOptOutCommand extends CommandEnvelopeBase {
  keyword: string;
  rawInput: string;
  type: "opt-out.record";
}

export type DomainCommand =
  | RecordAdultParticipationCommand
  | RecordProcessingNoticeCommand
  | RecordGuardianAuthorityCommand
  | RecordOnBehalfDisclosureCommand
  | AcceptQualifyingTextContributionCommand
  | FinalizeMediaCommand
  | RecordAttendanceCommand
  | RecordAnswersCommand
  | GrantOrganizerExemptionCommand
  | RecordOptOutCommand;

export interface CapabilityClaims {
  eventId: string;
  expiresAt: string;
  invitationId: string;
  issuedAt: string;
  purpose: CapabilityPurpose;
  tokenHash: string;
}

export interface SignCapabilityTokenInput {
  eventId: string;
  expiresAt: string;
  invitationId: string;
  issuedAt?: string;
  purpose: CapabilityPurpose;
  rawToken: string;
  secret: string;
}

export interface VerifyCapabilityTokenInput {
  now?: string;
  purpose: CapabilityPurpose;
  secret: string;
  token: string;
}

export const pilotProgramMetadata = {
  birthday: {
    adultHonoreePairs: 2,
    invitedGuestMinimum: 10,
    minorHonoreePairs: 3,
    pairCount: 5,
    requiredFormats: [BirthdayFormat.SHARED, BirthdayFormat.MILESTONE] as const
  },
  matchedPairs: 15,
  perEventTypePairs: 5,
  totalEvents: 30
} as const;

export function hashCapabilityToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("base64url");
}

export function signCapabilityToken(
  input: SignCapabilityTokenInput
): string {
  const claims: CapabilityClaims = {
    eventId: input.eventId,
    expiresAt: input.expiresAt,
    invitationId: input.invitationId,
    issuedAt: input.issuedAt ?? new Date().toISOString(),
    purpose: input.purpose,
    tokenHash: hashCapabilityToken(input.rawToken)
  };

  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = signPayload(payload, input.secret);

  return `${payload}.${signature}`;
}

export function verifyCapabilityToken(
  input: VerifyCapabilityTokenInput
): CapabilityClaims | null {
  const [payload, signature] = input.token.split(".");

  if (!payload || !signature) {
    return null;
  }

  if (!signaturesMatch(signature, signPayload(payload, input.secret))) {
    return null;
  }

  const parsed = parseClaims(payload);

  if (!parsed || parsed.purpose !== input.purpose) {
    return null;
  }

  const now = new Date(input.now ?? new Date().toISOString()).getTime();
  const expiresAt = new Date(parsed.expiresAt).getTime();

  if (!Number.isFinite(expiresAt) || expiresAt <= now) {
    return null;
  }

  return parsed;
}

function parseClaims(payload: string): CapabilityClaims | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as Partial<CapabilityClaims>;

    if (
      typeof parsed.eventId !== "string" ||
      typeof parsed.invitationId !== "string" ||
      typeof parsed.issuedAt !== "string" ||
      typeof parsed.expiresAt !== "string" ||
      typeof parsed.tokenHash !== "string"
    ) {
      return null;
    }

    if (!Object.values(CapabilityPurpose).includes(parsed.purpose as CapabilityPurpose)) {
      return null;
    }

    return parsed as CapabilityClaims;
  } catch {
    return null;
  }
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function signaturesMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

import { describe, expect, it } from "vitest";

import {
  BirthdayFormat,
  type DomainCommand,
  EventType,
  type Honoree,
  type AdultActor,
  RSVPState
} from "@neargather/contracts";

import {
  applyCommand,
  buildEventPolicySnapshot,
  createInitialInvitationState,
  resolveNextStep
} from "./index";

const adultActor: AdultActor = {
  actorId: "adult_1",
  ageAttested: true,
  role: "RESPONDENT"
};

const organizerActor: AdultActor = {
  actorId: "adult_host",
  ageAttested: true,
  role: "ORGANIZER"
};

const adultHonoree: Honoree = {
  ageCategory: "ADULT",
  displayName: "Alex",
  honoreeId: "honoree_adult"
};

const minorHonoree: Honoree = {
  ageCategory: "MINOR",
  displayName: "Milo",
  honoreeId: "honoree_minor",
  milestoneLabel: "Turning 8"
};

const secondMinorHonoree: Honoree = {
  ageCategory: "MINOR",
  displayName: "Nora",
  honoreeId: "honoree_minor_2"
};

function createState(honorees: readonly Honoree[] = [adultHonoree]) {
  return createInitialInvitationState({
    birthdayFormat: BirthdayFormat.STANDARD,
    eventId: "evt_1",
    eventType: EventType.BIRTHDAY,
    honorees,
    invitationId: "inv_1"
  });
}

function baseCommand<TType extends DomainCommand["type"]>(
  type: TType,
  idempotencyKey: string,
  actor: AdultActor = adultActor
) {
  return {
    actor,
    channel: "WEB" as const,
    eventId: "evt_1",
    idempotencyKey,
    invitationId: "inv_1",
    type
  };
}

function primeStateForRsvp(honorees: readonly Honoree[] = [adultHonoree]) {
  let state = createState(honorees);

  state = applyCommand(state, {
    ...baseCommand("adult-participation.record", "adult-participation"),
      receipt: {
        actor: adultActor,
        assuranceVersion: "2026-08-19",
        channel: "WEB",
        evidence: "age-checkbox",
        eventId: "evt_1",
        invitationId: "inv_1",
        purpose: "RESPONDENT_PARTICIPATION",
        receiptId: "apr_1",
        recordedAt: "2026-08-19T00:00:00.000Z",
        role: "RESPONDENT"
    }
  });

  state = applyCommand(state, {
    ...baseCommand("processing-notice.record", "processing-notice"),
    receipt: {
      actor: adultActor,
      audience: "HOSTS_ONLY",
      categories: ["attendance", "guestbook"],
      channel: "WEB",
      eventId: "evt_1",
      invitationId: "inv_1",
      noticeVersion: "2026-08-19",
      purpose: "EVENT_TRANSACTIONAL",
      receiptId: "pnr_1",
      recordedAt: "2026-08-19T00:01:00.000Z",
      retentionUntil: "2027-08-19T00:00:00.000Z"
    }
  });

  if (honorees.some((honoree) => honoree.ageCategory === "MINOR")) {
    state = applyCommand(state, {
      ...baseCommand("on-behalf-disclosure.record", "on-behalf-disclosure", organizerActor),
      receipt: {
        actor: organizerActor,
        disclosureVersion: "2026-08-19",
        eventId: "evt_1",
        invitationId: "inv_1",
        minorHonoreeId: honorees.find((honoree) => honoree.ageCategory === "MINOR")?.honoreeId ?? "honoree_minor",
        receiptId: "obr_1",
        recordedAt: "2026-08-19T00:01:30.000Z",
        scope: "MINOR_HONOREE_PARTICIPATION"
      }
    });

    state = applyCommand(state, {
      ...baseCommand("guardian-authority.record", "guardian-authority", organizerActor),
      receipt: {
        actor: organizerActor,
        authorityScope: "EVENT_PARTICIPATION",
        authorityVersion: "2026-08-19",
        childRelationship: "parent",
        disclosureAccepted: true,
        eventId: "evt_1",
        guardianAdultActorId: organizerActor.actorId,
        invitationId: "inv_1",
        minorHonoreeId: honorees.find((honoree) => honoree.ageCategory === "MINOR")?.honoreeId ?? "honoree_minor",
        noticeVersion: "2026-08-19",
        receiptId: "gar_1",
        recordedAt: "2026-08-19T00:02:00.000Z"
      }
    });
  }

  return state;
}

describe("policy snapshot", () => {
  it("marks birthdays as adult-managed, matching-only on imported phones, and host-only", () => {
    const policy = buildEventPolicySnapshot({
      birthdayFormat: BirthdayFormat.STANDARD,
      eventType: EventType.BIRTHDAY,
      honorees: [minorHonoree]
    });

    expect(policy).toMatchObject({
      adultActorsOnly: true,
      birthdayFormat: BirthdayFormat.STANDARD,
      collectChildContactChannels: false,
      eventType: EventType.BIRTHDAY,
      guardianAuthorityRequired: true,
      guestInitiatedSmsOnly: true,
      importedPhonesAreMatchingOnly: true,
      mediaAudience: "HOSTS_ONLY",
      minorSubjectsOnly: true,
      allowImportedPhoneConsent: false,
      allowMinorGuestIdentity: false,
      takedownWorkflowRequired: true
    });

    expect(policy.prohibitedReuse).toEqual(
      expect.arrayContaining(["AI_TRAINING", "CROSS_PRODUCT_REUSE", "PUBLIC_POSTING"])
    );

    expect(policy.removalRequestors).toEqual(
      expect.arrayContaining([
        "PARENT_GUARDIAN",
        "DEPICTED_PERSON",
        "AUTHORIZED_REPRESENTATIVE"
      ])
    );
  });
});

describe("initial invitation state", () => {
  it("requires a birthday format and at least one honoree for birthday events", () => {
    expect(() =>
      createInitialInvitationState({
        eventId: "evt_1",
        eventType: EventType.BIRTHDAY,
        honorees: [adultHonoree],
        invitationId: "inv_1"
      })
    ).toThrow(/birthdayFormat/i);

    expect(() =>
      createInitialInvitationState({
        birthdayFormat: BirthdayFormat.STANDARD,
        eventId: "evt_1",
        eventType: EventType.BIRTHDAY,
        honorees: [],
        invitationId: "inv_1"
      })
    ).toThrow(/at least one honoree/i);
  });

  it("rejects birthday format on non-birthday events", () => {
    expect(() =>
      createInitialInvitationState({
        birthdayFormat: BirthdayFormat.MILESTONE,
        eventId: "evt_2",
        eventType: EventType.WEDDING,
        honorees: [adultHonoree],
        invitationId: "inv_2"
      })
    ).toThrow(/birthdayFormat/i);
  });
});

describe("state engine", () => {
  it("rejects a minor honoree acting as an adult actor", () => {
    const state = createState([minorHonoree]);

    expect(() =>
      applyCommand(state, {
        ...baseCommand("adult-participation.record", "minor-actor", {
          actorId: "honoree_minor",
          ageAttested: true,
          role: "RESPONDENT"
        }),
        receipt: {
          actor: {
            actorId: "honoree_minor",
            ageAttested: true,
            role: "RESPONDENT"
          },
          assuranceVersion: "2026-08-19",
          channel: "WEB",
          evidence: "age-checkbox",
          eventId: "evt_1",
          invitationId: "inv_1",
          purpose: "RESPONDENT_PARTICIPATION",
          receiptId: "apr_minor",
          recordedAt: "2026-08-19T00:00:00.000Z",
          role: "RESPONDENT"
        }
      })
    ).toThrow(/Minor honorees/);
  });

  it("keeps a bare YES in awaiting_response until the same invitation has an accepted qualifying contribution", () => {
    const state = applyCommand(primeStateForRsvp(), {
      ...baseCommand("attendance.record", "attendance-yes"),
      gatePromptAccepted: true,
      response: "YES"
    });

    expect(state.rsvpState).toBe(RSVPState.AWAITING_RESPONSE);
    expect(resolveNextStep(state)).toEqual({
      kind: "REQUEST_QUALIFYING_CONTRIBUTION"
    });
  });

  it("requires per-minor disclosure and guardian records before minor-event progress can continue", () => {
    let state = createState([minorHonoree, secondMinorHonoree]);

    state = applyCommand(state, {
      ...baseCommand("adult-participation.record", "adult-participation"),
      receipt: {
        actor: adultActor,
        assuranceVersion: "2026-08-19",
        channel: "WEB",
        evidence: "age-checkbox",
        eventId: "evt_1",
        invitationId: "inv_1",
        purpose: "RESPONDENT_PARTICIPATION",
        receiptId: "apr_1",
        recordedAt: "2026-08-19T00:00:00.000Z",
        role: "RESPONDENT"
      }
    });

    state = applyCommand(state, {
      ...baseCommand("processing-notice.record", "processing-notice"),
      receipt: {
        actor: adultActor,
        audience: "HOSTS_ONLY",
        categories: ["attendance"],
        channel: "WEB",
        eventId: "evt_1",
        invitationId: "inv_1",
        noticeVersion: "2026-08-19",
        purpose: "EVENT_TRANSACTIONAL",
        receiptId: "pnr_1",
        recordedAt: "2026-08-19T00:01:00.000Z",
        retentionUntil: "2027-08-19T00:00:00.000Z"
      }
    });

    state = applyCommand(state, {
      ...baseCommand("on-behalf-disclosure.record", "one-minor-disclosure", organizerActor),
      receipt: {
        actor: organizerActor,
        disclosureVersion: "2026-08-19",
        eventId: "evt_1",
        invitationId: "inv_1",
        minorHonoreeId: minorHonoree.honoreeId,
        receiptId: "obr_1",
        recordedAt: "2026-08-19T00:01:30.000Z",
        scope: "MINOR_HONOREE_PARTICIPATION"
      }
    });

    state = applyCommand(state, {
      ...baseCommand("guardian-authority.record", "one-minor-authority", organizerActor),
      receipt: {
        actor: organizerActor,
        authorityScope: "EVENT_PARTICIPATION",
        authorityVersion: "2026-08-19",
        childRelationship: "parent",
        disclosureAccepted: true,
        eventId: "evt_1",
        guardianAdultActorId: organizerActor.actorId,
        invitationId: "inv_1",
        minorHonoreeId: minorHonoree.honoreeId,
        noticeVersion: "2026-08-19",
        receiptId: "gar_1",
        recordedAt: "2026-08-19T00:02:00.000Z"
      }
    });

    expect(resolveNextStep(state)).toEqual({
      kind: "COLLECT_ON_BEHALF_DISCLOSURE"
    });
  });

  it("requires no child channels or child-linked contact identities in RSVP flows", () => {
    const state = primeStateForRsvp([minorHonoree]);

    expect(() =>
      applyCommand(state, {
        ...baseCommand("opt-out.record", "minor-sms", {
          actorId: "honoree_minor",
          ageAttested: true,
          role: "RESPONDENT"
        }),
        keyword: "STOP",
        rawInput: "stop"
      })
    ).toThrow(/Minor honorees/);
  });

  it("requires a same-event contribution reference before attending and advances to complete once answers are done", () => {
    let state = applyCommand(primeStateForRsvp(), {
      ...baseCommand("attendance.record", "attendance-yes"),
      gatePromptAccepted: true,
      response: "YES"
    });

    expect(() =>
      applyCommand(state, {
        ...baseCommand("qualifying-text.accept", "foreign-contribution"),
        contribution: {
          acceptedAt: "2026-08-19T00:05:00.000Z",
          contributionId: "contrib_foreign",
          eventId: "evt_other",
          invitationId: "inv_1",
          kind: "TEXT"
        }
      })
    ).toThrow(/same event and invitation/i);

    state = applyCommand(state, {
      ...baseCommand("qualifying-text.accept", "local-contribution"),
      contribution: {
        acceptedAt: "2026-08-19T00:05:00.000Z",
        contributionId: "contrib_1",
        eventId: "evt_1",
        invitationId: "inv_1",
        kind: "TEXT"
      }
    });

    expect(state.rsvpState).toBe(RSVPState.ATTENDING_INCOMPLETE);
    expect(resolveNextStep(state)).toEqual({ kind: "COLLECT_REQUIRED_ANSWERS" });

    state = applyCommand(state, {
      ...baseCommand("answers.record", "answers-complete"),
      answers: [{ questionId: "meal", value: "vegetarian" }],
      completedRequiredPrompts: true
    });

    expect(state.rsvpState).toBe(RSVPState.ATTENDING_COMPLETE);
    expect(resolveNextStep(state)).toEqual({ kind: "CONFIRM_ATTENDING" });
  });

  it("allows declining after qualifying into attending while retaining qualifying contribution evidence", () => {
    let state = applyCommand(primeStateForRsvp(), {
      ...baseCommand("attendance.record", "attendance-yes"),
      gatePromptAccepted: true,
      response: "YES"
    });

    state = applyCommand(state, {
      ...baseCommand("qualifying-text.accept", "local-contribution"),
      contribution: {
        acceptedAt: "2026-08-19T00:05:00.000Z",
        contributionId: "contrib_1",
        eventId: "evt_1",
        invitationId: "inv_1",
        kind: "TEXT"
      }
    });

    expect(state.rsvpState).toBe(RSVPState.ATTENDING_INCOMPLETE);

    state = applyCommand(state, {
      ...baseCommand("attendance.record", "attendance-no"),
      gatePromptAccepted: false,
      response: "NO"
    });

    expect(state.rsvpState).toBe(RSVPState.DECLINED);
    expect(state.qualifyingContribution).toMatchObject({
      contributionId: "contrib_1"
    });
  });

  it("treats organizer exemptions as separate audited leaves", () => {
    let state = applyCommand(primeStateForRsvp(), {
      ...baseCommand("organizer-exemption.grant", "grant-exemption", organizerActor),
      reason: "Accessibility accommodation"
    });

    expect(state.rsvpState).toBe(RSVPState.EXEMPT_INCOMPLETE);
    expect(resolveNextStep(state)).toEqual({ kind: "COLLECT_REQUIRED_ANSWERS" });

    state = applyCommand(state, {
      ...baseCommand("answers.record", "answers-after-exemption"),
      answers: [{ questionId: "transport", value: "needs shuttle" }],
      completedRequiredPrompts: true
    });

    expect(state.rsvpState).toBe(RSVPState.EXEMPT_COMPLETE);
    expect(resolveNextStep(state)).toEqual({ kind: "CONFIRM_EXEMPT" });
  });

  it("allows declining after exemption while retaining exemption and contribution history", () => {
    let state = applyCommand(primeStateForRsvp(), {
      ...baseCommand("organizer-exemption.grant", "grant-exemption", organizerActor),
      reason: "Accessibility accommodation"
    });

    state = applyCommand(state, {
      ...baseCommand("attendance.record", "decline-after-exempt"),
      gatePromptAccepted: false,
      response: "NO"
    });

    expect(state.rsvpState).toBe(RSVPState.DECLINED);
    expect(state.organizerExemption).toMatchObject({
      reason: "Accessibility accommodation"
    });
  });

  it("rejects blank organizer exemption reasons", () => {
    expect(() =>
      applyCommand(primeStateForRsvp(), {
        ...baseCommand("organizer-exemption.grant", "blank-exemption", organizerActor),
        reason: "   "
      })
    ).toThrow(/reason/i);
  });

  it("allows a decline without contribution and keeps STOP/START/HELP in the messaging lane only", () => {
    const state = applyCommand(primeStateForRsvp(), {
      ...baseCommand("attendance.record", "decline"),
      gatePromptAccepted: false,
      response: "NO"
    });

    expect(state.rsvpState).toBe(RSVPState.DECLINED);

    const afterStop = applyCommand(state, {
      ...baseCommand("opt-out.record", "stop"),
      keyword: "STOP",
      rawInput: "stop"
    });

    expect(afterStop.rsvpState).toBe(RSVPState.DECLINED);
    expect(afterStop.messagingSuppression).toMatchObject({
      eventId: "evt_1",
      invitationId: "inv_1",
      reason: "STOP",
      scope: "EVENT"
    });

    const afterStart = applyCommand(afterStop, {
      ...baseCommand("opt-out.record", "start"),
      keyword: "START",
      rawInput: "start"
    });

    expect(afterStart.rsvpState).toBe(RSVPState.DECLINED);
    expect(afterStart.messagingSuppression).toBeUndefined();

    const afterHelp = applyCommand(afterStart, {
      ...baseCommand("opt-out.record", "help"),
      keyword: "HELP",
      rawInput: "help"
    });

    expect(afterHelp.rsvpState).toBe(RSVPState.DECLINED);
  });
});

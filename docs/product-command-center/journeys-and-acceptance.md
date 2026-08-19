# Canonical User Journeys and Acceptance Traceability

| Field | Value |
|---|---|
| Document owner | Chat 1 Product Command Center |
| Status | Approved baseline |
| Version | 2.0.0 |
| Last updated | 2026-08-19 |

Each acceptance criterion has a stable, individually testable ID. Evidence must identify event arm, channel, party shape, initial state, action, resulting canonical state, telemetry, and audit record where applicable. State names come from the [Canonical Model and States](canonical-model-and-states.md).

## JRN-PUB-001 — Organizer publishes an event

**Story:** As an organizer, I can configure the complete RSVP experience before inviting guests.

| Acceptance ID | Criterion |
|---|---|
| AC-PUB-001 | Event type selection offers only a U.S. `WEDDING`, `BABY_SHOWER`, or `BIRTHDAY`; birthday additionally requires `STANDARD`, `MILESTONE`, or `SHARED`. |
| AC-PUB-002 | Publication is blocked until authenticated host access, event date, RSVP deadline, one required prompt, a guest list grouped into parties, and at least one active access route exist. |
| AC-PUB-003 | Every logistics question records whether it is required; plus-one, guest-name, meal, dietary, and optional custom logistics configuration is supported. |
| AC-PUB-004 | CSV import and manual guest entry support adult primary contacts and invitation parties/households; imported phone data is identity-matching input only and creates neither SMS nor marketing consent. |
| AC-PUB-005 | Successful publication generates invitation-specific link/QR tokens, a live event URL, dedicated event SMS/MMS number, and 5–10 exact prompt routes. |
| AC-PUB-006 | Experiment arm and matched-pair metadata are visible only to authorized internal operators, are audit logged, and cannot change after publication. |

## JRN-BDAY-001 — Adult manages a birthday

**Story:** As an adult organizer or guest, I can run or respond to a standard, milestone, shared, adult-honoree, or minor-honoree birthday without creating a child participant identity or weakening the shared RSVP flow.

| Acceptance ID | Criterion |
|---|---|
| AC-BDAY-001 | A birthday requires one of `STANDARD`, `MILESTONE`, or `SHARED` and one or more `HonoreeProfile` records with `ADULT` or `MINOR` age band; shared birthdays support multiple honoree profiles. |
| AC-BDAY-002 | Before organizer, respondent, contributor, or uploader data collection, the actor must record a versioned `AdultActorAssurance` attesting they are 18+; a negative or missing attestation blocks collection. |
| AC-BDAY-003 | A minor-honoree birthday cannot publish or collect responses until an authenticated adult guardian records a versioned `GuardianAuthorityRecord`; missing, withdrawn, or invalid authority blocks the flow. |
| AC-BDAY-004 | A minor honoree receives no `GuestIdentity`, phone, account, login, direct message, invitation-primary-contact role, RSVP response, contribution, upload, purchase, or prize-recipient state. |
| AC-BDAY-005 | Before an adult submits child-related text, audio, or video, a versioned `OnBehalfDisclosureReceipt` is recorded and correlated to the submission; submission is blocked when the receipt is absent. |
| AC-BDAY-006 | Birthday consent and policy records are event-scoped; imported adult phone data creates no SMS or marketing consent, and no birthday data is used for marketing, cross-product reuse, or AI. |
| AC-BDAY-007 | Standard, milestone, shared, adult-honoree, and minor-honoree birthdays use the existing RSVP, Contribution, and ConversationSession state names and preserve intent-only `YES`, contribution gating, audited organizer exceptions, direct/confirmed `NO`, and distinct `STOP`. |
| AC-BDAY-008 | Thesis fixtures include five birthday matched pairs—three minor-honoree and two adult-honoree—with at least one shared and one milestone pair; every birthday event has at least 10 invited guests, and telemetry proves safe policy fields without child identifiers. |

## JRN-WEB-001 — Guest confirms through web or QR

**Story:** As an invited party, I confirm attendance by leaving one qualifying contribution and then completing logistics.

| Acceptance ID | Criterion |
|---|---|
| AC-WEB-001 | Treatment web/QR presents no standalone affirmative `YES` action. |
| AC-WEB-002 | Text below 10 non-whitespace characters or media below 3 stored seconds explains the applicable minimum and leaves attendance in `AWAITING_RESPONSE`. |
| AC-WEB-003 | One accepted required-prompt contribution immediately transitions once to `ATTENDING_LOGISTICS_INCOMPLETE` and opens only outstanding applicable logistics. |
| AC-WEB-004 | The interface does not label the RSVP complete until all required logistics answers validate and state is `ATTENDING_COMPLETE`. |
| AC-WEB-005 | Refreshes and retried submissions remain idempotent: one RSVP, no repeated advance, and no accidental duplicate contribution. |
| AC-WEB-006 | Dashboard shows the accepted contribution and the RSVP under the same invitation party while displaying contribution, attendance, and logistics states separately. |

## JRN-SMS-001 — Guest confirms through SMS/MMS

**Story:** As an invited party, I can contribute and finish my RSVP conversationally.

| Acceptance ID | Criterion |
|---|---|
| AC-SMS-001 | Inbound text/audio/video from an exact phone uniquely matched within the event is attributed to the correct event, invitation party, prompt, and conversation. |
| AC-SMS-002 | Plain SMS `YES` returns the required prompt and leaves treatment RSVP in `AWAITING_RESPONSE`. |
| AC-SMS-003 | First accepted qualifying required contribution confirms attendance exactly once; simultaneous later accepted submissions become additional guestbook entries without re-advancing RSVP. |
| AC-SMS-004 | An authenticated later SMS or web interaction resumes the same RSVP and expected logistics question without creating a second RSVP. |
| AC-SMS-005 | Persist-before-process plus dedupe handles duplicate/out-of-order provider events without duplicate contributions, duplicate RSVPs, or skipped questions. |
| AC-SMS-006 | Unsupported, oversized, expired, or failed MMS returns a secure one-tap upload link bound to the original prompt, identity, party, and conversation. |
| AC-SMS-007 | An imported phone match can resolve an adult event identity but cannot itself authorize outbound SMS, record SMS consent, or record marketing consent. |

## JRN-DEC-001 — Guest declines

**Story:** As an invited party, I can decline without contributing.

| Acceptance ID | Criterion |
|---|---|
| AC-DEC-001 | An authenticated web guest can decline directly without contributing. |
| AC-DEC-002 | SMS `NO` for a multi-person invitation enters `DECLINE_CONFIRMATION_PENDING` and requires one explicit whole-party confirmation before `DECLINED`. |
| AC-DEC-003 | `STOP` opts out, `HELP` returns compliant help, and neither changes RSVP status or counts as a decline. |
| AC-DEC-004 | An authenticated guest can later change a decline; the reversal records explicit intent and an audit entry. |
| AC-DEC-005 | A prior contribution remains after decline unless contributor or organizer deliberately invokes the documented removal process. |

## JRN-EXC-001 — Organizer grants an exception

**Story:** As an organizer, I can accommodate someone who cannot reasonably use the contribution gate.

| Acceptance ID | Criterion |
|---|---|
| AC-EXC-001 | Only an authenticated organizer/cohost can grant a host exception; no guest-facing self-skip path exists. |
| AC-EXC-002 | A non-empty reason is required and the actor, reason, party, time, and prior/new state are audit logged. |
| AC-EXC-003 | Dashboard and exports visibly distinguish `EXEMPT_*` attendance and `SATISFIED_BY_HOST_EXCEPTION` gate status. |
| AC-EXC-004 | Adjusted experiment metrics exclude host-exception parties while unadjusted/intent-to-treat reporting includes them. |
| AC-EXC-005 | No organizer, operator, integration, or data import can confirm treatment attendance through any undocumented override path. |

## JRN-PRM-001 — Attendee answers an event prompt

**Story:** As an attendee, I can scan a specific prompt QR and add another memory.

| Acceptance ID | Criterion |
|---|---|
| AC-PRM-001 | Each QR resolves to the exact configured event prompt and does not substitute another active prompt. |
| AC-PRM-002 | Identity is established before final submission by invitation token, verified phone, or a new event-scoped identity. |
| AC-PRM-003 | A new uninvited attendee is clearly labeled `UNINVITED_EVENT_ATTENDEE` and not represented as guest-list origin. |
| AC-PRM-004 | Accepted prompt contribution enters the same host-only private guestbook with contributor, prompt, channel, timestamp, media type, and original asset. |
| AC-PRM-005 | Event-prompt route resolution, identity creation, and contribution never change RSVP state or gate status. |
| AC-PRM-006 | All event-prompt routes remain feature-flagged off in the matched thesis experiment and are enabled only in a separately governed usability pilot. |

## JRN-GBK-001 — Organizer views and exports the guestbook

**Story:** As an organizer, I can privately review, download, and remove event memories.

| Acceptance ID | Criterion |
|---|---|
| AC-GBK-001 | Only authenticated organizers/cohosts can browse all event contributions. |
| AC-GBK-002 | Every entry retains contributor, prompt, channel, timestamp, media type, and original accepted asset. |
| AC-GBK-003 | Media is private, not publicly indexed, served only through non-enumerable expiring signed access URLs, and inaccessible after expiry without reauthorization. |
| AC-GBK-004 | Organizer export contains guestbook originals plus a metadata manifest and separately available guest/logistics export. |
| AC-GBK-005 | Event deletion makes media and personal data inaccessible and propagates deletion under the published policy; contributor removal is also supported and auditable. |
| AC-GBK-006 | Host interface states the 12-month post-event retention guarantee and archiving is not represented as deletion. |

## JRN-CTL-001 — Internal team runs a control event

**Story:** As a researcher, I can operate a conventional RSVP and post-event QR guestbook without changing the underlying infrastructure.

| Acceptance ID | Criterion |
|---|---|
| AC-CTL-001 | Control guests can answer conventional `YES` or `NO` before contributing; `YES` opens identical applicable logistics. |
| AC-CTL-002 | Control and treatment use the same logistics, identity, consent, media, privacy, guestbook, and telemetry behavior. |
| AC-CTL-003 | Both arms receive the same post-event QR guestbook opportunity. |
| AC-CTL-004 | Control mode is feature-flagged, inaccessible to public organizers, and available only to authorized internal operators. |
| AC-CTL-005 | Arm and matched-pair metadata are immutable after publication and their assignment/history is auditable. |

## Cross-cutting acceptance evidence

| Evidence ID | Required proof |
|---|---|
| EVD-STATE-001 | Before/after canonical state, transition trigger, version/correlation identifier, and audit record where required |
| EVD-UI-001 | Role- and arm-specific interface or transcript demonstrating exact visible behavior |
| EVD-IDEM-001 | Replay and concurrency test showing a single RSVP advance and deterministic dedupe outcome |
| EVD-AUTH-001 | Positive authorized and negative unauthorized access tests for host-only data/actions |
| EVD-DATA-001 | Persisted entity relationships and export/manifest inspection without cross-event identity linkage |
| EVD-TELEM-001 | Telemetry query proving required event name, timestamp, event/party/arm context, state outcome, and dedupe behavior |
| EVD-PRIV-001 | Signed URL expiry, non-indexing, export, removal, event deletion, and deletion-propagation evidence |
| EVD-OPS-001 | Review-queue and runbook evidence for ambiguous identity, media failure, support, and event emergency |
| EVD-POL-001 | Positive and negative sequencing evidence for 18+ assurance, guardian authority, on-behalf disclosure, no-child-identity enforcement, and copy-version/audit linkage |

## Traceability matrix

| Requirement ID | Journey and acceptance IDs | Primary evidence |
|---|---|---|
| P0-EVT-001 | JRN-PUB-001: AC-PUB-001–AC-PUB-006 | EVD-UI-001, EVD-DATA-001, EVD-STATE-001 |
| P0-BDAY-001 | JRN-BDAY-001: AC-BDAY-001–AC-BDAY-008 | EVD-POL-001, EVD-AUTH-001, EVD-DATA-001, EVD-TELEM-001 |
| P0-GATE-001 | JRN-WEB-001: AC-WEB-001–AC-WEB-006; JRN-SMS-001: AC-SMS-002–AC-SMS-003 | EVD-STATE-001, EVD-IDEM-001, EVD-TELEM-001 |
| P0-CTRL-001 | JRN-CTL-001: AC-CTL-001–AC-CTL-005 | EVD-UI-001, EVD-DATA-001, EVD-TELEM-001 |
| P0-ID-001 | AC-WEB-006; AC-SMS-001, AC-SMS-004, AC-SMS-007; AC-PRM-002–AC-PRM-003; AC-BDAY-004, AC-BDAY-006 | EVD-DATA-001, EVD-IDEM-001, EVD-STATE-001, EVD-POL-001 |
| P0-LOG-001 | AC-WEB-003–AC-WEB-004; AC-SMS-004; AC-CTL-001–AC-CTL-002 | EVD-UI-001, EVD-STATE-001, EVD-TELEM-001 |
| P0-EXC-001 | JRN-DEC-001: AC-DEC-001–AC-DEC-005; JRN-EXC-001: AC-EXC-001–AC-EXC-005 | EVD-AUTH-001, EVD-STATE-001, EVD-TELEM-001 |
| P0-MSG-001 | AC-SMS-001, AC-SMS-003–AC-SMS-007; AC-WEB-005 | EVD-IDEM-001, EVD-DATA-001, EVD-OPS-001 |
| P0-ROUTE-001 | AC-PUB-005; JRN-PRM-001: AC-PRM-001–AC-PRM-006 | EVD-UI-001, EVD-STATE-001, EVD-DATA-001 |
| P0-BOOK-001 | AC-DEC-005; AC-PRM-004; JRN-GBK-001: AC-GBK-001–AC-GBK-006 | EVD-AUTH-001, EVD-PRIV-001, EVD-DATA-001 |
| P0-OPS-001 | AC-WEB-006; AC-EXC-003, AC-EXC-005; AC-GBK-004–AC-GBK-005 | EVD-OPS-001, EVD-AUTH-001, EVD-DATA-001 |
| P0-MEAS-001 | AC-EXC-004; AC-CTL-002–AC-CTL-005 plus every state-changing criterion | EVD-TELEM-001, EVD-DATA-001 |

Acceptance status is tracked in the [Release Checklist](release-checklist.md); a criterion without linked evidence is `No evidence recorded`, not passed.

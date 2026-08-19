# NearGather P0 MVP Product Requirements Document

| Field | Value |
|---|---|
| Document owner | Chat 1 Product Command Center |
| Status | Approved baseline |
| Version | 2.0.0 |
| Last updated | 2026-08-19 |

## Product thesis

NearGather will test whether requiring a meaningful contribution before affirmative attendance materially increases identified private-guestbook participation compared with conventional RSVP plus the same post-event QR opportunity, without an unacceptable RSVP-completion penalty.

The differentiator is not generic QR collection, logistics, or media storage. It is the contribution-gated affirmative RSVP, delivered consistently across web, QR, SMS, and MMS while keeping attendance confirmation distinct from completion of required logistics.

## Product objective

Deliver a controlled, measurable, privacy-respecting digital MVP for U.S. weddings, baby showers, and adult-managed birthdays that can run 15 matched event pairs/30 events and produce an auditable thesis decision under the [experiment specification](experiment-and-metrics.md).

## Users and authorized actors

| Actor | P0 need and authority |
|---|---|
| Organizer/cohost | Configure and publish an eligible event; invite parties; review operational states; grant reasoned exceptions; privately browse, export, and delete event data |
| Invited party | Accept by contributing in treatment, decline without contributing, complete applicable logistics, switch channel without duplication, manage own contribution deletion |
| Uninvited attendee | Use an enabled event-prompt route after event-scoped identification; remain marked as not from the guest list; cannot mutate RSVP |
| Internal research operator | Configure research-only control events and immutable matched-pair assignment; view arm metadata unavailable to public organizers |
| Support/operations reviewer | Resolve ambiguous identity and failed-media queues within authorized event scope without fuzzy merging or undocumented attendance overrides |
| Adult actor | Attest to being 18+ before acting as organizer, respondent, contributor, or uploader; a future purchaser or prize recipient must also be 18+ if separately authorized after P0 |
| Guardian adult | Attest to event-scoped authority for a minor-honoree birthday and accept on-behalf responsibility; the child honoree is not a user or participant |

## P0 product principles

1. **One thesis.** Product and measurement optimize for the stated contribution-participation hypothesis.
2. **Gate integrity.** In treatment, only an accepted qualifying required-prompt contribution or an organizer/cohost exception confirms attendance.
3. **State clarity.** Accepted contribution, attendance confirmed, logistics complete, and RSVP complete are separate observable facts.
4. **Identity restraint.** Identity is event-scoped; tokens and exact unique phone matches are authoritative; ambiguity is reviewed, never guessed.
5. **Privacy by default.** The guestbook is host-only, private, non-indexed, deletable, exportable, and not reused across products.
6. **Research comparability.** Both experiment arms share identity, logistics, media, telemetry, privacy, and post-event QR infrastructure.
7. **Digital focus.** Physical fulfillment, pricing, partnerships, growth loops, and NearYou reuse do not enter P0.
8. **Adult-managed participation.** All direct actors are 18+; a minor may be a birthday honoree only and has no identity, phone, account, response, contribution, upload, purchase, or prize-recipient role.

## Functional requirements

The [Scope Ledger](scope-ledger.md) is the status authority; these requirements define behavior.

### P0-EVT-001 — Event and invitation setup

- Organizer creates only a U.S. wedding, baby shower, or adult-managed birthday and imports adult guests by CSV or adds them manually.
- Invitations group guests into parties/households with one primary contact.
- Organizer configures one required RSVP prompt, deadline, plus-one rules, guest names, meal choices, dietary question, and optional custom logistics questions. Required logistics are explicitly marked.
- Publication requires authenticated host access, event date, RSVP deadline, required prompt, guest list, and at least one active access route.
- Publication generates a live URL, invitation-specific QR/link tokens, a dedicated event SMS/MMS number, and 5–10 digital event-prompt routes.
- Experiment arm is restricted to authorized internal operators and becomes immutable on publication.

### P0-BDAY-001 — Adult-managed birthday policy

- `BirthdayFormat` is required as `STANDARD`, `MILESTONE`, or `SHARED`; `HonoreeProfile` records only an adult-safe display label and `ageBand` of `ADULT` or `MINOR`.
- `SHARED` supports multiple honoree profiles. Adult, minor-honoree, milestone, and shared birthdays use the existing RSVP, Contribution, and ConversationSession state machines without renamed or birthday-only states.
- Every organizer, respondent, contributor, and uploader records an `AdultActorAssurance` attesting 18+ before data collection. A missing or negative assurance blocks collection.
- A birthday with any minor honoree requires a valid `GuardianAuthorityRecord` before publication or response collection.
- Before an adult submits child-related content, the system records a versioned `OnBehalfDisclosureReceipt` linked to that adult, event, honoree profile, and submission correlation.
- A minor honoree has no `GuestIdentity`, phone, account, login, direct messaging, RSVP response, contribution, upload, purchase, prize-recipient state, or cross-event linkage.
- Every birthday in the thesis pilot has at least 10 invited guests at publication. This eligibility floor does not modify the primary metric denominator.
- Birthday policy does not change the treatment gate, intent-only `YES`, audited organizer exemption, direct/confirmed `NO`, distinct `STOP`, host-only media, signed access, audited removal, export/deletion, 12-month retention, U.S.-only operation, or prohibitions on marketing, cross-product use, and AI.

### P0-GATE-001 — Contribution-gated treatment

- Treatment exposes no standalone affirmative `YES` action.
- One accepted qualifying required-prompt contribution per invitation party unlocks affirmative attendance.
- Text qualifies at 10 or more non-whitespace characters. Audio/video qualifies at 3 or more seconds only after successful storage.
- Plain SMS `YES` returns the required prompt and leaves RSVP in `AWAITING_RESPONSE`.
- Accepted contribution confirms attendance exactly once; outstanding applicable logistics then open.
- The product says attendance is confirmed before, and separately from, `Your RSVP is complete.`

### P0-CTRL-001 — Research-only control

- Internal feature-flagged control allows conventional `YES`/`NO`, followed by the identical logistics flow.
- Control and treatment share identity, media, guestbook, telemetry, and post-event QR infrastructure.
- Control is inaccessible as a public product and assignment is immutable after publication.

### P0-ID-001 — Event-scoped identity and cross-channel continuity

- Invitation token is authoritative on web/QR; exact phone uniquely matching one invitation within the event is authoritative on SMS.
- Unmatched or ambiguous phones require an invitation code or organizer review; no fuzzy or name-only merge occurs.
- A guest can continue between channels under one party RSVP and conversation state.
- Shared phones are handled at party level and ask who is contributing before attribution.
- First accepted required contribution advances RSVP; simultaneous later submissions are retained as additional guestbook entries.
- P0 has no global or cross-event person graph.
- Imported phone data may support event-scoped identity matching only; import creates neither SMS consent nor marketing consent, and a minor honoree can never be resolved as a guest identity.

### P0-LOG-001 — Conversational logistics

- After attendance confirmation, ask only questions applicable to the party and attending members.
- Validate every required answer before `ATTENDING_COMPLETE` or `EXEMPT_COMPLETE` and before saying `Your RSVP is complete.`
- Guests can review and correct answers before submission.
- Organizer and guest changes are audit logged and explicit reversals require new intent.

### P0-EXC-001 — Decline, opt-out, and accessibility exception

- Web decline requires no contribution.
- Multi-person-party SMS `NO` asks once for confirmation before declining the whole party.
- `STOP` opts out and `HELP` returns compliant help; neither changes RSVP state.
- An authenticated guest may later change a decline; prior contributions remain until deliberately removed.
- Only an organizer/cohost may grant a host exception, must provide a reason, and the UI/export must distinguish the exception.
- Host exceptions are excluded from adjusted gate metrics and retained in unadjusted/intent-to-treat reporting.
- No guest-facing self-skip and no other manual attendance override exist.

### P0-MSG-001 — Messaging, media, fallback, and idempotency

- Persist each inbound message before processing and deduplicate by provider message ID plus event number.
- Unsupported, oversized, expired, or failed MMS returns a secure one-tap upload link attached to the original prompt, identity, and conversation.
- Submission retries, duplicate/out-of-order webhooks, and concurrent SMS/web responses cannot duplicate RSVPs or double-advance a conversation.
- Original text/audio/video is retained when accepted; failed or quarantined media follows the canonical contribution lifecycle.
- SMS/MMS may target only an adult under an approved messaging basis; an imported phone match alone is not consent to send SMS or marketing.

### P0-ROUTE-001 — Digital event-prompt routes

- Organizer configures 5–10 additional prompts, each with an exact QR route.
- Identity is established before final submission via invitation token, verified phone, or a new event-scoped identity marked as uninvited.
- Prompt-route contributions enter the same private guestbook and never change RSVP.
- The capability is feature-flagged off for the matched thesis experiment and receives a separate usability pilot afterward.
- Printed cards, custom fulfillment, and physical kits are not P0.

### P0-BOOK-001 — Private multimedia guestbook and data rights

- Accepted text and original stored audio/video appear in a host-only guestbook with contributor, prompt, channel, timestamp, media type, and original asset metadata.
- Only authenticated organizers/cohosts browse all entries.
- Media uses private storage, non-enumerable expiring signed access URLs, and no public indexing.
- Retention is guaranteed for 12 months after the event; archiving is not deletion.
- Organizer export contains media plus a metadata manifest; event deletion removes accessible media and personal data under the published deletion policy.
- Contributors receive a documented path to request or perform deletion of their own contribution.
- NearFamily, NearLegacy, and all other cross-product use is prohibited in P0.

### P0-OPS-001 — Dashboard and operations

- Dashboard separately shows invitation state, attendance state, gate status, logistics completion, contribution count, channel, host-exception status, and delivery problems.
- Ambiguous identities and failed media have actionable review queues.
- Organizers export guest/logistics data and guestbook media.
- Operations preserve audit history and cannot apply undocumented attendance overrides.

### P0-MEAS-001 — Measurement

- Emit events for invitation delivery/open, RSVP start, gate display, contribution attempt/acceptance/failure, attendance confirmation, logistics completion, abandonment, channel switch, host exception, support request, decline, post-event contribution, deletion, and media type.
- Experiment assignment is immutable after publication.
- Analytics and operations distinguish accepted contribution, attendance confirmation, and RSVP completion.
- Event records preserve event type, birthday format and honoree age band when applicable, invitation-count band, party-size mix, RSVP lead time, organizer engagement, arm, matched-pair ID, and required policy-record presence for analysis without child identifiers.

## Privacy, consent, retention, and compliance defaults

- P0 serves United States events only and requires operational U.S. messaging registration before controlled pilots.
- Store event-scoped verified channels and consent records describing who agreed to what, for which event and contribution.
- Consent and privacy copy require approval before controlled pilots; an opt-out is not an RSVP response.
- Imported phone data is identity-matching input only and creates neither SMS nor marketing consent.
- Use least-privilege host/cohost authorization, private object storage, expiring signed access, audit logs, scanning/quarantine, and deletion propagation.
- Guarantee accessible retention for 12 months after event date, subject to an earlier valid deletion request or event deletion. A longer internal retention period is not authorized by this PRD.
- Cross-event identity, model training use, public galleries, cross-product use, and implicit secondary consent are prohibited.
- Marketing use is prohibited. Child names, birth dates, contact details, and other child identifiers are excluded from general analytics; a minor honoree is represented only by the event-scoped `HonoreeProfile` age band and adult-safe display label.

## Non-goals

P0 excludes paid pricing tests and paid Digital pilots, automated reminders/follow-ups, transcription, relationship-aware prompts, AI summaries, public galleries, global identity, NearYou reuse, Memory Maker/scoring/prizes, upsells, promotions, partner/reseller infrastructure, white label, integrations, physical kits, fulfillment, and event types beyond U.S. weddings, baby showers, and birthdays. See [P1 and Later](scope-ledger.md#p1--after-the-thesis-passes).

## Outcome and release constraint

P0 is successful only if the frozen [success gate](experiment-and-metrics.md#success-gate) passes after at least 15 matched pairs/30 events, guardrails are acceptable, and no applicable [release gate](release-checklist.md) remains failed or blocked. Passing a technical acceptance criterion alone does not authorize the downstream 20-event paid Digital pilot, paid beta, or scope expansion.

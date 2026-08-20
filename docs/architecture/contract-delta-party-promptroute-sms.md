# Architecture contract delta: Party, PromptRoute, EVENT_PROMPT, and SMS recovery

Status: approved additive delta for `CHG-2026-005` by Elizabeth; authorized engineering truth. This resolves the remaining Raja/Alaska questions without authorizing physical fulfillment or changing the contribution-gated RSVP contract.

## 1. LTR-PHYS-001 disposition

No change. Printed cards, packaging, shipping, NFC, fulfillment automation, and physical guestbook/capsule remain Later. P0 may generate digital prompt routes and event QR links only. A later physical amendment must define its own edition, reproduction, takedown, and counsel gates.

## 2. Party versus Invitation

`Party` is the event-scoped household/group aggregate and metric unit. `Invitation` is a revocable delivery/access artifact for exactly one party. They are separate identifiers and tables.

Minimum relationships:

```text
Event 1 ── * Party 1 ── * PartyMember
Party 1 ── * Invitation
Invitation 1 ── 1 RSVP
Party/Invitation ── * Contribution
```

Rules:

- One qualifying RSVP-gate contribution satisfies the party gate.
- Attendance/logistics remain member/guest-level where configured.
- A party may have a replacement invitation without changing the party or RSVP identity.
- A forwarded or revoked invitation never changes party ownership.
- Minor honorees are never `PartyMember`, `GuestIdentity`, contact, respondent, or contributor identities.

The existing invitation-keyed state engine remains valid only when its persisted state carries the immutable `partyId`; invitation IDs must not be used as an implicit substitute in new storage or APIs.

## 3. Prompt and PromptRoute

Canonical prompt kinds are:

```text
REQUIRED_RSVP
EVENT_PROMPT
POST_EVENT_CONTROL
```

`RSVP_GATE` is an implementation compatibility alias for `REQUIRED_RSVP` only at an adapter/migration boundary; it is not a fourth product prompt kind.

`PromptRoute` is an event/prompt-scoped submit capability:

```text
routeId, eventId, promptId, tokenHash, enabled,
accessPolicy = SUBMIT_ONLY, experimentExclusion, expiresAt/revokedAt
```

It contains no name, phone, invitation state, or private media. A route can resolve an existing invitation capability, perform verified adult identity resolution, or create an uninvited event-scoped identity. It never grants guestbook read access and never mutates RSVP state.

P0 route behavior:

- `REQUIRED_RSVP` routes are invitation-scoped and may enter the contribution gate.
- `EVENT_PROMPT` routes accept additional memories and can never satisfy or alter RSVP.
- `POST_EVENT_CONTROL` routes are reserved for the separately governed control flow.
- Matched thesis experiments keep event-prompt routes disabled; a separate usability pilot enables them.

## 4. SMS-code persistence and recovery

An invitation recovery code is a persisted, event-scoped capability, not a conversation cursor and not a consent record.

Required record:

```text
SmsInvitationCode
  eventId, partyId, invitationId, codeId
  codeHash, hashKeyVersion, status
  issuedAt, expiresAt, consumedAt, revokedAt
  failedAttemptCount, lastAttemptAt
```

Contract rules:

- Store only a keyed hash; never store or log the raw code.
- Codes are high-entropy, rate-limited, scoped to one event/party/invitation, revocable, and single-use when used for a new claim.
- Code resolution establishes party context only; it does not establish adult assurance, guardian authority, consent, or messaging permission.
- Imported-phone matching remains matching-only. No outbound SMS is sent until the adult guest initiates inbound and passes suppression/policy checks.
- Unknown, expired, revoked, or ambiguous code attempts produce neutral recovery and no RSVP mutation.
- The SMS provider dedupe key remains provider/account/message/destination scoped; code attempts get a separate idempotency key.

## 5. Uninvited event attendees

An uninvited attendee is represented by an event-scoped `UninvitedEventIdentity`:

```text
identityId, eventId, adultActorId, displayName,
origin = UNINVITED_EVENT_ATTENDEE, createdAt, removedAt
```

It has no `partyId`, `invitationId`, RSVP, guest-list origin, phone-based cross-event identity, or guestbook-read authority.

An uninvited adult may submit only to an `EVENT_PROMPT` route after adult assurance. The contribution is host-only and remains separate from invited-party participation. It cannot satisfy an RSVP gate, create an invitation, trigger outbound messaging, or enter the thesis RSVP denominator.

For an event with a minor honoree, the strict child-subject policy applies. An adult on-behalf disclosure is required before accepting child-related content; the child is never created as an actor or identity.

## 6. Alaska SMS evidence disposition

Alaska’s separate SMS artifacts are accepted as supporting evidence for:

- bounded Twilio ingress and signature verification;
- provider-message idempotency;
- party-scoped conversation continuity;
- STOP/START/HELP separation;
- fallback-upload capability binding;
- outbound-message/outbox boundaries.

They are not merged as a competing canonical model. Integration must map them to the Party/Invitation/Prompt/Contribution contracts above and add the persisted SMS-code and uninvited-identity records before launch.

## CHG-2026-005 approval record

Approval: Elizabeth approved the exact five-part additive delta. Implementation may proceed for Party/Invitation separation, PromptRoute, canonical prompt kinds, SMS recovery-code persistence, and uninvited-attendee identity handling. Any further semantic change returns to Chat 01 change control.

Exact change set:

1. Add the event-scoped `Party` aggregate and separate it from revocable `Invitation` access artifacts.
2. Add submit-only `PromptRoute` records and canonical prompt kinds `REQUIRED_RSVP`, `EVENT_PROMPT`, and `POST_EVENT_CONTROL`; retain `RSVP_GATE` only as a migration compatibility alias.
3. Add hashed, scoped, expiring, revocable `SmsInvitationCode` persistence for neutral SMS recovery.
4. Add adult-only `UninvitedEventIdentity` records for event-prompt submissions that have no party, invitation, RSVP, or outbound-messaging authority.
5. Map Alaska’s SMS ingress, conversation, fallback-upload, and outbox evidence to those records and the existing domain commands.

The change explicitly does **not** alter RSVP states, contribution qualification, adult/minor policy, guestbook authorization, retention, experiment assignment, or provider compliance requirements. It does not authorize printed cards, physical fulfillment, NFC, public galleries, or capsule editions.

Approval scope: the five additive records/mappings above as `CHG-2026-005`, with the explicit no-change disposition that `LTR-PHYS-001` remains Later. This does not authorize production launch; implementation remains behind existing feature gates.

## Required privacy and security evidence

Migration and integration evidence must prove:

- `Party`, `Invitation`, `PromptRoute`, `SmsInvitationCode`, and `UninvitedEventIdentity` are event-scoped; party/invitation relationships cannot cross events.
- Capability and recovery tokens are stored only as hashes, with expiry, revocation, single-use or idempotency behavior, and no raw-token logging.
- Minor honorees never become child identities, contacts, accounts, SMS recipients, RSVP respondents, contributors, or uploaders.
- Imported phone matching never infers consent or messaging permission; SMS remains guest-initiated and suppression-aware.
- Prompt routes are submit-only, do not grant guestbook read authority, and cannot mutate RSVP or gate status unless they are explicitly invitation-scoped `REQUIRED_RSVP` routes.
- Unknown, ambiguous, expired, revoked, and replayed codes/routes produce neutral recovery and no state mutation.
- Audit records capture route/code issuance, resolution, revocation, dedupe, identity outcome, and contribution outcome without raw tokens, child identifiers, or raw phone numbers.
- Negative authorization, cross-event isolation, replay/idempotency, and deletion/takedown propagation tests are release-gate evidence.

## Review disposition

Approved additive delta for `CHG-2026-005`: Party, PromptRoute, canonical prompt-kind names, persisted SMS recovery codes, and uninvited event identities. No-change disposition: `LTR-PHYS-001` remains Later. No RSVP state, contribution-gate invariant, minor policy, guestbook authorization, or retention rule is changed.

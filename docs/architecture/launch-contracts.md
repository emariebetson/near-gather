# NearGather launch contract freeze

Status: review-ready contract freeze for the approved P0 scope. This document is additive to the existing architecture source of truth and does not authorize Later physical/offline editions.

## Scope and invariants

- `EventType` is `WEDDING | BABY_SHOWER | BIRTHDAY`.
- Birthday presentation is `STANDARD | MILESTONE | SHARED`; honorees are display subjects, never actors.
- Every organizer, cohost, respondent, contributor, and uploader is an adult actor with a versioned assurance receipt.
- A minor honoree has no guest identity, contact channel, account, invitation contact, RSVP, consent, contributor, or uploader identity.
- Imported phones are matching-only. Outbound SMS requires verified guest-initiated inbound activity. `STOP` is messaging suppression; `NO` is RSVP decline.
- A qualifying contribution is accepted only when its persisted contribution is `ACCEPTED`, live, linked to the event RSVP-gate prompt, and—if media—has a `READY` media asset.
- A YES is intent. `ATTENDING_*` requires the qualifying contribution and a persisted gate-acceptance timestamp. Logistics completeness is independent.
- Organizer exemptions are audited and produce `EXEMPT_INCOMPLETE` or `EXEMPT_COMPLETE`; a bare attendance override is not supported.
- Child-subject events are host-only, private, non-indexed, and subject to guardian/on-behalf receipts and audited removal.

## Canonical state contract

```text
AWAITING_RESPONSE
  -> DECLINED
  -> ATTENDING_INCOMPLETE
  -> ATTENDING_COMPLETE

DECLINED -> ATTENDING_INCOMPLETE | ATTENDING_COMPLETE
ATTENDING_INCOMPLETE -> ATTENDING_COMPLETE | DECLINED
ATTENDING_COMPLETE -> ATTENDING_INCOMPLETE | DECLINED

AWAITING_RESPONSE -> EXEMPT_INCOMPLETE | EXEMPT_COMPLETE
DECLINED -> EXEMPT_INCOMPLETE | EXEMPT_COMPLETE
```

`ATTENDING_*` is impossible unless the contribution reference is accepted, same-event, same-invitation, RSVP-gate scoped, and media-ready when applicable. System actors may only submit media finalization commands; they cannot mutate attendance, answers, consent, or opt-out.

## Persistence contract

The relational source of truth is PostgreSQL. Core event-owned tables are `events`, `honorees`, `invitations`, `guests`, `guest_contacts`, `prompts`, `contributions`, `media_assets`, `invitation_states`, `accepted_contributions`, append-only state history, receipts, outbox, audit, and deletion tombstones.

The accepted-contribution trigger rejects any contribution that is not accepted, live, RSVP-gate scoped, same-kind, and media-ready where required. Composite event/invitation foreign keys and RLS prevent cross-event references and writes.

## Command/API contract

All mutating commands carry `eventId`, `invitationId`, channel, adult/system actor, idempotency key, and optional expected version. Only the domain package may apply commands.

Canonical commands:

- `adult-participation.record`
- `processing-notice.record`
- `guardian-authority.record`
- `on-behalf-disclosure.record`
- `attendance.record`
- `qualifying-text.accept`
- `media.finalize`
- `answers.record`
- `organizer-exemption.grant`
- `opt-out.record`

Provider adapters normalize input and never decide RSVP legality. The web, QR, and SMS paths invoke the same command service.

## Media/provider boundaries

- `ObjectStoragePort` owns private object inspection; upload grants are single-object, expiring, and single-use at finalization.
- Scanner and transcoder ports operate on quarantine objects and return safe, durable derivatives only.
- Twilio inbound processing requires raw-body signature verification, provider-message idempotency, and neutral recovery for unknown/ambiguous senders.
- Transactional SMS delivery is an outbox side effect and must prove guest-initiated inbound authorization plus unsuppressed messaging state.
- Clerk authentication is an organizer boundary; guest capabilities are signed, hashed at rest, purpose-scoped, expiring, and never expose private state in URLs.

## Contribution/media API shapes

An accepted contribution reference is one of:

```ts
{ kind: "TEXT", acceptanceStatus: "ACCEPTED", promptId, acceptedAt, ... }
{ kind: "AUDIO" | "VIDEO" | "PHOTO", acceptanceStatus: "ACCEPTED",
  promptId, acceptedAt, mediaAssetId, mediaStatus: "READY", ... }
```

Media qualification is two-phase: create pending contribution/upload, then finalize only after checksum, size, detected type, scanning, and safe derivative durability succeed. Replays return the prior outcome and cannot replace accepted media.

## Removal and evidence

Contribution deletion/takedown removes content and derivatives without rewriting historical RSVP transitions. The persisted RSVP keeps the qualifying contribution reference and records an operational `gateEvidenceStatus = REMOVED_AFTER_ACCEPTANCE`; attendance is not silently resurrected or reversed. This status must be included in the deletion worker/audit implementation before production launch.

## Review request

Please approve this contract freeze for implementation and release-gate review. Specifically confirm:

1. Historical attendance remains valid after post-acceptance contribution removal, with evidence marked removed.
2. The accepted-contribution database trigger is the authoritative persistence guard in addition to domain validation.
3. Provider adapters remain replaceable ports; live Clerk/Twilio/S3 credentials and A2P/legal attestations are deployment prerequisites, not contract changes.
4. Physical Guestbook/Digital Memory Capsule remains Later and is excluded from this freeze.

No implementation of physical/offline editions, public galleries, AI/transcription, biometrics, cross-product reuse, or permanent cloud hosting is included.

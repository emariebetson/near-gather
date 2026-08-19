# Security, rights, abuse response, and launch gates

## Core types

```ts
type EventType = "WEDDING" | "BABY_SHOWER" | "BIRTHDAY";
type AgeCategory = "ADULT" | "MINOR";
type ContributionVisibility = "HOSTS_ONLY";
type MessagePurpose = "EVENT_TRANSACTIONAL" | "MARKETING";
type BirthdayFormat = "STANDARD" | "MILESTONE" | "SHARED";
type Honoree = { eventId: string; displayName: string; ageCategory: AgeCategory };
type AdultActorAssurance = { actorId: string; version: string; affirmedAt: string };
type GuardianAuthorityRecord = { actorId: string; childHonoreeId: string; purpose: string; recordedAt: string };
type OnBehalfDisclosureReceipt = { actorId: string; childHonoreeId: string; version: string; disclosedAt: string };
```

An adult-controlled invitation party may contain a child attendee, but no child channel or identity. Minor birthdays require `GuardianAuthorityRecord`; adult child-related submissions require `OnBehalfDisclosureReceipt`. Tokens are separate for invite, upload, view, and management; opaque, purpose-scoped, hashed at rest, revocable, expiring, and at least 128 bits of entropy.

## Security requirements

- Organizer/cohost accounts require verified identity and MFA/passkeys; sensitive export/delete/collaborator actions require recent reauthentication.
- Every object/API read and mutation enforces event tenancy server-side. Add negative cross-tenant tests.
- Guest pages are non-indexed, contain no PII in URLs/logs, use no ad pixels/session replay, and apply restrictive CSP, CORS, cache, referrer, framing, and permissions headers.
- Uploads use private quarantine, byte-signature/decoder validation, strict limits, malware scanning, sandboxed processing, metadata stripping, random keys, signed delivery URLs, and raw-byte destruction within 24 hours.
- Logs redact message bodies, media, allergy text, raw phones, bearer tokens, and URLs. Encrypt in transit/at rest; least privilege; managed secrets; audited support access.
- Exports are field-minimized, separate guestbook/logistics, formula-neutralized, short-lived, one-time, and audited.
- Rate-limit invite lookup, upload, auth, export, and messaging. Add idempotency for concurrent submissions and webhook replay protection.

## Rights and abuse operations

Provide self-service or verified request paths for contributor removal, dietary withdrawal, access/export, event deletion, parent/guardian removal, depicted-person removal, and TIDA/DMCA reports. Organizer deletion cannot override a valid individual removal request. Before media launch, staff apparent-CSAM escalation, child-safety reporting, DMCA handling, and a staffed TAKE IT DOWN queue; test 48-hour removal operations.

## Release evidence

Production evidence must cover cross-tenant authorization, adult role enforcement, prevention of minor contact channels, token expiry/revocation, webhook verification, idempotency, malicious-media handling, metadata removal, signed URL expiry, CSAM/TIDA/DMCA exercises, guardian/depic­ted-person workflows, deletion propagation/backups, retention jobs, and birthday minimization. The matched pilot is 15 event pairs (five wedding, five baby-shower, five birthday) with guardrails reported independently for each type.

## Launch blockers

Do not launch data-bearing birthdays until counsel approves participating states, child-honoree notice, legal entity, guardian language, and removal procedures; media-safety operations are staffed; and privacy/security release evidence is reproducible. Defer public galleries, marketing, AI/transcription/biometrics, cross-product reuse, first-touch SMS, direct MMS ingestion, Memory Maker/upsells/partner messages, and physical fulfillment until separately consented and controlled.

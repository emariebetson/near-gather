# Chat 1 change proposals (pending governance approval)

These proposals were the implementation package for Chat 1 governance. Chat 1 Product Command Center v2.0.0 has now approved the resulting birthday/privacy rulings (DEC-030–DEC-037, JRN-BDAY-001, AC-BDAY-001–008, REL-ALP-011–013, REL-PIL-011–012, IP-009). Keep the proposal IDs as the audit trail; prototype backend controls remain simulations.

## CHG-2026-001 — Birthday event type and adult-managed honorees

Add `BIRTHDAY` to event types, scope, states, journeys, fixtures, rollout gates, and matched-pilot reporting. Add `Honoree` with `ageCategory` and `BirthdayFormat` (`STANDARD | MILESTONE | SHARED`); support child, adult, milestone, and shared honorees. Require versioned `AdultActorAssurance`, explicit `GuardianAuthorityRecord` for minor birthdays, and `OnBehalfDisclosureReceipt` for child-related submissions. Prohibit child phone/account/RSVP/contributor/uploader identity. Add audited removal and birthday prompt safety filters.

## CHG-2026-002 — Guest-initiated transactional messaging

Prohibit first-touch outbound SMS from organizer-imported numbers. Require guest-initiated `RSVP <event code>` or documented guest web opt-in. Split `ProcessingNoticeReceipt`, `ConsentGrant`, `MessagingSuppression`, RSVP state, and marketing consent. Implement immediate STOP/equivalent suppression without attendance mutation; keep marketing disabled.

## CHG-2026-003 — Adult participation, dietary controls, and rights

Add adult/guardian receipts, host/cohost duties, child-honoree protections, optional dietary permission and withdrawal, contributor copyright/media license, host-only default, contributor/depic­ted-person/parent/guardian removal, deletion SLAs, exports, retention notices, and request audit records.

## CHG-2026-004 — Browser upload and media safety

Make browser upload the P0 media path. Route inbound MMS media to a short-lived event/identity-scoped upload link. Require quarantine, byte validation, malware scanning, sandboxed processing, metadata stripping, random keys, signed URLs, raw quarantine deletion, and staffed DMCA/TIDA/apparent-CSAM response. Ban public sharing, advertising, AI training, transcription, voiceprints, face recognition, cloning, and cross-product rights.

## Atomic follow-up after approval

The approved ruling requires the PRD, scope ledger, canonical model, acceptance criteria, decision log, experiment specification, dependencies, and release checklist to carry the same contract. Expand the thesis pilot to 15 matched pairs/30 events (five per event type), with three minor-honoree and two adult-honoree birthday pairs, including shared and milestone fixtures; birthday events require at least 10 invited guests. Report guardrails independently by event type.

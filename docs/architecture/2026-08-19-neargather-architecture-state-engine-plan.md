# NearGather Architecture + State Engine Implementation Plan

> **For agentic workers:** implement with test-driven development and verify each gate before advancing.

**Goal:** Build the production-capable NearGather modular-monolith foundation, canonical PostgreSQL model, transactional RSVP state engine, channel contracts, worker boundaries, and operational documentation.

**Architecture:** One TypeScript workspace produces a Next.js web/API process and a background worker. PostgreSQL is canonical; all channels invoke a shared domain command service. Twilio, Clerk, and S3 are accessed only through provider adapters.

**Spec:** The user-approved “NearGather — Architecture + State Engine Build Plan” in this task, with non-conflicting terminology consumed from `docs/product-command-center/`.

## Global constraints

- An attending treatment RSVP must reference an accepted qualifying contribution from the same event and party.
- Party-level contribution gate; guest-level attendance and logistics.
- Guests have no accounts and identity remains event-scoped.
- Organizer-only guestbook; RSVP logistics never enter its projection.
- U.S.-only MVP; weddings, baby showers, and birthday parties; Node.js 24; Next.js 16.2.11; PostgreSQL 18.
- Birthday is a configuration-driven format (`STANDARD`, `MILESTONE`, `SHARED`); formats support adult/minor and multiple honorees without a birthday-specific state machine.
- Organizers, respondents, contributors, and uploaders are adult actors. Minor honorees have no account, contact, RSVP, contribution, upload, or messaging identity.
- `AdultActorAssurance`, `ProcessingNoticeReceipt`, optional consent, media license, SMS suppression, and data-rights evidence are separate records.
- Minor birthdays require `GuardianAuthorityRecord`; child-related submissions require `OnBehalfDisclosureReceipt`.
- Minor-present events require explicit guardian-authority attestation, host-only media, and audited removal/takedown.
- SMS is guest-initiated; imported phone numbers never authorize first-touch outbound messages.
- No microservices, full event sourcing, Redis, Kafka, generic rules engine, global identity graph, AI features, or public gallery.

## Tasks

1. Scaffold the workspace, deployment contract, source-of-truth architecture, ADRs, and IP ledger.
2. Implement and test channel-neutral contracts, adult/minor privacy evidence, birthday policy, state transitions, qualification invariant, next-step resolver, and capability tokens.
3. Implement and test the Drizzle schema, SQL migration, constraint trigger, RLS, idempotency, audit, and outbox storage.
4. Implement and test organizer/guest/QR API application services and Twilio webhook ingestion through provider adapters.
5. Implement and test outbox leasing, media lifecycle boundaries, export/deletion workflows, and worker entry point.
6. Add the minimal Next.js and worker deployables, Render blueprint, health endpoints, and end-to-end fixture.
7. Run the full verification suite and independent code/security review; fix load-bearing findings.

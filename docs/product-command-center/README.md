# NearGather Chat 1 Product Command Center

| Field | Value |
|---|---|
| Document owner | Chat 1 Product Command Center |
| Status | Approved baseline |
| Version | 2.0.0 |
| Last updated | 2026-08-19 |

## Purpose

This directory is the sole product-governance authority for the NearGather P0 MVP. It narrows the rollout strategy to one testable hypothesis:

> Contribution-gated affirmative RSVP materially increases identified guestbook participation versus conventional RSVP followed by a post-event QR guestbook, without causing unacceptable RSVP abandonment.

The source [NearGather Rollout Document](../../NearGather%20Rollout%20Document.md) remains strategic input and is not changed by this package. Where strategy and this package differ, this package controls P0 terminology, behavior, scope, states, acceptance criteria, experiment design, dependencies, release gates, and the private IP register.

## Authority and boundaries

- Chat 1 owns product governance, not application code or detailed engineering task decomposition.
- Downstream workstreams implement against the accepted version of this package. They may propose changes but may not redefine canonical behavior independently.
- P0 is digital-only, United States-only, and limited to weddings, baby showers, and adult-managed birthdays.
- Birthday P0 supports `STANDARD`, `MILESTONE`, and `SHARED` formats. Every organizer, respondent, contributor, and uploader is 18+; a minor may be an honoree only and receives no identity, phone, account, or direct participation path.
- Any contradiction is resolved using the authority order in [Governance and Change Control](governance.md#authority-order).
- Exact transition rules, identity-merge policy, retry/idempotency design, routing internals, scoring formulas, and cross-event reuse architecture are confidential and subject to the [IP and Public-Disclosure Register](ip-public-disclosure-register.md).

## Canonical artifact index

| Artifact | Governs |
|---|---|
| [Governance and Change Control](governance.md) | Authority, versioning, approvals, scope-change process, downstream compliance |
| [MVP Product Requirements Document](prd.md) | Problem, hypothesis, goals, actors, constraints, product behavior, privacy defaults |
| [Scope Ledger](scope-ledger.md) | Stable P0/P1/Later requirement IDs and explicit exclusions |
| [Canonical Model and States](canonical-model-and-states.md) | Terms, entities, lifecycles, invariants, identity and concurrency rules |
| [User Journeys and Acceptance Traceability](journeys-and-acceptance.md) | Canonical journeys, atomic acceptance IDs, requirement mapping, evidence expectations |
| [Matched-Pilot Experiment and Metric Dictionary](experiment-and-metrics.md) | Design, assignment, metrics, thresholds, analysis, guardrails |
| [Dependencies and Handoffs](dependencies-and-handoffs.md) | Workstream order, contracts, handoff register, reusable template |
| [Decision Log](decision-log.md) | Locked decisions, rationale, owner, date, affected acceptance IDs |
| [Release Checklist](release-checklist.md) | External prototype, alpha, pilot, beta, and expansion gates with evidence fields |
| [Confidential IP and Public-Disclosure Register](ip-public-disclosure-register.md) | Invention records, prior art, disclosure status, counsel and permitted-disclosure controls |

## Current release

Version `2.0.0` is the approved birthday-party P0 scope amendment dated 2026-08-19 under `CHG-2026-004`. It incorporates received Chat 2, Chat 8, and Chat 9 delegation evidence without changing the source rollout document. All evidence and handoffs must cite both the document version and the relevant stable IDs. Status terms used throughout are `Approved baseline`, `Not started`, `In progress`, `Passed`, `Failed`, `Blocked`, `Not assigned`, `No evidence recorded`, and `Requires counsel decision`.

## Quick use

1. Confirm scope in the [Scope Ledger](scope-ledger.md).
2. Cite applicable requirement and acceptance IDs from the [PRD](prd.md) and [traceability matrix](journeys-and-acceptance.md).
3. Consume only canonical entities and state transitions from the [model](canonical-model-and-states.md).
4. Complete the [handoff template](dependencies-and-handoffs.md#reusable-downstream-handoff-template).
5. Attach required evidence to the relevant [release gate](release-checklist.md).
6. Route any behavioral or scope change through [change control](governance.md#change-control-process) before implementation.

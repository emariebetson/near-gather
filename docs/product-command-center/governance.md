# Governance and Change Control

| Field | Value |
|---|---|
| Document owner | Chat 1 Product Command Center |
| Status | Approved baseline |
| Version | 2.0.0 |
| Last updated | 2026-08-19 |

## Mandate

Chat 1 is the sole authority for the NearGather PRD, scope, terminology, canonical states, acceptance criteria, matched-pilot experiment, cross-workstream dependencies, release gates, decisions, and IP/public-disclosure register. This authority is product governance; it does not assign implementation tasks or prescribe code architecture.

## Authority order

When artifacts conflict, apply this order:

1. A newer approved entry in the [Decision Log](decision-log.md), limited to the acceptance IDs it explicitly affects.
2. The current approved versions of the [PRD](prd.md), [Scope Ledger](scope-ledger.md), [Canonical Model and States](canonical-model-and-states.md), and [User Journeys and Acceptance Traceability](journeys-and-acceptance.md).
3. The [Experiment and Metric Dictionary](experiment-and-metrics.md), [Dependencies and Handoffs](dependencies-and-handoffs.md), and [Release Checklist](release-checklist.md).
4. The [NearGather Rollout Document](../../NearGather%20Rollout%20Document.md) as non-canonical strategic input.
5. Downstream workstream notes and implementation artifacts.

The [Confidential IP and Public-Disclosure Register](ip-public-disclosure-register.md) independently controls permitted public disclosure and cannot be overridden by a downstream artifact.

## Roles

| Role | Authority |
|---|---|
| Chat 1 Product Command Center | Owns and versions all canonical artifacts; accepts or rejects scope and behavior changes |
| Product owner | Approves product and experiment decisions recorded by Chat 1 |
| Internal research operator | Creates research-only control assignments and matched-pair metadata; cannot change an assignment after publication |
| Organizer/cohost | Configures an event within P0 constraints, grants reasoned host exceptions, manages private event content |
| Adult actor | A person age 18+ acting as organizer, respondent, contributor, or uploader; purchaser and prize-recipient roles are also 18+ if separately authorized after P0 |
| Guardian adult | An adult actor who attests event-scoped authority for a minor-honoree birthday; the minor is never a direct product actor |
| Downstream workstream owner | Implements an approved contract, supplies evidence, and raises change proposals |
| Qualified counsel | Advises on IP, prior art, disclosure, trademark, privacy, consent, and messaging questions; product records the decision but does not substitute for advice |

Unassigned work uses the literal owner value `Not assigned`.

## Versioning

- Documents use semantic versions.
- Patch: clarity or cross-link corrections with no behavior or evidence change.
- Minor: backward-compatible requirement or acceptance additions.
- Major: a changed hypothesis, metric denominator, state semantics, identity rule, gate threshold, privacy promise, event/channel eligibility, or P0 boundary.
- Stable IDs are never reused or renumbered. Removed items are retained as `Retired` with a superseding decision ID.
- Every approved change records date, owner, rationale, affected IDs, compatibility impact, and required downstream re-acceptance in the [Decision Log](decision-log.md).

## Change-control process

1. **Propose.** A workstream submits a change record with current behavior, proposed behavior, reason, affected requirement/acceptance/metric/state IDs, privacy and experiment impact, and delivery urgency.
2. **Block independent redefinition.** Proposed behavior remains `Blocked` for implementation as canonical behavior until Chat 1 records a decision. Work may continue only on unaffected approved behavior.
3. **Assess.** Chat 1 evaluates scope tier, participant impact, metric validity, consent/privacy, IP disclosure, dependencies, migration, and evidence effects.
4. **Decide.** The product owner records `Approved`, `Rejected`, or `Deferred` in the [Decision Log](decision-log.md). Counsel-dependent changes remain `Requires counsel decision` and are not approval to disclose or ship.
5. **Version.** Chat 1 updates every affected canonical artifact atomically, preserving stable IDs and adding supersession links.
6. **Re-hand off.** Affected workstreams submit a revised [handoff](dependencies-and-handoffs.md#reusable-downstream-handoff-template) and re-run affected acceptance evidence.

## Required change-proposal fields

| Field | Required content |
|---|---|
| Proposal ID | `CHG-YYYY-NNN` |
| Status | `Not started`, `In review`, `Approved`, `Rejected`, `Deferred`, or `Requires counsel decision` |
| Requestor and owner | Named workstream and accountable person, or `Not assigned` |
| Current and proposed behavior | Unambiguous before/after statement |
| Affected IDs | Requirements, acceptance criteria, metrics, states, decisions, and gates |
| Impacts | Experiment comparability, privacy/consent, identity, media, operations, accessibility, IP/disclosure |
| Migration | Existing event/participant/data treatment |
| Evidence | Evidence needed to accept the changed behavior, or `No evidence recorded` |

## Downstream compliance rules

- Every handoff must state the PRD version, applicable requirement and acceptance IDs, canonical states consumed, inputs, outputs, telemetry, privacy/compliance constraints, upstream dependencies, and acceptance evidence.
- A workstream may add implementation detail that does not change observable behavior, canonical state meaning, measurement, privacy, or scope.
- Feature flags do not convert deferred scope into P0. The research-only control and prompt routes are the only P0 flags authorized by this baseline.
- Production data must not be reused across events or NearYou products in P0.
- Birthday work must preserve the approved age-band-only honoree model, 18+ direct actors, guardian/on-behalf sequence, and unchanged RSVP, contribution, and conversation state names.
- Guest-list phone import is identity-matching input only and cannot be represented as SMS consent or marketing consent.
- Release evidence must be reproducible and linked from the [Release Checklist](release-checklist.md).
- Exceptions to the contribution gate may use only the documented organizer/cohost path. A manual attendance override is a product defect.

## Review cadence and records

- Review the package before each release gate and whenever an incident or experiment-integrity concern affects canonical behavior.
- Preserve prior versions and decision history.
- Record absent owners as `Not assigned`, unexecuted work as `Not started`, absent artifacts as `No evidence recorded`, and legal-dependent outcomes as `Requires counsel decision`.

## Approved change record

| Field | Record |
|---|---|
| Proposal ID | `CHG-2026-004` |
| Status | Approved |
| Requestor and owner | Product owner / Chat 1 Product Command Center |
| Current and proposed behavior | Supersede the two-event P0 boundary with U.S. weddings, baby showers, and adult-managed birthdays; add birthday/minor policy and expand `EXP-MP-001` to 15 pairs/30 events without changing the thesis metric or gate mechanics |
| Affected IDs | `P0-EVT-001`, `P0-BDAY-001`, `P0-ID-001`, `P0-MEAS-001`, `JRN-BDAY-001`, `AC-BDAY-001–008`, `AC-SMS-007`, `GATE-EXP-004–006`, `REL-ALP-011–013`, `REL-PIL-011–012`, `REL-BETA-001–002`, `IP-009`, `DEC-030–037` |
| Impacts | Event eligibility, adult/minor data policy, consent sequencing, experiment composition, telemetry, release evidence, dependencies, and confidential mechanism tracking |
| Migration | No published production events or participant records are migrated; new birthday behavior requires version 2.0.0 contracts and release evidence |
| Evidence | Received Chat 2 UX delegation, Chat 8 GTM/pilot delegation, and Chat 9 policy delegation; final package verification recorded by the implementing workstream |

The received Chat 2, Chat 8, and Chat 9 delegation records are cataloged once in the [Decision Log change-evidence register](decision-log.md#change-evidence-for-chg-2026-004) as `CHG-EVD-002`, `CHG-EVD-008`, and `CHG-EVD-009`.

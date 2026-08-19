# Release Checklist and Evidence Register

| Field | Value |
|---|---|
| Document owner | Chat 1 Product Command Center |
| Status | Approved baseline |
| Version | 2.0.0 |
| Last updated | 2026-08-19 |

`Passed` requires linked, reviewable evidence. `No evidence recorded` never satisfies a gate. A later gate inherits all earlier applicable gates.

## Before any external prototype

| Gate ID | Requirement | Owner | Status | Evidence | Reviewer / decision date |
|---|---|---|---|---|---|
| REL-EXT-001 | Contribution-gated mechanism documented in the private IP register, including inventors, conception support, and disclosure history | Not assigned | In progress | [Private register entries](ip-public-disclosure-register.md#mechanism-register); inventor/conception evidence: No evidence recorded | Not assigned / No evidence recorded |
| REL-EXT-002 | Qualified counsel completes prior-art and existing-provisional comparison | Not assigned | Requires counsel decision | No evidence recorded | Not assigned / No evidence recorded |
| REL-EXT-003 | Public-disclosure decision and permitted level are recorded for each sensitive mechanism | Not assigned | Requires counsel decision | No evidence recorded | Not assigned / No evidence recorded |
| REL-EXT-004 | NearGather trademark and domain clearance decision is recorded | Not assigned | Requires counsel decision | No evidence recorded | Not assigned / No evidence recorded |
| REL-EXT-005 | No public technical explanation or efficacy claim is published before clearance | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |

## Before internal alpha

| Gate ID | Requirement | Owner | Status | Evidence | Reviewer / decision date |
|---|---|---|---|---|---|
| REL-ALP-001 | Canonical states and identity rules approved | Chat 1 Product Command Center | Passed | [Canonical Model and States v2.0.0](canonical-model-and-states.md), [DEC-007–DEC-012](decision-log.md), and [DEC-030–DEC-036](decision-log.md) | Chat 1 Product Command Center / 2026-08-19 |
| REL-ALP-002 | Treatment happy path passes end to end across applicable web/QR and SMS/MMS paths | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-ALP-003 | Control happy path passes end to end on the shared infrastructure | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-ALP-004 | Duplicate webhook and submission retry scenarios pass | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-ALP-005 | Ambiguous phone and shared-phone attribution scenarios pass without merge or wrong RSVP mutation | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-ALP-006 | Failed upload and fallback recovery scenarios pass | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-ALP-007 | Authenticated channel-switch and state-resume scenarios pass | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-ALP-008 | Direct web decline, multi-person SMS decline confirmation, STOP, and HELP scenarios pass | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-ALP-009 | Organizer-only reasoned exception and absence of undocumented override pass | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-ALP-010 | Private-media authorization, signed-link expiry, deletion, contributor removal, and export paths pass security/privacy review | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-ALP-011 | Standard, milestone, shared, adult-honoree, and minor-honoree birthday fixtures reuse the unchanged RSVP, contribution, and conversation states while preserving gate, `YES`, exception, `NO`, and `STOP` semantics | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-ALP-012 | Positive and negative tests enforce 18+ assurance, guardian authority, on-behalf disclosure, and absence of child identity/phone/account/direct participation | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-ALP-013 | Imported phone data resolves identity only and cannot create SMS consent, marketing consent, or a child-honoree recipient | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |

## Before controlled pilots

| Gate ID | Requirement | Owner | Status | Evidence | Reviewer / decision date |
|---|---|---|---|---|---|
| REL-PIL-001 | U.S. messaging registration is operational for every event-number use case | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-PIL-002 | STOP and HELP behavior is operational and verified not to mutate RSVP | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-PIL-003 | Consent and privacy copy is approved for all channels and contribution types | Not assigned | Requires counsel decision | No evidence recorded | Not assigned / No evidence recorded |
| REL-PIL-004 | Support runbook exists and has an accountable operator | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-PIL-005 | Event-emergency runbook exists and has an accountable operator | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-PIL-006 | Media-failure/fallback runbook exists and has an accountable operator | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-PIL-007 | Ambiguous-identity review runbook exists and prohibits fuzzy merge and undocumented RSVP override | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-PIL-008 | Required telemetry is complete and query-verified in staging, including separate accepted/attending/complete states | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-PIL-009 | Pilot matching, assignment, eligibility, observation cutoffs, exclusions, interview scripts, calculations, and guardrail thresholds are frozen | Not assigned | Not started | [Pilot freeze record](experiment-and-metrics.md#pilot-freeze-record); execution evidence: No evidence recorded | Not assigned / No evidence recorded |
| REL-PIL-010 | Matched-experiment feature flags disable event prompt routes, Memory Maker, prizes, physical materials, and automated follow-ups in both arms | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-PIL-011 | Adult/minor privacy, consent, guardian-authority, on-behalf disclosure, and messaging copy is approved; operations runbook covers withdrawal and blocked child-identity attempts | Not assigned | Requires counsel decision | No evidence recorded | Not assigned / No evidence recorded |
| REL-PIL-012 | Five birthday pairs are frozen as three minor-honoree and two adult-honoree fixtures, include at least one shared and one milestone pair, and every birthday event has at least 10 invited guests | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |

## Before paid beta

| Gate ID | Requirement | Owner | Status | Evidence | Reviewer / decision date |
|---|---|---|---|---|---|
| REL-BETA-001 | At least 15 matched pairs/30 events are complete: five wedding, five baby-shower, and five birthday pairs with the frozen birthday mix | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-BETA-002 | All success thresholds GATE-EXP-001–006 pass or beta scope is restricted per DEC-027 | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-BETA-003 | Guardrails are reviewed against frozen thresholds and accepted | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-BETA-004 | No unresolved severe privacy, identity, RSVP, or media-loss incident remains | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-BETA-005 | Digital-only pricing and refund policy are approved | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-BETA-006 | Storage and support economics support the 12-month retention guarantee | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-BETA-007 | Public efficacy and technical claims remain within recorded permitted disclosure levels | Not assigned | Requires counsel decision | No evidence recorded | Not assigned / No evidence recorded |

## Before scope expansion

| Gate ID | Requirement | Owner | Status | Evidence | Reviewer / decision date |
|---|---|---|---|---|---|
| REL-EXP-001 | Event prompt routes complete a separate usability pilot before production validation/expansion | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-EXP-002 | Printed Deluxe passes separate fulfillment, print QA, deadline, reprint, shipping, and margin gates | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-EXP-003 | Partner programs wait for proven paid conversion | Not assigned | Not started | No evidence recorded | Not assigned / No evidence recorded |
| REL-EXP-004 | NearYou/cross-product reuse receives separate explicit consent and privacy review | Not assigned | Requires counsel decision | No evidence recorded | Not assigned / No evidence recorded |
| REL-EXP-005 | Scope ledger and affected canonical artifacts are changed through an approved decision before implementation | Chat 1 Product Command Center | Not started | No evidence recorded | Not assigned / No evidence recorded |

## Release decision record

| Release stage | Decision | Decision owner | Date | Evidence bundle |
|---|---|---|---|---|
| External prototype | Blocked | Not assigned | No evidence recorded | No evidence recorded |
| Internal alpha | Blocked | Not assigned | No evidence recorded | No evidence recorded |
| Controlled pilots | Blocked | Not assigned | No evidence recorded | No evidence recorded |
| Paid beta | Blocked | Not assigned | No evidence recorded | No evidence recorded |
| Scope expansion | Blocked | Not assigned | No evidence recorded | No evidence recorded |

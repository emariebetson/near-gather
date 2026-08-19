# CONFIDENTIAL — NearGather IP and Public-Disclosure Register

> **Confidential internal working record. Not legal advice.** Access only by authorized NearGather/NearYou personnel and qualified counsel. Do not copy mechanism details into public tickets, demos, marketing, recruiting material, partner documents, or external technical explanations until a permitted disclosure level is recorded.

| Field | Value |
|---|---|
| Document owner | Chat 1 Product Command Center |
| Register custodian | Not assigned |
| Status | Confidential baseline; counsel review not started |
| Version | 2.0.0 |
| Last updated | 2026-08-19 |
| Legal status | Not legal advice; all patentability, freedom-to-operate, trademark, privacy, and disclosure conclusions require qualified counsel |

## Permitted disclosure levels

| Level | Meaning |
|---|---|
| `INTERNAL_CONFIDENTIAL_ONLY` | Share only with authorized internal personnel and counsel under appropriate confidentiality controls |
| `EXTERNAL_UNDER_CONFIDENTIALITY` | Counsel-approved disclosure under an appropriate confidentiality agreement and limited purpose |
| `PUBLIC_HIGH_LEVEL_ONLY` | Counsel-approved high-level benefit/experience language; no protected internal mechanism detail |
| `PUBLIC_APPROVED_DETAIL` | Specific counsel-reviewed detail approved for the named use and version |

Absent a recorded counsel decision, the level is `INTERNAL_CONFIDENTIAL_ONLY`.

## Mechanism register

| IP ID | Mechanism summary | Inventors | First conception date | Supporting private artifacts | Known prior art / existing provisional comparison | Disclosure history | Counsel status | Permitted disclosure level |
|---|---|---|---|---|---|---|---|---|
| IP-001 | Contribution-gated affirmative RSVP: affirmative attendance is unlocked only by an accepted qualifying contribution for an invitation party, with accessibility exceptions distinctly governed. | Not assigned | No evidence recorded | [P0-GATE-001](prd.md#p0-gate-001--contribution-gated-treatment), [RSVP invariants](canonical-model-and-states.md#rsvp-transition-invariants), DEC-004–DEC-007 | No evidence recorded | No evidence recorded | Requires counsel decision | `INTERNAL_CONFIDENTIAL_ONLY` |
| IP-002 | Multimodal SMS/QR/web gate completion: qualifying text or successfully stored audio/video satisfies one gate while preserving channel continuity. | Not assigned | No evidence recorded | [P0-MSG-001](prd.md#p0-msg-001--messaging-media-fallback-and-idempotency), AC-WEB-001–006, AC-SMS-001–006 | No evidence recorded | No evidence recorded | Requires counsel decision | `INTERNAL_CONFIDENTIAL_ONLY` |
| IP-003 | Progressive logistics collection after contribution: accepted contribution confirms attendance, then only applicable required party/member logistics are collected before RSVP completion. | Not assigned | No evidence recorded | [P0-LOG-001](prd.md#p0-log-001--conversational-logistics), [RSVP lifecycle](canonical-model-and-states.md#rsvp-lifecycle), DEC-007/DEC-013 | No evidence recorded | No evidence recorded | Requires counsel decision | `INTERNAL_CONFIDENTIAL_ONLY` |
| IP-004 | Event-scoped cross-channel identity continuity: invitation-token and exact unique-phone authority resume one party RSVP without fuzzy or cross-event merging. | Not assigned | No evidence recorded | [Identity rules](canonical-model-and-states.md#identity-resolution-and-continuity), AC-SMS-001/004, DEC-010–DEC-012 | No evidence recorded | No evidence recorded | Requires counsel decision | `INTERNAL_CONFIDENTIAL_ONLY` |
| IP-005 | Identity-linked RSVP and later prompt routing into one private archive while keeping prompt contributions independent from RSVP state. | Not assigned | No evidence recorded | [P0-ROUTE-001](prd.md#p0-route-001--digital-event-prompt-routes), AC-PRM-001–006, DEC-020–DEC-023 | No evidence recorded | No evidence recorded | Requires counsel decision | `INTERNAL_CONFIDENTIAL_ONLY` |
| IP-006 | Physical/digital prompt-route architecture for exact prompt resolution, invitation or verified-phone identity, and private archive routing. Physical realization is deferred. | Not assigned | No evidence recorded | [Scope Ledger](scope-ledger.md), AC-PUB-005, AC-PRM-001–005, DEC-020 | No evidence recorded | No evidence recorded | Requires counsel decision | `INTERNAL_CONFIDENTIAL_ONLY` |
| IP-007 | Memory Maker scoring and event-to-event prize propagation. Entire mechanism is deferred and prohibited in P0 and the matched experiment. | Not assigned | No evidence recorded | [LTR-GROW-001](scope-ledger.md#later), DEC-021/DEC-028 | No evidence recorded | No evidence recorded | Requires counsel decision | `INTERNAL_CONFIDENTIAL_ONLY` |
| IP-008 | Future cross-event or NearYou relationship graph linking event identities or contributions across products. Entire mechanism is deferred and prohibited in P0. | Not assigned | No evidence recorded | [LTR-ID-001](scope-ledger.md#later), DEC-012/DEC-028 | No evidence recorded | No evidence recorded | Requires counsel decision | `INTERNAL_CONFIDENTIAL_ONLY` |
| IP-009 | Adult-mediated birthday contribution gating for minor honorees: an age-band-only honoree profile is separated from participant identity, with sequenced 18+ assurance, guardian authority, and on-behalf disclosure before child-related content enters the unchanged contribution-gated RSVP flow. | Not assigned | No evidence recorded | [P0-BDAY-001](prd.md#p0-bday-001--adult-managed-birthday-policy), [JRN-BDAY-001](journeys-and-acceptance.md#jrn-bday-001--adult-manages-a-birthday), AC-BDAY-001–008, DEC-030–DEC-036, CHG-2026-004 | No evidence recorded | No evidence recorded | Requires counsel decision | `INTERNAL_CONFIDENTIAL_ONLY` |

## Entry completion template

Use one section per mechanism when evidence becomes available. Do not replace missing information with assumptions.

```markdown
### IP-NNN — Mechanism name

- Status: Not started
- Mechanism summary and distinguishable elements: No evidence recorded
- Inventors and contribution descriptions: Not assigned
- First conception date and basis: No evidence recorded
- Supporting private artifacts with dates and custodians: No evidence recorded
- Known prior art and search scope: No evidence recorded
- Existing provisional/application comparison: Requires counsel decision
- Reduction-to-practice evidence: No evidence recorded
- Disclosure history (who/what/when/confidentiality): No evidence recorded
- Counsel owner and review status: Not assigned / Requires counsel decision
- Permitted disclosure level, audience, purpose, version, and expiry: `INTERNAL_CONFIDENTIAL_ONLY`
- Related PRD, acceptance, decision, and change IDs: No evidence recorded
```

## Public-disclosure decision register

| Disclosure ID | Mechanism IDs | Proposed audience/use | Proposed content/version | Owner | Counsel decision | Permitted level | Date | Evidence |
|---|---|---|---|---|---|---|---|---|
| DISC-001 | IP-001–IP-009 | Any external prototype, marketing, partner, recruiting, press, public demo, or efficacy claim | No external content approved | Not assigned | Requires counsel decision | `INTERNAL_CONFIDENTIAL_ONLY` | No evidence recorded | No evidence recorded |

## Trademark and domain decision

| Record | Owner | Status | Decision | Evidence |
|---|---|---|---|---|
| NearGather trademark/domain clearance | Not assigned | Requires counsel decision | No clearance or usage decision recorded | No evidence recorded |

## Restricted until reviewed

Do not publicly disclose:

- exact state transition and gate validation rules;
- identity matching, ambiguity, shared-phone, or merge policy;
- retry, deduplication, concurrency, or webhook idempotency design;
- prompt-route internals or physical/digital route architecture;
- Memory Maker scoring, leaderboard, prize, or propagation formulas;
- cross-event, cross-product, or relationship-graph architecture;
- birthday/minor assurance, guardian-authority, on-behalf disclosure sequencing, or age-band identity-separation rules;
- unpublished experiment results or efficacy claims.

High-level public wording is also blocked until `REL-EXT-002` through `REL-EXT-005` in the [Release Checklist](release-checklist.md) are satisfied.

## Ordinary feature note

Commodity capabilities such as generic QR generation, standard RSVP forms, ordinary media upload, meal selection, guest-list import, and generic export may be tracked outside this invention register. Their combination with a registered mechanism, or any disclosure that reveals a registered mechanism, remains governed here.

# NearGather Technical Conception Log

This record distinguishes product concepts from concrete technical mechanisms. It is not a novelty or patentability conclusion and does not assign provisional application 64/131,861’s filing date to later work.

| Date | Source | Classification | Record | Evidence status |
|---|---|---|---|---|
| 2026-08-19 | Elizabeth / rollout | Product concept | “Every yes comes with a story”; the RSVP begins the private guestbook. | Confirmed requirement |
| 2026-08-19 | Elizabeth / architecture plan | Technical mechanism | A party-level qualifying contribution is atomically persisted before any guest RSVP enters an attending state. | Planned and under implementation |
| 2026-08-19 | Architecture agent suggestion, user-approved | Technical mechanism | SMS, signed web, and prompt QR inputs normalize into one idempotent command envelope and state engine. | Planned and under implementation |
| 2026-08-19 | Architecture agent suggestion, user-approved | Technical mechanism | Invitation-level gate plus per-guest attendance/logistics rows share one qualifying contribution reference. | Planned and under implementation |
| 2026-08-19 | Architecture agent suggestion, user-approved | Technical mechanism | Deterministic next-step resolution derives from versioned answers rather than a channel-owned conversation cursor. | Planned and under implementation |
| 2026-08-19 | Elizabeth / rollout | Product concept | Event prompt cards route guests to additional private multimedia contributions. | Confirmed requirement |
| 2026-08-19 | Architecture agent suggestion, user-approved | Technical mechanism | Prompt-scoped submit-only capability is distinct from personalized RSVP and organizer guestbook authorization. | Planned and under implementation |
| 2026-08-19 | Architecture agent suggestion, user-approved | Technical mechanism | Media contribution qualification is delayed until durable storage validation and safe derivative readiness. | Planned and under implementation |
| 2026-08-19 | Architecture agent suggestion, user-approved | Technical mechanism | The monolith separates channel adapters from a provider-free domain package so the qualifying-contribution rule remains identical for web, SMS, and QR inputs. | Planned and under implementation |
| 2026-08-19 | User-approved birthday scope / Chat 9 privacy | Product concept | Birthday parties, including child-honoree, adult, milestone, and shared-honoree celebrations, use the private contribution-gated guestbook. | Confirmed requirement |
| 2026-08-19 | Architecture agent suggestion, user-approved | Technical mechanism | Event-local honoree subjects are structurally separate from adult actor identities; minor honorees cannot own contact, RSVP, contribution, upload, or messaging records. | Planned and under implementation |
| 2026-08-19 | Architecture agent suggestion, user-approved | Technical mechanism | A frozen event policy snapshot applies the strictest host-only, guardian-authorized minor-subject policy to a mixed birthday event without per-asset child classification. | Planned and under implementation |
| 2026-08-19 | Architecture agent suggestion, user-approved | Technical mechanism | Split notice, optional consent, media license, SMS suppression, and data-rights records preserve independent revocation and audit semantics. | Planned and under implementation |
| 2026-08-19 | Architecture agent suggestion, user-approved | Technical mechanism | Separate EXEMPT RSVP leaves preserve the contribution invariant while allowing an audited organizer exception. | Planned and under implementation |
| 2026-08-19 | Chat 1 Product Command Center v2.0.0 / CHG-2026-004 | Product contract | Birthday formats are STANDARD, MILESTONE, and SHARED; the P0 pilot includes five birthday pairs with three minor-honoree and two adult-honoree pairs. | Canonical and approved |
| 2026-08-19 | Chat 1 Product Command Center v2.0.0 / IP-009 | Technical mechanism | Versioned AdultActorAssurance plus GuardianAuthorityRecord and OnBehalfDisclosureReceipt keep adult attribution explicit while excluding minors from GuestIdentity and channel records. | Canonical and approved |

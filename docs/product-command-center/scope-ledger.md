# P0 / P1 / Later Scope Ledger

| Field | Value |
|---|---|
| Document owner | Chat 1 Product Command Center |
| Status | Approved baseline |
| Version | 2.0.0 |
| Last updated | 2026-08-19 |

Stable IDs are permanent. Scope changes require the process in [Governance and Change Control](governance.md#change-control-process).

## P0 — required to prove the thesis

| Requirement ID | Capability | Canonical outcome | Status |
|---|---|---|---|
| P0-EVT-001 | Event and invitation setup | Eligible organizer publishes a U.S. wedding, baby shower, or adult-managed birthday with parties, logistics, tokens, routes, and event number | Approved baseline |
| P0-BDAY-001 | Adult-managed birthday policy | Standard, milestone, shared, adult-honoree, and minor-honoree birthdays use 18+ actors, required guardian/on-behalf records, no child identity/contact/account, and shared canonical states | Approved baseline |
| P0-GATE-001 | Contribution-gated treatment | One qualifying required contribution per party gates affirmative attendance; completeness remains separate | Approved baseline |
| P0-CTRL-001 | Research-only control | Internal conventional RSVP shares treatment infrastructure and immutable assignment | Approved baseline |
| P0-ID-001 | Unified event-scoped identity | Token/unique exact phone authority supports cross-channel continuity without fuzzy or cross-event merging | Approved baseline |
| P0-LOG-001 | Conversational logistics | Applicable required answers are validated, reviewable, correctable, and audit logged | Approved baseline |
| P0-EXC-001 | Decline and exception handling | Direct decline, compliant STOP/HELP, confirmed party-wide SMS decline, reasoned host-only exception | Approved baseline |
| P0-MSG-001 | SMS/MMS and fallback | Persist-before-process, deterministic dedupe, secure fallback, concurrency-safe state advance | Approved baseline |
| P0-ROUTE-001 | Digital event-prompt routes | Five to ten exact routes enter the private guestbook without RSVP mutation; disabled in matched experiment | Approved baseline |
| P0-BOOK-001 | Private multimedia guestbook | Host-only original media, private signed access, 12-month guarantee, export and deletion rights | Approved baseline |
| P0-OPS-001 | Organizer dashboard and operations | Separate operational states, review queues, exports, and only documented exceptions | Approved baseline |
| P0-MEAS-001 | Measurement infrastructure | Immutable assignment and complete state/behavior telemetry support the matched pilot | Approved baseline |

Detailed behavior is in the [PRD](prd.md#functional-requirements); evidence traces through [acceptance IDs](journeys-and-acceptance.md#traceability-matrix).

## P1 — after the thesis passes

P1 items are not authorized for P0 delivery and begin only after the [success gate](experiment-and-metrics.md#success-gate) passes and paid-beta release gates are satisfied.

| Requirement ID | Capability | Entry condition | Status |
|---|---|---|---|
| P1-COM-001 | Paid Digital beta and founding-price tests, including Chat 8's non-authoritative 20-event planning mix (8 wedding / 6 baby-shower / 6 birthday) | Thesis and paid-beta release gates pass; a separate approved plan is required | Not started |
| P1-AUTO-001 | Automated reminders and post-event follow-ups | Consent, messaging, frequency, and experiment-confounding review complete | Not started |
| P1-MEDIA-001 | Transcription and richer story organization | Privacy, consent, accuracy, deletion, and cost decisions approved | Not started |
| P1-PROMPT-001 | Prompt libraries, themes, improved presentation | Core guestbook usefulness validated | Not started |
| P1-EXPORT-001 | Advanced exports and duplicate-resolution tooling | P0 operations evidence identifies approved needs | Not started |
| P1-ROUTE-001 | Production validation of event-prompt routes | Separate usability pilot passes | Not started |
| P1-PARTNER-001 | Manual co-branded planner referrals | Paid conversion proven; no reseller infrastructure | Not started |

## Later

| Requirement ID | Capability | Deferral rationale | Status |
|---|---|---|---|
| LTR-PHYS-001 | Deluxe printed cards, packaging, shipping, NFC, fulfillment automation | Separate print, operations, deadline, reprint, shipping, and margin gates required | Not started |
| LTR-GROW-001 | Memory Maker scoring, prizes, leaderboards, event-to-event acquisition | Confounds thesis and requires separate behavioral/IP review | Not started |
| LTR-PARTNER-001 | Affiliate, reseller, planner, venue, multi-client dashboards | Requires proven paid conversion and partner operations | Not started |
| LTR-WHITE-001 | White-label and custom-domain products | Adds tenancy, branding, support, and privacy complexity | Not started |
| LTR-INT-001 | Zola, invitation-platform, CRM, and API integrations | Not needed for thesis; external dependency burden | Not started |
| LTR-EVENT-001 | Reunions, graduations, anniversaries, and event types other than weddings, baby showers, and birthdays | P0 evidence is limited to the three approved event types | Not started |
| LTR-ID-001 | Cross-event identity graph and NearFamily/NearLegacy reuse | Prohibited without separate explicit consent and privacy review | Not started |
| LTR-AI-001 | AI summaries, relationship-aware prompts, time capsules | Not needed for thesis; consent and quality work required | Not started |

## Explicit P0 exclusions

- Printed or customized physical fulfillment of any kind.
- Public control-mode access.
- Event-prompt routes during the matched thesis experiment, despite their P0 build status.
- Public guestbook/gallery or unauthenticated host access.
- Guest self-exemption, undocumented attendance override, name-only fuzzy identity matching, cross-event merge, or global person graph.
- Child identity, phone, account, direct messaging, response, contribution, upload, purchase, or prize-recipient state; imported-phone-derived SMS or marketing consent.
- Automated follow-ups, transcription, pricing tests, paid Digital pilots, upsells, promotions, partner infrastructure, NearYou reuse, cross-product use, AI, Memory Maker, physical fulfillment, or event types beyond weddings, baby showers, and birthdays.

Any attempt to include an exclusion is a scope-change proposal and remains blocked until an approved [decision](decision-log.md) updates this ledger.

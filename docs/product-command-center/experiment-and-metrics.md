# Matched-Pilot Experiment and Metric Dictionary

| Field | Value |
|---|---|
| Document owner | Chat 1 Product Command Center |
| Status | Approved baseline |
| Version | 2.0.0 |
| Last updated | 2026-08-19 |

## Hypothesis and decision use

**Hypothesis:** Contribution-gated affirmative RSVP materially increases identified guestbook participation versus conventional RSVP followed by the same post-event QR guestbook, without causing unacceptable RSVP abandonment.

This is a matched product pilot, not a claim of population-level causal proof. Its frozen gate determines whether NearGather may proceed toward a restricted digital paid beta; it does not authorize public efficacy claims. Public claims remain subject to the [release checklist](release-checklist.md) and [disclosure register](ip-public-disclosure-register.md).

## Design

| Field | Frozen specification |
|---|---|
| Design ID | EXP-MP-001 |
| Minimum sample | 15 matched pairs / 30 events |
| Event-type composition | Five wedding pairs, five baby-shower pairs, and five birthday pairs |
| Birthday composition | Three minor-honoree pairs and two adult-honoree pairs; at least one `SHARED` and one `MILESTONE` birthday fixture |
| Assignment unit | Event |
| Primary analysis unit | Attending eligible invitation party |
| Matching variables | Event type, invitation-count band, party-size mix, RSVP lead time, organizer engagement; for birthdays also birthday format and honoree age band |
| Treatment | Contribution-gated affirmative RSVP plus shared post-event QR guestbook |
| Control | Conventional `YES`/`NO` RSVP plus identical logistics and shared post-event QR guestbook |
| Shared infrastructure | Identity, party model, logistics, consent, media, guestbook, telemetry, privacy, retention, and post-event QR opportunity |
| Prohibited during experiment | Event prompt-card QRs, 5–10 event prompt routes, Memory Maker, scoring, prizes, physical materials, automated reminders/follow-ups |
| Assignment rule | Arm and matched-pair ID are created by an authorized internal operator and become immutable at publication |
| Analysis freeze | Matching, assignment, eligibility, observation cutoff, exclusions, interview scripts, calculations, and thresholds must be frozen before controlled pilots; execution status is `Not started` |

## Eligibility and analysis populations

- An **eligible invitation party** originates from the published guest list, is delivered an invitation under the frozen pilot protocol, is not a test/internal record, and is not `CANCELLED_BY_HOST` before a response opportunity.
- An eligible birthday event has at least 10 invited guests at the publication snapshot, uses an approved birthday fixture, and completes applicable adult/minor policy gates before collection.
- An **attending eligible invitation party** is eligible and is in `ATTENDING_LOGISTICS_INCOMPLETE`, `ATTENDING_COMPLETE`, `EXEMPT_LOGISTICS_INCOMPLETE`, or `EXEMPT_COMPLETE` at the frozen analysis cutoff.
- Uninvited event attendees, internal/test identities, duplicate invitations adjudicated under the frozen resolution rule, and cancelled parties are excluded from invitation-party metrics.
- The **adjusted gate population** excludes host-exception parties from numerator and denominator.
- The **unadjusted/intent-to-treat reporting population** retains host-exception parties under their assigned event arm and reports their contribution outcome; no reassignment or crossover occurs.
- All exclusions are counted, reason-coded, arm-reported, and auditable. An exclusion cannot be introduced after outcomes are inspected.

## Primary metric

### MET-PRI-001 — Accepted identified contribution participation

For each arm:

```text
attending eligible invitation parties with at least one ACCEPTED identified contribution
-------------------------------------------------------------------------------------------
all attending eligible invitation parties
```

**Adjusted value:** exclude parties with `SATISFIED_BY_HOST_EXCEPTION` from numerator and denominator.

**Unadjusted/intent-to-treat value:** include host-exception parties and report whether they later supplied an accepted identified contribution.

**Identified** means the contribution is linked to an event-scoped `GuestIdentity` and invitation party through canonical resolution—not an anonymous or fuzzy match. For treatment, the qualifying required-prompt contribution counts. For both arms, any accepted identified contribution received through the identical post-event opportunity by the frozen cutoff also counts. Each party contributes at most one numerator success regardless of contribution count.

## Success gate

All conditions are conjunctive:

| Gate ID | Pass condition |
|---|---|
| GATE-EXP-001 | Adjusted treatment `MET-PRI-001` is at least `2.0 ×` adjusted control `MET-PRI-001`. |
| GATE-EXP-002 | Adjusted treatment `MET-PRI-001` is at least `+20 percentage points` above adjusted control. |
| GATE-EXP-003 | Treatment RSVP completion rate is no more than `10 percentage points` below control. |
| GATE-EXP-004 | Wedding treatment-control primary-metric difference is not negative. |
| GATE-EXP-005 | Baby-shower treatment-control primary-metric difference is not negative. |
| GATE-EXP-006 | Birthday treatment-control primary-metric difference is not negative. |

If GATE-EXP-001 through GATE-EXP-003 pass overall but an event type is positive yet inconclusive, launch remains restricted to event types with sufficient evidence while an inconclusive type receives additional pilots. A negative directional effect for wedding, baby shower, or birthday fails this baseline gate. Results must show pair-level values, arm aggregates, adjusted values, and unadjusted/intent-to-treat values.

## Metric dictionary

| Metric ID | Metric | Unit and formula | Required segmentation / notes |
|---|---|---|---|
| MET-PRI-001 | Accepted identified contribution participation | Party rate defined above | Arm, matched pair, event type, birthday format, honoree age band, channel, media type; adjusted and unadjusted |
| MET-RSVP-001 | RSVP completion rate | Eligible invitation parties in `DECLINED`, `ATTENDING_COMPLETE`, or `EXEMPT_COMPLETE` by frozen RSVP cutoff ÷ delivered eligible invitation parties | Arm, pair, event type; exceptions separately visible |
| MET-GATE-001 | Gate abandonment | Treatment eligible parties with `gate_displayed` or contribution attempt but no attendance confirmation and no decline by cutoff ÷ treatment eligible parties shown gate | Event type, channel, validation failure |
| MET-TIME-001 | Median RSVP completion time | Median elapsed time from `rsvp_started` to first terminal completed response (`DECLINED`, `ATTENDING_COMPLETE`, `EXEMPT_COMPLETE`) | Arm, event type, channel-switch status; censor incomplete separately |
| MET-EXC-001 | Host-exception rate | Eligible parties granted host exception ÷ eligible invitation parties | Arm, event type, reason category; raw reason remains restricted |
| MET-LOG-001 | Logistics completion without organizer intervention | Attending eligible parties reaching `*_COMPLETE` without organizer answer edits ÷ attending eligible parties | Arm, event type, channel |
| MET-COMP-001 | Guest complaint rate | Unique eligible parties with complaint record ÷ delivered eligible invitation parties | Arm, event, complaint category |
| MET-OPT-001 | SMS opt-out rate | Unique messaged party phones sending `STOP` ÷ unique eligible party phones sent an SMS | Arm, event type; never treated as decline |
| MET-SUP-001 | Support requests per event | Count of unique support cases linked to event ÷ events | Arm, event type, issue type |
| MET-MEDIA-001 | Failed/abandoned media submission rate | Media contribution attempts ending rejected/fallback without accepted recovery by cutoff ÷ media contribution attempts | Arm, channel, media type, failure category |
| MET-DEL-001 | Contribution deletion rate | Accepted contributions later `REMOVED_BY_REQUEST` ÷ accepted contributions | Arm, requester role, media type; no content in analytics |
| MET-USE-001 | Organizer-rated usefulness | Frozen post-event rating instrument summarized by arm and event type | Instrument and aggregation freeze status: `Not started` |
| MET-SWITCH-001 | Channel-switch rate | Parties using more than one authenticated channel during RSVP ÷ parties starting RSVP | Arm, origin/destination channel |
| MET-POST-001 | Post-event contribution participation | Attending eligible parties with accepted contribution from shared post-event route ÷ attending eligible parties | Arm, event type; separates post-event from treatment gate contribution |
| MET-ATT-001 | Attendance confirmation rate | Eligible invitation parties reaching any `ATTENDING_*` or `EXEMPT_*` state ÷ delivered eligible invitation parties | Arm, event type, exception status |

Guardrail decision thresholds not numerically specified above are `Not assigned` and must be frozen before controlled pilots. They may not be selected after arm outcomes are viewed.

## Telemetry event dictionary

All records require `occurredAt`, `eventId`, `eventType`, `experimentArm`, `matchedPairId`, `channel`, `correlationId`, and schema version. Birthday records additionally require `birthdayFormat`, `honoreeAgeBand`, `adultActorAssurancePresent`, `guardianAuthorityPresent`, and `onBehalfDisclosurePresent` when applicable. Invitation/party/adult-identity/contribution/message identifiers are included only when applicable and must remain event-scoped.

| Event name | Trigger | Required outcome/context |
|---|---|---|
| `invitation_delivery_updated` | Delivery attempt or provider update | Invitation, delivery status, provider category |
| `invitation_opened` | Valid invitation link/QR opens | Invitation, route, first/repeat indicator |
| `rsvp_started` | Party begins response flow | Party, invitation, starting state |
| `gate_displayed` | Treatment required prompt shown/returned | Party, prompt, channel, reason including plain `YES` |
| `contribution_attempted` | Text/media submission accepted for validation | Contribution, prompt type, media type, idempotency context |
| `contribution_accepted` | Contribution enters `ACCEPTED` | Contribution, prompt, media type, duration/character band, whether first gate advance |
| `contribution_failed` | Validation exits to rejection, fallback, or quarantine | Contribution, non-content failure category, fallback status |
| `attendance_confirmed` | RSVP first enters `ATTENDING_*` or `EXEMPT_*` | Party, source contribution/control yes/host exception, prior/new state |
| `logistics_completed` | RSVP first enters `*_COMPLETE` | Party, elapsed time, organizer-intervention indicator |
| `rsvp_abandoned` | Frozen abandonment rule is met | Party, last step/state, channel, elapsed time |
| `channel_switched` | Authenticated flow resumes on a different channel | Party, from/to channel, expected question preserved |
| `host_exception_granted` | Authorized reasoned exception | Party, restricted reason category, actor role |
| `support_requested` | Guest or host opens support case | Event/party when known, issue category |
| `party_declined` | RSVP enters `DECLINED` | Party, channel, direct/confirmed, prior state |
| `post_event_contribution_accepted` | Shared post-event prompt response accepted | Contribution, party, media type |
| `contribution_removed` | Contribution enters `REMOVED_BY_REQUEST` | Contribution, requester role, deletion propagation status |
| `media_type_recorded` | Contribution attempt identifies type | Contribution, `TEXT`/`AUDIO`/`VIDEO` |
| `adult_actor_assurance_recorded` | An adult acknowledges the versioned 18+ attestation before collection | Adult actor role, copy version, channel; no birth date or child data |
| `guardian_authority_recorded` | An adult guardian attests authority for a minor-honoree birthday | Presence, authority category, copy version; no child identity/contact data |
| `on_behalf_disclosure_acknowledged` | Adult acknowledges the versioned disclosure before submitting child-related content | Adult role, honoree age band, copy version, contribution correlation |

Event payloads must not contain contribution text, media, free-text dietary answers, full phone numbers, exception reasons, child names, child birth dates, child contact data, or other child identifiers in general analytics. Imported-phone source data is never a consent field.

## Analysis and reporting rules

1. Calculate event-level rates first, then report arm totals and matched-pair differences; retain party-level numerator/denominator counts for audit.
2. Report weddings, baby showers, and birthdays separately and combined; segment birthday reporting by format and honoree age band without child identifiers.
3. Report adjusted and unadjusted/intent-to-treat results together.
4. Do not remove an event or party based on outcome. Apply only frozen exclusions.
5. Report missing telemetry, protocol deviations, support interventions, arm contamination, and unequal post-event opportunity.
6. Treat multiple contributions by one party as one primary-metric success, while retaining contribution-count distributions as descriptive data.
7. Do not interpret `STOP` as decline, archived as deleted, attendance confirmed as RSVP complete, or anonymous/uninvited contributions as primary party participation.
8. Any metric-definition change requires [change control](governance.md) and a versioned re-analysis; it cannot replace the frozen primary result.

## Pilot freeze record

| Item | Owner | Status | Evidence |
|---|---|---|---|
| Matching bands and organizer-engagement rubric | Not assigned | Not started | No evidence recorded |
| Event recruitment and eligibility adjudication rule | Not assigned | Not started | No evidence recorded |
| Assignment sequence and concealment procedure | Not assigned | Not started | No evidence recorded |
| Observation and RSVP cutoffs | Not assigned | Not started | No evidence recorded |
| Guardrail thresholds | Not assigned | Not started | No evidence recorded |
| Interview and usefulness instruments | Not assigned | Not started | No evidence recorded |
| Query/version package and data-quality checks | Not assigned | Not started | No evidence recorded |
| Signed analysis freeze approval | Not assigned | Not started | No evidence recorded |

## Downstream paid-Digital planning boundary

Chat 8 supplied a downstream paid Digital pilot planning input of 20 events: eight wedding, six baby-shower, and six birthday. That P1 planning input is not part of `EXP-MP-001`, does not replace the 15-pair/30-event thesis gate, and cannot authorize paid delivery, Memory Maker, upsells, promotions, partner infrastructure, or physical fulfillment.

# ADR-001: Canonical rulings for concurrent product and architecture baselines

**Status:** Accepted for implementation on 2026-08-19.

Concurrent Product Command Center documents appeared after the architecture plan was approved. Non-conflicting product terms are adopted, but the direct user-approved architecture remains binding where the baselines differ.

## Adopted refinements

- Separate `Party` (household aggregate) from `Invitation` (access/delivery artifact).
- Preserve richer event and contribution lifecycle evidence in append-only audit/state tables.
- Reserve experiment-assignment storage for future research without allowing it to bypass the production treatment invariant.

## Binding architecture rulings

1. **No conventional control bypass in the state engine.** The critical production invariant remains universal in this implementation. A future control arm requires a separately approved state-engine mode and database invariant.
2. **Audited exemptions are separate RSVP leaves.** `ATTENDING_*` always proves an accepted qualifying contribution; `EXEMPT_*` requires a current organizer exemption and is excluded from contribution-gate success metrics.
3. **P0 retention follows the approved privacy policy.** Accepted contributions and preservation masters expire at event date plus twelve months, with earlier removal rights; logistics/contact data expires thirty days after the event. Deletion tombstones cover backups and subprocessors.
4. **Birthday is a first-class format with an adult/minor subject boundary.** `STANDARD`, `MILESTONE`, and `SHARED` are presentation/configuration formats; minor honorees never become actors, and minor-present events use host-only content policy with explicit guardian authority and takedown evidence.

These rulings are reversible through documented change control; they are not silently backported into the Product Command Center artifacts.

## Consequences

- Domain and database work must reject an attending RSVP when its qualifying contribution reference is absent, unaccepted, or belongs to a different event or party.
- Organizer tools may create only an explicit audited exemption; they may not manufacture a qualifying contribution or place an exempt RSVP in an `ATTENDING_*` state.
- Retention and deletion workers are required before data-bearing pilot launch.

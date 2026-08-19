# NearGather Chat 2 UX Spec — Wedding, Baby Shower, and Birthday

The mobile prototype uses one configuration-driven RSVP system for weddings, baby showers, and birthday parties. Birthday supports child, adult, milestone, and shared-honoree fixtures; the primary fixture is **Riley Turns 8**.

## Shared model and state rules

- `EventType` is `wedding | baby_shower | birthday`; birthday variant is research configuration, not a forked application.
- A `Honoree` is a display subject. A child honoree never becomes a contact, account, respondent, uploader, contributor, SMS identity, or consent actor.
- Attendance, contribution, logistics, adult assurance, guardian authority, identity, and messaging permission are separate axes.
- The web CTA opens one continuous RSVP canvas. Adult assurance appears at the top, and the memory submission itself records the affirmative RSVP; before that submission, attendance remains `awaiting response`.
- A qualifying text/audio/video contribution or audited organizer exemption satisfies the affirmative memory gate; required logistics still must be completed.
- In the research-only optional control, an empty contribution is stored as `not_required_control` with `optional_control` provenance and a dedicated research event. It is never labeled `waived` and never shares audited host-exemption provenance.
- `NO` declines attendance without contribution. `STOP` changes messaging permission only. Event-day QR stories and guestbook moderation never change attendance.
- Local progress is saved after each interaction. Original browser-recorded audio/video Blobs remain in IndexedDB; the prototype does not transcode them.

## Adult-managed child safeguards

- Every organizer, cohost, direct respondent, contributor, and uploader confirms they are 18 or older before collection. The versioned prototype assurance is `2026-08-p0`; no date of birth is collected.
- A child-focused birthday also requires guardian/authorized-adult authority before contribution or logistics collection.
- The adult contributor enters their own name. A child honoree name is rejected as contributor attribution.
- Warm disclosure explains that the adult is sharing for a private, adult-managed celebration guestbook. Guest copy does not label the child with legal jargon.
- An under-18 response clears local draft fields, deletes the local media database, persists only the stopped screen, and asks for an adult host.
- Child attendees may appear inside an adult household RSVP for logistics, but receive no interaction identity or direct contact method.

## Primary journeys

### Organizer

Neutral organizer/cohost adult assurance → event type → configurable details (birthday name, optional age/milestone, child-honoree flag) → prompt preview → adult-contact assurance and guest parties → optional plus-ones/meals/dietary questions → custom questions → link/QR/guest-initiated SMS channels → review/publish. No event type, title, honoree, date, or other setup input is available before assurance. Changing the type shows a warning while compatible values remain.

### Guest web

Welcome → `I’m attending — add a memory` → one dynamic RSVP canvas. The canvas shows a quick adult assurance, then the configured prompt with text active by default and audio/video as equal alternatives. The primary action is `RSVP yes with this memory`; it changes attendance to `attending` only after a qualifying contribution or audited exemption. Once the memory is saved, the canvas progressively reveals named attendees, plus-one, enabled meals/dietary questions, custom questions, and review. Smooth scroll transitions replace route clickthroughs, a sticky progress row shows `Memory ✓ · Guests · Review`, and the estimate reads about two minutes. Decline exits directly without assurance or contribution.

Research-only last-screen cells use the same canvas but reveal logistics before the memory section, preserving prior answers. Assurance and disclosure are identical in required and optional-control arms. Optional control remains the only path where the memory action can be completed without a contribution, and it is recorded with `not_required_control` provenance.

The operational label `attending but logistics incomplete` is host-only. Guests see the neutral confirmation `Memory saved — your RSVP is yes.` and the remaining questions, while organizer views retain the derived state and missing-requirements signal.

Declining remains a complete `declined` attendance decision with no required contribution. The decline confirmation offers an optional `I can’t attend, but I’d like to leave a memory` path. That path uses adult assurance, the same host-only text/audio/video safeguards, and a separate memory confirmation; it records `declined:memory_submitted` while attendance stays `declined`.

### SMS/MMS and unknown phone

SMS is an adult, guest-initiated simulation. `YES` saves intent and requests the secure adult contribution link; it never completes attendance. A story before `YES` remains pending. `NO`, `STOP`, `START`, and `HELP` have independent contextual behavior. Unknown-phone recovery remains neutral and disables code entry until adult assurance; no event or guest data appears before verification.

### Event-day QR and guestbook

Birthday QR derives its prompt from all configured honorees, requires adult assurance plus authority before showing text/audio/video controls, and never changes RSVP. A contributor may remain unattributed or enter and validate their own adult name; the name of any child honoree is rejected, and the entered attribution is retained on success. Media stays host-only. Birthday completion and archive headings derive from all honorees—for the shared fixture, `Stories About Riley & Morgan`—without Riley-only fallback copy. Request, remove, restore, hide, and unhide actions are audited simulations and preserve attendance.

RSVP review distinguishes the adult household respondent from the entered adult contributor and displays the contribution’s real status/provenance.

## Scenario Lab and research

The lab exposes all three presets; child/adult/milestone/shared birthdays; guest, organizer, SMS, unknown-phone, QR, guestbook, and error entries; RSVP state; media support; and experiment cells:

- A: “One thing before your RSVP is confirmed” on screen 2.
- B default: transparent copy on screen 2.
- C: transparent copy on the last screen.
- D: “One thing before your RSVP is confirmed” on the last screen.
- Optional-control mode is research-only.

JSON export includes event type, birthday variant, experiment, and timestamped local events. Analyze conversion by event type and child-honoree versus adult/milestone configuration before pooling.

## Production boundary

Authentication, cloud persistence, messaging delivery, transcription, scanning, signed URLs, export/deletion propagation, and formal identity/authority verification are simulated. Production must preserve the original file NearGather received, keep all media host-only for 12 months, and provide an audited takedown path.

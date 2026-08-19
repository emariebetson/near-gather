# Notice, consent, rights, and messaging

## Required records

Replace the overloaded consent boolean with versioned, event-scoped records:

- `ProcessingNoticeReceipt`: notice version, categories, purpose, audience, retention, timestamp, actor, method.
- `ConsentGrant`: optional, purpose-specific grant with scope and withdrawal timestamp.
- `MediaLicenseReceipt`: limited license to host, secure, process, deliver, export, and create the private event artifact.
- `MessagingSuppression`: hashed destination, event/program scope, reason, received/propagated timestamps.
- `DataRightsRequest`: requester type, authenticated actor, target contribution/data, request status, tombstone and SLA evidence.
- `AdultParticipationReceipt`: organizer, cohost, respondent, contributor, and uploader affirm they are 18+.
- `GuardianAuthorityAttestation`: adult actor, child-related purpose, and timestamp; do not collect custody documents.

## Guest notice

Before collection, show NearGather’s legal entity, exact event and hosts/cohosts, fields requested, purpose, organizer export ability, audience (`HOSTS_ONLY` in P0), exact retention date, privacy contact, terms, and rights/removal path. State that organizers can download and redistribute exports. Birthday notices add: adult participation only; adults must not direct a child to respond/upload; child submissions remain host-only; a parent, guardian, depicted person, or authorized representative may request removal.

Organizers must not scrape lists, send unauthorized outreach, collect child channels, market unrelated products, resell data, publicly post contributions, or reuse data in NearYou/NearFamily/NearLegacy. A household lead cannot consent for another adult. Only an authenticated adult organizer/cohost may grant a contribution-gate exception, with reason and audit record.

## Messaging contract

`MessagePurpose` is `EVENT_TRANSACTIONAL | MARKETING`; marketing dispatch is disabled in P0. Organizer-imported numbers never authorize outbound texts. The first SMS is only a guest-initiated `RSVP <event code>` (or a documented web opt-in by the guest).

Initial response identifies NearGather and the event, describes the event-specific exchange, mentions message/data rates, HELP, STOP, and terms/privacy links. No reminders, prize offers, birthday promotions, partner messages, or NearYou marketing launch in P0. Verify webhook signatures, freshness, replay protection, and provider suppression synchronization.

STOP, QUIT, END, REVOKE, OPT OUT, CANCEL, UNSUBSCRIBE, and understandable equivalent revocations immediately set messaging suppression. Suppression never changes RSVP state. Web RSVP remains available without SMS consent and without requiring START.

## Media and sensitive data

Contributor retains copyright. No public, advertising, testimonial, AI-training, transcription, voiceprint, face-recognition, cloning, or cross-product rights. Audio/video UI has active indication, device permission, preview, re-record/remove, and no background capture. Dietary/allergy fields are optional, least-privilege, separately shareable and withdrawable; never use them for analytics, targeting, or relationship graphs.

`ContributionVisibility` is fixed to `HOSTS_ONLY`. A valid removal request hides content immediately and does not alter attendance.

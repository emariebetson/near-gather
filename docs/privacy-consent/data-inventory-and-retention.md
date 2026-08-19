# Data inventory, flows, purpose, and retention

## Inventory contract

| Data | Purpose | Recipients | Default retention |
|---|---|---|---|
| Adult name and invite identity | Event invitation, RSVP logistics | Organizer/cohosts; support only when needed | Event + 30 days |
| Phone number | Matching and guest-initiated transactional SMS | Messaging provider only for enrolled event traffic | Event + 30 days; suppression evidence life of program + 4 years |
| RSVP and household relationship | Attendance planning | Organizer/cohosts; designated logistics vendor only | Event + 30 days |
| Dietary/allergy response | Accommodation | Organizer; explicitly selected caterer | Event + 30 days; optional and independently revocable |
| Text contribution | Private event artifact | Named hosts/cohosts | Event + 12 months |
| Original audio/video/photo and derivatives | Private event artifact | Named hosts/cohosts | Preservation master event + 12 months; raw quarantine ≤24h |
| Event metadata | Invitation, scheduling, expiry | Organizer/cohosts | Event + 12 months, then delete |
| Honoree | Event display only | Hosts/cohosts | Event + 12 months; no minor birthdate/school/address |
| Consent/notice, license, suppression, rights records | Evidence and request handling | NearGather privacy/security staff | As specified below |

No child phone, login, direct response, contributor identity, full birthdate, school, address, or age is collected. Birthday URLs/QR tokens contain no name, age, or date.

## Flow and tenancy requirements

1. Organizer creates an event after verified identity and MFA/passkey, names exact hosts/cohosts, and attests the guest list was lawfully obtained. Imported numbers support matching only.
2. Guest opens an opaque, non-indexed, revocable token or initiates `RSVP <code>` by SMS. Notice appears before text, media, dietary, phone permission, or child-related information.
3. Browser uploads enter event- and identity-scoped quarantine. MMS receives only a short-lived upload link; raw quarantine bytes are destroyed within 24 hours.
4. Accepted content is metadata-stripped, scanned, stored under random object keys, and delivered through short-lived signed URLs. Every read/write enforces event tenancy server-side.
5. Exports are separate guestbook/logistics bundles, require recent authentication, are audited, expire quickly, and neutralize CSV formulas. Downloaded copies cannot be recalled.
6. Deletion creates an immediate access tombstone, erases primary/derivatives within 24 hours, sends processor deletion within 30 days, and replays tombstones on restore.

## Retention schedule

| Data class | Default |
|---|---|
| Accepted contributions and preservation masters | Event date + 12 months |
| Minor attendee names and household logistics | Delete 30 days after event |
| Phone matching, RSVP logistics, and dietary data | Delete 30 days after event |
| Quarantined raw uploads | Delete within 24 hours |
| Data after valid deletion request | Inaccessible immediately; primary erasure within 24 hours |
| Subprocessor copies | Erased within 30 days |
| Encrypted backups | Expire within 180 days; restores replay deletion tombstones |
| Redacted security/audit logs | 12 months |
| SMS consent evidence | Four years after last covered message |
| Hashed messaging suppression | Life of messaging program plus four years |
| Experiment metrics | De-identify after operational records expire |

Send archive-expiry notices 60, 30, and 7 days before deletion. Do not retain child age, birthday, phone, school, location, or relationship graph for analytics.

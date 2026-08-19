# Chat 9 — NearGather privacy, consent, and security package

Status: MVP engineering requirements and pending Chat 1 governance proposals. This package is the implementation contract for the privacy-safe prototype; it does not claim that the current static prototype enforces backend controls.

## P0 scope

`WEDDING`, `BABY_SHOWER`, and `BIRTHDAY` are configuration-driven event types. Birthday formats are `STANDARD`, `MILESTONE`, and `SHARED`; they may honor a child or adult, including multiple/shared honorees. Every organizer, cohost, respondent, direct contributor, uploader, purchaser, and prize recipient is 18+ via versioned `AdultActorAssurance`. Children may be honorees or members of an adult-controlled invitation party only.

## Package map

- [Data inventory and retention](./data-inventory-and-retention.md)
- [Consent, notices, and messaging](./consent-and-messaging.md)
- [Security, media, rights, and launch gates](./security-rights-and-launch-gates.md)
- [Chat 1 change proposals](./change-proposals.md)

## Non-launch blockers

Do not collect real birthday/minor data until qualified counsel approves pilot states, the legal entity and notice, guardian-authority language, removal procedures, and staffed TIDA/DMCA/apparent-CSAM operations. Do not launch public sharing, marketing, AI/transcription/voiceprints, cross-product reuse, first-touch SMS, or unscoped MMS media.

## Review anchors

[FCC messaging rule](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-L/section-64.1200) · [Twilio Messaging Policy](https://www.twilio.com/en-us/legal/messaging-policy) · [COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions) · [Washington My Health My Data Act](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373&full=true) · [TAKE IT DOWN Act guidance](https://www.ftc.gov/business-guidance/resources/complying-take-it-down-act) · [DMCA](https://www.copyright.gov/dmca/) · [FTC security guidance](https://www.ftc.gov/business-guidance/resources/start-security-guide-business)

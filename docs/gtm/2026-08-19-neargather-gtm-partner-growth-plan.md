# NearGather Chat 8 — Three-Event GTM + Adult-Managed Birthday Plan

**Status:** implementation artifact, 2026-08-19  
**Authority:** Chat 1 owns canonical product scope and state semantics. This document is the Chat 8 commercial rollout and partner handoff; conflicts route through Chat 1 change control.

## 1. Locked P0 contract

P0 has three configuration-driven presets: weddings, baby showers, and birthdays. Birthday formats are `STANDARD`, `MILESTONE`, and `SHARED`, supporting adult or minor honorees and multiple/shared honorees; the birthday minimum is ten invited guests. Weddings and baby showers retain their existing minimums.

All direct participation is adult-managed. Organizers, purchasers, respondents, contributors, uploaders, partner contacts, and any future prize recipients must be 18+. A child may be an honoree or attendee, but never has a NearGather account, phone, RSVP, contributor, uploader, contact, analytics, or marketing identity. Media is private to authenticated hosts/cohosts, and contributors get an easy audited removal/takedown path.

P0 excludes Memory Maker, prizes, Deluxe upsells, referral or promotional follow-ups, partner infrastructure, and physical fulfillment. Birthday positioning must never imply a child is the customer or participant.

Canonical RSVP behavior is unchanged:

1. `YES` records intent only and leaves `CONTRIBUTION_REQUIRED`.
2. An accepted contribution confirms affirmative attendance.
3. A documented, audited organizer exemption may confirm attendance; guests cannot self-exempt.
4. `NO` declines without a contribution.
5. `STOP` revokes messaging permission and never changes attendance.
6. Removing content preserves an auditable non-content record and never silently rewrites RSVP history.

## 2. Audience and positioning

Market only to adult organizers and adult professionals: engaged couples, adult wedding organizers, expectant parents, adult baby-shower hosts, adults arranging their own or another adult's birthday, adult parents/guardians/family members arranging a child's birthday, planners, invitation/stationery designers, venues, and photographers.

Do not use schools, daycares, camps, clubs, teams, youth organizations, child-directed creators/apps/games/sites/social accounts, purchased parent/child data, prior-event guest lists, minor contact information, or inferred child profiles.

> **Every yes comes with a story.**  
> **The RSVP that becomes your guestbook.**

Event support copy:

- Wedding — “Begin your guestbook with the stories of how your people know you.”
- Baby shower — “Collect the stories, hopes, and advice surrounding your growing family.”
- Standard/adult birthday — “Gather the memories and messages that make one person’s celebration worth keeping.”
- Milestone birthday — “Bring together the stories that made this chapter worth celebrating.”
- Child birthday — “Privately collect stories and messages from the adults who love them.”
- Shared honorees — “Gather the memories that connect everyone being celebrated.”

Birthday landing pages must state that participation is adult-only, private to authenticated hosts/cohosts, with no public gallery, advertising, AI training, or cross-product reuse; declining needs no contribution; affirmative attendance needs a contribution unless the organizer grants an audited exception; and contributors may request removal.

Required neutral assurance before any birthday RSVP information, contribution, upload, phone permission, or media collection:

> I’m 18 or older and I’m participating as an adult. If I include information or media involving a child, I confirm I’m authorized to share it privately with the event hosts.

Child-honoree events also show:

> This celebration is managed by adults. NearGather does not create accounts, messaging identities, RSVP records, or contributor profiles for children.

The assurance is mandatory. Test comprehension and abandonment, but never weaken the boundary for conversion.

## 3. P0 thesis experiment

### Positioning interviews

Run 16 adult-organizer interviews: four weddings, four baby showers, two standard minor-honoree birthdays, two standard adult-honoree birthdays, two milestone birthdays, and two shared-honoree birthdays.

Pass when 13/16 explain “RSVP plus a story before the event,” 12/16 distinguish NearGather from free RSVP and QR galleries, every birthday participant understands that contributors are adults, at least 7/8 birthday participants understand host-only visibility, nobody believes plain `YES` completes affirmative RSVP, and nobody believes `STOP` declines attendance.

### Matched experiment

Run 15 matched pairs / 30 events:

| Event type | Treatment | Control | Total |
|---|---:|---:|---:|
| Weddings | 5 | 5 | 10 |
| Baby showers | 5 | 5 | 10 |
| Birthdays | 5 | 5 | 10 |

Birthday pairs cover minor-honoree, adult-honoree, milestone, and shared-honoree formats. At least two pairs use 10–19 guests and at least two use 20+ guests; the canonical composition is three minor-honoree pairs and two adult-honoree pairs, including shared and milestone fixtures.

Pass only when treatment contribution participation is at least 2× control, treatment is at least 20 percentage points above control, treatment RSVP completion is no more than ten points below control, no event type has a negative treatment-control difference, zero minor identities are created, and canonical `YES`/`NO`/`STOP`/exemption/removal tests pass.

## 4. Paid Digital pricing test

Start only after the P0 thesis and paid-beta gates pass. Randomize 60 qualified adult decision-makers: 20 wedding, 20 baby-shower, and 20 birthday prospects; ten of each event type per pricing cell.

| Cell | Digital | Deluxe |
|---|---:|---:|
| Founding | $99 | $199 adult-organizer waitlist only |
| MSRP | $149 | $249 adult-organizer waitlist only |

Collect a refundable $25 Digital reservation, provide downward price protection, and count willingness-to-pay only after the full balance is paid. Keep birthday prices event-type neutral. Deluxe waitlist activity is interest, not a sale. Never show Deluxe or referral upsells in guest-facing RSVP flows.

Choose MSRP when its full-paid conversion is at least 65% of founding conversion and contribution per qualified prospect is no lower.

Skeptical economics rule: founding retail and reseller wholesale must not overlap. At $99/$199, $89/$149 wholesale leaves only $10/$50 (10%/25%) gross spread before support, so reseller is a waitlist/design-partner conversation until MSRP parity is active and margin is revalidated.

## 5. Twenty-customer paid Digital pilot

Allocate eight weddings, six baby showers, and six birthdays. Birthday coverage must include standard minor-honoree, standard adult-honoree, milestone, and shared-honoree events; three birthdays with 10–19 guests and three with 20+ guests.

Every birthday verifies an adult organizer and purchaser, adult primary party contacts, assurance before contribution collection, no child contact or respondent record, visible removal/takedown instructions, and host-only access.

Acquisition mix:

- 8 adult warm or second-degree referrals.
- 6 administrator-approved adult communities or creators.
- 6 targeted paid acquisitions to adult organizers.

Do not use schools, youth groups, children's accounts, parent/child data brokers, or event guest lists. Pilot budget ceiling is $1,500; stop paid acquisition if qualified-reservation CAC exceeds the tested contribution ceiling or any safety blocker appears.

## 6. Ten-planner pilot

Recruit six wedding/full-service planners and four adult celebration planners serving birthdays and baby showers. Invitation designers, venues, and photographers are secondary referral conversations, not a P0 infrastructure dependency.

Use a manual, adult-only affiliate test at 25% of collected revenue. Do not build reseller infrastructure in P0. A reseller waitlist may record interest, but wholesale activation waits until founding pricing is closed and three full-MSRP sales validate support and margin.

Partner pitch:

> **Every yes comes with a story.** NearGather privately begins the guestbook during RSVP. Adult guests leave one text, voice, or video memory before completing event details, while NearGather handles setup and support. For celebrations honoring children, participation remains adult-managed and private to the hosts.

Partner rules: market only to adult clients; never contact minors or provide school/youth lists; never present a child as the customer; never reuse client media, honoree likeness, or contributions in portfolios, social posts, proposals, or testimonials; explain that `YES` is intent, accepted contribution confirms attendance, and organizer exceptions are audited; include the removal/takedown path in client materials.

Pilot pass criteria: at least 6/10 planners activate; at least 4/10 source a paid event within 60 days; at least five partner-sourced sales occur; at least one planner produces an approved birthday event; zero prohibited outreach/media reuse; and at least six planners add NearGather to a second adult-facing proposal.

Expected funnel: screen 200 planners → contact 160 → 32 positive replies → 22 calls → 15 signed → 10 active. Treat activation and paid-sourced events as separate gates.

## 7. Contribution planning cases

Net contribution values below are planning scenarios after payment, partner, fulfillment, support, and expected-content costs. They are not guarantees; birthday-specific assurance, moderation, takedown, and partner-support costs must be tracked separately.

| Channel | Pessimistic Digital / Deluxe | Base Digital / Deluxe | Upside Digital / Deluxe |
|---|---:|---:|---:|
| Direct | $10 / $6 | $94 / $128 | $117 / $172 |
| Affiliate (25%) | $11 / **-$19** | $74 / $83 | $90 / $121 |
| Reseller | $34 / **-$3** | $60 / $59 | $73 / $91 |

Base direct CAC ceilings at a 30% contribution floor are approximately $75 Digital and $79 Deluxe. Pessimistic Deluxe affiliate and reseller cases are loss-making; do not scale them on revenue alone. Track D/X separately by event type and guest-count band.

## 8. Measurement contract

Required events:

`offer_assigned`, `reservation_created`, `balance_paid`, `adult_assurance_displayed`, `adult_assurance_confirmed`, `yes_intent_recorded`, `gate_displayed`, `contribution_accepted`, `attendance_confirmed`, `host_exception_granted`, `party_declined`, `messaging_opted_out`, `logistics_completed`, `removal_requested`, `content_hidden`, `content_removed`, `takedown_completed`.

Birthday dimensions: format (`STANDARD`, `MILESTONE`, `SHARED`), honoree age band (adult/minor), guest-count band, adult-managed minor logistics, assurance completion, guardian-authority status, host exception, removal/takedown request, and prohibited minor identity detection.

Never count `YES` as attendance or `STOP` as decline. Report `NO`, `STOP`, exemption, and abandonment separately. Analytics may not contain names, exact ages, birth dates, phone numbers, media, contribution text, or restricted exception reasons. Hiding content is not removal; removal preserves only an auditable non-content record.

## 9. Launch blockers and later mechanics

Block launch for any minor phone/account/RSVP/contributor/uploader identity; direct minor outreach; child-media marketing or partner reuse; P0 Memory Maker, prize, upgrade, referral, or promotional follow-up; plain `YES` directly becoming attending; `STOP` mutating attendance; undocumented exemption; or removal requests without an auditable completion path.

Memory Maker remains outside P0 and the first paid pilot. Any later birthday version requires verified adult-only winner eligibility, no minor claimant/prize account/purchaser, separate adult marketing consent, no public leaderboard, no child-media or contribution reuse, no guest-list retargeting, and privacy/contest/IP/takedown review. Until then birthdays generate no winner notice, prize, Deluxe upgrade, referral CTA, or future-event marketing.

## 10. Acceptance coverage and handoffs

Acceptance fixtures must cover standard minor-honoree, standard adult-honoree, milestone, and shared-honoree birthdays; adult assurance accepted/declined; guardian authority and on-behalf disclosure; plain `YES` leaving contribution required; accepted contribution confirming attendance; audited organizer exemption; `NO`; `STOP`; removal preserving RSVP history; and rejection of minor phone, account, respondent, contributor, uploader, prize, and marketing identities.

Chat 1 must publish the revised canonical baseline before implementation is considered released. Chat 2 owns birthday copy/flow and assurance comprehension; Chat 3 owns configuration/state/analytics interfaces; Chat 9 owns consent, adult-managed disclosure, media access, and takedown controls. Chat 8 owns the commercial tests, partner scripts, economics, acquisition guardrails, and go/no-go reporting.

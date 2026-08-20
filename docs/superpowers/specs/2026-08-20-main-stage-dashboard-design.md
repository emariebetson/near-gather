# Main Stage Dashboard Design

**Goal:** A local-only, interactive companion dashboard for NearGather’s weekly Main Stage review.

## Scope and boundaries

- It is a separate dashboard route/app, never part of the customer-facing NearGather MVP.
- It uses the supplied runway image as a local visual reference/background.
- It starts from a compact static data file. Friday automation updates that data only after a review is completed.
- No production deployment, authentication, network calls, or automatic reading of Codex threads.
- Real editorial headshots are local-preview assets only unless image licensing is later cleared for distribution.

## Experience

The screen is a dark, runway-inspired board: dimmed blue mirrored floor, pink neon perimeter, electric-blue LED motifs, and strong readable panels. The entrance displays the weekly winner and short P0 callout. The body has:

1. **Leaderboard:** a season grid with one column per Main Stage week and summary counters for Wins, Top Three, Bottom Three, Bottom Two, and Eliminations. Placement colors are semantic and accessible by text, not color alone.
2. **Queen cards:** all thirteen owners, each with headshot, emoji, canonical chat name, current placement, operating grade, concise weekly summary, key risk, and next priority.
3. **Detail drawer:** selecting a card opens that queen’s weekly receipts, blockers, commitments, and weekly bet. A clearly labeled Open chat action uses the known Codex thread id/deep-link capability when the desktop host supports it; otherwise it presents the chat name and a Copy chat ID fallback.

## Data model

One typed/local JSON or TypeScript data module holds:

- `week`: review id/date and company-level callouts.
- `queen`: canonical id 00–12, display name, emoji, thread id, headshot asset/source attribution, summary, risk, goal, and ratings.
- `placement`: `WINNER`, `TOP_THREE`, `SAFE`, `BOTTOM_THREE`, `BOTTOM_TWO`, or `ELIMINATED`; exact weekly data preserves Main Stage history.

The first record is the existing 2026-08-19 baseline and counts as Week 0. The interface accepts absent future weeks without inventing results.

## Components and state

- `StageShell`: background, responsive layout, and reduced-motion behavior.
- `WeeklySpotlight`: Winner, P0 callout, and review date.
- `LeaderboardGrid`: accessible row/column labels and placement tokens.
- `QueenCardGrid`: keyboard-operable cards with image alt text.
- `QueenDetailDrawer`: selected queen state, close/focus return, chat action/fallback.

No persistence is required. The selected card is browser-local UI state only.

## Quality and safety

- Desktop-first, responsive down to a single-column card layout.
- Headshots have explicit descriptive alt text; decorative background is hidden from screen readers.
- Respect `prefers-reduced-motion`; avoid flashing effects.
- Do not claim a chat action succeeded unless the host confirms it.
- Preserve P0 product scope and do not modify application functionality, canonical state, privacy rules, or launch decisions.

## Acceptance criteria

- All thirteen current workstreams render with names/emojis and the Week 0 scorecard accurately represented.
- Leaderboard totals equal the displayed weekly placements.
- Selecting every card opens the matching summary/details and returns focus on close.
- The dashboard remains usable at mobile width, keyboard-only, and with reduced motion.
- The local build succeeds; it remains explicitly non-production until image-rights and hosting decisions are made.

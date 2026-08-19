# Task 5 Report

## Changed files

- `apps/worker/src/index.ts`
- `apps/worker/src/outbox.ts`
- `apps/worker/src/outbox.test.ts`
- `packages/db/src/index.test.ts`
- `packages/db/src/migrations/0001_initial.sql`
- `packages/db/src/schema.ts`
- `packages/providers/src/index.ts`
- `packages/providers/src/media.ts`
- `packages/providers/src/media.test.ts`
- `.superpowers/sdd/2026-08-19-neargather-architecture-state-engine-plan/task-5-report.md`

## Commit hash

- `70ed4ce`
- `eb7128e`

## Tests run

- `/Users/elizabethbetson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vitest/vitest.mjs run apps/worker/src/outbox.test.ts`
- `/Users/elizabethbetson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vitest/vitest.mjs run packages/providers/src/media.test.ts`
- `/Users/elizabethbetson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vitest/vitest.mjs run apps/worker/src/outbox.test.ts packages/providers/src/index.test.ts packages/providers/src/media.test.ts`
- `/Users/elizabethbetson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vitest/vitest.mjs run packages/db/src/index.test.ts`
- `/Users/elizabethbetson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vitest/vitest.mjs run packages/providers/src/index.test.ts packages/providers/src/media.test.ts apps/worker/src/outbox.test.ts packages/db/src/index.test.ts`
- `/Users/elizabethbetson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/typescript/bin/tsc --noEmit -p apps/worker/tsconfig.json`
- `/Users/elizabethbetson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/typescript/bin/tsc --noEmit -p packages/db/tsconfig.json`
- `/Users/elizabethbetson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/typescript/bin/tsc --noEmit -p packages/providers/tsconfig.json`

## Notes

- Verified the red phase first with the new focused Vitest suites before implementation; both suites failed because the worker and provider packages exported no Task 5 behavior yet.
- Added a dependency-light worker outbox engine that leases available messages, retries retriable failures after lease expiry, deduplicates by semantic idempotency key, and routes terminal exhaustion to deterministic dead-letter records.
- Hardened the outbox seam and schema so terminal failures persist `dead_lettered_at` and a dead-letter reason distinctly from `published_at`; the in-memory snapshot now preserves that distinction and the DB migration/metadata model it explicitly.
- Added deterministic in-memory worker fakes and a manual clock so lease recovery and duplicate suppression are exercised without a live queue, broker, or database adapter.
- Added a provider-side media lifecycle service with replaceable object storage, scanner, transcoder, repository, and clock ports plus deterministic fakes; the lifecycle now models `UPLOADING -> QUARANTINED -> READY` and `REJECTED`.
- Finalization now requires the current single-use finalize token, enforces expiry against the current clock, scopes the token to event/invitation/media/object state, and rejects replay after the first accepted `READY` finalize.
- Upload grants are short-lived five-minute grants bound to a single object key for a given media record; tokens are now cryptographically random instead of predictable, and interrupted-upload reissues must preserve the original event, invitation, checksum, content type, size, and object scope.
- Added an explicit byte-signature validation port plus max-size enforcement ahead of scanner/transcoder work, so oversize uploads and declared/actual mismatches reject before deeper media processing begins.

## Concerns

- `pnpm exec vitest ...` is still unusable in this workspace because `pnpm` attempts a dependency status/install check and fails with `ERR_PNPM_IGNORED_BUILDS` for `sharp`; all verification used the pinned runtime `node` binary directly instead.
- ESLint could not be executed successfully because the checked-in `eslint.config.mjs` imports `@eslint/js`, but that package is not installed in the current workspace. This blocked lint verification independently of the Task 5 code.
- I represented deletion propagation as a worker job and kept orphan-quarantine cleanup support at the same generic job-handler boundary, but there is still no live persistence or scheduler wiring in scope here; downstream integration will need to map these pure seams onto the real repository/job system introduced by later tasks.

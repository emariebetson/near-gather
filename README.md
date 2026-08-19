# NearGather

Go-to-market rollout and partner-growth decisions are documented in [docs/gtm/](docs/gtm/), including the three-event adult-managed birthday plan for Chat 8.

NearGather is a TypeScript modular monolith for invitations, contribution-gated RSVPs, and private event memory keeping. PostgreSQL is the canonical state store; the web/API process and background worker are separate deployables from one pnpm workspace.

## Prerequisites

- Node.js `24.18.0` (see `.node-version`)
- pnpm `11.19.0` (the version pinned in `package.json`)
- PostgreSQL 18 for database-backed work in later tasks

## Local commands

```sh
corepack enable
pnpm install
cp .env.example .env
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

`pnpm check` runs linting, typechecking, tests, and package builds. Database generation and migrations are intentionally delegated to `@neargather/db`:

```sh
pnpm db:generate
pnpm db:migrate
```

## Workspace boundaries

| Workspace | Responsibility |
| --- | --- |
| `apps/web` | Next.js organizer, guest, QR, and webhook HTTP boundary. |
| `apps/worker` | PostgreSQL outbox consumer and asynchronous media/messaging operations. |
| `packages/domain` | Channel-neutral state transitions and policy decisions. |
| `packages/contracts` | Shared command, event, and provider-port types. |
| `packages/db` | PostgreSQL schema, migrations, transactions, RLS, audit, and outbox persistence. |
| `packages/providers` | Replaceable Clerk, Twilio, and S3 adapter implementations. |
| `packages/testing` | Fixtures, fakes, and cross-package test helpers. |

Only `packages/domain` decides whether a contribution qualifies an RSVP or which state transition is legal. Apps authenticate and normalize input; `packages/providers` makes external calls only behind contracts; `packages/db` is the sole persistence implementation. No package may import from an app, and domain code must not import provider or database adapters.

## Providers and deployment

Clerk provides organizer authentication; Twilio carries SMS; S3 holds quarantined and approved media. They are optional runtime adapters, never the canonical store of invitation, RSVP, contribution, consent, or audit state. The PostgreSQL transactional outbox is the worker handoff; no external broker is introduced.

`render.yaml` is a credential-free deployment skeleton for the web service, worker, and PostgreSQL. Configure all `sync: false` values in Render or another secret manager; do not commit live credentials.

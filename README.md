# UniTrack

Student / lead / application management CRM for education consultancies, built on
**Next.js 16 (App Router) + TypeScript + Prisma + MySQL**, with multi-tenant
consultancy scoping, a role/permission system, file management, payments
(eSewa / connectIPS) and an email engine.

## Requirements

- Node.js 20+
- npm 10+ (the committed `package-lock.json` is required — CI uses `npm ci`)
- A MySQL database (remote or local)

## Setup

```bash
# 1. Install exactly what the lockfile pins
npm ci

# 2. Configure environment
cp .env.example .env.local
#    then edit .env.local with real values (see "Environment" below)

# 3. Create the Prisma client
npx prisma generate

# 4. Apply migrations (non-destructive; only applies pending ones)
npx prisma migrate deploy

# 5. Start the dev server (http://localhost:4028)
npm run dev
```

> The Prisma CLI reads `.env`, **not** `.env.local`. To run CLI commands against
> your local `.env.local`, source it first:
> ```bash
> set -a && . ./.env.local && set +a && npx prisma migrate status
> ```

## Environment

`.env.example` is the tracked template. Every other `.env*` file is git-ignored.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | yes | **≥ 32 chars**, `openssl rand -base64 32`. Enforced at request time. |
| `ENCRYPTION_KEY` | recommended | **≥ 32 chars** and must **differ** from `JWT_SECRET`. |
| `NEXT_PUBLIC_APP_URL` | yes | Used for gateway redirects and CSRF origin checks. |
| `ESEWA_*`, `CONNECTIPS_*` | for payments | Payment gateway credentials. |
| `MASTER_API_URL` / `MASTER_API_KEY` | optional | External master service. |
| `UPLOADS_DIR` | optional | Absolute path for persistent uploads (must be outside `public/`). |
| `TRUST_PROXY` | behind a proxy | `"true"` makes rate limiting trust `X-Forwarded-For`. |
| `LOG_LEVEL` | optional | `debug` \| `info` \| `warn` \| `error` (default `info`). |

Environment is validated by `src/lib/env.ts` (`checkEnv` / `validateEnv`), which
fails fast on missing/weak secrets and rejects reusing `JWT_SECRET` as
`ENCRYPTION_KEY`. `GET /api/health` reports this alongside database reachability.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on `0.0.0.0:4028` |
| `npm run build` | Production build (`next build --webpack`) |
| `npm start` / `npm run serve` | Start the production server |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint (changed files first; full-repo lint is slow) |
| `npm run format` | Prettier write |
| `npm test` / `test:watch` / `test:coverage` | Vitest |
| `npx prisma migrate deploy` | Apply pending migrations |
| `npx prisma studio` | DB browser |

## Health check

```bash
curl http://localhost:4028/api/health
```

Unauthenticated, exposes no tenant data. Returns `200 { status: "ok" }` when the
database is reachable and required env vars are present, `503 { status: "degraded" }`
otherwise. Point load balancers / uptime monitors here.

## Quality gates

CI (`.github/workflows/ci.yml`) runs on every push/PR to `master`/`main`:

1. `npm ci` (reproducible install from the lockfile)
2. `npx prisma generate`
3. `npm run type-check`
4. `npm run lint`
5. `npm test`
6. `npm run build`

Run the same four locally before pushing.

## Project structure

```
src/
├── app/                 # App Router pages (route groups per feature)
│   ├── api/             # API route handlers (auth + permission checks per route)
│   ├── students/        # Students, leads, applications, payments, HR, ... etc
│   └── appconsole/      # Super Admin console (login, overview, consultancies, dashboard)
├── components/          # Shared UI (Sidebar, ui/)
├── lib/                 # Auth, RBAC, tenancy, validation, email, uploads, db
│   ├── db.ts            # Prisma client + consultancy-scoping extension
│   ├── validate.ts      # Shared zod request validation
│   ├── env.ts           # Environment fail-fast checks
│   └── __tests__/       # Unit tests
└── test/setup.ts        # Vitest setup
prisma/
├── schema.prisma        # 65 models
└── migrations/          # Versioned migrations
```

## Architecture notes

- **Tenancy:** every tenant model carries `consultancyId`; `src/lib/db.ts` injects
  the active consultancy into every query via a Prisma `$extends`. Models that are
  intentionally platform-wide are listed in `UNSCOPED_MODELS` (`src/lib/consultancy.ts`)
  — guarded by tests in `src/lib/__tests__/hardening.test.ts`. Never widen that
  allow-list without review.
- **Auth:** HS256 JWT in `httpOnly` cookies (`src/lib/session.ts`), re-validated
  against the DB on every request. CSRF is enforced centrally for every non-GET
  `/api` call in `src/proxy.ts`.
- **Validation:** use `parseJson(req, schema)` + `zodResponse()` from
  `src/lib/validate.ts` in new route handlers instead of hand-rolling checks.
- **Logging:** `logError/logInfo/logWarn` from `src/lib/logger.ts` emit
  single-line JSON (sanitised, no secrets) so output is collector-friendly.
- **Uploads:** hardened in `src/lib/upload-security.ts` (magic-byte sniffing,
  extension/MIME allow-lists, SVG sanitisation, path-traversal protection).

## Deployment

On the production box (Hostinger container):

```bash
bash scripts/deploy.sh
```

The script backs up `storage/`, pulls `origin/master` (fast-forward only), runs
`npm ci`, applies migrations (`npx prisma migrate deploy`), builds, restarts
the app and only reports success once `/api/health` returns 200. A failed
pull, install or build never touches the running process. Per-box settings
(branch, restart command, health URL) go in `.deploy.env` next to the
checkout — see the header of `scripts/deploy.sh`.

Alternatively, GitHub Actions can run the same script over SSH: add the
`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` and `DEPLOY_PATH` secrets, then
trigger the **Deploy** workflow manually. Secrets must be injected via the
environment — never commit `.env.local` / `.env.production`.

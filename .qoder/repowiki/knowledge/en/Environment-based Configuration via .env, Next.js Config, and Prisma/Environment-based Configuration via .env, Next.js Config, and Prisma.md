---
kind: configuration_system
name: Environment-based Configuration via .env, Next.js Config, and Prisma
category: configuration_system
scope:
    - '**'
source_files:
    - .env.example
    - next.config.mjs
    - image-hosts.config.mjs
    - prisma/schema.prisma
    - src/lib/db.ts
    - src/lib/session.ts
    - src/lib/master-api.ts
    - src/lib/csrf.ts
    - src/lib/logger.ts
    - tailwind.config.js
---

## Overview

The UniTrack application uses a straightforward environment-driven configuration system built on top of Next.js. There is no centralized config loader or feature-flag framework; instead, runtime settings are read directly from `process.env` at module load time across several layers: the Next.js build/runtime config, Prisma database connection, JWT secrets, and per-feature toggles.

## Environment Variables

All required and optional runtime variables are documented in `.env.example`, which defines the canonical set:
- `DATABASE_URL` — Prisma datasource URL (MySQL template shown, but runtime uses SQLite)
- `JWT_SECRET` — HMAC-SHA256 signing key for session tokens
- `MASTER_API_URL` / `MASTER_API_KEY` — upstream master service endpoint and bearer key
- `NODE_ENV` — controls cookie security flags (`secure: true` only when production) and logging behavior
- `NEXT_PUBLIC_APP_URL` — used by CSRF origin validation

A local `.env` file exists alongside `.env.example` and is loaded by Node/Next automatically. No schema validation is performed on env vars at startup — missing `JWT_SECRET` throws at first use inside `src/lib/session.ts`, and `MASTER_API_URL`/`MASTER_API_KEY` fall back to defaults with an `isConfigured()` guard in `src/lib/master-api.ts`.

## Next.js Build & Runtime Config

`next.config.mjs` is the single source of Next-level configuration:
- `distDir` is overridden by `process.env.DIST_DIR`
- Image remote hosts are imported from `image-hosts.config.mjs` (a small JS array of `{protocol, hostname}` entries), keeping image allowlists out of `.env`
- Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy) are hardcoded in the `headers()` hook
- `serverExternalPackages` excludes `@prisma/client` and `prisma` from bundling

There is no Next `publicRuntimeConfig` or `env` section — all public-facing values must be prefixed `NEXT_PUBLIC_` if consumed by client code.

## Database Configuration

Prisma is configured in `prisma/schema.prisma`:
- `datasource db { provider = "sqlite"; url = env("DATABASE_URL") }` — reads the DB URL from `process.env.DATABASE_URL`
- The generator uses `engineType = "library"` (Prisma Client bundled as a library rather than a binary)

The app singleton for the client lives in `src/lib/db.ts`, which caches `PrismaClient` on `globalThis` during development to avoid hot-reload leaks.

## Feature & Service Configuration Modules

Configuration is not centralized into one place; each subsystem reads its own env vars:
- **Session/JWT**: `src/lib/session.ts` reads `JWT_SECRET` and throws if empty; signs HS256 tokens expiring in 24h
- **Master API client**: `src/lib/master-api.ts` reads `MASTER_API_URL` and `MASTER_API_KEY`; calls return `null` when either is unset
- **CSRF validation**: `src/lib/csrf.ts` builds an allowed-origin list from `NEXT_PUBLIC_APP_URL` plus hard-coded localhost origins
- **Logging**: `src/lib/logger.ts` redacts sensitive fields (password, token, secret, authorization, cookie, credentials) via regex before printing, and suppresses output in `NODE_ENV === "test"`
- **Seed/admin scripts**: `src/lib/seed-admin.ts` reads `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` with sensible defaults

## Hardcoded Defaults vs. Env Overrides

Several modules blend env vars with fallback defaults rather than failing fast:
- `MASTER_API_URL` defaults to `http://localhost:5000`
- `NEXT_PUBLIC_APP_URL` defaults to `http://localhost:4028`
- Cookie `secure` flag is gated on `process.env.NODE_ENV === "production"` in login/me routes
- Logger skips output in test mode

## Static Module-Level Config Files

Some non-secret configuration lives in plain JS files committed to the repo:
- `image-hosts.config.mjs` — allowed image CDN hostnames
- `tailwind.config.js` — design tokens (colors, fonts, animations, spacing) defining the UI theme
- `postcss.config.js`, `eslint.config.mjs`, `vitest.config.mjs`, `react-doctor.config.json` — tooling configs
- `data/nepal/*.json` — static reference data (provinces, districts, municipalities)

## Conventions Observed

1. Secrets go exclusively in `.env` (never committed); non-secret module options live in `.mjs`/`.js` config files under the repo root.
2. Each feature module owns its own env var access — there is no shared `config.ts` that aggregates them.
3. Missing critical secrets cause failures at first use (e.g., `JWT_SECRET`), not at import time.
4. Optional integrations (master API) degrade gracefully by returning `null` when their env vars are absent.
5. Production behavior is controlled by checking `process.env.NODE_ENV` against string literals like `"production"` and `"development"`.
6. Database connection strings are the only place where `env(...)` interpolation happens outside of `process.env` (in Prisma's schema).
7. Publicly exposed browser-side URLs must use the `NEXT_PUBLIC_` prefix convention so Next.js can bake them into the bundle.
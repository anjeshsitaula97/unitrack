---
kind: build_system
name: Next.js App Router Build, Test & Screenshot Tooling
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - next.config.mjs
    - vitest.config.mjs
    - tsconfig.json
    - postcss.config.js
    - tailwind.config.js
    - scripts/screenshots.mjs
    - scripts/capture-realshots.mjs
    - scripts/add-metadata.js
    - prisma/schema.prisma
    - prisma/seed-universities.ts
    - prisma/seed-roles.ts
    - prisma/seed-notifications.ts
    - prisma/seed-activities.ts
    - start-dev.bat
    - start-server.bat
    - .env.example
---

## Build System Overview

This repository is a **single Next.js application** (App Router) built and run entirely through npm scripts. There are no Makefiles, Dockerfiles, or CI pipelines in the repo; build orchestration lives in `package.json` plus a small set of Node scripts.

### Core Build Commands
- `npm run dev` — starts the Next.js development server on port **4028** (`next dev -p 4028`).
- `npm run build` — runs `next build`, emitting artifacts to `.next/` (configurable via `DIST_DIR` env var).
- `npm run start` / `npm run serve` — alias for running the dev server; production would use `next start`.
- `npm run type-check` — runs `tsc --noEmit` against `tsconfig.json`.
- `npm run lint` / `npm run lint:fix` — ESLint v9 with `eslint-config-next`, `@typescript-eslint`, `eslint-plugin-prettier`, and `eslint-plugin-unused-imports`.
- `npm run format` — Prettier writes over `src/**/*.{ts,tsx,css,md,json}`.
- `npm test` / `npm run test:watch` / `npm run test:coverage` — Vitest runner.
- `npm run seed:universities` — seeds reference data via `npx tsx prisma/seed-universities.ts`; Prisma's own `prisma seed` command is wired to the same script.

### Next.js Configuration (`next.config.mjs`)
- Output directory defaults to `.next`, overridable by `DIST_DIR`.
- Turbopack file-system cache disabled in dev (`turbopackFileSystemCacheForDev: false`).
- Remote image hosts are loaded from a separate `image-hosts.config.mjs` module.
- `serverExternalPackages` forces `@prisma/client` and `prisma` to be treated as server-only packages so they can be bundled at runtime.
- Global security headers are applied via the `headers()` hook: X-Frame-Options DENY, X-Content-Type-Options nosniff, XSS protection, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy disabling camera/microphone/geolocation, HSTS with preload, and a permissive Content-Security-Policy that allows `'unsafe-inline'` and `'unsafe-eval'` for scripts/styles and whitelists Google Fonts and Unsplash images.

### Testing Setup (`vitest.config.mjs`)
- Tests live under `src/**/*.test.{ts,tsx}` and `src/**/*.spec.{ts,tsx}`.
- Uses `jsdom` environment with global `describe/test/expect` enabled.
- Shared setup file at `./src/test/setup.ts`.
- Path alias `@` resolves to `./src` so tests import using the same aliases as the app.

### Database / Schema Build Step
- Prisma schema lives in `prisma/schema.prisma`.
- Seed scripts under `prisma/` (`seed-universities.ts`, `seed-roles.ts`, `seed-notifications.ts`, `seed-activities.ts`) are executed via `npx tsx` directly — there is no `prisma generate` or `prisma migrate` script in `package.json`, so developers must run Prisma CLI commands manually.
- A local SQLite database (`prisma/dev.db`) ships with the repo alongside a read-only copy (`prisma/check-counts.ts`, `prisma/dump-roles.ts`).

### Screenshot / Documentation Automation
Two Puppeteer-based scripts drive headless browser automation against the running dev server:
- `scripts/screenshots.mjs` — logs into `/login` with hardcoded credentials (`anjeshsitaula.arj@gmail.com` / `admin`), navigates to ~35 pages (dashboard, HR modules, settings tabs, universities, courses, students, leads, access, staff, api-keys, reports, chat, tickets, notifications, tasks, automations, featured, expenses, payments, search, analytics, learning-hub), waits for `networkidle0`, then captures full-page PNGs into `public/screenshots/`.
- `scripts/capture-realshots.mjs` — similar flow but navigates via sidebar `<a>` links instead of direct URLs to keep client-side routing intact; outputs to `public/screenshots/` as well.
- Both scripts launch Puppeteer headless with `--no-sandbox --disable-setuid-setuid-sandbox` and a fixed viewport of `1440x900`.

### Windows Convenience Scripts
- `start-dev.bat`, `start-server.bat`, `run-dev.bat`, `run-dev-task.bat` are batch wrappers around `npm run dev` / `next dev -p 4028`. They hardcode an absolute path on `D:\Coding\...`, so they are developer-local convenience files rather than portable build artifacts.

### External Subproject
- `scanner-agent/package.json` + `index.js` defines a standalone Node process (likely a background worker) with its own dependencies; it is not part of the Next.js build graph.

### Conventions Observed
- All build/runtime configuration is centralized in `next.config.mjs`, `postcss.config.js`, `tailwind.config.js`, and `tsconfig.json`; there is no monorepo tooling (no lerna, nx, turborepo, etc.).
- The project pins major versions for critical dependencies via the `rocketCritical.dependencies` / `devDependencies` metadata block in `package.json` (with an explicit warning not to remove them).
- Environment variables control behavior: `DIST_DIR` overrides the output folder; other runtime config (e.g., email, DB URL) is expected via `.env` (see `.env.example`).
- No containerization or CI pipeline exists in this repository; deployment is assumed to be done externally by copying the `.next` build or running `next start`.
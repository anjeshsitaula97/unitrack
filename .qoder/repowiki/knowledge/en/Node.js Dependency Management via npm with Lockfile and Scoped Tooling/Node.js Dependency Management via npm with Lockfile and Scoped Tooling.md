---
kind: dependency_management
name: Node.js Dependency Management via npm with Lockfile and Scoped Tooling
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - scanner-agent/package.json
    - .opencode/package.json
    - prisma/schema.prisma
---

## System / Approach

The repository uses **npm** as the package manager for all Node/TypeScript dependencies. The root `package.json` declares runtime and development dependencies, and a `package-lock.json` is committed at the repository root to pin exact transitive versions. There are no private registries, `.npmrc`, or vendored `node_modules`; dependencies are resolved from the public npm registry.

Two additional small Node projects coexist in the monorepo:
- `scanner-agent/package.json` — a standalone Node script (no dependencies beyond Node built-ins) that exposes a local HTTP server on port 5899 to enumerate and drive Windows WIA/PnP/TWAIN scanners via PowerShell.
- `.opencode/package.json` — a tiny project declaring only `@opencode-ai/plugin@1.18.31`, used by the Opencode AI tooling under `.opencode/`.

## Key Files

- `package.json` — single source of truth for application dependencies, scripts, Prisma seed config, and an `allowScripts` block.
- `package-lock.json` — committed lockfile ensuring reproducible installs across environments.
- `scanner-agent/package.json` — isolated dependency manifest for the scanner helper process.
- `.opencode/package.json` — isolated dependency manifest for the Opencode plugin.
- `prisma/schema.prisma` + `prisma/*.ts` — Prisma client (`@prisma/client`) and CLI (`prisma`) are declared as dependencies; seeding is wired through the `prisma.seed` field in `package.json`.

## Architecture and Conventions

- **Single-root dependency graph**: All production and dev dependencies live in the root `package.json`. Subprojects (`scanner-agent`, `.opencode`) have their own minimal manifests but do not share a workspace configuration — they are independent Node processes.
- **Version strategy**: Most packages use caret ranges (`^x.y.z`). Notable exceptions: `react` and `react-dom` are pinned to `latest`, which intentionally defers to the latest published version rather than a fixed semver range. Tailwind and PostCSS are pinned to exact minor versions (`tailwindcss@3.4.6`, `postcss@8.4.8`) to avoid CSS pipeline drift.
- **Prisma integration**: `@prisma/client` and `prisma` are both listed as dependencies (not just devDependencies), and `package.json`'s `prisma.seed` field points to `npx tsx prisma/seed-universities.ts`, making seeding part of the standard npm lifecycle.
- **Scripted entry points**: `dev`, `build`, `start`, `lint`, `format`, `serve`, `type-check`, `test`, `test:watch`, `test:coverage`, and `seed:universities` are the canonical npm scripts. No custom dependency install/update scripts exist.
- **Postinstall / allowScripts**: The `allowScripts` block explicitly permits postinstall/build scripts for `@prisma/client`, `@prisma/engines`, `prisma`, `esbuild`, `core-js`, and `unrs-resolver`. This is the repo's mechanism for controlling which native/scripted dependencies may run code during install.
- **No workspace / monorepo tooling**: There is no `pnpm-workspace.yaml`, `yarn workspaces`, or `npm workspaces` configuration. Each subproject manages its own `node_modules` independently.

## Conventions and Constraints

- **Lockfile is authoritative**: `package-lock.json` is present at the repository root and should be kept in sync with `package.json` changes when adding/upgrading dependencies.
- **Scoped tooling separation**: Development-only tooling (ESLint, Prettier, TypeScript, Vitest, Puppeteer, JSDOM, Zod) lives exclusively in `devDependencies`; runtime-only libraries (Next.js, React, Prisma client, bcryptjs, jose, etc.) go in `dependencies`.
- **Critical dependency annotation**: A `rocketCritical` section in `package.json` enumerates Next.js, React, Tailwind typography, Recharts, TypeScript, ESLint, Prettier, and related tooling as critical, with an explicit warning comment stating they must not be removed or modified because they are required for "Next.js 15 TypeScript app functionality". This acts as a human-readable convention guardrail (not enforced by tooling).
- **No private registry or proxy configured**: No `.npmrc`, `NPM_CONFIG_REGISTRY`, or `proxy` settings were found in the repository. Dependencies resolve against the default public npm registry.
- **Scanner agent has zero external deps**: `scanner-agent/index.js` uses only Node core modules (`http`, `child_process`, `path`, `fs`, `os`) and invokes system PowerShell/WIA APIs directly, so it carries no npm dependencies.
- **Optional Redis note**: A comment in `src/lib/rate-limit.ts` documents that `ioredis` can be installed for rate limiting, indicating that Redis-backed rate limiting is an optional add-on rather than a required dependency.
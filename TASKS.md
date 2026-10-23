# Task List (paused 2026-10-23)

Resumable status snapshot. Local dev server on port 4028 has been stopped.

## Done & pushed to `master`
- `f06e165` — Course "Postgraduate" save fix (`src/app/api/courses/route.ts` now reads `data.level`); upgraded `recharts` v2→v3 and `eslint` v9→v10; Node v24 Windows `fs.readlink` EISDIR webpack-build workaround (`scripts/patch-readlink.cjs` + `next.config.mjs`).
- `bbf505f` — npm audit remediation: `vitest` 4→5 (+ `@types/node` 20→22 for its peer) cleared the `vitest`/`vite`/`@vitest/mocker` advisories; added `braces`/`micromatch`/`fast-glob` overrides. Audit count **13 → 10**. Verified `tsc --noEmit` clean and `next build` passes (190 routes).

## Status: all tasks resolved (updated 2026-10-23)

- Logo: root cause CONFIRMED = deploy wipes gitignored `storage/uploads` (the 6 logo files referenced in the DB are absent locally/in-repo; serving + auth code verified correct). Chosen fix: re-upload the logos in production (user action) — no code change. To prevent recurrence later, set a persistent `UPLOADS_DIR` outside the repo or move to object storage.
- npm audit: migrated Tailwind v3.4 -> v4 (compat `@config`), commit `9282af8` pushed; vulnerabilities reduced 13 -> 7 (build + dev verified clean). The remaining 7 are the ESLint chain (`eslint-config-next` -> fast-glob/micromatch/braces) + `@tailwindcss/typography`/postcss-selector-parser; they only clear via regressive downgrades, so left in place (dev-only, no production risk).

## Original notes

### 1. University logo not showing after relogin (resolved)
- Code path reviewed and found correct: `src/app/api/uploads/[...path]/route.ts`, `src/lib/upload-access.ts`, `src/lib/upload-storage.ts`, `src/app/api/upload/route.ts`, `src/proxy.ts`, `src/lib/session.ts`.
- Leading hypothesis is **environmental**: files live in gitignored `storage/uploads` (no `UPLOADS_DIR` set) and may be wiped on deploy; `Cache-Control: private, max-age=3600` masks the missing file until relogin forces a fresh 404.
- **Next step:** user to run "Open image in new tab" on a broken production logo and report the status:
  - 404 → storage wiped → set persistent `UPLOADS_DIR` + re-upload (or object storage S3/R2).
  - 401/403 → session/auth layer fix.
  - loads fine → `<Image>`/CSP rendering fix.

### 2. Remaining 10 npm audit vulnerabilities (decision needed)
- All are **dev-only** DoS/CPU-exhaustion advisories; zero production runtime exposure.
- Root cause of all 7 HIGH is `braces` (advisory range `*` — no patched release exists).
- Only remediation is the breaking **Tailwind 3.4 → 4.x** migration (CSS-first `@theme`, drop `@apply` for custom classes like `badge`, PostCSS plugin move) — OR a regressive `eslint-config-next` downgrade to 14.2.35 (not viable for Next 16).
- **Recommendation:** accept the 10. **If pursued:** do Tailwind v4 as its own careful task with full build + visual QA.

### 3. Local DB unreachable (informational, not code-fixable)
- `.env` / `.env.local` `DATABASE_URL` → remote `srv1633.hstgr.io:3306`; port 3306 TCP times out (DROP) from local public IP. Production works because it connects internally.
- Options: hPanel Databases → Remote Access firewall allowlist (distinct from phpMyAdmin `%` grant), local MySQL, or SSH tunnel.

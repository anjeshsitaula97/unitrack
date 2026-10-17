# UniTrack — Engineering & DevOps Assessment

Assessed: 91,387 LOC across `src` (375 `.tsx`, 299 `.ts`), **153 API route handlers**, **65 Prisma models**, MySQL via Prisma, Next.js 16 App Router.

## Verdict: **6 / 10** — well-built application, not yet production-operable

The *code* is meaningfully better than typical startup CRM code (strict TS, real RBAC, careful upload/tenancy handling). The *operations* around it — build reproducibility, CI/CD, testing, observability, secrets, repo hygiene — are largely absent. In 30 years the pattern is consistent: applications like this ship, then hurt you at 3am because nothing is measurable and nothing is automated. Everything below is fixable in ~2–3 focused weeks.

### Scorecard

| Dimension | Score | Notes |
|---|---|---|
| App security (auth/RBAC/input) | 8/10 | Strong foundations; gaps remain |
| Architecture & tenancy | 7.5/10 | Clever Prisma scoping, but fragile implicit magic |
| Type-safety & code hygiene | 7/10 | No `any`, no `@ts-ignore`; but giant components |
| Data modeling & migrations | 7/10 | 65 models, 117 indexes, versioned migrations |
| Testing | 3/10 | 759 LOC of lib unit tests only; no route/component/e2e |
| CI/CD & build reproducibility | 2/10 | No CI, no Docker, lockfile gitignored, `react: "latest"` |
| Observability & ops | 2/10 | `console.error` wrapper only; no health check, metrics, tracing |
| Config & secrets | 3/10 | Live secrets on disk; shared JWT/encryption key |
| Repo hygiene | 3/10 | Corrupted `.git`, `._*` files, 147 KB `doctor-full.txt`, boilerplate README |

## What's genuinely strong (don't touch)
- **Auth core**: HS256 pinned with issuer/audience + alg allowlist, 12h expiry, secret-strength fail-fast; `getSession` re-reads role/status from DB each request (`src/lib/session.ts`, `src/lib/api-utils.ts:122`).
- **CSRF enforced centrally** on every non-GET `/api` call via `src/proxy.ts` — the right layer.
- **Uploads**: magic-byte sniffing, whitelists, SVG sanitization, UUID names, traversal guards, restrictive serve CSP (`src/lib/upload-security.ts`, `upload-access.ts`).
- **No SQLi/XSS**: only parameterized `$queryRaw` (rate limiter); zero `dangerouslySetInnerHTML` outside your email preview; React escaping everywhere.
- **Tenant isolation** via a Prisma `$extends` that injects `consultancyId` (`src/lib/db.ts`) — powerful, see caveats below.
- Rate limiting on login/OTP/reset/checkout; bcrypt cost 12; API keys stored as SHA-256 hashes.

## Must-fix, prioritized

### P0 — before any production use
1. **Repo is corrupt.** `.git/objects/pack/._*` AppleDouble files make `git status`/`git log` fail with `non-monotonic index`. Every commit is a gamble right now. Back up, `git repack`/re-clone clean, add `._*` to global gitignore.
2. **Builds are not reproducible.** `package-lock.json` is **gitignored** (`.gitignore`), and `react`/`react-dom` are pinned to `"latest"` in `package.json`. A clone today resolves different code than your machine. Commit the lockfile, pin `react`/`react-dom` to exact versions, and switch CI to `npm ci`.
3. **Input validation is almost nonexistent.** `zod` is imported in **2 of 153** routes (`auth/login`, `access`). Everything else hand-validates or trusts the body. Adopt a shared `zod` schema per route (or a `parseBody(schema)` helper) — this is where your next data-corruption bug lives.
4. **No CI/CD at all.** No `.github/workflows`, no `Dockerfile`, no pipeline. At minimum: on PR run `type-check` + `lint` + `test` + `build`; on merge build and deploy. Without this, "it works on my machine" is your only gate.

### P1 — operational readiness
5. **Observability is a `console.error` wrapper** (`src/lib/logger.ts`). No error tracking (Sentry/GlitchTip), no structured JSON logs, no request IDs, no metrics, no `/api/health` (I checked — it doesn't exist). You cannot currently answer "is it up?", "how slow?", or "what broke for user X?".
6. **Secrets management.** `.env.local` and `.env.production` sit in plaintext on an exFAT USB drive; `JWT_SECRET` and `ENCRYPTION_KEY` share weak material (per your own audit §5). Move to real env injection / a secrets manager, rotate, and enforce ≥32 random bytes for both, separately.
7. **Testing depth.** Only 9 files (759 lines) of pure lib unit tests, despite `vitest`, `@testing-library/react`, and `puppeteer` all installed. No test exercises a single one of the 153 routes. Add integration tests for the money paths (auth, students CRUD, payments, uploads, tenancy) before feature work.
8. **Tenancy magic needs guardrails.** The global `$extends` scoping is elegant but invisible: developers must remember `UNSCOPED_MODELS`, `runWithConsultancy`, and the `findUnique`+`consultancyId` behavior. Any query run outside a request context silently becomes platform scope (`consultancyId == null` → no filter). Add tests asserting cross-tenant reads are impossible, and fail-closed for scoped models.

### P2 — quality & performance
9. **Monolith components.** `SupportContent.tsx` (3,604 lines), `CoursesContent` (2,617), `SearchContent` (2,486), `StudentForm` (2,344). These are un-reviewable and untestable. Extract sub-components, hooks, and data logic.
10. **Rate limiter is racy and single-node.** `checkRateLimit` does `COUNT` then `INSERT` (TOCTOU) and falls back to per-process memory → trivially bypassed across instances. Move to Redis (the code even says so) or atomic `INSERT … ON DUPLICATE` counters.
11. **Pagination inconsistency.** `getPaginationParams` caps at 100, but several UIs cap client-side at 20 → items 21+ unreachable (your audit L1/A4). Unify server-driven pagination.
12. **Dead & insecure-in-design code.** `src/lib/encryption.ts` / `encryption.server.ts` expose unsalted-SHA-256 `hashPassword`/`verifyPassword` that are unused — delete them so no one "reuses" them.
13. **Images disabled optimizer** (`unoptimized: true`) — correct for your auth'd uploads, but means no responsive/WebP. Serve uploads via a signed-URL route and re-enable optimization.
14. **Junk in repo root**: `doctor-full.txt` (147 KB), `next.log`, `server.log`, `SECURITY_AUDIT_REPORT.md` (publicly readable in the tree), `._*` files, `graphify-out/`, `scanner-agent/`. Clean and gitignore.
15. **README is boilerplate** (claims Next 15, generic template text). Replace with real setup, env matrix, migration and deploy steps.

## Highest-leverage next 5 actions
1. Repair `.git` and **commit `package-lock.json`**, pin React.
2. Add a GitHub Actions pipeline: `type-check`, `lint`, `test`, `build`.
3. Add `zod` validation + a `/api/health` endpoint.
4. Install error tracking (Sentry) and emit structured JSON logs.
5. Add integration tests for auth, students, payments, and tenant isolation.

**Bottom line:** This is a capable product with solid security instincts and real engineering care in the hard parts (uploads, tenancy, RBAC). Treat it as a strong prototype that needs an operational spine — CI, tests, observability, reproducible builds, secret hygiene — before it earns the right to run a business. Get those five actions done and this is legitimately an 8.5/10.

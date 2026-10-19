# UniTrack — Full Security Audit Report

**Date:** 2026-10-19
**App:** Next.js 16.3.6 + Prisma 5 + MySQL (remote Hostinger DB), dev server port 4028
**Method:** Live server smoke tests (HTTP routing, anonymous access probes, response-header inspection) + static review of all 170+ API routes and core libraries (auth/session, RBAC, uploads, rate limiting, CSRF, checkout, email). `npm audit` for dependencies. **No mutating test data was created against the live DB.**

---

## 1. Runtime status

| Check | Result |
|---|---|
| Dev server (port 4028) | Running — `/` 200, `/login` 200 |
| Anonymous API access | `GET /api/students` → 401 (auth enforced) |
| Anonymous file access | `GET /uploads/test.png` → 401 (private storage) |
| Security headers | HSTS, CSP (`frame-ancestors 'none'`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` all present |
| Dependencies | **14 vulns (1 low, 3 moderate, 10 high)** — `next`, `sharp`, `dompurify`, `braces`/`micromatch` et al. |

---

## 2. Findings

### CRITICAL

**C1 — Admin → Super Admin privilege escalation via bulk staff import**
`src/app/api/bulk/route.ts:350-360`. The CSV `role` column is passed straight into `db.user.create` with **no `validateRoleAssignment`** — unlike `access/route.ts:136-139` and the Super-Admin guard in `access/[id]/route.ts:42-50`. An Admin with `bulk:create` imports a row with `role=Super Admin` and gets a platform-scope account across all consultancies. Missing passwords default to the literal `"password123"` (line 351). No rate limit; bcrypt×N rows = CPU DoS.

**C2 — `/api/restore` lets an Admin materialise arbitrary Super Admin users and secrets**
`src/app/api/restore/route.ts:216-217`. Table names are allowlisted but **row contents are unvalidated**:
```ts
if (shouldRestore("users")) await tx.user.createMany({ data: data.users });
if (shouldRestore("apiKeys")) await tx.apiKey.createMany({ data: data.apiKeys });
```
An Admin (gate at line 62) POSTs a crafted backup containing a `users` row with `role:"Super Admin"` + a bcrypt hash of their choice, then logs in as that Super Admin — bypassing every Super-Admin guard elsewhere. Can also inject SMTP credentials and permission grants.

**C3 — All IP-keyed rate limits bypassable via spoofable headers**
`src/lib/rate-limit.ts:45-62`. `X-Forwarded-For` is correctly gated behind `TRUST_PROXY`, but `cf-connecting-ip` and `x-real-ip` are **always trusted** and client-settable when the app is not behind Cloudflare/stripping proxy (the default here — no `TRUST_PROXY` in `.env.local`). Rotating these headers per request resets every bucket: login, OTP, forgot/reset-password, student login, checkout — all decorative for a scripted attacker. Also unbounded `RateLimitLog` row growth.

### HIGH

**H1 — The 6-digit OTP itself is a valid password-reset token**
`verify-otp/route.ts:47-51` marks the OTP record `verified:true` and keeps it; `reset-password/route.ts:32-35` accepts **any** verified record whose `otp` equals the submitted token. Submitting the 6-digit OTP as the `token` works → reset space shrinks from 256-bit (`crypto.randomBytes(32)`) to ~20 bits, with no per-account attempt counter. Verified OTP rows persist for the 10-minute OTP window.

**H2 — Staff bcrypt hashes (and biometric templates) exposed in API responses**
- `access/route.ts:53-62` — `findMany` with no `select`; full rows incl. `password` returned to Admins.
- `access/[id]/route.ts:59-96` — PUT returns the full updated row.
- `hr/employees/route.ts:61-95` — POST/PUT return full rows; GET returns `faceDescriptor` (biometric template) to any `hr:read`.
Contrast with the correct handling in `students/route.ts:68` and `users/route.ts:17-23`.

**H3 — Committed seed script with hardcoded admin credentials**
`prisma/seed-admin2.ts:7-8` — `admin@gmail.com` / `admin`, password also logged (line 28). Not in the `package.json` seed chain, but a runnable committed script that upserts an Admin account with a known password.

**H4 — Reset tokens & OTPs stored in plaintext in the DB**
`schema.prisma:265` — `PasswordResetToken.otp` holds both the email OTP and the 32-byte reset token verbatim. Any DB read (SQLi, backup export) yields immediately usable reset tokens. Standard practice: store `sha256(token)`.

**H5 — OTP brute force → student account takeover**
`verify-otp/route.ts:43` — `record.otp !== otp.trim()` (non-constant-time), 900k-value space (`crypto.randomInt(100000,999999)`), no per-account lockout, IP-only limiting (bypassable per C3). Success → 32-byte token → `reset-password` sets `studentPassword`. Reliable takeover of any student account whose email is known.

**H6 — 14 dependency vulnerabilities (10 high)**
`npm audit`: `next` 16.3.6 — cache poisoning of SSG/ISR (×2), SSRF in image optimization, draft-mode cache leak, MCP endpoint info disclosure, `dynamicParams` metadata bypass (fix available via `npm audit fix` → 16.3.8+); `sharp` <0.35.5 librsvg CVE; `dompurify` ≤3.4.15 DOM XSS; `braces`/`micromatch`/`source-map-js` DoS.

**H7 — Login never checks account status; `/api/auth/me` doesn't either**
`login/route.ts:45-65` issues a full 12h JWT without checking `user.status` — `Pending`/disabled accounts log in fine. `me/route.ts:19-33` omits `status` from its select. Data APIs do re-check via `getSession` (`api-utils.ts:86-89`) with a 30s cache, so demotion closes on data routes only; page shells and `/me` stay accessible.

**H8 — No server-side session revocation**
Stateless JWTs, no `jti`/token-version. Logout only deletes the cookie (`logout/route.ts:27-31`); a stolen token stays valid up to 12h. Password change / admin disable never invalidates existing tokens.

### MEDIUM

- **M1 — Stored XSS in email-template preview** — `EmailTemplatesSettings.tsx:35-37,446` renders admin-editable HTML via raw `dangerouslySetInnerHTML`. Any `email:update` principal can execute script in the origin of any `email:read` admin who opens preview. Same HTML is emailed verbatim to students (intended, but phish-capable). Only one `dangerouslySetInnerHTML` in the codebase.
- **M2 — CSP allows `'unsafe-inline'` + `'unsafe-eval'` for scripts** — `next.config.mjs:53`; M1's sink isn't mitigated by CSP. `img-src https:` (line 55) overly broad.
- **M3 — Backup exports live secrets; encryption password in URL query** — `backup/route.ts:17` takes `password` from the query string (server logs, browser history); exports plaintext `smtpPass` (line 159), `applicationEmailPassword` (line 106), full `apiKeys` (line 148). Un-rate-limited full-DB dump.
- **M4 — Uploads: no rate limit, no pre-buffer body cap** — `upload-security.ts:207-211` checks size only after `req.formData()` fully buffers; `api/upload/route.ts` and `api/files/upload/route.ts` (20 MB) have no `checkRateLimit`. Any authenticated user (incl. Viewer) can fill the disk.
- **M5 — Heavy/sensitive endpoints unthrottled** — `/api/bulk`, `/api/reports/generate`, `/api/backup`, `/api/restore`, `/api/email/send` (staff session = spam relay via org SMTP), `/api/batch`.
- **M6 — eSewa failure callback trusts an unsigned payload** — `checkout/esewa/failure/[[...reference]]/route.ts:82-88` decodes `?data=` **without** `verifyEsewaSignature` (success route does verify, line 38). When the status API is down, an attacker can flip a PENDING order to FAILED.
- **M7 — Unescaped `student.name` in OTP email HTML** — `forgot-password/route.ts:70` — `<p>Hello ${student.name},</p>`; staff-controlled name injects HTML into mail. (Invite mail is properly escaped — `access/route.ts:37-43`.)
- **M8 — Third-party email passwords stored/sent plaintext by design** — `schema.prisma:432-435`; `students/[id]/route.ts:40` strips only `studentPassword`, so `applicationEmailPassword` goes to all `students:read` principals and into backups.
- **M9 — CSRF Bearer exception is dead code relaxing the strongest rule** — `csrf.ts:72-75`: requests with `Authorization: Bearer` bypass Origin checks, but **no route ever validates a Bearer token** (API keys are hashed yet never verified).
- **M10 — No per-account OTP/reset lockout; login brute-force per-IP only** — no attempt counter in `PasswordResetToken`; `login/route.ts:49-51` also returns early without a dummy `bcrypt.compare` (timing enumeration side channel).
- **M11 — Bulk import default password + login pending status** (see H7/C1) — operationally, imported staff get `password123`.
- **M12 — Role/password management lacks least privilege** — `access/[id]` PUT lets any Admin set any non-Super-Admin user's role and password (object-level tenancy applies, but no self-escalation guard, no separate `users:password:reset` permission, no before/after audit capture).

### LOW / INFO

- **L1** — `verify-otp` response distinguishes "No pending reset request" from "Invalid OTP" → reset-in-flight enumeration (`verify-otp/route.ts:29-33`).
- **L2** — Chat: any `chat:read` user can read any room by ID — no membership check (`chat/messages/route.ts:17-21`).
- **L3** — Student-document claim-by-reference: client-supplied `url` stored without verifying it's a file the caller uploaded (`students/[id]/documents/route.ts:30-38`).
- **L4** — SVG sanitizer is deny-by-regex (`upload-security.ts:149-164`) — inherently bypassable; mitigated by serve-time sandbox CSP (`upload-storage.ts:24-25`).
- **L5** — Proxy JWT verification lacks `algorithms`/`issuer` pinning unlike `verifyAuth` (`proxy.ts:93` vs `session.ts:64-68`).
- **L6** — Reset password minimum 6 chars, no complexity (`reset-password/route.ts:24`).
- **L7** — `X-Powered-By: Next.js` disclosed.
- **L8** — Roles DELETE doesn't check role is assigned to users (`roles/[id]`).
- **L9** — Login rate limiter fails open to per-process memory on DB error (documented; multi-instance caveat) (`rate-limit.ts:109-126`).

### Verified strong

1. **CSRF** — centralized in `proxy.ts:71-76` for every `/api/*` mutation; origin model in `csrf.ts` rejects `Origin: null`, path-only Referer, and header-less cookie callers; GET/HEAD/OPTIONS exempt; unit tests exist.
2. **JWT** — HS256 pinned + issuer/audience + payload-shape validation (`session.ts:41-80`); fail-closed on missing/short `JWT_SECRET` (no weak default); student tokens (`subject:"student"`) rejected from admin APIs.
3. **Passwords** — bcrypt cost 12 everywhere; `isBcryptHash` guard prevents double-hashing; uniform invalid-credential errors; generation via `crypto.randomInt` Fisher-Yates.
4. **Cookies** — `httpOnly`, `secure` in prod, `sameSite: "strict"` in prod, browser-session cookie over 12h JWT.
5. **Tenant isolation** — Prisma extension injects `consultancyId` into WHERE for all scoped ops (`db.ts:170-210`); `request-tenancy` returns `DENIED` on forged tokens; explicit `runWithConsultancy` escape hatch for Super Admin; cross-consultancy IDOR largely blocked at the data layer.
6. **Uploads** — extension allowlist ∩ active-content blocklist + magic-byte sniffing; `crypto.randomUUID()` names with `wx`; path-traversal triple-checked (`sanitizeFilename`, `isSafeRelativeUploadPath`, `resolveStoredUpload` containment); private storage; authenticated serving with `nosniff` + sandbox CSP; per-file ACL binding files to owning records. Live: anon `/uploads/*` → 401.
7. **Payments** — eSewa success verifies redirect HMAC via `timingSafeEqual` **and** confirms server-to-server before COMPLETED; amounts re-checked twice; connectIPS requires signed `validatetxn` API; checkout amount from server-side plan config, never client; initiate is CSRF-checked + validated + rate-limited.
8. **No SQL injection** — only parameterized raw SQL (rate limiter, `SELECT 1`); no `$queryRaw` interpolation of user input.
9. **No SSRF** — all outbound `fetch` targets fixed or env-derived; `images.remotePatterns` explicit 5-host allowlist.
10. **No secrets in source/git** — only `.env.example` committed; `JWT_SECRET` length-checked at runtime; API keys stored as SHA-256 hashes (raw returned once); SMTP password masked on read; backup encryption AES-256-GCM + PBKDF2 200k.
11. **Fresh authz** — role/status re-read from DB per request (30s cache); disablement closes within 30s on data APIs.
12. **Validation** — zod on login/user-invite; field allowlists on large student PUT; template rendering escapes all non-stripped values.

---

## 3. Remediation plan

| Priority | Fix | Status |
|---|---|---|
| 1 | Bulk import: run roles through `validateRoleAssignment`, reject `Super Admin`, drop `password123` default, add rate limit | todo |
| 2 | `/api/restore`: Super Admin only + scrub `users.role` / secrets rows | todo |
| 3 | `rate-limit.ts`: only trust `cf-connecting-ip`/`x-real-ip` when `TRUST_PROXY=true` | todo |
| 4 | OTP: consume after verification; `reset-password` accepts only the 32-byte token; store hashed | todo |
| 5 | `select`-omit `password`/`faceDescriptor`/`applicationEmailPassword` from access & HR responses | todo |
| 6 | `npm audit fix` (next, sharp, dompurify, …) | todo |
| 7 | Check `status === "Active"` in login + `/api/auth/me` | todo |
| 8 | OTP: `timingSafeEqual` + per-email attempt lockout | todo |
| 9 | Rate-limit uploads/bulk/backup/reports/email; backup password via header/POST | todo |
| 10 | Sandbox email-template preview; escape `student.name` in OTP email | todo |
| later | Session token-version claim (revocation on password change); delete `seed-admin2.ts`; remove CSRF Bearer bypass; tighten CSP; chat membership checks; plaintext third-party creds → encrypted at rest |

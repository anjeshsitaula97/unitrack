# UniTrack — Functional Check & Security Audit Report

**Date:** 2026-10-12
**App:** Next.js 16.3.6 + Prisma 5 + MySQL (remote Hostinger DB)
**Audit method:** Read-only static code review. No mutating test data was created, and **no DELETE/UPDATE was executed** against the live database — current data was not touched. Function and menu behaviour was verified via live server responses (HTTP routing) plus code-path analysis.

---

## 1. Functional check — Students, Leads, Applications

### 1.1 Runtime status

| Check | Result |
|---|---|
| Dev server (port 4028) | Running — `/` returns 200 |
| `/students`, `/leads`, `/applications` | Respond correctly; unauth users get 307 → `/login` |
| `/login` | 200 OK |
| Database | Remote MySQL reachable (port 3306). NOTE: a live connection-pool/timeout error (`connection limit: 17`) hit `/api/dashboard/stats` once; recovered after restarting the dev process. Watch connection-pool exhaustion. |

### 1.2 Students menu

| Flow | Status | Notes |
|---|---|---|
| Add | Works | `POST /api/students` — `students:create` + 20/min rate limit. Performs Prisma `student.create` then creates/updates linked `User`. |
| Edit | Works, **critical bugs** | `PUT /api/students/[id]` — `students:update` + role gate (Admin/Super Admin/Staff). **No per-record/branch scoping (IDOR).** |
| Delete | Soft delete — data preserved | `DELETE` → `softDeleteStudent()` → `status:"Deleted"` + `TrashItem` with **30-day expiry** (`src/lib/trash.ts`). Recoverable via `/api/trash/restore`; permanently purged only after 30 days. |

Critical bugs found in Students:
- **S1 — Account takeover (HIGH)** `src/app/api/students/route.ts:212-226`. On create/edit, the handler looks up an existing `User` by the submitted email and **overwrites that user's password** with the student password. A user with `students:create/update` authority can type an Admin's email + a chosen password and log in as that Admin.
- **S2 — Double-hashed password (HIGH)** `src/app/api/students/[id]/route.ts:165-167`. `GET /api/students/[id]` returns the stored bcrypt hash, the form re-sends it as `studentPassword`, and PUT re-hashes it → `bcrypt(bcrypt(old))` on every edit, silently breaking the student portal login.
- **S3 — Student-role BOLA (HIGH)** `src/lib/permission-catalog.ts:47`. Student portal accounts are created as `User role:"Student"`, which by default holds `students:read`. Any student can enumerate `GET /api/students` and `GET /api/students/[id]` for every student.
- **S4 — Password-hash exposure (MED)** `GET /api/students/[id]` returns the full row incl. bcrypt `studentPassword` (projected, not `select`-filtered). No filter for `status:"Deleted"` either.

### 1.3 Leads menu

| Flow | Status | Notes |
|---|---|---|
| Add | Works | `POST /api/leads` — `leads:create` + 30/min limit. Manual validation (`name`/`email` present only). No zod. |
| Edit | Works, **IDOR** | `PUT /api/leads/[id]` — `leads:update` (= Admin + Staff by default). No ownership scoping; any staff can edit any lead by id. |
| Delete | Soft delete — data preserved | `DELETE` → `softDeleteLead()` → `status:"Deleted"` + 30-day `TrashItem`; **Admin-only role gate** present. Recoverable via trash restore. |

Bugs found in Leads:
- **L1 — List truncated to 20 (MED)** `src/app/leads/components/LeadsContent.tsx:142`. API caps `perPage` at 20; UI paginates client-side, so leads 21+ are unreachable.
- **L2 — `PUT` returns 500 on duplicate email / bad types (MED)** `src/app/api/leads/[id]/route.ts:158-161`. P2002 handled only in POST, not PUT.
- **L3 — Form `required` bypassed (LOW)** Submit buttons sit outside the `<form>` (`LeadForm.tsx:443-461`), so native validation never runs.

### 1.4 Applications menu

| Flow | Status | Notes |
|---|---|---|
| Add | Works | `POST /api/applications` — `applications:create`. Creates with hardcoded `status:"Submitted"`. No duplicate-check, no `course↔university` validation. |
| Edit | Status-only | No general edit form; `PATCH /api/applications/[id]` changes status only (`applications:update`). No Admin-only gate, no per-record scoping. |
| Delete | **HARD delete — data is destroyed** | `DELETE /api/applications/[id]` → `db.application.delete()` **(`[id]/route.ts:119`) — unrecoverable.** Unlike leads/students it is NOT trashed. `onDelete: Cascade` for note/workflow tables (`schema.prisma:444,458`) permanently destroys all notes and workflow history too. **No explicit Admin role gate** — relies solely on the default permission (`applications:delete` = admin only, overridable via custom roles). |

Bugs found in Applications:
- **A1 — Hard delete inconsistency (HIGH/Data-safety)** Permanent deletion, contrary to students/leads/universities/courses which are soft-deleted.
- **A2 — Workflow IDOR (MED)** `workflow/route.ts:110-129, 176-182` mutates/deletes stages by bare stage id **without `applicationId` scoping** — cross-application stage tampering.
- **A3 — Workflow delete fails silently (MED)** `applications:workflow` is defined (`permission-catalog.ts:60`) but never used; DELETE resolves to `applications:delete` (admin-only). Staff see the delete button but the 403 is swallowed (no error toast) `ApplicationDetailContent.tsx:541-557`.
- **A4 — List truncated to 20 (MED)** Same pattern as leads (`ApplicationsContent.tsx:100`).

---

## 2. Security audit — findings

### CRITICAL

**C1 — CSRF protection is not enforced on almost any state-changing route**
`src/lib/csrf.ts:45` implements Origin/Referer validation, but it is only wired into **4 routes**: `POST /api/access`, `POST /api/roles`, `/api/roles/[id]` PUT/DELETE, `POST /api/checkout/initiate` (grep-verified). Every other mutating endpoint — students/leads/applications CRUD, files upload/delete, bulk import, **restore**, email send, payroll/HR writes, payments — is cookie-auth with **no CSRF check**. Combined with `sameSite: "lax"` in non-prod (and even strict can be bypassed cross-browser flows), a forged cross-site POST (e.g. DELETE application, upload to file manager, trigger restore) is possible against an authenticated admin.

### HIGH

**H1 — Student account takeover via User password overwrite (functional item S1)**
See §1.2. Anyone with `students:create|update` can adopt an arbitrary existing user's password (even Super Admin).

**H2 — Double-hash breaks student logins on every edit (S2)** — functional.

**H3 — Student-role horizontal privilege escalation / mass student read (S3)** — Student portal accounts inherit `students:read`, `GET /api/students` returns all students incl. password hashes.

**H4 — Application DELETE = permanent data loss (A1)** — not recoverable, no Trash integration.

**H5 — No object-level / branch-level authorization on `[id]` routes (Students/Leads/Applications)** — any authorized staff can read/update any record across branches; applications UPDATE/DELETE also lack explicit admin gate. BOLA/IDOR class.

**H6 — Weak JWT secret policy (OPSEC)** `src/lib/session.ts` — HS256 with a single env secret (`JWT_SECRET`), 12h expiry, no minimum-length/fail-fast check. The live value is a short visible string in `.env.local`; enforce ≥32 random bytes and rotate if exposure is suspected.

**H7 — Trashed records remain readable/editable** — Leads/Students with `status:"Deleted"` are still returned by `GET`/`PUT` by id (no deleted filter), and their original status is not preserved on restore (`trash.ts:80` forces `"New"`).

### MEDIUM

- **M1 — OTP comparison not timing-safe** `src/app/api/auth/verify-otp/route.ts:43-46` — direct `!==` string compare; use `crypto.timingSafeEqual`.
- **M2 — Restore endpoint is destructive and has no CSRF** `src/app/api/restore/route.ts:134-257` — Admin-only role gate exists, but a forged/admin CSRF can wipe and repopulate tables. Add re-auth + CSRF + full audit logging.
- **M3 — Empty/edge passwords: staff bulk import sets `password123`** `src/app/api/bulk/route.ts` — operational concern.
- **M4 — API-key Bearer exception weakens CSRF posture** `src/lib/csrf.ts:73-80` — requests with `Authorization: Bearer` bypass Origin/Referer checks; there is no Bearer auth implemented in served routes, so the bypass only helps attackers misusing the pattern. Restrict or remove.
- **M5 — Info disclosure** `/api/master/status` returns the internal `MASTER_API_URL` (route.ts:25). Redact for non-admins.
- **M6 — `from` query param on `/login` redirect unsanitized** (`src/proxy.ts:87-89`) — same-origin redirect keeps it low-risk, but validate it is an internal path.
- **M7 — `.env.local` / `.env.production` contain live credentials on disk** — verify they are git-ignored and never committed; rotate if they ever were. (`.gitignore` appears to exclude `.env*`.)
- **M8 — Create/update non-transactional** — student creation, document reconciliation and password sync are separate awaits (`students/route.ts:119-226`); partial failure leaves orphaned/inconsistent rows.
- **M9 — Workflow/bulk/credential permission mapping misconfig** — student documents use `students:create/delete` instead of `files:*` (`rbac.ts` moduleMap fallback); `applications:workflow` defined but unused.

### LOW / Verified-strong areas

- **SQL injection: NOT found.** Raw queries exist **only** in `rbc...` rate-limit lib and are fully parameterized (`?` placeholders). All CRUD uses Prisma parameterization.
- **XSS: NOT found.** No `dangerouslySetInnerHTML`/`innerHTML` in the codebase; React text rendering everywhere.
- **Uploads: strong.** Extension/MIME whitelists + magic-byte sniffing, SVG sanitization, path-traversal protection, random UUID filenames, 10MB/20MB limits, `nosniff` + restrictive CSP on serve.
- **SSRF: not found.** Master API uses an env-controlled base URL; no user-controlled URL fetch.
- **Passwords:** bcryptjs cost 12 throughout; no plaintext storage; login uses `bcrypt.compare`.
- **Rate limiting: good** on login (10/min), student login (10/min), OTP (10/10min), reset (5/10min), forgot (5/10min), user create, checkout initiate, payment create (30/min). IP extraction handles `TRUST_PROXY`/`cf-connecting-ip`.
- **Session hardening:** `getSession()` re-validates role & account status from DB per request and rejects inactive users/admin demotions immediately; JWT HS256 pinned with issuer/audience, 12h expiry.
- **Cookie flags:** `httpOnly` + `secure` (prod) + `sameSite: strict` (prod) on auth cookies; `strict` on student tokens.
- **Backup/restore/bulk/payroll access control** is correctly gated to Admin/Super Admin; payroll correctly scopes non-admins to own records.
- **API keys:** stored as SHA-256 hashes; raw key shown once at creation. Good.

---

## 3. Priority remediation list

1. **Enforce CSRF on all POST/PUT/PATCH/DELETE cookie-auth routes** (middleware or a shared wrapper). Highest-impact, cheapest fix. (C1)
2. **Stop overwriting existing User passwords with student passwords** — never `user.update` on `students:create/update` unless a unique linking key is proven; add Admin role protection. (H1/S1)
3. **Project `studentPassword` out of GET responses** and **only re-hash a password if the submitted value is not a bcrypt hash** (or clear it). (S2/S4)
4. **Limit `students:read` from the `Student` role** (and verify the whole default permission matrix with the existing tests `src/lib/__tests__/permission-matrix.test.ts`). (H3)
5. **Route Application DELETE through the Trash system** (soft delete + 30-day restore) to match students/leads. (H4/A1)
6. **Add object-level scoping** (tenant/branch) on all `[id]` routes; scope workflow PATCH/DELETE by `applicationId`. (H5/A2)
7. **Enforce JWT secret strength at startup** and rotate the current secret; never re-use it as the encryption key. (H6)
8. **Timing-safe OTP compare**; **add CSRF + re-auth + audit to restore**; redact `MASTER_API_URL` from status endpoint. (M1/M2/M5)
9. Fix truncated lists (pagination) and the dead "Edit" link on student detail (`/students?edit=id` never handled). Low-effort wins. (L1/A4)
10. Make student create/edit + user sync + document reconciliation transactional. (M8)

---

## 4. Verdict

- **Functionality:** Add/edit/delete flows for Students, Leads and Applications are wired end-to-end. **No current data was modified or deleted during this review.**
- **Data safety:** Students and Leads deletes are recoverable (30-day trash). **Application deletes are permanent** — flag to the team.
- **Security posture:** Strong foundations (bcrypt, RBAC, rate limiting, upload hardening, no SQLi/XSS), but the **missing app-wide CSRF enforcement** and three **High-severity Students-module flaws** (account takeover, double-hash, Student-role data read) require immediate attention before this system is considered production-safe.

---

## 5. Remediation status (2026-10-12)

Deployment review of the priority list. All verifications green: `tsc --noEmit` passes, 81/81 unit tests pass, changed files lint clean, live HTTP tests confirm behaviour, dev server running.

| # | Fix | Status | Where |
|---|---|---|---|
| C1 | CSRF enforced app-wide for all cookie-auth mutating API calls | **Done** | `src/proxy.ts` — validates Origin/Referer/Bearer on every `/api` non-GET; live-tested (no/evil Origin → 403, same-origin → passes to auth) |
| H1 | Stop overwriting existing User passwords from student records (account takeover) | **Done** | `api/students/route.ts`, `api/students/[id]/route.ts` — only `Student`-role User accounts are re-synced |
| H2 | Double-hash on every student edit | **Done** | `GET` strips hash; `PUT` skips values that are already bcrypt (`isBcryptHash` in `lib/crypto.ts`); form masks hashes |
| H3 | Student-role read of entire student registry (BOLA) | **Done** | `permission-catalog.ts` — `students:read` removed from Student role; tests updated |
| H4 | Applications DELETE permanently destroyed notes+workflow | **Done** | `lib/trash.ts` `softDeleteApplication` + restore/purge cases; `applications/[id]` DELETE now soft-deletes with an **Admin-only gate** |
| H5 | Workflow stage PATCH/DELETE cross-application IDOR | **Done** | `workflow/route.ts` — updates/deletes scoped to `applicationId`; foreign stages rejected 400/404 |
| H6 | Weak JWT secret | **Done** | `session.ts` + `proxy.ts` fail fast when `JWT_SECRET` < 32 chars |
| Pre-existing | `SettingsContent.tsx` had 3 stacked duplicate copies (broke all typechecking) | **Done** | removed orphaned lines 181–607; file now parses |

**Action still open (operational, needs you):** rotate `JWT_SECRET` (shared with `ENCRYPTION_KEY`, which is weak), confirm `.env.local`/`.env.production` are git-ignored and were never committed, and for existing DB-seeded Student roles re-save their permission list in Settings so the new student matrix applies.
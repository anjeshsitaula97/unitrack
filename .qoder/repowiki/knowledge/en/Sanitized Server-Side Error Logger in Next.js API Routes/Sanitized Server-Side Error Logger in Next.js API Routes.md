---
kind: logging_system
name: Sanitized Server-Side Error Logger in Next.js API Routes
category: logging_system
scope:
    - '**'
source_files:
    - src/lib/logger.ts
    - src/app/api/applications/route.ts
    - src/app/api/auth/login/route.ts
    - src/app/api/auth/logout/route.ts
    - src/app/api/activity/route.ts
    - src/app/api/batch/route.ts
---

## What system/approach is used

The repository implements a minimal, purpose-built server-side logging utility rather than adopting a third-party logging framework. The entire logging concern lives in a single module:

- **`src/lib/logger.ts`** — exports `logError(context: string, error: unknown)`, which sanitizes the error payload and writes it to `console.error` only when `process.env.NODE_ENV !== "test"`.

There are no log levels (debug/info/warn/error), no structured log envelope, no file/remote sinks, and no logger initialization or configuration. Logging is effectively an ad-hoc pattern centered on this one helper.

## Key files and packages

- **Core logger**: `src/lib/logger.ts`
- **Consumers**: dozens of Next.js App Router API route handlers under `src/app/api/**/route.ts` import `logError` from `@/lib/logger` and call it inside `try/catch` blocks around Prisma calls, file I/O, email sending, etc. Examples include `src/app/api/applications/route.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/batch/route.ts`, `src/app/api/activity/route.ts`, and many others.
- **Direct console usage**: Many other API routes bypass the logger entirely and call `console.error(...)` directly (e.g. `src/app/api/access/[id]/details/route.ts`, `src/app/api/email/send/route.ts`, `src/app/api/files/upload/route.ts`). This indicates the logger is adopted but not universally enforced by linting.

## Architecture and conventions

1. **Single entry point for error logging.** The convention documented in the module header is: *"Use this instead of console.error in API routes."* The function takes a human-readable context string (e.g. `"Fetch applications"`, `"Login Route"`) plus the thrown error object.

2. **Automatic PII redaction.** Before emitting, `sanitize()` walks the value:
   - Strings are scanned against `SENSITIVE_PATTERNS = [/password/gi, /token/gi, /secret/gi, /authorization/gi, /cookie/gi, /credentials/gi]` and matched substrings are replaced with `[REDACTED]`.
   - `Error` instances are reduced to `{ name, message }`.
   - Plain objects are JSON-stringified, sanitized, then parsed back; unserializable values fall through to `"[Unserializable]"`.
   - This means callers do not need to manually strip fields before passing errors to `logError`.

3. **Test suppression.** Calls are suppressed when `NODE_ENV === "test"`, so unit/integration tests do not pollute output with expected error traces.

4. **Adopted via imports, not middleware.** Each API route handler explicitly imports `logError` and wraps its body in `try/catch`, calling `logError("<context>", error)` in the catch block. There is no global error boundary or request-scoped logger that automatically captures all route errors.

5. **No structured log format.** Output is a plain `console.error` line of the form `[context] sanitized_error`. There is no timestamp, request ID, user ID, or correlation field attached by the logger itself.

6. **No separate info/debug logging.** The repo does not define a general-purpose `log`, `info`, or `debug` helper. Only error paths are instrumented through `logError`; normal operational tracing is absent.

## Conventions and constraints

- **Observed convention**: In API routes that use the logger, the pattern is consistently `import { logError } from "@/lib/logger"` followed by `logError("<verb> <resource>", error)` inside a `catch` block around database or external calls.
- **Enforced constraint (code-level)**: Sensitive keywords (`password`, `token`, `secret`, `authorization`, `cookie`, `credentials`) are always redacted in logged output by the sanitizer — callers cannot accidentally emit them through `logError`.
- **Enforced constraint (environmental)**: `logError` emits nothing when `NODE_ENV === "test"`, making test output deterministic.
- **Not enforced by tooling**: Several API routes still call `console.error` directly, so the rule "use `logError` instead of `console.error`" exists as a documented convention in the module header but is not enforced by ESLint or a pre-commit hook in this snapshot.
- **Scope limitation**: The logger is server-side only (used in Next.js API routes). No client-side logging equivalent was found in `src/components/` or `src/app/` page components.
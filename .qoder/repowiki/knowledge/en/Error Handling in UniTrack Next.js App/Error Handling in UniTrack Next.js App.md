---
kind: error_handling
name: Error Handling in UniTrack Next.js App
category: error_handling
scope:
    - '**'
source_files:
    - src/lib/api-utils.ts
    - src/lib/logger.ts
    - src/lib/fetch-client.ts
    - src/app/error.tsx
    - src/app/not-found.tsx
    - src/components/ErrorBoundary.tsx
    - src/lib/session.ts
---

## Overview

UniTrack uses a layered error-handling approach that combines Next.js App Router conventions, a shared API response helper, a sanitized server-side logger, and a client-side fetch wrapper with a custom `FetchError` type.

## Server-side (API routes)

- **Centralized error responses**: All API routes return errors via `apiError(message, status)` from `src/lib/api-utils.ts`, which wraps the message in `{ error: message }` using `NextResponse.json`. This is used consistently for 400/401/403/404/500 cases across every route under `src/app/api/...`.
- **Auth & authorization failures** are short-circuited early using `getSession()` / `_requireSession()` helpers; missing or invalid sessions return `apiError("Unauthorized", 401)`, and insufficient roles return `apiError("Forbidden: insufficient permissions", 403)`.
- **Structured try/catch blocks** wrap each DB call. On failure, routes call `logError("<context>", error)` from `src/lib/logger.ts` and then return an `apiError` response rather than letting the exception bubble up unhandled.
- **Input validation** returns 400 via `apiError` (e.g. `"Note content is required"`, `"Invalid role"`, `"Status is required"`).
- **Resource-not-found** checks return 404 (`"Application not found"`, etc.).

## Sanitized logging

`src/lib/logger.ts` provides `logError(context, error)`, which:
- Redacts sensitive fields (`password`, `token`, `secret`, `authorization`, `cookie`, `credentials`) by regex replacement before logging.
- Serializes objects safely and falls back to `[Unserializable]` on JSON stringify failure.
- Only emits logs when `NODE_ENV !== "test"`, so tests stay quiet.
- Uses `console.error` — there is no external logging framework.

This is the only place where caught errors are persisted; it is intentionally designed to never leak PII into logs.

## Client-side (browser)

- **Global page-level errors**: `src/app/error.tsx` is the Next.js App Router catch-all error page. It renders a user-friendly UI showing `error.message` and an optional `error.digest`, plus a "Try again" button (calls `reset()`) and a link to `/dashboard`.
- **404 handling**: `src/app/not-found.tsx` renders a styled 404 page with navigation buttons.
- **Component-level boundaries**: `src/components/ErrorBoundary.tsx` is a class-based React Error Boundary that catches render-time errors inside its subtree. It shows a consistent fallback UI with a "Try again" button and accepts an optional `fallback` prop for custom rendering.
- **HTTP client errors**: `src/lib/fetch-client.ts` defines a `FetchError` class carrying `status`, `message`, and optional `data`. The `apiFetch` wrapper:
  - Throws `FetchError` for non-`res.ok` responses, extracting `data.error` as the message.
  - Wraps network exceptions into `FetchError(0, "Network error")`.
  - Optionally surfaces success/failure via `sonner` toasts (`showSuccess`, `showError` flags).
  - Exposes typed `api.get/post/put/delete/upload` helpers.

## Conventions observed

| Area | Convention |
|---|---|
| API routes | Wrap each operation in `try { ... } catch (err) { logError(...); return apiError(...) }` |
| Auth checks | Use `_requireSession()` / `_requireRole()` helpers; return `apiError("Unauthorized", 401)` or `apiError("Forbidden: insufficient permissions", 403)` |
| Validation | Return `apiError("<message>", 400)` for malformed input |
| Not found | Return `apiError("<resource> not found", 404)` |
| Logging | Never use raw `console.error`; always use `logError(context, error)` |
| Client HTTP | Always call through `api.*` from `fetch-client.ts`; never bare `fetch` |
| Page errors | Rely on Next.js `error.tsx` + per-route `not-found.tsx` |
| Component errors | Wrap risky subtrees with `<ErrorBoundary>` |

## Constraints enforced by code

- Sensitive strings are redacted in logs at runtime via regex patterns in `logger.ts` — this is enforced by the `sanitize` function called from `logError`.
- Test runs suppress all `logError` output (`process.env.NODE_ENV !== "test"` guard).
- JWT secret must be present at startup; `session.ts` throws if `JWT_SECRET` is undefined.
- The client `FetchError` carries an HTTP status field so callers can branch on 401/403 vs other failures.
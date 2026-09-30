# Upload storage

Uploaded files are served by `src/app/api/uploads/[...path]/route.ts`, which
authenticates the request and then checks that the caller is allowed to read
that specific file. Nothing bypasses this except one case, described below.

## How a request is authorized

1. `getSession()` / `getStudentSession()` must resolve a live account. The
   role is re-read from the database, so a demoted or disabled user loses
   access immediately.
2. `authorizeUploadAccess()` resolves the requested path to the record that
   claims it (`src/lib/upload-access.ts`). The role and ownership rules are:

   | File kind | Who can read |
   | --- | --- |
   | `StudentDocument` | the owning student, admins |
   | `FileItem`, `ScannedDocument`, `EmployeeDocument` | the uploader, admins |
   | university/branch logos, avatars, learning resources | any signed-in role |
   | unclaimed by any record | nobody |

3. Anything unmatched is refused. A file with no owning row is not served on
   the strength of knowing its URL.

## Layout

- `storage/uploads/` — the default root, resolved from `UPLOADS_DIR`. It is
  gitignored. Set `UPLOADS_DIR` to an absolute path in production.
- `public/uploads/` — the legacy root. Files here are served directly by
  Next.js as static assets, which means **no session check and no ownership
  check run at all**. Anything in this directory is public to anyone who knows
  the URL.

## Migrating off the legacy root

1. Copy `public/uploads/*` into `UPLOADS_DIR`.
2. Confirm each file is referenced by a database row. Files with no owning
   row will 403 after the move, because `authorizeUploadAccess` refuses
   unclaimed files. Either create the missing record or delete the file.
3. Delete the contents of `public/uploads/`. Leaving it populated re-exposes
   those files regardless of the application code.
4. Restart the application.

`UPLOADS_ALLOW_LEGACY_ROOT=1` serves the legacy root through the authorized
route for short-term migration, but it does not retroactively protect the
static copy. Use it only while draining the directory, then turn it back off.

## Verifying

```bash
# Authenticated ownership check still applies to the new root
curl -s -o /dev/null -w '%{http_code}\n' -H "cookie: auth_token=$TOKEN" \
  "$APP_URL/api/uploads/<path>"

# The static bypass: this must 404 once public/uploads is emptied
curl -s -o /dev/null -w '%{http_code}\n' "$APP_URL/uploads/<path>"
```

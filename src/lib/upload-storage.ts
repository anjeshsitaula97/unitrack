import fs from "fs";
import path from "path";

export const UPLOADS_URL_PREFIX = "/uploads";

const DEFAULT_STORAGE_SUBDIR = path.join("storage", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export const UPLOAD_CONTENT_SECURITY_POLICY =
  "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox";

export function getUploadsRoot(): string {
  const configured = (process.env.UPLOADS_DIR || "").trim();
  return configured ? path.resolve(configured) : path.join(process.cwd(), DEFAULT_STORAGE_SUBDIR);
}

export function getLegacyUploadsRoot(): string {
  return path.join(process.cwd(), "public", "uploads");
}

export function getLegacyUploadsDir(...subdirs: string[]): string {
  const safeSubdirs = subdirs
    .map((sub) => sub.replace(/[^A-Za-z0-9._-]/g, ""))
    .filter((sub) => sub && sub !== "." && sub !== "..");
  return path.join(getLegacyUploadsRoot(), ...safeSubdirs);
}

export function getUploadRoots(): string[] {
  const primary = getUploadsRoot();
  const legacy = getLegacyUploadsRoot();
  return primary === legacy ? [primary] : [primary, legacy];
}

export function getUploadContentType(filePath: string): string | null {
  return CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? null;
}

export function isSafeRelativeUploadPath(relPath: string): boolean {
  if (!relPath || relPath.includes("\0")) return false;
  if (!/^[A-Za-z0-9._/-]+$/.test(relPath)) return false;
  if (relPath.startsWith("/") || relPath.endsWith("/")) return false;
  return relPath
    .split("/")
    .every((segment) => segment !== "" && segment !== "." && segment !== "..");
}

export function resolveStoredUpload(relPath: string): string | null {
  if (!isSafeRelativeUploadPath(relPath)) return null;

  for (const root of getUploadRoots()) {
    const absolute = path.resolve(path.join(root, relPath));
    if (absolute !== root && !absolute.startsWith(root + path.sep)) continue;
    if (!getUploadContentType(absolute)) continue;

    let stats: fs.Stats;
    try {
      stats = fs.statSync(absolute);
    } catch {
      continue;
    }
    if (stats.isFile()) return absolute;
  }

  return null;
}

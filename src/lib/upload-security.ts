import fs from "fs";
import path from "path";
import crypto from "crypto";

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "txt",
]);

const ACTIVE_EXTENSIONS = new Set([
  "html",
  "htm",
  "svg",
  "js",
  "mjs",
  "xml",
  "json",
  "xhtml",
  "asp",
  "php",
  "sh",
  "bat",
  "swf",
]);

const ACTIVE_MIME_TYPES = new Set([
  "image/svg+xml",
  "text/html",
  "application/xhtml+xml",
  "application/xml",
  "text/xml",
  "text/javascript",
  "application/javascript",
]);

const EXTENSION_MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  txt: "text/plain",
};

export class UploadError extends Error {
  status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.name = "UploadError";
    this.status = status;
  }
}

type SniffedType = { ext: string } | "text" | null;

function looksLikeText(buffer: Buffer): boolean {
  const head = buffer.subarray(0, Math.min(buffer.length, 1024));
  for (let i = 0; i < head.length; i++) {
    const byte = head[i];
    if (byte === 0) return false;
    if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) return false;
  }
  return true;
}

export function sniffFileType(buffer: Buffer): SniffedType {
  if (!buffer || buffer.length < 4) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { ext: "jpg" };
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47)
    return { ext: "png" };
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38)
    return { ext: "gif" };
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  )
    return { ext: "webp" };
  if (buffer.toString("ascii", 0, 4) === "%PDF") return { ext: "pdf" };
  if (
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07)
  )
    return { ext: "zip" };
  if (
    buffer.length >= 8 &&
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0 &&
    buffer[4] === 0xa1 &&
    buffer[5] === 0xb1 &&
    buffer[6] === 0x1a &&
    buffer[7] === 0xe1
  )
    return { ext: "ole" };

  if (looksLikeText(buffer)) return "text";
  return null;
}

export function getExtensionFromFilename(name: string): string {
  if (!name || typeof name !== "string") return "";
  const base = name.split(/[/\\]/).pop() || "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) return "";
  return base.slice(dot + 1).toLowerCase();
}

export function sanitizeFilename(name: string): string {
  if (!name || typeof name !== "string") return "file";
  const base = (name.split(/[/\\]/).pop() || "").replace(/[\x00-\x1f<>:"|?*]/g, "");
  const stripped = base.replace(/^\.+$/, "").trim();
  return stripped || "file";
}

export function getUploadsDir(...subdirs: string[]): string {
  return path.join(process.cwd(), "public", "uploads", ...subdirs);
}

export function ensureUploadDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function createStoredName(ext: string): string {
  return `${crypto.randomUUID()}.${ext}`;
}

export interface UploadedFile {
  buffer: Buffer;
  ext: string;
  mime: string;
  originalName: string;
}

export async function readUploadedFile(
  file: File | null | undefined,
  maxSize: number = MAX_UPLOAD_SIZE
): Promise<UploadedFile> {
  if (!file) throw new UploadError("No file uploaded", 400);
  if (file.size === 0) throw new UploadError("File is empty", 400);
  if (file.size > maxSize) {
    const maxMb = Math.floor(maxSize / (1024 * 1024));
    throw new UploadError(`File too large. Maximum size is ${maxMb}MB.`, 413);
  }

  const originalName = sanitizeFilename(file.name);
  const claimedExt = getExtensionFromFilename(originalName);
  const claimedMime = (file.type || "").toLowerCase();

  if (!claimedExt || !ALLOWED_EXTENSIONS.has(claimedExt) || ACTIVE_EXTENSIONS.has(claimedExt))
    throw new UploadError("File type not allowed", 400);
  const mimeBase = claimedMime.split(";")[0].trim();
  if (ACTIVE_MIME_TYPES.has(mimeBase)) throw new UploadError("File type not allowed", 400);

  const buffer = Buffer.from(new Uint8Array(await file.arrayBuffer()));
  const sniffed = sniffFileType(buffer);
  if (sniffed === null) throw new UploadError("File content does not match an allowed type", 400);

  let ext: string;
  if (sniffed === "text") {
    if (claimedExt !== "txt" && claimedExt !== "csv")
      throw new UploadError("File content does not match an allowed type", 400);
    ext = claimedExt;
  } else {
    ext = sniffed.ext;
    if (ext === "zip" && ["docx", "xlsx", "zip"].includes(claimedExt)) ext = claimedExt;
    if (ext === "ole" && ["doc", "xls"].includes(claimedExt)) ext = claimedExt;
  }

  return {
    buffer,
    ext,
    mime: EXTENSION_MIME_TYPES[ext] || "application/octet-stream",
    originalName,
  };
}

export function writeUploadedBuffer(
  buffer: Buffer,
  ext: string,
  ...subdirs: string[]
): { fileName: string; fileUrl: string } {
  const dir = getUploadsDir(...subdirs);
  ensureUploadDir(dir);

  for (let attempt = 0; attempt < 3; attempt++) {
    const storedName = createStoredName(ext);
    try {
      fs.writeFileSync(path.join(dir, storedName), buffer, { flag: "wx" });
      const fileUrl = `/${["uploads", ...subdirs, storedName].filter(Boolean).join("/")}`;
      return { fileName: storedName, fileUrl };
    } catch (err) {
      const error = err as { code?: string };
      if (error.code === "EEXIST" && attempt < 2) continue;
      throw err;
    }
  }
  throw new UploadError("Failed to store file", 500);
}

export async function storeUploadedFile(
  file: File | null | undefined,
  maxSize: number = MAX_UPLOAD_SIZE,
  ...subdirs: string[]
): Promise<UploadedFile & { fileName: string; fileUrl: string; size: number }> {
  const uploaded = await readUploadedFile(file, maxSize);
  const stored = writeUploadedBuffer(uploaded.buffer, uploaded.ext, ...subdirs);
  return { ...uploaded, ...stored, size: file!.size };
}

export function deleteStoredFile(fileUrl: string, ...subdirs: string[]): void {
  if (!fileUrl || typeof fileUrl !== "string") return;
  const prefix = `/${["uploads", ...subdirs].filter(Boolean).join("/")}/`;
  if (!fileUrl.startsWith(prefix)) return;

  const relName = fileUrl.slice(prefix.length);
  if (!/^[A-Za-z0-9._-]+$/.test(relName) || relName === "." || relName === "..") return;

  const dir = path.resolve(getUploadsDir(...subdirs));
  const filePath = path.resolve(path.join(dir, relName));
  if (!filePath.startsWith(`${dir}${path.sep}`)) return;

  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getUploadContentType,
  resolveStoredUpload,
  UPLOAD_CONTENT_SECURITY_POLICY,
} from "@/lib/upload-storage";

export const dynamic = "force-dynamic";

/** Uploads are addressed as /uploads/<relative-path> everywhere in this app. */
const UPLOAD_PREFIX = "/uploads/";

/** Only an Active workspace is advertised on marketing surfaces. */
function isActive(status: string | null | undefined): boolean {
  return (status || "").trim().toLowerCase() === "active";
}

function notFound() {
  return new NextResponse("Not found", { status: 404 });
}

/**
 * Public, read-only access to one consultancy logo, for marketing surfaces such
 * as the landing-page customer band.
 *
 * Uploads are session-protected by /api/uploads, which is correct for working
 * data but leaves a public page unable to show a logo its owner agreed to
 * advertise. This route is the deliberate exception, narrowed as far as it can
 * be: it is keyed by the workspace's public `code`, never by a caller-supplied
 * file path, so it cannot be used to walk the uploads directory; it serves only
 * workspaces that are Active; and it only ever returns the single image recorded
 * in that workspace's own logoUrl.
 */
export async function GET(_request: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  if (!code) return notFound();

  const consultancy = await db.consultancy.findFirst({
    where: { code },
    select: { status: true, logoUrl: true },
  });
  if (!consultancy || !isActive(consultancy.status)) return notFound();

  // Remote logos are hosted off-origin and the page CSP only allows a short list
  // of image hosts, so this route sticks to locally stored files.
  const logoUrl = (consultancy.logoUrl || "").trim();
  if (!logoUrl.startsWith(UPLOAD_PREFIX)) return notFound();

  const absolutePath = resolveStoredUpload(logoUrl.slice(UPLOAD_PREFIX.length));
  if (!absolutePath) return notFound();

  const contentType = getUploadContentType(absolutePath);
  if (!contentType) return notFound();

  const data = fs.readFileSync(absolutePath);

  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(data.byteLength),
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": UPLOAD_CONTENT_SECURITY_POLICY,
      // Public and shareable, but short enough that a replaced logo lands
      // without a deploy.
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

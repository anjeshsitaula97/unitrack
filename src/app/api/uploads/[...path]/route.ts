import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import {
  getUploadContentType,
  resolveStoredUpload,
  UPLOAD_CONTENT_SECURITY_POLICY,
} from "@/lib/upload-storage";
import { getSession, getStudentSession } from "@/lib/api-utils";
import { authorizeUploadAccess } from "@/lib/upload-access";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

/**
 * Every upload lives under one public directory and is rewritten here from
 * /uploads/*, so this route is the only place that can gate access. It sits
 * outside the auth proxy, which deliberately lets /uploads/* through.
 *
 * No upload is readable anonymously: the pages that render logos, avatars and
 * marketing collateral are all behind authentication, and assets are fetched
 * same-origin with the session cookie, so signing in is always sufficient.
 *
 * A session alone is not enough. The file is resolved back to the record that
 * owns it, so one user cannot read another's private document by learning a URL.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const [session, studentSession] = await Promise.all([getSession(), getStudentSession()]);
  if (!session && !studentSession) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { path: segments } = await context.params;
  const relativePath = segments
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/");

  const absolutePath = resolveStoredUpload(relativePath);
  if (!absolutePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = getUploadContentType(absolutePath);
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  if ((await authorizeUploadAccess(relativePath, session, studentSession)) !== "allow") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const data = fs.readFileSync(absolutePath);

  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(data.byteLength),
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": UPLOAD_CONTENT_SECURITY_POLICY,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

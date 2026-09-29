import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import {
  getUploadContentType,
  resolveStoredUpload,
  UPLOAD_CONTENT_SECURITY_POLICY,
} from "@/lib/upload-storage";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
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

  const data = fs.readFileSync(absolutePath);

  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(data.byteLength),
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": UPLOAD_CONTENT_SECURITY_POLICY,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

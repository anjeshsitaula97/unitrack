import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { getSession, apiError, checkRoutePermission } from "@/lib/api-utils";
import { storeUploadedFile, UploadError, MAX_UPLOAD_SIZE } from "@/lib/upload-security";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkRoutePermission(session, { url: "/api/upload", method: "POST" });
    if (deniedPOST) return deniedPOST;
    if (!session) return apiError("Unauthorized", 401);

    const rl = await checkRateLimit(`upload:${session.id}:${getClientIp(req)}`, 30, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many uploads" }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const stored = await storeUploadedFile(file, MAX_UPLOAD_SIZE);

    return NextResponse.json({
      url: stored.fileUrl,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
    });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logError("Upload file", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

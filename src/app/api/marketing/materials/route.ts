import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { getSession, apiError, checkRoutePermission } from "@/lib/api-utils";
import { saveUploadedFile } from "@/lib/marketing-files";
import { UploadError } from "@/lib/upload-security";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkRoutePermission(session, {
      url: "/api/marketing/materials",
      method: "POST",
    });
    if (deniedPOST) return deniedPOST;
    if (!session) return apiError("Unauthorized", 401);

    const formData = await req.formData();
    const requestId = formData.get("requestId") as string;
    const file = formData.get("file") as File;
    const description = formData.get("description") as string | null;
    const isFinal = formData.get("isFinal") === "true";

    if (!requestId || !file) {
      return apiError("Request ID and file are required", 400);
    }

    const request = await db.marketingRequest.findUnique({
      where: { id: parseInt(requestId) },
    });

    if (!request) {
      return apiError("Marketing request not found", 404);
    }

    const { fileUrl, fileType: sniffedMime } = await saveUploadedFile(file);
    let fileType = "document";
    if (sniffedMime.startsWith("image/")) fileType = "image";

    const material = await db.marketingMaterial.create({
      data: {
        requestId: parseInt(requestId),
        fileName: file.name,
        fileUrl,
        fileType,
        fileSize: file.size,
        uploadedBy: session.id,
        description,
        isFinal,
      },
      include: {
        uploader: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (isFinal) {
      await db.marketingRequest.update({
        where: { id: parseInt(requestId) },
        data: { status: "Completed", completedAt: new Date() },
      });
    } else if (request.status === "Pending") {
      await db.marketingRequest.update({
        where: { id: parseInt(requestId) },
        data: { status: "In Progress" },
      });
    }

    const user = await db.user.findUnique({ where: { id: session.id } });
    await logActivity({
      actorName: user?.name || "System",
      userId: session.id,
      action: "uploaded marketing material",
      target: `${material.fileName} for "${request.title}"`,
    });

    if (request.requestedBy !== session.id) {
      await db.notification.create({
        data: {
          userId: String(request.requestedBy),
          title: "New Material Uploaded",
          message: `${user?.name || "Someone"} uploaded "${material.fileName}" for "${request.title}"`,
          type: "Success",
        },
      });
    }

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    logError("Upload marketing material", error);
    if (error instanceof UploadError) return apiError(error.message, error.status);
    return apiError("Failed to upload marketing material", 400);
  }
}

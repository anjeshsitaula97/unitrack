import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { restoreFromTrash } from "@/lib/trash";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkPermission(session, "trash:restore");
    if (deniedPOST) return deniedPOST;
    if (!session) return apiError("Unauthorized", 401);
    if (!["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Forbidden", 403);

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Trash item ID required" }, { status: 400 });

    const restored = await restoreFromTrash(id);
    const user = await db.user.findUnique({ where: { id: session.id } });

    await logActivity({
      actorName: user?.name || "System",
      action: "restored from trash",
      target: `${restored.entityType}: ${restored.entityName}`,
    });

    return NextResponse.json({ success: true, item: restored });
  } catch (error) {
    logError("Restore error:", error);
    return apiError("Failed to restore item");
  }
}

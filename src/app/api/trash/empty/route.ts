import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { purgeAllTrash } from "@/lib/trash";
import { logActivity, getActorName } from "@/lib/activity";

export async function POST() {
  try {
    const session = await getSession();
    const deniedPOST = checkPermission(session, "trash:delete");
    if (deniedPOST) return deniedPOST;
    if (!session) return apiError("Unauthorized", 401);
    if (!["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Forbidden", 403);

    const { purged, failed } = await purgeAllTrash();

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "emptied the trash",
      target: "Trash",
    });

    return NextResponse.json({ success: failed === 0, purged, failed });
  } catch (error) {
    logError("Empty trash error:", error);
    return apiError("Failed to empty trash");
  }
}

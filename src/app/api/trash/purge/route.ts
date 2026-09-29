import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { getSession, apiError } from "@/lib/api-utils";
import { purgeExpiredTrash } from "@/lib/trash";
import { logActivity, getActorName } from "@/lib/activity";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);
    if (!["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Forbidden", 403);

    const purged = await purgeExpiredTrash();

    let target = "Trash";
    try {
      const body = await req.json();
      const counts = body?.counts ?? body;
      if (counts && typeof counts === "object") {
        const parts = Object.entries(counts)
          .filter(([, v]) => typeof v === "number" && v > 0)
          .map(([k, v]) => `${k}: ${v}`);
        if (parts.length > 0) target = parts.join(", ");
      }
    } catch {}

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "purged the trash",
      target,
    });

    return NextResponse.json({ success: true, purged });
  } catch (error) {
    logError("Purge error:", error);
    return apiError("Failed to purge expired trash");
  }
}

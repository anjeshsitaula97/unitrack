import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { newsVisibilityWhere, withNewsScope } from "@/lib/news";

export const dynamic = "force-dynamic";

/**
 * Latest unread, published news for the login popup. Returns an empty list
 * (never an error for a legitimate session) when the feature is disabled, the
 * role lacks news:read, or there is nothing new — the popup is opt-in chrome,
 * not an authorization boundary.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const settings = await db.systemSettings.findFirst({ orderBy: { updatedAt: "desc" } });
    if (settings && settings.showNewsOnLogin === false) {
      return NextResponse.json({ items: [] });
    }

    const denied = checkPermission(session, "news:read");
    if (denied) return NextResponse.json({ items: [] });

    const items = await withNewsScope(() =>
      db.news.findMany({
        where: {
          isPublished: true,
          AND: [
            newsVisibilityWhere(session.consultancyId ?? null),
            { reads: { none: { userId: session.id } } },
          ],
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 5,
        include: { author: { select: { name: true, email: true } } },
      })
    );

    return NextResponse.json({ items });
  } catch (error) {
    logError("Fetch news popup", error);
    return apiError("Failed to fetch news");
  }
}

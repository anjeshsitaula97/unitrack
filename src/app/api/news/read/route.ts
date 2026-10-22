import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError } from "@/lib/api-utils";
import { newsVisibilityWhere, withNewsScope } from "@/lib/news";

/**
 * Marks news posts as read for the current user so the login popup stops
 * showing them. Runs in platform scope because the unique key is (newsId,
 * userId); the tenant extension would otherwise add a consultancyId filter that
 * can miss a row created under a different scope.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const body = await req.json();
    const raw = Array.isArray(body?.ids) ? body.ids : [];
    const requested = Array.from(
      new Set(
        raw
          .map((value: unknown) => Number(value))
          .filter((id: number) => Number.isInteger(id) && id > 0)
      )
    ).slice(0, 50) as number[];

    if (requested.length === 0) return apiError("No news ids provided", 400);

    // Only mark posts the caller is allowed to see as read.
    const visible = await withNewsScope(() =>
      db.news.findMany({
        where: {
          id: { in: requested },
          isPublished: true,
          AND: [newsVisibilityWhere(session.consultancyId ?? null)],
        },
        select: { id: true },
      })
    );
    const ids = visible.map((v) => v.id);

    if (ids.length === 0) return NextResponse.json({ success: true, marked: 0 });

    await withNewsScope(async () => {
      await Promise.all(
        ids.map((newsId) =>
          db.newsRead.upsert({
            where: { newsId_userId: { newsId, userId: session.id } },
            create: { newsId, userId: session.id, consultancyId: session.consultancyId ?? null },
            update: {},
          })
        )
      );
    });

    return NextResponse.json({ success: true, marked: ids.length });
  } catch (error) {
    logError("Mark news read", error);
    return apiError("Failed to mark news as read");
  }
}

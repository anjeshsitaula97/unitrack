import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";
import { getSession, apiError, checkRoutePermission } from "@/lib/api-utils";
import { isSuperAdminRole } from "@/lib/permission-catalog";
import { NEWS_AUDIENCE_ALL, isNewsAudience, withNewsScope } from "@/lib/news";

/** Loads a post and enforces that the caller may modify it. */
async function loadEditable(
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>,
  id: number
) {
  const row = await withNewsScope(() => db.news.findUnique({ where: { id } }));
  if (!row) return { row: null, error: apiError("News not found", 404) };

  if (!isSuperAdminRole(session.role)) {
    const platformWide = row.audience === NEWS_AUDIENCE_ALL || row.consultancyId == null;
    if (platformWide || row.consultancyId !== session.consultancyId) {
      return { row: null, error: apiError("Forbidden: not your consultancy's news", 403) };
    }
  }
  return { row, error: null };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const denied = checkRoutePermission(session, {
      url: "/api/news/[id]",
      method: "GET",
    });
    if (denied) return denied;
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const loaded = await loadEditable(session, Number(id));
    if (loaded.error) return loaded.error;

    return NextResponse.json(loaded.row);
  } catch (error) {
    logError("Fetch news item", error);
    return apiError("Failed to fetch news item");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const denied = checkRoutePermission(session, {
      url: "/api/news/[id]",
      method: "PATCH",
    });
    if (denied) return denied;
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const loaded = await loadEditable(session, Number(id));
    if (loaded.error) return loaded.error;
    const existing = loaded.row!;

    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (typeof body?.title === "string") {
      const title = body.title.trim();
      if (!title) return apiError("Title is required", 400);
      data.title = title.slice(0, 255);
    }
    if (typeof body?.body === "string") {
      const content = body.body.trim();
      if (!content) return apiError("Body is required", 400);
      data.body = content;
    }
    if (typeof body?.isPublished === "boolean") {
      data.isPublished = body.isPublished;
      if (body.isPublished && !existing.publishedAt) data.publishedAt = new Date();
    }

    // Only a Super Admin may change the audience / target consultancy.
    if (isNewsAudience(body?.audience) && isSuperAdminRole(session.role)) {
      data.audience = body.audience;
      if (body.audience === NEWS_AUDIENCE_ALL) {
        data.consultancyId = null;
      } else if (Number.isInteger(body?.consultancyId) && body.consultancyId > 0) {
        data.consultancyId = body.consultancyId;
      } else if (existing.consultancyId == null) {
        return apiError("Select a consultancy for this post", 400);
      }
    }

    if (Object.keys(data).length === 0) return apiError("Nothing to update", 400);

    const updated = await withNewsScope(() =>
      db.news.update({
        where: { id: Number(id) },
        data,
        include: { author: { select: { name: true, email: true } } },
      })
    );

    await logActivity({
      actorName: await getActorName(session.id),
      userId: session.id,
      action: "updated news",
      target: updated.title,
      changes: diffChanges(existing, updated, ["author", "reads"]),
    });

    return NextResponse.json(updated);
  } catch (error) {
    logError("Update news", error);
    return apiError("Failed to update news");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const denied = checkRoutePermission(session, {
      url: "/api/news/[id]",
      method: "DELETE",
    });
    if (denied) return denied;
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const loaded = await loadEditable(session, Number(id));
    if (loaded.error) return loaded.error;

    await withNewsScope(() => db.news.delete({ where: { id: Number(id) } }));

    await logActivity({
      actorName: await getActorName(session.id),
      userId: session.id,
      action: "deleted news",
      target: loaded.row!.title,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete news", error);
    return apiError("Failed to delete news");
  }
}

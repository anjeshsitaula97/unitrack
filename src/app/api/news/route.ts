import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { logActivity, getActorName } from "@/lib/activity";
import {
  getSession,
  apiError,
  checkPermission,
  checkRoutePermission,
  getPaginationParams,
  paginatedResponse,
} from "@/lib/api-utils";
import { parseJson, zodResponse } from "@/lib/validate";
import { isSuperAdminRole } from "@/lib/permission-catalog";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  NEWS_AUDIENCE_ALL,
  NEWS_AUDIENCE_CONSULTANCY,
  isNewsAudience,
  newsVisibilityWhere,
  withNewsScope,
} from "@/lib/news";

const createNewsSchema = z.object({
  title: z.string().trim().min(1).max(255),
  body: z.string().trim().min(1),
  audience: z.string().optional(),
  isPublished: z.boolean().optional(),
  consultancyId: z.number().int().positive().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const denied = checkPermission(session, "news:read");
    if (denied) return denied;
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const params = getPaginationParams(searchParams);

    const filters: Record<string, unknown>[] = [newsVisibilityWhere(session.consultancyId ?? null)];
    if (params.search) {
      filters.push({
        OR: [{ title: { contains: params.search } }, { body: { contains: params.search } }],
      });
    }

    const where = { AND: filters };

    const [rows, total] = await withNewsScope(() =>
      Promise.all([
        db.news.findMany({
          where,
          include: {
            author: { select: { name: true, email: true } },
            reads: { where: { userId: session.id }, select: { readAt: true } },
          },
          orderBy: [{ isPublished: "desc" }, { createdAt: "desc" }],
          skip: params.skip,
          take: params.perPage,
        }),
        db.news.count({ where }),
      ])
    );

    const data = rows.map((row) => {
      const { reads, ...rest } = row;
      return { ...rest, isRead: reads.length > 0 };
    });

    return NextResponse.json(paginatedResponse(data, total, params));
  } catch (error) {
    logError("Fetch news", error);
    return apiError("Failed to fetch news");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const denied = checkRoutePermission(session, { url: "/api/news", method: "POST" });
    if (denied) return denied;
    if (!session) return apiError("Unauthorized", 401);

    const rl = await checkRateLimit(`news-create:${session.id}:${getClientIp(req)}`, 20, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many news posts" }, { status: 429 });
    }

    const parsed = await parseJson(req, createNewsSchema);
    if (!parsed.ok) return zodResponse(parsed.error);

    const { title, body, isPublished } = parsed.data;
    const audience = isNewsAudience(parsed.data.audience) ? parsed.data.audience : undefined;
    const superAdmin = isSuperAdminRole(session.role);

    // Resolve the target consultancy: platform-wide ("all") is Super Admin only.
    let targetConsultancy: number | null;
    const resolvedAudience = audience ?? NEWS_AUDIENCE_CONSULTANCY;

    if (resolvedAudience === NEWS_AUDIENCE_ALL) {
      if (!superAdmin) return apiError("Only a Super Admin can post platform-wide news", 403);
      targetConsultancy = null;
    } else if (superAdmin) {
      // A Super Admin may be viewing all consultancies; the target must be explicit.
      const chosen = parsed.data.consultancyId;
      if (!chosen) return apiError("Select a consultancy for this post", 400);
      targetConsultancy = chosen;
    } else {
      if (session.consultancyId == null) return apiError("No consultancy in scope", 400);
      targetConsultancy = session.consultancyId;
    }

    const published = isPublished !== false;

    const created = await withNewsScope(() =>
      db.news.create({
        data: {
          title,
          body,
          audience: resolvedAudience,
          isPublished: published,
          publishedAt: published ? new Date() : null,
          authorId: session.id,
          consultancyId: targetConsultancy,
        },
        include: { author: { select: { name: true, email: true } } },
      })
    );

    await logActivity({
      actorName: await getActorName(session.id),
      userId: session.id,
      action: "posted news",
      target: created.title,
      targetBy: resolvedAudience === NEWS_AUDIENCE_ALL ? "All consultancies" : "Consultancy",
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    logError("Create news", error);
    return apiError("Failed to create news");
  }
}

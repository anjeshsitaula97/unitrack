import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";
import { purgeExpiredTrash } from "@/lib/trash";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    // Auto-purge expired items in background (fire and forget)
    purgeExpiredTrash().catch(() => {});

    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type") || "";
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = { restoredAt: null };
    if (typeFilter) where.entityType = typeFilter;
    if (search) where.entityName = { contains: search };

    const items = await db.trashItem.findMany({
      where: where as Prisma.TrashItemWhereInput,
      orderBy: { deletedAt: "desc" },
      take: 200,
    });

    const total = await db.trashItem.count({ where: where as Prisma.TrashItemWhereInput });

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error("Trash fetch error:", error);
    return apiError("Failed to fetch trash items");
  }
}

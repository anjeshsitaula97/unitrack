import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";
import { checkPermission, checkRoutePermission, getSession } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "learning:read");
    if (deniedGET) return deniedGET;
    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get("countryId");
    const categoryId = searchParams.get("categoryId");

    const where: Record<string, unknown> = {};
    if (countryId) where.countryId = Number(countryId);
    if (categoryId) where.categoryId = Number(categoryId);

    const resources = await db.learningResource.findMany({
      where: where as Prisma.LearningResourceWhereInput,
      include: {
        country: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(resources);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkRoutePermission(session, {
      url: "/api/learning-resources",
      method: "POST",
    });
    if (deniedPOST) return deniedPOST;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { title, description, type, categoryId, countryId, url, thumbnail, fileSize } = data;

    if (!title || !url)
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });

    const [newResource, user] = await Promise.all([
      db.learningResource.create({
        data: {
          title,
          description,
          type: type || "Document",
          categoryId: categoryId != null && categoryId !== "" ? Number(categoryId) : null,
          countryId: countryId != null && countryId !== "" ? Number(countryId) : null,
          url,
          thumbnail,
          fileSize,
        },
      }),
      db.user.findUnique({ where: { id: session.id } }),
    ]);
    await logActivity({
      actorName: user?.name || "System",
      action: "added a hub resource",
      target: newResource.title,
    });

    return NextResponse.json(newResource, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to add resource" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedDELETE = checkRoutePermission(session, {
      url: "/api/learning-resources",
      method: "DELETE",
    });
    if (deniedDELETE) return deniedDELETE;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const resource = await db.learningResource.findUnique({ where: { id: Number(id) } });

    await db.learningResource.delete({ where: { id: Number(id) } });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a learning resource",
      target: resource?.title || id,
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPATCH = checkRoutePermission(session, {
      url: "/api/learning-resources",
      method: "PATCH",
    });
    if (deniedPATCH) return deniedPATCH;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { id, title, description, type, categoryId, countryId, url, thumbnail, fileSize } = data;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const existing = await db.learningResource.findUnique({ where: { id: Number(id) } });

    const updatedResource = await db.learningResource.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        type,
        categoryId: categoryId != null && categoryId !== "" ? Number(categoryId) : null,
        countryId: countryId != null && countryId !== "" ? Number(countryId) : null,
        url,
        thumbnail,
        fileSize,
      },
    });

    const changes = diffChanges(existing, updatedResource);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a learning resource",
      target: updatedResource.title,
      changes,
    });

    return NextResponse.json(updatedResource);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
  }
}

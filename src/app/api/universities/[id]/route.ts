import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import type { Course } from "@prisma/client";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { softDeleteUniversity } from "@/lib/trash";
import { getSession, apiError, checkRoutePermission, checkPermission } from "@/lib/api-utils";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "universities:read");
    if (deniedGET) return deniedGET;
    if (!session) return apiError("Unauthorized", 401);
    const { id } = await params;

    const university = await db.university.findUnique({
      where: { id: Number(id) },
      include: {
        partner: true,
        courses: {
          orderBy: { name: "asc" },
        },
      },
    });

    if (!university) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    // Transform university data
    const transformed = {
      ...university,
      addedDate: university.createdAt,
      accredited: university.accreditation !== null,
      accreditation: university.accreditation
        ? university.accreditation.startsWith("[")
          ? JSON.parse(university.accreditation)
          : [university.accreditation]
        : [],
      color: `hsl(${(university.name.length * 137) % 360}, 70%, 50%)`,
      initials: university.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2),
      requirements: university.requirements
        ? university.requirements.startsWith("[")
          ? JSON.parse(university.requirements)
          : [university.requirements]
        : [],
      images: university.images
        ? university.images.startsWith("[")
          ? JSON.parse(university.images)
          : [university.images]
        : [],
    };

    // Group courses by faculty
    const groupedCourses: Record<string, Course[]> = {};
    university.courses.forEach((course) => {
      const faculty = course.faculty || "General";
      if (!groupedCourses[faculty]) {
        groupedCourses[faculty] = [];
      }
      groupedCourses[faculty].push(course);
    });

    return NextResponse.json({
      ...transformed,
      groupedCourses,
    });
  } catch (error) {
    logError("Error fetching university:", error);
    return NextResponse.json({ error: "Failed to fetch university details" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const permError = checkRoutePermission(session, req.url, req.method);
    if (permError) return permError;

    // Rate limit university deletion
    const rl = await checkRateLimit(`delete-university:${getClientIp(req)}`, 10, 60000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId)) {
      return NextResponse.json({ error: "Invalid university id" }, { status: 400 });
    }

    let university;
    try {
      university = await softDeleteUniversity(numId);
    } catch (err) {
      if ((err as { code?: string })?.code === "P2025") {
        return NextResponse.json({ error: "University not found" }, { status: 404 });
      }
      throw err;
    }

    if (university) {
      await createNotification({
        title: "University Deleted",
        message: `University "${university.name}" has been moved to trash.`,
        type: "Warning",
      });

      await logActivity({
        actorName: await getActorName(session?.id),
        userId: session?.id,
        action: "deleted a university",
        target: university.name,
      });
    }

    return NextResponse.json({ success: true, message: "University moved to trash" });
  } catch (error) {
    logError("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete university" }, { status: 500 });
  }
}

const parseSafeInt = (val: string | number | null | undefined) => {
  if (val === undefined || val === null || val === "") return null;
  const parsed = parseInt(val.toString());
  return isNaN(parsed) ? null : parsed;
};

const parseSafeFloat = (val: string | number | null | undefined) => {
  if (val === undefined || val === null || val === "") return null;
  const parsed = parseFloat(val.toString());
  return isNaN(parsed) ? null : parsed;
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedPATCH = checkPermission(session, "universities:update");
    if (deniedPATCH) return deniedPATCH;
    if (!session || !["Admin", "Super Admin", "Staff"].includes(session.role as string))
      return apiError("Unauthorized", 401);
    const { id } = await params;
    const data = await req.json();
    const university = await db.university.findUnique({ where: { id: Number(id) } });

    const updated = await db.university.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        shortName: data.shortName || null,
        country: data.country,
        city: data.city || "",
        website: data.websiteUrl || data.website || null,
        founded: parseSafeInt(data.establishedYear || data.foundedYear),
        accreditation: data.accreditationBody
          ? typeof data.accreditationBody === "string"
            ? data.accreditationBody
            : JSON.stringify(data.accreditationBody)
          : data.accreditation
            ? typeof data.accreditation === "string"
              ? data.accreditation
              : JSON.stringify(data.accreditation)
            : null,
        ranking: parseSafeInt(data.ranking),
        logo: data.logo || null,
        banner: data.banner || null,
        images: data.images || (data.imagesList ? JSON.stringify(data.imagesList) : null),
        requirements: data.requirements
          ? typeof data.requirements === "string"
            ? data.requirements
            : JSON.stringify(data.requirements)
          : null,
        partnerId: data.partnerId ? Number(data.partnerId) : null,
        partnershipAmount: parseSafeFloat(data.partnershipAmount),
        commissionType: data.commissionType || "Percentage",
        commissionValue: parseSafeFloat(data.commissionValue),
        commissionCurrency: data.commissionCurrency || null,
        status: data.status || "Active",
        type: data.type || "Public",
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        description: data.description || null,
      },
    });

    if (university) {
      await createNotification({
        title: "University Updated",
        message: `University "${university.name}" has been updated.`,
        type: "Info",
      });
    }

    const changes = diffChanges(university, updated);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a university",
      target: updated.name,
      changes,
    });

    return NextResponse.json(updated);
  } catch (error) {
    logError("Update error:", error);
    return NextResponse.json({ error: "Failed to update university" }, { status: 500 });
  }
}

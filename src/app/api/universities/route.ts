import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/notifications";
import { getPaginationParams, paginatedResponse, apiError, getSession, checkRoutePermission } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const permError = checkRoutePermission(session, req.url, req.method);
    if (permError) return permError;

    const { searchParams } = new URL(req.url);
    const params = getPaginationParams(searchParams);
    const statusFilter = searchParams.get("status") || "";
    const countryFilter = searchParams.get("country") || "";
    const typeFilter = searchParams.get("type") || "";

    const where: Record<string, unknown> = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { country: { contains: params.search } },
        { city: { contains: params.search } },
      ];
    }

    if (statusFilter) {
      where.status = statusFilter;
    } else {
      where.status = { not: "Deleted" };
    }
    if (countryFilter) where.country = countryFilter;
    if (typeFilter) where.type = typeFilter;

    const [universities, total] = await Promise.all([
      db.university.findMany({
        where: where as Prisma.UniversityWhereInput,
        include: {
          partner: true,
          _count: { select: { courses: true } },
        },
        orderBy: { name: "asc" },
        skip: params.skip,
        take: params.perPage,
      }),
      db.university.count({ where: where as Prisma.UniversityWhereInput }),
    ]);

    const transformed = universities.map((u) => ({
      ...u,
      courses: u._count.courses,
      students: 0,
      type: u.type || "Public",
      addedDate: u.createdAt,
      accredited: u.accreditation !== null,
      color: `hsl(${(u.name.length * 137) % 360}, 70%, 50%)`,
      initials: u.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2),
      requirements: u.requirements
        ? u.requirements.startsWith("[")
          ? JSON.parse(u.requirements)
          : [u.requirements]
        : [],
      accreditation: u.accreditation
        ? u.accreditation.startsWith("[")
          ? JSON.parse(u.accreditation)
          : [u.accreditation]
        : [],
    }));

    return NextResponse.json(paginatedResponse(transformed, total, params));
  } catch (error) {
    logError("Fetch universities", error);
    return apiError("Failed to fetch universities");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const permError = checkRoutePermission(session, req.url, req.method);
    if (permError) return permError;

    // Rate limit university creation
    const rl = await checkRateLimit(`create-university:${getClientIp(req)}`, 20, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const data = await req.json();

    const name = data.name || data.title;
    if (!name || !String(name).trim()) {
      return apiError("University name is required", 400);
    }
    if (!data.country) {
      return apiError("Country is required", 400);
    }

    const newUniversity = await db.university.create({
      data: {
        name: name.trim(),
        shortName: data.shortName || null,
        country: data.country || "",
        city: data.city || "",
        type: data.type || "Public",
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        website: data.websiteUrl || data.website || null,
        founded: data.establishedYear
          ? parseInt(data.establishedYear)
          : data.foundedYear
            ? parseInt(data.foundedYear)
            : null,
        accreditation: data.accreditationBody
          ? typeof data.accreditationBody === "string"
            ? data.accreditationBody
            : JSON.stringify(data.accreditationBody)
          : data.accreditation
            ? typeof data.accreditation === "string"
              ? data.accreditation
              : JSON.stringify(data.accreditation)
            : null,
        ranking: data.ranking ? parseInt(data.ranking.toString()) : null,
        logo: data.logo || null,
        banner: data.banner || null,
        images: data.images || (data.imagesList ? JSON.stringify(data.imagesList) : null),
        requirements: data.requirements
          ? typeof data.requirements === "string"
            ? data.requirements
            : JSON.stringify(data.requirements)
          : null,
        partnerId: data.partnerId ? Number(data.partnerId) : null,
        partnershipAmount: data.partnershipAmount
          ? parseFloat(data.partnershipAmount.toString())
          : null,
        commissionType: data.commissionType || "Percentage",
        commissionValue: data.commissionValue ? parseFloat(data.commissionValue.toString()) : null,
        commissionCurrency: data.commissionCurrency || null,
        description: data.description || null,
        status: data.status || "Active",
      },
    });

    if (session) {
      const user = await db.user.findUnique({ where: { id: session.id } });
      await logActivity({
        actorName: user?.name || "System",
        action: "created a new university",
        target: newUniversity.name,
      });
    }

    await createNotification({
      userId: String(session!.id),
      title: "University Created",
      message: `University "${newUniversity.name}" has been added.`,
      type: "Success",
    });

    return NextResponse.json(newUniversity, { status: 201 });
  } catch (error) {
    logError("Create university", error);
    return apiError("Failed to create university", 400);
  }
}

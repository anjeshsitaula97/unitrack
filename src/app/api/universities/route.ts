import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/notifications";
import { getPaginationParams, paginatedResponse, apiError, getSession } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const params = getPaginationParams(searchParams);
    const statusFilter = searchParams.get("status") || "";
    const countryFilter = searchParams.get("country") || "";
    const typeFilter = searchParams.get("type") || "";

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { country: { contains: params.search, mode: "insensitive" } },
        { city: { contains: params.search, mode: "insensitive" } },
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
        where,
        include: {
          partner: true,
          _count: { select: { courses: true } },
        },
        orderBy: { name: "asc" },
        skip: params.skip,
        take: params.perPage,
      }),
      db.university.count({ where }),
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
    console.error(error);
    return apiError("Failed to fetch universities");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin", "Staff"].includes(session.role as string))
      return apiError("Unauthorized", 401);
    const data = await req.json();
    const newUniversity = await db.university.create({
      data: {
        name: data.name || data.title,
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
      userId: String(session.id),
      title: "University Created",
      message: `University "${newUniversity.name}" has been added.`,
      type: "Success",
    });

    return NextResponse.json(newUniversity, { status: 201 });
  } catch (error) {
    console.error(error);
    return apiError("Failed to create university", 400);
  }
}

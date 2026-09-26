import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { logActivity, getActorName } from "@/lib/activity";
import { getPaginationParams, paginatedResponse, apiError, getSession } from "@/lib/api-utils";

const prisma = db;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const params = getPaginationParams(searchParams);
    const statusFilter = searchParams.get("status") || "";
    const sourceFilter = searchParams.get("source") || "";
    const counselorFilter = searchParams.get("counselor") || "";

    const where: Record<string, unknown> = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { phone: { contains: params.search } },
      ];
    }

    if (statusFilter) {
      where.status = statusFilter;
    } else {
      where.status = { not: "Deleted" };
    }
    if (sourceFilter) where.source = sourceFilter;
    if (counselorFilter) where.counselor = counselorFilter;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where: where as Prisma.LeadWhereInput,
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.perPage,
      }),
      prisma.lead.count({ where: where as Prisma.LeadWhereInput }),
    ]);

    return NextResponse.json(paginatedResponse(leads, total, params));
  } catch (error) {
    console.error("Fetch Leads Error:", error);
    return apiError("Failed to fetch leads");
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin", "Staff"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const body = await req.json();
    const {
      name,
      email,
      phone,
      source,
      status,
      notes,
      uploadedBy,
      uploaderNotes,
      counselor,
      counselorNotes,
      assignedDate,
      nextFollowUp,
      interestedCountry,
      maritalStatus,
      childrenCount,
      referenceName,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        source: source || "Website",
        status: status || "New",
        notes,
        uploadedBy,
        uploaderNotes,
        counselor,
        counselorNotes,
        assignedDate: assignedDate ? new Date(assignedDate) : null,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
        interestedCountry,
        maritalStatus: maritalStatus || "Single",
        childrenCount: childrenCount ? parseInt(childrenCount) : 0,
        referenceName,
      },
    });

    await createNotification({
      title: "Lead Created",
      message: `Lead "${name}" has been added.`,
      type: "Success",
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "created a lead",
      target: lead.name,
    });

    if (status === "Converted") {
      try {
        const existingStudent = await prisma.student.findUnique({ where: { email } });
        if (!existingStudent) {
          const nameParts = (lead.name || "").split(" ").filter(Boolean);
          const initials =
            nameParts.length >= 2
              ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
              : (nameParts[0]?.[0] || "S").toUpperCase();
          await prisma.student.create({
            data: {
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              interestedCountry: lead.interestedCountry,
              maritalStatus: lead.maritalStatus,
              counselor: lead.counselor,
              lead: "Converted from Leads",
              status: "New Leads",
              initials: initials || "ST",
              color: "#6366f1",
              country: lead.interestedCountry,
            },
          });
        }
      } catch (studentError) {
        console.error("Migration to Student failed:", studentError);
      }
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Create Lead Error:", error);
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "A lead with this email already exists" }, { status: 400 });
    }
    return apiError("Failed to create lead");
  }
}

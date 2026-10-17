import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { logActivity, getActorName } from "@/lib/activity";
import {
  getPaginationParams,
  paginatedResponse,
  apiError,
  getSession,
  checkRoutePermission,
} from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  parseJson,
  zodResponse,
  emailField,
  optionalTrimmedString,
  isoDateOrNull,
} from "@/lib/validate";

const prisma = db;

// Server-side contract for a lead. Replaces the previous "destructure the raw
// body, check name/email exist, pass everything else through" pattern so that
// free-form fields are trimmed/bounded and dates are actually validated before
// they reach Prisma.
const createLeadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: emailField,
  phone: optionalTrimmedString(40),
  source: optionalTrimmedString(80),
  status: optionalTrimmedString(60),
  notes: optionalTrimmedString(4000),
  uploadedBy: optionalTrimmedString(120),
  uploaderNotes: optionalTrimmedString(2000),
  counselor: optionalTrimmedString(120),
  counselorNotes: optionalTrimmedString(2000),
  assignedDate: isoDateOrNull,
  nextFollowUp: isoDateOrNull,
  interestedCountry: optionalTrimmedString(120),
  maritalStatus: optionalTrimmedString(40),
  childrenCount: z.coerce.number().int().min(0).max(50).optional().default(0),
  referenceName: optionalTrimmedString(120),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const permError = checkRoutePermission(session, req.url, req.method);
    if (permError) return permError;

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
    logError("Fetch Leads Error:", error);
    return apiError("Failed to fetch leads");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const permError = checkRoutePermission(session, req.url, req.method);
    if (permError) return permError;

    // Rate limit lead creation
    const rl = await checkRateLimit(`create-lead:${getClientIp(req)}`, 30, 60000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = await parseJson(req, createLeadSchema);
    if (!parsed.ok) return zodResponse(parsed.error);

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
    } = parsed.data;

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
        assignedDate,
        nextFollowUp,
        interestedCountry,
        maritalStatus: maritalStatus || "Single",
        childrenCount,
        referenceName,
      },
    });

    await createNotification({
      title: "Lead Created",
      message: `Lead "${name}" has been added.`,
      type: "Success",
    });

    await logActivity({
      actorName: await getActorName(session!.id),
      userId: session!.id,
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
        logError("Migration to Student failed:", studentError);
      }
    }

    return NextResponse.json(lead);
  } catch (error) {
    logError("Create Lead Error:", error);
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "A lead with this email already exists" }, { status: 400 });
    }
    return apiError("Failed to create lead");
  }
}

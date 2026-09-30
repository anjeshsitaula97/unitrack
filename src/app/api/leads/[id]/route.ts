import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { softDeleteLead } from "@/lib/trash";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkPermission, getSession } from "@/lib/api-utils";

const prisma = db;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "leads:read");
    if (deniedGET) return deniedGET;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const lead = await prisma.lead.findUnique({ where: { id: Number(id) } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    return NextResponse.json(lead);
  } catch (error) {
    logError("Fetch Lead Error:", error);
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const [{ id }, body] = await Promise.all([params, req.json()]);

    const session = await getSession();
    const deniedPUT = checkPermission(session, "leads:update");
    if (deniedPUT) return deniedPUT;

    // Rate limit lead updates
    const rl = await checkRateLimit(`update-lead:${getClientIp(req)}`, 30, 60000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Get current lead to check previous status
    const currentLead = await prisma.lead.findUnique({ where: { id: Number(id) } });
    if (!currentLead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const lead = await prisma.lead.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        source: body.source,
        status: body.status,
        notes: body.notes,
        uploadedBy: body.uploadedBy,
        uploaderNotes: body.uploaderNotes,
        counselor: body.counselor,
        counselorNotes: body.counselorNotes,
        assignedDate: body.assignedDate ? new Date(body.assignedDate) : null,
        nextFollowUp: body.nextFollowUp ? new Date(body.nextFollowUp) : null,
        interestedCountry: body.interestedCountry,
        maritalStatus: body.maritalStatus,
        childrenCount: body.childrenCount ? parseInt(body.childrenCount) : 0,
        referenceName: body.referenceName,
      },
    });

    const changes = diffChanges(currentLead, lead);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a lead",
      target: currentLead.name,
      changes,
    });

    // Handle status moving AWAY from Converted — soft-hide the student
    if (currentLead.status === "Converted" && body.status !== "Converted") {
      try {
        const student = await prisma.student.findUnique({
          where: { email: currentLead.email },
        });
        if (student && student.lead === "Converted from Leads") {
          await prisma.student.update({
            where: { id: student.id },
            data: { status: "Deleted" },
          });
        }
      } catch (err) {
        logError("Failed to soft-hide student on lead status change:", err);
      }
    }

    // Handle re-conversion — restore the soft-hidden student
    if (body.status === "Converted" && currentLead.status !== "Converted") {
      try {
        const existingStudent = await prisma.student.findUnique({
          where: { email: lead.email },
        });

        if (
          existingStudent &&
          existingStudent.status === "Deleted" &&
          existingStudent.lead === "Converted from Leads"
        ) {
          await prisma.student.update({
            where: { id: existingStudent.id },
            data: { status: "New Leads" },
          });
        } else if (!existingStudent) {
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

    if (currentLead.status !== body.status) {
      await createNotification({
        title: "Lead Status Changed",
        message: `Lead "${currentLead.name}" status changed from ${currentLead.status} to ${body.status}.`,
        type: body.status === "Converted" ? "Success" : "Info",
      });
    } else {
      await createNotification({
        title: "Lead Updated",
        message: `Lead "${currentLead.name}" has been updated.`,
        type: "Info",
      });
    }

    return NextResponse.json(lead);
  } catch (error) {
    logError("Update Lead Error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedDELETE = checkPermission(session, "leads:delete");
    if (deniedDELETE) return deniedDELETE;
    if (!session || !["Admin", "Super Admin"].includes(session.role)) {
      return NextResponse.json({ error: "Only admins can delete leads" }, { status: 403 });
    }

    // Rate limit lead deletion
    const rl = await checkRateLimit(`delete-lead:${getClientIp(req)}`, 10, 60000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { id } = await params;
    const lead = await softDeleteLead(id);

    if (lead) {
      await createNotification({
        title: "Lead Deleted",
        message: `Lead "${lead.name}" has been moved to trash.`,
        type: "Warning",
      });

      await logActivity({
        actorName: await getActorName(session?.id),
        userId: session?.id,
        action: "deleted a lead",
        target: lead.name,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete Lead Error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}

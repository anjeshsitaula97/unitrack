import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createNotification } from "@/lib/notifications";
import { softDeleteStudent } from "@/lib/trash";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { logError } from "@/lib/logger";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "students:read");
    if (deniedGET) return deniedGET;
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const student = await db.student.findUnique({
      where: { id: Number(id) },
      include: {
        documents: {
          include: { academicDocument: { select: { id: true, name: true } } },
          orderBy: { uploadedAt: "desc" },
        },
        partner: { select: { id: true, name: true, countries: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    logError("Fetch student", error);
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedPUT = checkPermission(session, "students:update");
    if (deniedPUT) return deniedPUT;
    if (!session || !["Admin", "Super Admin", "Staff"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    // Rate limit student updates
    const rl = await checkRateLimit(`update-student:${getClientIp(req)}`, 30, 60000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { id } = await params;
    const numId = Number(id);
    const body = await req.json();

    const updateData: Record<string, unknown> = {};
    const scalarFields: [string, string?][] = [
      ["name"],
      ["firstName"],
      ["lastName"],
      ["email"],
      ["admissionEmail"],
      ["studentPassword"],
      ["phone"],
      ["whatsappNumber"],
      ["gender"],
      ["dob"],
      ["dobAd"],
      ["dobBs"],
      ["nationality"],
      ["maritalStatus"],
      ["photoUrl"],
      ["address"],
      ["permanentAddress"],
      ["temporaryAddress"],
      ["passportNumber"],
      ["passportNationality"],
      ["passportIssueDate"],
      ["passportExpiryDate"],
      ["passportIssuePlace"],
      ["testType"],
      ["overallScore"],
      ["readingScore"],
      ["writingScore"],
      ["listeningScore"],
      ["speakingScore"],
      ["moi"],
      ["testDate"],
      ["testRegNumber"],
      ["studyLevel"],
      ["intakeTerm"],
      ["major"],
      ["interestedCountry"],
      ["targetUniversities"],
      ["spouseName"],
      ["guardianName"],
      ["guardianPhone"],
      ["guardianEmail"],
      ["guardianRelation"],
      ["guardianAddress"],
      ["status"],
      ["statusColor"],
      ["initials"],
      ["color"],
      ["university"],
      ["country"],
      ["lastActivity"],
      ["counselor"],
      ["lead"],
      ["branchId"],
    ];
    // The province pickers are numeric selects but the columns are String?, so
    // they are coerced rather than copied through raw.
    const toProvince = (value: unknown): string | null => {
      if (value === null || value === undefined || value === "") return null;
      const n = Number(value);
      return Number.isFinite(n) && n > 0 ? String(n) : null;
    };
    const nullableText = (value: unknown): string | null => {
      if (value === null || value === undefined || value === "") return null;
      return String(value);
    };

    // partnerId is a real foreign key on an Int column. The form renders it as
    // an empty string when no partner is chosen, which Prisma rejects outright
    // ("Expected Int ... provided String") and failed every edit with a 500.
    // An absent or non-numeric selection means "no partner".
    if ("partnerId" in body) {
      const raw = body.partnerId;
      const n = Number(raw);
      updateData.partnerId =
        raw === null || raw === undefined || raw === "" || !Number.isInteger(n) || n <= 0
          ? null
          : n;
    }

    for (const [field] of scalarFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // District, municipality and ward belong to a province, so they were
    // cleared on every save. That silently erased a saved address whenever the
    // form was resubmitted without anyone touching those pickers, which is most
    // saves. The form already resets all three when the province itself
    // changes, so the server only normalises what it was sent and lets the
    // client decide when a cascade is warranted.
    for (const prefix of ["permanent", "temporary"] as const) {
      const provinceKey = `${prefix}Province`;
      if (provinceKey in body) updateData[provinceKey] = toProvince(body[provinceKey]);
      for (const part of ["District", "Municipality", "WardNo"] as const) {
        const key = `${prefix}${part}`;
        if (key in body) updateData[key] = nullableText(body[key]);
      }
    }

    if ("studentPassword" in body && body.studentPassword) {
      updateData.studentPassword = await bcrypt.hash(body.studentPassword, 12);
    }

    if ("education" in body) {
      updateData.education =
        typeof body.education === "string" ? body.education : JSON.stringify(body.education || []);
    }
    if ("workExperience" in body) {
      updateData.workExperience =
        typeof body.workExperience === "string"
          ? body.workExperience
          : JSON.stringify(body.workExperience || []);
    }
    if ("training" in body) {
      updateData.training =
        typeof body.training === "string" ? body.training : JSON.stringify(body.training || []);
    }
    if ("childrenDetails" in body) {
      updateData.childrenDetails =
        typeof body.childrenDetails === "string"
          ? body.childrenDetails
          : JSON.stringify(body.childrenDetails || []);
    }

    if ("name" in body || "firstName" in body || "lastName" in body) {
      updateData.name = body.name || `${body.firstName || ""} ${body.lastName || ""}`.trim();
    }

    // Documents used to be replaced wholesale, with deleteMany: {} wiping every
    // row and recreating the submitted list. Each save therefore renumbered every
    // document and dropped fileSize, fileType, academicDocumentId and
    // uploadedAt, because only type/name/url/status were carried across. They
    // are now reconciled after the student row is written: an incoming entry is
    // matched to its stored row by id or upload url, and only rows the client
    // actually dropped are deleted.
    const incomingDocs = Array.isArray(body.documents) ? body.documents : null;

    const existing = await db.student.findUnique({ where: { id: numId } });

    const student = await db.student.update({
      where: { id: numId },
      data: updateData as Prisma.StudentUpdateInput,
    });

    if (incomingDocs) {
      const stored = await db.studentDocument.findMany({ where: { studentId: numId } });
      const kept = new Set<number>();
      for (const doc of incomingDocs as {
        id?: string | number;
        type?: string;
        name?: string;
        url?: string;
        status?: string;
        fileSize?: number;
        fileType?: string;
      }[]) {
        const url = typeof doc?.url === "string" ? doc.url.trim() : "";
        if (!url || !doc?.name) continue;
        const idNum = Number(doc.id);
        const byId = Number.isInteger(idNum) ? stored.find((d) => d.id === idNum) : undefined;
        const row = byId ?? stored.find((d) => d.url === url);
        if (row) {
          kept.add(row.id);
          const type = doc.type || row.type;
          const status = doc.status || row.status || "Uploaded";
          if (row.name !== doc.name || row.type !== type || row.status !== status) {
            await db.studentDocument.update({
              where: { id: row.id },
              data: { name: doc.name, type, status },
            });
          }
        } else {
          const created = await db.studentDocument.create({
            data: {
              studentId: numId,
              type: doc.type || null,
              name: doc.name,
              url,
              status: doc.status || "Uploaded",
              fileSize: typeof doc.fileSize === "number" ? doc.fileSize : null,
              fileType: doc.fileType || null,
            },
          });
          kept.add(created.id);
        }
      }
      // Deletes run last so a failure part way through cannot lose documents.
      const removed = stored.filter((d) => !kept.has(d.id)).map((d) => d.id);
      if (removed.length) {
        await db.studentDocument.deleteMany({ where: { id: { in: removed } } });
      }
    }

    const changes = diffChanges(existing, student);
    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated a student",
      target:
        student.name ||
        `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
        `#${numId}`,
      changes,
    });

    if ("studentPassword" in updateData && updateData.studentPassword) {
      const existingUser = await db.user.findUnique({ where: { email: student.email } });
      if (existingUser) {
        await db.user.update({
          where: { id: existingUser.id },
          data: { password: updateData.studentPassword as string },
        });
      } else {
        await db.user.create({
          data: {
            name: student.name,
            email: student.email,
            password: updateData.studentPassword as string,
            role: "Student",
            status: "Active",
            lastLogin: "Never",
          },
        });
      }
    }

    if ("name" in updateData) {
      await createNotification({
        title: "Student Updated",
        message: `Student "${updateData.name as string}" has been updated.`,
        type: "Info",
      });
    }

    return NextResponse.json(student);
  } catch (error) {
    logError("Update student", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const deniedDELETE = checkPermission(session, "students:delete");
    if (deniedDELETE) return deniedDELETE;
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    // Rate limit student deletion
    const rl = await checkRateLimit(`delete-student:${getClientIp(req)}`, 10, 60000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { id } = await params;
    const student = await softDeleteStudent(id);

    await createNotification({
      title: "Student Deleted",
      message: `Student "${student.name}" has been moved to trash.`,
      type: "Warning",
    });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "deleted a student",
      target:
        student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim() || `#${id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Delete student", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}

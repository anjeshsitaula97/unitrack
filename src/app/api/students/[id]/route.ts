import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createNotification } from "@/lib/notifications";
import { softDeleteStudent } from "@/lib/trash";
import { getSession, apiError } from "@/lib/api-utils";
import { logError } from "@/lib/logger";
import { logActivity, diffChanges, getActorName } from "@/lib/activity";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
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
    if (!session || !["Admin", "Super Admin", "Staff"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    // Rate limit student updates
    const rl = await checkRateLimit(`update-student:${getClientIp(req)}`, 30, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
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
      ["permanentProvince"],
      ["permanentDistrict"],
      ["permanentMunicipality"],
      ["permanentWardNo"],
      ["permanentAddress"],
      ["temporaryProvince"],
      ["temporaryDistrict"],
      ["temporaryMunicipality"],
      ["temporaryWardNo"],
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
      ["partnerId"],
    ];
    for (const [field] of scalarFields) {
      if (field in body) updateData[field] = body[field];
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

    if ("documents" in body && body.documents) {
      updateData.documents = {
        deleteMany: {},
        create: body.documents.map(
          (doc: { type?: string; name: string; url: string; status?: string }) => ({
            type: doc.type,
            name: doc.name,
            url: doc.url,
            status: doc.status || "Uploaded",
          })
        ),
      };
    }

    const existing = await db.student.findUnique({ where: { id: numId } });

    const student = await db.student.update({
      where: { id: numId },
      data: updateData as Prisma.StudentUpdateInput,
    });

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
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    // Rate limit student deletion
    const rl = await checkRateLimit(`delete-student:${getClientIp(req)}`, 10, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
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

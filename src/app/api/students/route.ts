import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createNotification } from "@/lib/notifications";
import { logActivity, getActorName } from "@/lib/activity";
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
    const counselorFilter = searchParams.get("counselor") || "";

    const where: Record<string, unknown> = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { phone: { contains: params.search } },
        { passportNumber: { contains: params.search } },
      ];
    }

    if (statusFilter) {
      where.status = statusFilter;
    } else {
      where.status = { not: "Deleted" };
    }
    if (countryFilter) where.interestedCountry = countryFilter;
    if (counselorFilter) where.counselor = counselorFilter;

    const [students, total] = await Promise.all([
      db.student.findMany({
        where: where as Prisma.StudentWhereInput,
        include: {
          documents: true,
          partner: { select: { id: true, name: true, countries: true } },
          _count: { select: { documents: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.perPage,
      }),
      db.student.count({ where: where as Prisma.StudentWhereInput }),
    ]);

    return NextResponse.json(paginatedResponse(students, total, params));
  } catch (error) {
    logError("Fetch students", error);
    return apiError("Failed to fetch students");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const permError = checkRoutePermission(session, req.url, req.method);
    if (permError) return permError;

    // Rate limit student creation
    const rl = await checkRateLimit(`create-student:${getClientIp(req)}`, 20, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const data = await req.json();

    if (!data.name && (!data.firstName || !data.lastName)) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const name = data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim();

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let generatedPassword = "";
    for (let i = 0; i < 10; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const passwordToUse = data.studentPassword || generatedPassword;
    const hashedPassword = await bcrypt.hash(passwordToUse, 12);

    const student = await db.student.create({
      data: {
        name,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        admissionEmail: data.admissionEmail,
        studentPassword: hashedPassword,
        phone: data.phone,
        whatsappNumber: data.whatsappNumber,
        gender: data.gender,
        dob: data.dob,
        dobAd: data.dobAd,
        dobBs: data.dobBs,
        nationality: data.nationality,
        maritalStatus: data.maritalStatus,
        photoUrl: data.photoUrl,
        address: data.address,
        permanentProvince: data.permanentProvince,
        permanentDistrict: data.permanentDistrict,
        permanentMunicipality: data.permanentMunicipality,
        permanentWardNo: data.permanentWardNo,
        permanentAddress: data.permanentAddress,
        temporaryProvince: data.temporaryProvince,
        temporaryDistrict: data.temporaryDistrict,
        temporaryMunicipality: data.temporaryMunicipality,
        temporaryWardNo: data.temporaryWardNo,
        temporaryAddress: data.temporaryAddress,
        passportNumber: data.passportNumber,
        passportNationality: data.passportNationality,
        passportIssueDate: data.passportIssueDate,
        passportExpiryDate: data.passportExpiryDate,
        passportIssuePlace: data.passportIssuePlace,
        education:
          typeof data.education === "string"
            ? data.education
            : JSON.stringify(data.education || []),
        workExperience:
          typeof data.workExperience === "string"
            ? data.workExperience
            : JSON.stringify(data.workExperience || []),
        training:
          typeof data.training === "string" ? data.training : JSON.stringify(data.training || []),
        testType: data.testType,
        overallScore: data.overallScore,
        readingScore: data.readingScore,
        writingScore: data.writingScore,
        listeningScore: data.listeningScore,
        speakingScore: data.speakingScore,
        moi: data.moi,
        testDate: data.testDate,
        testRegNumber: data.testRegNumber,
        studyLevel: data.studyLevel,
        intakeTerm: data.intakeTerm,
        major: data.major,
        interestedCountry: data.interestedCountry,
        partnerId: data.partnerId || null,
        targetUniversities: data.targetUniversities,
        spouseName: data.spouseName,
        childrenDetails:
          typeof data.childrenDetails === "string"
            ? data.childrenDetails
            : JSON.stringify(data.childrenDetails || []),
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        guardianEmail: data.guardianEmail,
        guardianRelation: data.guardianRelation,
        guardianAddress: data.guardianAddress,
        status: data.status || "In Review",
        statusColor: data.statusColor,
        initials: data.initials,
        color: data.color,
        university: data.university,
        country: data.country,
        lastActivity: data.lastActivity,
        counselor: data.counselor,
        lead: data.lead,
        branchId: data.branchId,
        documents: data.documents
          ? {
              create: data.documents.map(
                (doc: { type: string; name: string; url: string; status?: string }) => ({
                  type: doc.type,
                  name: doc.name,
                  url: doc.url,
                  status: doc.status || "Uploaded",
                })
              ),
            }
          : undefined,
      },
    });

    const existingUser = await db.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      await db.user.update({ where: { id: existingUser.id }, data: { password: hashedPassword } });
    } else {
      await db.user.create({
        data: {
          name,
          email: data.email,
          password: hashedPassword,
          role: "Student",
          status: "Active",
          lastLogin: "Never",
        },
      });
    }

    await createNotification({
      userId: String(session!.id),
      title: "Student Created",
      message: `Student "${name}" has been added successfully.`,
      type: "Success",
    });

    await logActivity({
      actorName: await getActorName(session!.id),
      userId: session!.id,
      action: "created a student",
      target: name,
    });

    return NextResponse.json({ ...student, generatedPassword: passwordToUse });
  } catch (error) {
    logError("Create student", error);
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    return apiError("Failed to create student");
  }
}

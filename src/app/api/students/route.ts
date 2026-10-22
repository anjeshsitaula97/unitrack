import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createNotification } from "@/lib/notifications";
import { logActivity, getActorName } from "@/lib/activity";
import { sendTemplatedEmail } from "@/lib/email-templates";
import {
  getPaginationParams,
  paginatedResponse,
  apiError,
  getSession,
  checkRoutePermission,
} from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { generateStrongPassword } from "@/lib/password";
import {
  parseJson,
  zodResponse,
  emailField,
  optionalTrimmedString,
  isoDateOrNull,
} from "@/lib/validate";

// JSON string or array — the student model stores education/work/training as
// JSON strings. Accept either a pre-stringified value or a raw array/object and
// serialize it here so Prisma always receives a string.
const jsonStringOrArray = z
  .union([z.string(), z.array(z.unknown()), z.record(z.unknown())])
  .optional()
  .transform((v) => {
    if (v === undefined) return JSON.stringify([]);
    if (typeof v === "string") return v;
    return JSON.stringify(v);
  });

// Province pickers are numeric selects but the column is String?. Coerce and
// normalize the unset sentinel 0 to null.
const provinceField = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? String(n) : null;
  });

// The partner <select> yields a string id or "" when nothing is chosen.
const partnerIdField = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

const createStudentSchema = z
  .object({
    // Either a full name or first+last — at least one combination must be present
    name: z.string().trim().max(200).optional(),
    firstName: z.string().trim().max(100).optional(),
    lastName: z.string().trim().max(100).optional(),
    email: emailField.optional(),
    admissionEmail: emailField.optional(),
    studentPassword: z.string().max(200).optional(),
    applicationEmailPassword: optionalTrimmedString(200),
    phone: optionalTrimmedString(40),
    whatsappNumber: optionalTrimmedString(40),
    gender: optionalTrimmedString(20),
    dob: isoDateOrNull,
    dobAd: optionalTrimmedString(20),
    dobBs: optionalTrimmedString(20),
    nationality: optionalTrimmedString(60),
    maritalStatus: optionalTrimmedString(40),
    photoUrl: optionalTrimmedString(1000),
    address: optionalTrimmedString(500),
    permanentProvince: provinceField,
    permanentDistrict: optionalTrimmedString(100),
    permanentMunicipality: optionalTrimmedString(100),
    permanentWardNo: optionalTrimmedString(20),
    permanentAddress: optionalTrimmedString(500),
    temporaryProvince: provinceField,
    temporaryDistrict: optionalTrimmedString(100),
    temporaryMunicipality: optionalTrimmedString(100),
    temporaryWardNo: optionalTrimmedString(20),
    temporaryAddress: optionalTrimmedString(500),
    passportNumber: optionalTrimmedString(40),
    passportNationality: optionalTrimmedString(60),
    passportIssueDate: isoDateOrNull,
    passportExpiryDate: isoDateOrNull,
    passportIssuePlace: optionalTrimmedString(100),
    education: jsonStringOrArray,
    workExperience: jsonStringOrArray,
    training: jsonStringOrArray,
    testType: optionalTrimmedString(40),
    overallScore: optionalTrimmedString(20),
    readingScore: optionalTrimmedString(20),
    writingScore: optionalTrimmedString(20),
    listeningScore: optionalTrimmedString(20),
    speakingScore: optionalTrimmedString(20),
    moi: optionalTrimmedString(200),
    testDate: isoDateOrNull,
    testRegNumber: optionalTrimmedString(60),
    studyLevel: optionalTrimmedString(60),
    intakeTerm: optionalTrimmedString(60),
    major: optionalTrimmedString(100),
    interestedCountry: optionalTrimmedString(100),
    partnerId: partnerIdField,
    targetUniversities: optionalTrimmedString(2000),
    spouseName: optionalTrimmedString(200),
    childrenDetails: jsonStringOrArray,
    guardianName: optionalTrimmedString(200),
    guardianPhone: optionalTrimmedString(40),
    guardianEmail: emailField.optional(),
    guardianRelation: optionalTrimmedString(60),
    guardianAddress: optionalTrimmedString(500),
    otherGuardians: jsonStringOrArray,
    status: optionalTrimmedString(60).default("In Review"),
    statusColor: optionalTrimmedString(20),
    initials: optionalTrimmedString(10),
    color: optionalTrimmedString(20),
    university: optionalTrimmedString(200),
    country: optionalTrimmedString(100),
    lastActivity: optionalTrimmedString(200),
    counselor: optionalTrimmedString(120),
    lead: optionalTrimmedString(200),
    branchId: z.coerce.number().int().positive().optional().nullable(),
    documents: z
      .array(
        z.object({
          type: z.string().trim().min(1).max(100),
          name: z.string().trim().min(1).max(200),
          url: z.string().trim().min(1).max(1000),
          status: z.string().trim().max(60).optional().default("Uploaded"),
        })
      )
      .optional(),
  })
  .refine((data) => data.name || (data.firstName && data.lastName) || data.firstName, {
    message: "Name is required",
    path: ["name"],
  });

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

    // Never expose the portal password hash to the client. The list is rendered
    // in tables and detail modals that only need the plaintext application-email
    // password, so the bcrypt hash is stripped here.
    const safeStudents = students.map(({ studentPassword: _studentPassword, ...rest }) => rest);

    return NextResponse.json(paginatedResponse(safeStudents, total, params));
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
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = await parseJson(req, createStudentSchema);
    if (!parsed.ok) return zodResponse(parsed.error);

    const data = parsed.data;
    const name = data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim();

    const generatedPassword = generateStrongPassword();
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
        applicationEmailPassword: data.applicationEmailPassword ?? null,
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
        education: data.education,
        workExperience: data.workExperience,
        training: data.training,
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
        partnerId: data.partnerId,
        targetUniversities: data.targetUniversities,
        spouseName: data.spouseName,
        childrenDetails: data.childrenDetails,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        guardianEmail: data.guardianEmail,
        guardianRelation: data.guardianRelation,
        guardianAddress: data.guardianAddress,
        otherGuardians: data.otherGuardians,
        status: data.status ?? "In Review",
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
              create: data.documents.map((doc) => ({
                type: doc.type,
                name: doc.name,
                url: doc.url,
                status: doc.status ?? "Uploaded",
              })),
            }
          : undefined,
      },
    });

    const existingUser = await db.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      // Never overwrite an existing account's password from a student record:
      // if it collides with an Admin/Staff login that is account takeover.
      // Only a prior Student-role portal account is re-synched.
      if (existingUser.role === "Student") {
        await db.user.update({
          where: { id: existingUser.id },
          data: { password: hashedPassword },
        });
      }
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

    // Welcome the student. Never blocks creation; the password is deliberately
    // not included, staff share the generated credential separately.
    if (student.email) {
      await sendTemplatedEmail({
        key: "student-created",
        to: student.email,
        actorUserId: session!.id,
        vars: {
          studentName: name,
          studentEmail: student.email,
          actorName: await getActorName(session!.id),
        },
      });
    }

    return NextResponse.json({ ...student, generatedPassword: passwordToUse });
  } catch (error) {
    logError("Create student", error);
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    return apiError("Failed to create student");
  }
}

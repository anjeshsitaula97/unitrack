import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createNotification } from "@/lib/notifications";
import { buildXlsx } from "@/lib/spreadsheet";
import { readSpreadsheetRows } from "@/lib/spreadsheet-read";
import { Prisma } from "@prisma/client";

interface CsvRow {
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | number;
  whatsappNumber?: string | number;
  gender?: string;
  nationality?: string;
  passportNumber?: string | number;
  studyLevel?: string;
  interestedCountry?: string;
  status?: string;
  counselor?: string;
  shortName?: string;
  country?: string;
  city?: string;
  type?: string;
  website?: string;
  ranking?: string | number;
  description?: string;
  universityId?: string | number;
  faculty?: string;
  degreeType?: string;
  initials?: string;
  level?: string;
  university?: string;
  credits?: string | number;
  duration?: string;
  instructor?: string;
  language?: string;
  mode?: string;
  tuitionFee?: string | number;
  currency?: string;
  source?: string;
  studentEmail?: string;
  courseId?: string | number;
  amount?: string | number;
  method?: string;
  date?: string;
  role?: string;
  password?: string;
  contactPerson?: string;
  address?: string;
  category?: string;
  paidTo?: string;
  billNo?: string | number;
  [key: string]: string | number | undefined;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkPermission(session, "bulk:create");
    if (deniedPOST) return deniedPOST;

    // bcrypt(cost 12) runs per row (up to 5000) — without a limit this is an
    // authenticated CPU-exhaustion vector as well as a data-flood vector.
    const rl = await checkRateLimit(`bulk-import:${getClientIp(req)}`, 10, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many import requests" }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file || !type) {
      return NextResponse.json({ error: "File and type are required" }, { status: 400 });
    }

    // xlsx@0.18.5 is the last release on npm and carries unpatched prototype
    // pollution and ReDoS advisories (GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9)
    // in its parser. Parsing is therefore confined to admins by bulk:create and
    // bounded here, and the parser is never asked to build formulas or HTML.
    const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
    const MAX_ROWS = 5000;
    const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".csv"];
    const ALLOWED_MIME = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
      "application/octet-stream",
    ];

    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: "Only .xlsx, .xls or .csv files are accepted" },
        { status: 400 }
      );
    }
    if (file.type && !ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File exceeds the 5 MB limit" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = (await readSpreadsheetRows(buffer, file.name, MAX_ROWS)) as unknown as CsvRow[];

    if (rows.length === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }
    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `File exceeds the ${MAX_ROWS} row limit` },
        { status: 400 }
      );
    }

    let imported = 0;
    const errors: string[] = [];
    const generatedPasswords: string[] = [];

    type RowError = { code?: string; message?: string };
    const describeDuplicateEmail = (err: RowError, row: CsvRow) =>
      err.code === "P2002" ? `duplicate email "${row.email}"` : (err.message ?? "Unknown error");

    const settleRows = async (
      work: (row: CsvRow, i: number) => Promise<string | null>,
      describeError: (err: RowError, row: CsvRow) => string = (err) =>
        err.message ?? "Unknown error"
    ) => {
      const results = await Promise.allSettled(rows.map((row, i) => work(row, i)));
      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          if (result.value === null) imported++;
          else errors.push(`Row ${i + 2}: ${result.value}`);
          return;
        }
        errors.push(`Row ${i + 2}: ${describeError(result.reason as RowError, rows[i])}`);
      });
    };

    switch (type) {
      case "students": {
        const bcrypt = await import("bcryptjs");
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        await settleRows(async (row) => {
          if (!row.name || !row.email) return "name and email are required";
          let pw = "";
          for (let j = 0; j < 10; j++) {
            pw += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          const hashed = await bcrypt.hash(pw, 12);
          await db.student.create({
            data: {
              name: row.name,
              firstName: row.firstName || row.name?.split(" ")[0] || "",
              lastName: row.lastName || row.name?.split(" ").slice(1).join(" ") || "",
              email: row.email,
              studentPassword: hashed,
              phone: row.phone?.toString(),
              whatsappNumber: row.whatsappNumber?.toString(),
              gender: row.gender,
              nationality: row.nationality,
              passportNumber: row.passportNumber?.toString(),
              studyLevel: row.studyLevel,
              interestedCountry: row.interestedCountry,
              status: row.status || "New Leads",
              counselor: row.counselor,
            },
          });
          await db.user
            .create({
              data: {
                name: row.name,
                email: row.email,
                password: hashed,
                role: "Student",
                status: "Active",
                lastLogin: "Never",
              },
            })
            .catch(() => {
              return db.user.update({ where: { email: row.email }, data: { password: hashed } });
            });
          return null;
        }, describeDuplicateEmail);
        break;
      }

      case "universities": {
        await settleRows(async (row) => {
          if (!row.name) return "name is required";
          await db.university.create({
            data: {
              name: row.name,
              shortName: row.shortName,
              country: row.country || "",
              city: row.city || "",
              type: row.type || "Public",
              website: row.website,
              ranking: row.ranking ? parseInt(row.ranking.toString()) : null,
              description: row.description,
              status: row.status || "Active",
            },
          });
          return null;
        });
        break;
      }

      case "courses": {
        await settleRows(async (row) => {
          if (!row.name || !row.universityId) return "name and universityId are required";
          await db.course.create({
            data: {
              name: row.name,
              universityId: row.universityId as number,
              faculty: row.faculty || "General",
              degreeType: row.degreeType || "None",
              initials: row.initials || row.name?.substring(0, 2).toUpperCase() || "",
              level: row.level || "Undergraduate",
              university:
                row.university as unknown as Prisma.UniversityCreateNestedOneWithoutCoursesInput,
              credits: parseInt(String(row.credits)) || 0,
              duration: row.duration || "0",
              instructor: row.instructor || "TBA",
              instructorEmail: row.instructorEmail || null,
              description: row.description || "",
              prerequisites: "[]",
              quickFilters: "[]",
              requirements: "[]",
              language: row.language || "English",
              mode: row.mode || "Online",
              tuitionFee: row.tuitionFee?.toString() || "",
              currency: row.currency || "",
            } as unknown as Prisma.CourseCreateInput,
          });
          return null;
        });
        break;
      }

      case "leads": {
        await settleRows(async (row) => {
          if (!row.name || !row.email) return "name and email are required";
          await db.lead.create({
            data: {
              name: row.name,
              email: row.email,
              phone: row.phone?.toString(),
              source: row.source || "Website",
              status: row.status || "New",
              interestedCountry: row.interestedCountry,
              counselor: row.counselor,
            },
          });
          return null;
        }, describeDuplicateEmail);
        break;
      }

      case "applications": {
        await settleRows(async (row) => {
          if (!row.studentEmail || !row.universityId || !row.courseId) {
            return "studentEmail, universityId, and courseId are required";
          }
          const student = await db.student.findUnique({ where: { email: row.studentEmail } });
          if (!student) return `student not found for email "${row.studentEmail}"`;
          await db.application.create({
            data: {
              studentId: student.id,
              universityId: row.universityId as number,
              courseId: row.courseId as number,
              status: row.status || "Submitted",
            },
          });
          return null;
        });
        break;
      }

      case "payments": {
        await settleRows(async (row) => {
          if (!row.studentEmail || !row.amount) return "studentEmail and amount are required";
          const student = await db.student.findUnique({ where: { email: row.studentEmail } });
          if (!student) return `student not found for email "${row.studentEmail}"`;
          await db.payment.create({
            data: {
              studentId: student.id,
              amount: parseFloat(String(row.amount)),
              currency: row.currency || "USD",
              status: row.status || "Pending",
              method: row.method,
              date: row.date ? new Date(row.date) : new Date(),
              description: row.description,
            },
          });
          return null;
        });
        break;
      }

      case "staff": {
        const { generateStrongPassword } = await import("@/lib/password");
        const { validateRoleAssignment } = await import("@/lib/role-assignment");
        const pendingPasswords: { i: number; message: string }[] = [];
        await settleRows(async (row, i) => {
          if (!row.name || !row.email) return "name and email are required";
          // Roles arriving from a spreadsheet are untrusted input: without
          // this check an Admin could import `role=Super Admin` and escalate
          // past every guard enforced in the invite/edit flows.
          const requestedRole = row.role?.trim() || "Staff";
          const roleError = await validateRoleAssignment(session?.role, requestedRole);
          if (roleError) return roleError;
          const bcrypt = await import("bcryptjs");
          // No shared default credential: each imported account without an
          // explicit password gets a unique random one (returned to the
          // importer below) instead of the public "password123".
          const plainPassword = row.password || generateStrongPassword();
          const hashed = await bcrypt.hash(plainPassword, 12);
          await db.user.create({
            data: {
              name: row.name,
              email: row.email,
              password: hashed,
              role: requestedRole,
              phone: row.phone?.toString(),
              status: row.status || "Active",
            },
          });
          if (!row.password) {
            pendingPasswords.push({
              i,
              message: `Row ${i + 2} (${row.email}): ${plainPassword}`,
            });
          }
          return null;
        }, describeDuplicateEmail);
        pendingPasswords.sort((a, b) => a.i - b.i);
        generatedPasswords.push(...pendingPasswords.map((entry) => entry.message));
        break;
      }

      case "partners": {
        await settleRows(async (row) => {
          if (!row.name) return "name is required";
          await db.partner.create({
            data: {
              name: row.name,
              contactPerson: row.contactPerson,
              email: row.email,
              phone: row.phone?.toString(),
              address: row.address,
              description: row.description,
            },
          });
          return null;
        });
        break;
      }

      case "expenses": {
        await settleRows(async (row) => {
          if (!row.category || !row.amount) return "category and amount are required";
          await db.expense.create({
            data: {
              category: row.category,
              amount: parseFloat(String(row.amount)),
              currency: row.currency || "USD",
              date: row.date ? new Date(row.date) : new Date(),
              description: row.description,
              paidTo: row.paidTo,
              method: row.method,
              billNo: row.billNo?.toString(),
            },
          });
          return null;
        });
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown import type: ${type}` }, { status: 400 });
    }

    await createNotification({
      title: "Bulk Import Complete",
      message: `Imported ${imported} ${type} with ${errors.length} errors.`,
      type: errors.length > 0 ? "Warning" : "Success",
    });

    return NextResponse.json({
      imported,
      errors,
      total: rows.length,
      ...(generatedPasswords.length > 0 ? { generatedPasswords } : {}),
    });
  } catch (error) {
    logError("Bulk import", error);
    return apiError("Bulk import failed");
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "bulk:read");
    if (deniedGET) return deniedGET;
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "students";
    const format = searchParams.get("format") || "xlsx";

    let data: Record<string, unknown>[] = [];

    switch (type) {
      case "students": {
        const students = await db.student.findMany({ orderBy: { name: "asc" } });
        data = students.map((s) => ({
          name: s.name,
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          phone: s.phone,
          whatsappNumber: s.whatsappNumber,
          gender: s.gender,
          nationality: s.nationality,
          passportNumber: s.passportNumber,
          studyLevel: s.studyLevel,
          interestedCountry: s.interestedCountry,
          status: s.status,
          counselor: s.counselor,
        }));
        break;
      }
      case "universities": {
        const universities = await db.university.findMany({ orderBy: { name: "asc" } });
        data = universities.map((u) => ({
          name: u.name,
          shortName: u.shortName,
          country: u.country,
          city: u.city,
          type: u.type,
          website: u.website,
          ranking: u.ranking,
          status: u.status,
        }));
        break;
      }
      case "courses": {
        const courses = await db.course.findMany({
          orderBy: { name: "asc" },
          include: { university: { select: { name: true } } },
        });
        data = courses.map((c) => ({
          name: c.name,
          universityId: c.universityId,
          university: c.university.name,
          faculty: c.faculty,
          degreeType: c.degreeType,
          level: c.level,
          duration: c.duration,
          language: c.language,
          mode: c.mode,
          tuitionFee: c.tuitionFee,
          status: c.status,
        }));
        break;
      }
      case "leads": {
        const leads = await db.lead.findMany({ orderBy: { name: "asc" } });
        data = leads.map((l) => ({
          name: l.name,
          email: l.email,
          phone: l.phone,
          source: l.source,
          status: l.status,
          interestedCountry: l.interestedCountry,
          counselor: l.counselor,
        }));
        break;
      }
      case "applications": {
        const applications = await db.application.findMany({
          orderBy: { appliedDate: "desc" },
          include: {
            student: { select: { name: true, email: true } },
            university: { select: { name: true } },
            course: { select: { name: true } },
          },
        });
        data = applications.map((a) => ({
          id: a.id,
          studentName: a.student?.name,
          studentEmail: a.student?.email,
          universityName: a.university?.name,
          courseName: a.course?.name,
          status: a.status,
          appliedDate: a.appliedDate,
        }));
        break;
      }
      case "payments": {
        const payments = await db.payment.findMany({
          orderBy: { date: "desc" },
          include: { student: { select: { name: true, email: true } } },
        });
        data = payments.map((p) => ({
          id: p.id,
          studentName: p.student?.name,
          studentEmail: p.student?.email,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          method: p.method,
          date: p.date,
          description: p.description,
        }));
        break;
      }
      case "staff": {
        const staff = await db.user.findMany({
          orderBy: { name: "asc" },
          select: {
            name: true,
            email: true,
            role: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        });
        data = staff.map((u) => u);
        break;
      }
      case "partners": {
        const partners = await db.partner.findMany({ orderBy: { name: "asc" } });
        data = partners.map((p) => ({
          name: p.name,
          contactPerson: p.contactPerson,
          email: p.email,
          phone: p.phone,
          address: p.address,
          description: p.description,
        }));
        break;
      }
      case "expenses": {
        const expenses = await db.expense.findMany({ orderBy: { date: "desc" } });
        data = expenses.map((e) => ({
          category: e.category,
          amount: e.amount,
          currency: e.currency,
          date: e.date,
          description: e.description,
          paidTo: e.paidTo,
          method: e.method,
          billNo: e.billNo,
        }));
        break;
      }
      default:
        return NextResponse.json({ error: `Unknown export type: ${type}` }, { status: 400 });
    }

    if (format === "json") {
      return NextResponse.json(data);
    }

    const blob = await buildXlsx(type, data);

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${type}_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    logError("Export", error);
    return apiError("Export failed");
  }
}

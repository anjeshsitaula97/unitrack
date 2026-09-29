import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signStudentToken } from "@/lib/session";
import { apiError } from "@/lib/api-utils";
import { normalizeEnabledModulesJson } from "@/lib/modules";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`student-login:${ip}`, 10, 60000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const student = await db.student.findUnique({
      where: { email: email },
    });

    if (!student || !student.studentPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, student.studentPassword);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signStudentToken({
      id: student.id,
      email: student.email,
    });

    const response = NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
      },
    });

    response.cookies.set("student_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    const settings = await db.systemSettings.findFirst();
    const enabledModules = normalizeEnabledModulesJson(settings?.enabledModules);
    response.cookies.set("enabled_modules", enabledModules, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch (error) {
    logError("Student login error:", error);
    return apiError("Login failed");
  }
}

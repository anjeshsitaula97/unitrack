import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/session";
import { apiError } from "@/lib/api-utils";
import { normalizeEnabledModulesJson } from "@/lib/modules";

export async function POST(req: NextRequest) {
  try {
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

    const token = await signToken({
      id: student.id,
      email: student.email,
      role: "Student",
    });

    const response = NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
      },
    });

    response.cookies.set("auth_token", token, {
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
    console.error("Student login error:", error);
    return apiError("Login failed");
  }
}

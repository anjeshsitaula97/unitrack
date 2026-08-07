import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { normalizeEnabledModulesJson } from "@/lib/modules";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAuth(token);

    let user = await db.user.findUnique({
      where: { id: payload.id },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        subscriptionPackage: true,
        subscriptionExpiry: true,
        isFirstLogin: true,
      },
    });

    if (!user) {
      const student = await db.student.findUnique({
        where: { id: Number(payload.id) },
        select: { id: true, name: true, email: true },
      });
      if (student) {
        user = {
          ...student,
          role: "Student",
          avatar: null,
          subscriptionPackage: null,
          subscriptionExpiry: null,
          isFirstLogin: null,
        } as NonNullable<typeof user>;
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const settings = await db.systemSettings.findFirst();
    const enabledModules = normalizeEnabledModulesJson(settings?.enabledModules);

    const response = NextResponse.json(user);
    response.cookies.set("enabled_modules", enabledModules, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}

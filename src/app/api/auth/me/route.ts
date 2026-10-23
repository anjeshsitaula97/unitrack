import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { baseDb } from "@/lib/base-db";
import { normalizeEnabledModulesJson } from "@/lib/modules";
import { isSuperAdminRole } from "@/lib/permission-catalog";
import { isSessionCurrent } from "@/lib/session-registry";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAuth(token);

    // Only one session per account is allowed. A staff token whose session has
    // been superseded by a newer login must not keep returning the profile.
    if (
      payload.subject !== "student" &&
      !(await isSessionCurrent("user", payload.id, payload.sid))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await baseDb.user.findUnique({
      where: { id: payload.id },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        subscriptionPackage: true,
        subscriptionExpiry: true,
        isFirstLogin: true,
        consultancyId: true,
      },
    });

    if (!user) {
      const student = await baseDb.student.findUnique({
        where: { id: Number(payload.id) },
        select: { id: true, name: true, email: true, consultancyId: true },
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

    // A token issued before the account was disabled must not keep granting
    // access to the app shell / profile payload.
    if (user.status && user.status.toLowerCase() !== "active") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // The branding shown in the app shell follows the session's consultancy. A
    // Super Admin follows the active_consultancy switch; everyone else is bound
    // to their own consultancy. "All Consultancies" (null) has no branding.
    let consultancyId = user.consultancyId ?? null;
    if (isSuperAdminRole(user.role)) {
      const selected = cookieStore.get("active_consultancy")?.value;
      const parsed = Number(selected);
      consultancyId =
        selected && selected !== "all" && Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    }
    const consultancy = consultancyId
      ? await baseDb.consultancy.findUnique({
          where: { id: consultancyId },
          select: { id: true, code: true, name: true, logoUrl: true },
        })
      : null;

    const settings = await db.systemSettings.findFirst();
    const enabledModules = normalizeEnabledModulesJson(settings?.enabledModules);

    const response = NextResponse.json({ ...user, consultancy });
    response.cookies.set("enabled_modules", enabledModules, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    });
    return response;
  } catch (_error) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}

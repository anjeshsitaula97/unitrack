import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signToken } from "@/lib/session";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { baseDb } from "@/lib/base-db";
import { runWithConsultancy } from "@/lib/consultancy";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import { normalizeEnabledModulesJson } from "@/lib/modules";
import { logActivity } from "@/lib/activity";
import { isSuperAdminRole } from "@/lib/permission-catalog";
import { startSession } from "@/lib/session-registry";

const prisma = db;

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  // Used by the dedicated Super Admin console entry point (/om/login) to
  // refuse non-Super-Admin accounts. Omitted for the standard staff login.
  portal: z.enum(["super-admin"]).optional(),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`login:${ip}`, 10, 60000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const user = await baseDb.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // A correct password is not enough — disabled, suspended or still-pending
    // accounts must not receive a session. getSession() enforces this on data
    // APIs; enforcing it here stops the account from ever getting a token.
    if (user.status && user.status.toLowerCase() !== "active") {
      return NextResponse.json(
        { error: "Your account is not active. Please contact an administrator." },
        { status: 403 }
      );
    }

    // The dedicated Super Admin portal only admits Super Administrators.
    if (parsed.data.portal === "super-admin" && !isSuperAdminRole(user.role)) {
      return NextResponse.json(
        { error: "This portal is for Super Administrators only." },
        { status: 403 }
      );
    }

    // Bind the rest of this request to the account's consultancy so the login
    // log, activity trail and settings cookie are attributed to the right
    // tenant. A null id is the Super Admin platform scope. The scope is entered
    // explicitly because the session cookie is not readable from cookies() until
    // the response is sent.
    return await runWithConsultancy({ consultancyId: user.consultancyId ?? null }, async () => {
      // Only one session per account is allowed. Rotating the stored session id
      // here revokes whatever session was previously active for this account,
      // so signing in on a new device immediately locks the old one out.
      const sid = await startSession({
        subject: "user",
        accountId: user.id,
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") || "Unknown",
      });

      // Set token
      const token = await signToken({
        id: user.id,
        email: user.email,
        role: user.role,
        sid,
      });

      const cookieStore = await cookies();
      const isDev = process.env.NODE_ENV !== "production";
      cookieStore.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        secure: !isDev,
        sameSite: isDev ? "lax" : "strict",
      });

      // Update last login & seen
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          lastSeenAt: new Date(),
        },
      });

      // Record login log
      await prisma.loginLog.create({
        data: {
          userId: user.id,
          ipAddress: getClientIp(req),
          userAgent: req.headers.get("user-agent") || "Unknown",
        },
      });

      await logActivity({
        actorName: user.name,
        userId: user.id,
        action: "logged in",
        target: user.email,
      });

      // Fetch enabled modules and set cookie
      const settings = await prisma.systemSettings.findFirst();
      const enabledModules = normalizeEnabledModulesJson(settings?.enabledModules);

      const response = NextResponse.json(
        { success: true, isFirstLogin: user.isFirstLogin },
        { status: 200 }
      );
      response.cookies.set("enabled_modules", enabledModules, {
        httpOnly: true,
        path: "/",
        secure: !isDev,
        sameSite: isDev ? "lax" : "strict",
        maxAge: 86400,
      });
      return response;
    });
  } catch (error) {
    logError("Login Route", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

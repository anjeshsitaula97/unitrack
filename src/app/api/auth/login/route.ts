import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signToken } from "@/lib/session";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import { normalizeEnabledModulesJson } from "@/lib/modules";
import { logActivity } from "@/lib/activity";

const prisma = db;

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
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

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Set token
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
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
  } catch (error) {
    logError("Login Route", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

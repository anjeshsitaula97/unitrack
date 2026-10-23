import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signStudentToken, signToken } from "./session";
import { startSession } from "./session-registry";
import { runWithConsultancy } from "./consultancy";
import { normalizeEnabledModulesJson } from "./modules";
import { logActivity } from "./activity";
import { db } from "./db";

/**
 * Issues a signed-in session once the credentials have been accepted.
 *
 * There are now three doors to the same room — the staff login, the student
 * login, and the email-verified relogin that reclaims a session held at another
 * location. All three must rotate the registry id, mint the matching cookie,
 * stamp the last-login fields and write the audit trail identically; a second
 * copy of that sequence is how a door ends up issuing a session the checker does
 * not recognise.
 *
 * Nothing here decides *whether* the caller may log in. Every door has already
 * checked the password, the account status and its own portal rules, and the
 * staff path additionally wraps this call in its consultancy scope.
 */

/** Where the sign-in came from, recorded so the session row can describe itself. */
export interface SessionIssueContext {
  ip: string | null;
  userAgent: string | null;
}

interface StaffAccount {
  id: number;
  email: string;
  role: string;
  /** Required on the User row, so the audit entry always has a name to show. */
  name: string;
  consultancyId?: number | null;
  isFirstLogin?: boolean | null;
}

interface StudentAccount {
  id: number;
  email: string;
  name: string;
}

/**
 * Staff cookies are unmarked and lax in development but Secure and Strict-site
 * in production, which is what keeps a staff session from riding along on an
 * embedded request.
 */
function staffCookieFlags() {
  const isDev = process.env.NODE_ENV !== "production";
  return {
    httpOnly: true,
    path: "/" as const,
    secure: !isDev,
    sameSite: (isDev ? "lax" : "strict") as "lax" | "strict",
  };
}

/** The student cookie has always been strict, in both environments. */
function studentCookieFlags() {
  return {
    httpOnly: true,
    path: "/" as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };
}

/**
 * Staff (and Super Admin console) session. Must be called inside the account's
 * consultancy scope so the activity entry and the module settings resolve
 * against the right tenant — the login route enters that scope explicitly,
 * because the cookie being set here is not readable from `cookies()` until the
 * response has been sent.
 */
export async function issueStaffSession(
  user: StaffAccount,
  ctx: SessionIssueContext
): Promise<NextResponse> {
  return runWithConsultancy({ consultancyId: user.consultancyId ?? null }, async () => {
    // Rotating the stored id is what revokes whatever session ran before this
    // one, so the account keeps exactly one live location.
    const sid = await startSession({
      subject: "user",
      accountId: user.id,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      sid,
    });

    const flags = staffCookieFlags();
    const cookieStore = await cookies();
    cookieStore.set({ ...flags, name: "auth_token", value: token });

    await db.user.update({
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

    await db.loginLog.create({
      data: {
        userId: user.id,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent || "Unknown",
      },
    });

    await logActivity({
      actorName: user.name,
      userId: user.id,
      action: "logged in",
      target: user.email,
    });

    const settings = await db.systemSettings.findFirst();
    const enabledModules = normalizeEnabledModulesJson(settings?.enabledModules);

    const response = NextResponse.json({ success: true, isFirstLogin: user.isFirstLogin ?? false });
    response.cookies.set("enabled_modules", enabledModules, { ...flags, maxAge: 86400 });
    return response;
  });
}

/** Student portal session. */
export async function issueStudentSession(
  student: StudentAccount,
  ctx: SessionIssueContext
): Promise<NextResponse> {
  const sid = await startSession({
    subject: "student",
    accountId: student.id,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });

  const token = await signStudentToken({
    id: student.id,
    email: student.email,
    sid,
  });

  const flags = studentCookieFlags();
  const response = NextResponse.json({
    success: true,
    student: { id: student.id, name: student.name, email: student.email },
  });

  response.cookies.set("student_token", token, flags);

  const settings = await db.systemSettings.findFirst();
  const enabledModules = normalizeEnabledModulesJson(settings?.enabledModules);
  response.cookies.set("enabled_modules", enabledModules, { ...flags, maxAge: 86400 });

  return response;
}

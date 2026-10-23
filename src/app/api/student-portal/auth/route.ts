import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { apiError } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyLoginCredentials } from "@/lib/login-credentials";
import { issueStudentSession } from "@/lib/session-issue";
import { isSessionLiveElsewhere } from "@/lib/session-registry";
import { sessionBlockedPayload } from "@/lib/session-otp";

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

    const credentials = await verifyLoginCredentials({ email, password, portal: "student" });
    if (!credentials.ok) {
      return NextResponse.json({ error: credentials.error }, { status: credentials.status });
    }
    // The staff form posts to its own endpoint; this one only serves students.
    if (credentials.principal.subject !== "student") {
      return apiError("Invalid credentials", 401);
    }
    const student = credentials.principal;

    // One location at a time, exactly as for staff accounts: while another
    // session for this student is still being used it owns the account, and this
    // sign-in is refused. The inactivity window releases it automatically.
    const occupied = await isSessionLiveElsewhere("student", student.id);
    if (occupied.live) {
      return NextResponse.json(await sessionBlockedPayload(student.email, occupied.state), {
        status: 409,
      });
    }

    // Only one session per student account is allowed. A previous session can
    // only still be stored here if the inactivity window already expired it.
    return await issueStudentSession(student, {
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") || "Unknown",
    });
  } catch (error) {
    logError("Student login error:", error);
    return apiError("Login failed");
  }
}

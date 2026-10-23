import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import { verifyLoginCredentials } from "@/lib/login-credentials";
import { issueStaffSession } from "@/lib/session-issue";
import { isSessionLiveElsewhere } from "@/lib/session-registry";
import { sessionBlockedPayload } from "@/lib/session-otp";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  // Used by the dedicated Super Admin console entry point (/appconsole/login) to
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

    // Everything the credential half of a sign-in has to answer — does the
    // account exist, is the password right, is the account allowed in at all, is
    // this the portal it belongs to — lives in one shared function so the
    // email-code relogin cannot drift from the form people use every day.
    const credentials = await verifyLoginCredentials({
      email,
      password,
      portal: parsed.data.portal,
    });
    if (!credentials.ok) {
      return NextResponse.json({ error: credentials.error }, { status: credentials.status });
    }
    // This route never serves the student form, which posts to its own endpoint.
    if (credentials.principal.subject !== "user") {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    const user = credentials.principal;

    // One location at a time. A second sign-in no longer steals the session of
    // the first: while that session is still being used it owns the account, so
    // this attempt is refused and the caller is told to sign out there first.
    // Once the other session passes the inactivity window it stops counting as
    // live, which releases the account automatically.
    const occupied = await isSessionLiveElsewhere("user", user.id);
    if (occupied.live) {
      return NextResponse.json(await sessionBlockedPayload(user.email, occupied.state), {
        status: 409,
      });
    }

    // Only one session per account is allowed, and a live one was refused
    // above. Rotating the stored id here therefore drops at most a session the
    // inactivity window has already expired, never an active one.
    return await issueStaffSession(user, {
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") || "Unknown",
    });
  } catch (error) {
    logError("Login Route", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

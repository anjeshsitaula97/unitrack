import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import { verifyLoginCredentials } from "@/lib/login-credentials";
import { verifySessionOtp } from "@/lib/session-otp";
import { isSessionOtpTakeoverEnabled } from "@/lib/session-policy";
import { getActiveSession } from "@/lib/session-registry";
import { issueStaffSession, issueStudentSession } from "@/lib/session-issue";
import { runWithConsultancy } from "@/lib/consultancy";
import { logActivity } from "@/lib/activity";
import { sendTemplatedEmail } from "@/lib/email-templates";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
  portal: z.enum(["super-admin", "student"]).optional(),
});

/** Human-readable moment for the notification email. */
function formatSignInTime(at: Date): string {
  return at.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Spends an ownership code and signs the caller in, ending whatever session was
 * open before it.
 *
 * A correct code is not the whole answer: the caller must still present the
 * password, so a forwarded email alone cannot open an account. With both in hand,
 * `startSession` rotates the stored session id — which is precisely the mechanism
 * that signs the other location out, because the token in that browser now names a
 * session the registry no longer recognises and its next request is refused.
 *
 * The old location is not told anything here. It finds out the way every stale
 * session does, from the heartbeat, and the account holder gets an email describing
 * the sign-in that replaced it.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`session-otp-verify:${ip}`, 10, 10 * 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { email, password, otp, portal } = parsed.data;

    // Per-account cap as well as the IP cap above: a 6-digit code is about 20
    // bits, and an attacker who can rotate addresses can rotate IPs too.
    const accountRl = await checkRateLimit(
      `session-otp-verify-acc:${String(email).toLowerCase()}`,
      8,
      10 * 60_000
    );
    if (!accountRl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts for this account. Please try again later." },
        { status: 429 }
      );
    }

    const credentials = await verifyLoginCredentials({ email, password, portal });
    if (!credentials.ok) {
      return NextResponse.json({ error: credentials.error }, { status: credentials.status });
    }
    const account = credentials.principal;

    if (!(await isSessionOtpTakeoverEnabled())) {
      return NextResponse.json(
        {
          error:
            "Verification codes have been switched off. Please sign out at the other location, or ask an administrator to sign out your session.",
        },
        { status: 403 }
      );
    }

    const verified = await verifySessionOtp({
      subject: account.subject,
      email: account.email,
      otp,
    });
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error, code: verified.failure }, { status: 400 });
    }

    // Read the displaced session before the new one overwrites it, so the audit
    // trail and the notice can say what was signed out.
    const previous = await getActiveSession(account.subject, account.id);
    const now = new Date();
    const userAgent = req.headers.get("user-agent") || "Unknown";
    const ctx = { ip, userAgent };

    const response =
      account.subject === "user"
        ? await issueStaffSession(account, ctx)
        : await issueStudentSession(account, ctx);

    try {
      await runWithConsultancy({ consultancyId: account.consultancyId ?? null }, async () => {
        await logActivity({
          actorName: account.name,
          userId: account.id,
          action: "signed in after email verification",
          target: account.email,
          details: JSON.stringify([
            {
              field: "session",
              from: previous?.ip || "another location",
              to: ip || "unknown",
            },
          ]),
        });

        // The account holder is told about the sign-in that ended their previous
        // session. Best effort by design: a mail outage must not undo a login that
        // has already been proven twice over.
        await sendTemplatedEmail({
          key: "session-takeover",
          to: account.email,
          vars: {
            recipientName: account.name || "there",
            signInTime: formatSignInTime(now),
            signInIp: ip || "Unknown",
            signInDevice: userAgent.slice(0, 120),
          },
          actorName: "System",
        });
      });
    } catch (error) {
      logError("Session takeover audit", error);
    }

    return response;
  } catch (error) {
    logError("Session OTP verify", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

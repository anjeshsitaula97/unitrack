import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import { verifyLoginCredentials } from "@/lib/login-credentials";
import { isSessionLiveElsewhere } from "@/lib/session-registry";
import {
  issueSessionOtp,
  consumeSessionOtps,
  maskEmail,
  SESSION_OTP_TTL_MS,
  SESSION_OTP_MAX_ATTEMPTS,
  SESSION_OTP_RESEND_COOLDOWN_MS,
} from "@/lib/session-otp";
import { isSessionOtpTakeoverEnabled } from "@/lib/session-policy";
import { sendTemplatedEmail } from "@/lib/email-templates";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  // Which form asked for the code, so the code is issued against the account that
  // the password was checked against and the console keeps its Super Admin gate.
  portal: z.enum(["super-admin", "student"]).optional(),
});

/**
 * Emails an ownership code so a refused sign-in can be resolved by the person who
 * owns the account instead of waiting for the inactivity window or hunting down an
 * Admin.
 *
 * Two proofs are required, in this order, and neither alone is enough: the
 * password (which is what got them to this screen in the first place) and control
 * of the registered mailbox, which the delivered code proves. That is the
 * difference between "somebody knows this password" and "somebody owns this
 * account".
 *
 * If the mail genuinely cannot be sent, the code is thrown away and the caller is
 * told. A half-finished flow — a code that exists in the database but nobody can
 * ever receive — is worse than a refusal, because it looks like a locked door with
 * a broken keyhole.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`session-otp:${ip}`, 5, 10 * 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { email, password, portal } = parsed.data;

    // The same credential check as the login form. A wrong password gets the same
    // refusal here as at sign-in, so this endpoint cannot be used to find out
    // whether an address has an account, or to mail a code to somebody else's
    // mailbox on a guess.
    const credentials = await verifyLoginCredentials({ email, password, portal });
    if (!credentials.ok) {
      return NextResponse.json({ error: credentials.error }, { status: credentials.status });
    }
    const account = credentials.principal;

    if (!(await isSessionOtpTakeoverEnabled())) {
      return NextResponse.json({
        sent: false,
        code: "OTP_DISABLED",
        error:
          "Verification codes are switched off. Please sign out at the other location, or ask an administrator to sign out your session.",
      });
    }

    // The block may have released itself between the refused login and this
    // request. Saying so is kinder than mailing a code for a door that is open.
    const occupied = await isSessionLiveElsewhere(account.subject, account.id);
    if (!occupied.live) {
      return NextResponse.json({
        sent: false,
        code: "SESSION_FREE",
        error: "That session has already ended. Please sign in again.",
      });
    }

    const issued = await issueSessionOtp({
      subject: account.subject,
      email: account.email,
      consultancyId: account.consultancyId,
    });
    if (!issued.ok) {
      return NextResponse.json({ sent: false, code: issued.failure, error: issued.error });
    }

    const result = await sendTemplatedEmail({
      key: "session-otp",
      to: account.email,
      vars: {
        recipientName: account.name || "there",
        otp: issued.otp,
        otpMinutes: String(Math.round(SESSION_OTP_TTL_MS / 60_000)),
      },
    });

    if (!result.sent) {
      // No delivery, no code: leave nothing that could later be spent by somebody
      // who never saw it.
      await consumeSessionOtps(account.subject, account.email);
      // The reason, never the address: this is an error log, not a mailing list.
      logError("Session OTP delivery", { reason: result.reason });
      return NextResponse.json(
        {
          sent: false,
          code: "DELIVERY_FAILED",
          error:
            result.reason === "no-smtp"
              ? "No email account is configured on this system, so a verification code cannot be sent. Please sign out at the other location, or ask an administrator to sign out your session."
              : "The verification code could not be sent right now. Please try again shortly, or sign out at the other location.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      sent: true,
      // Masked even though the caller typed it: this is the address the code went
      // to, and the form should echo the same shape the account record shows.
      maskedEmail: maskEmail(account.email),
      otpSeconds: Math.floor(SESSION_OTP_TTL_MS / 1000),
      maxAttempts: SESSION_OTP_MAX_ATTEMPTS,
      resendSeconds: Math.ceil(SESSION_OTP_RESEND_COOLDOWN_MS / 1000),
      expiresAt: issued.expiresAt,
    });
  } catch (error) {
    logError("Session OTP request", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

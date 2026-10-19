import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import crypto from "crypto";
import { logError } from "@/lib/logger";

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`verify-otp:${ip}`, 10, 600000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
    }

    // Per-account throttle: the IP limiter above is necessary but not
    // sufficient (a single attacker can rotate IPs), so also cap attempts
    // against one email address to stop OTP brute-forcing.
    const accountRl = await checkRateLimit(
      `verify-otp-acc:${String(email).toLowerCase()}`,
      5,
      600000
    );
    if (!accountRl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts for this account. Please try again later." },
        { status: 429 }
      );
    }

    const record = await db.passwordResetToken.findFirst({
      where: { email, verified: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json(
        { error: "No pending reset request. Please request a new OTP." },
        { status: 400 }
      );
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (!timingSafeEqualString(record.otp, String(otp).trim())) {
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Consume the OTP and mint the reset token in one transaction. Deleting the
    // OTP record is what stops the 6-digit code (≈20 bits) from being replayed
    // as the reset token in /api/auth/reset-password — only the 64-hex token,
    // which never leaves the server except to the verified mailbox, can match.
    await db.$transaction([
      db.passwordResetToken.deleteMany({ where: { email, verified: false } }),
      db.passwordResetToken.create({
        data: { email, otp: resetToken, expiresAt: resetExpiresAt, verified: true },
      }),
    ]);

    return NextResponse.json({ success: true, expiresAt: resetExpiresAt });
  } catch (error) {
    logError("Verify OTP", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createResetToken, hashResetToken, timingSafeEqualDigest } from "@/lib/reset-token";
import { logError } from "@/lib/logger";

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

    // The row holds the digest of the OTP, not the OTP itself, so the digest
    // of what the caller typed is what gets compared. The comparison is
    // constant-time so a wrong OTP cannot be narrowed down by timing.
    if (!timingSafeEqualDigest(record.tokenHash, hashResetToken(String(otp).trim()))) {
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    const { token: resetToken, hash: resetTokenHash } = createResetToken();
    const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Consume the OTP and mint the reset token in one transaction. Deleting the
    // OTP record is what stops the 6-digit code (≈20 bits) from being replayed
    // as the reset token in /api/auth/reset-password — only the 64-hex token,
    // which never leaves the server except to the verified mailbox, can match.
    await db.$transaction([
      db.passwordResetToken.deleteMany({ where: { email, verified: false } }),
      db.passwordResetToken.create({
        data: { email, tokenHash: resetTokenHash, expiresAt: resetExpiresAt, verified: true },
      }),
    ]);

    // The reset token is handed to the browser that proved it owns the
    // mailbox. Only its digest is stored, so the secret does not survive in
    // the database; it is single-use and expires in 15 minutes.
    return NextResponse.json({ success: true, resetToken, expiresAt: resetExpiresAt });
  } catch (error) {
    logError("Verify OTP", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

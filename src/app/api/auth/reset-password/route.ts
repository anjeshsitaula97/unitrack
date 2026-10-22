import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hashResetToken, isResetTokenFormat } from "@/lib/reset-token";
import { logError } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`reset-pw:${ip}`, 5, 600000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    }

    // The reset token is a 32-byte random value rendered as 64 hex chars. Only
    // that shape is accepted, so a 6-digit email OTP can never be used as a
    // reset token even if a stale verified record somehow exists.
    if (!isResetTokenFormat(token)) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please start over." },
        { status: 400 }
      );
    }

    const accountRl = await checkRateLimit(`reset-pw-acc:${token.slice(0, 16)}`, 5, 600000);
    if (!accountRl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // Only the 64-hex reset token fits this filter; the OTP row is consumed at
    // verification time (see verify-otp) so it cannot match here. The stored
    // value is the token's digest, so the digest of the submitted token is what
    // is looked up — the secret itself never reaches the database.
    const record = await db.passwordResetToken.findFirst({
      where: { tokenHash: hashResetToken(token), verified: true },
      orderBy: { createdAt: "desc" },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please start over." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.student.update({
      where: { email: record.email },
      data: { studentPassword: hashedPassword },
    });

    // Clean up all reset tokens for this email
    await db.passwordResetToken.deleteMany({
      where: { email: record.email },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    logError("Reset Password", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
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

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // The "token" here is actually the reset token stored in the otp field of a verified record
    const record = await db.passwordResetToken.findFirst({
      where: { otp: token, verified: true },
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

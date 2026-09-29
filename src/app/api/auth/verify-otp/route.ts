import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import crypto from "crypto";
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

    if (record.otp !== otp.trim()) {
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    // OTP matched — mark as verified and generate a reset token
    await db.passwordResetToken.update({
      where: { id: record.id },
      data: { verified: true },
    });

    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store the reset token in a new record linked to this verified email
    const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await db.passwordResetToken.create({
      data: { email, otp: resetToken, expiresAt: resetExpiresAt, verified: true },
    });

    return NextResponse.json({ success: true, expiresAt: resetExpiresAt });
  } catch (error) {
    logError("Verify OTP", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

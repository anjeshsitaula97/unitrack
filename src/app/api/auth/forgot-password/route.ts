import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { normalizeRecipients } from "@/lib/email-recipients";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`forgot-pw:${ip}`, 5, 600000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const student = await db.student.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!student) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, an OTP has been sent.",
      });
    }

    // Invalidate any existing unverified tokens for this email
    await db.passwordResetToken.deleteMany({
      where: { email, verified: false },
    });

    // Generate 6-digit OTP
    const otp = String(crypto.randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.passwordResetToken.create({
      data: { email, otp, expiresAt },
    });

    // Try to send email
    try {
      const settings = await db.emailSetting.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });

      if (settings) {
        const transporter = nodemailer.createTransport({
          host: settings.smtpHost,
          port: settings.smtpPort,
          secure: settings.smtpEncryption === "SSL",
          auth: { user: settings.smtpUser, pass: settings.smtpPass },
        });

        await transporter.sendMail({
          from: `"${settings.fromName}" <${settings.fromEmail}>`,
          to: normalizeRecipients(email),
          subject: "UniTrack - Password Reset OTP",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #059669;">Password Reset Request</h2>
              <p>Hello ${student.name},</p>
              <p>We received a request to reset your password. Use the OTP below to verify your identity.</p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background: #f0fdf4; border: 2px dashed #059669; border-radius: 12px; padding: 16px 32px;">
                  <span style="font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 8px;">${otp}</span>
                </div>
              </div>
              <p style="color: #666; font-size: 13px;">This OTP expires in 10 minutes.</p>
              <p style="color: #666; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      logError("Send OTP Email", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, an OTP has been sent.",
    });
  } catch (error) {
    logError("Forgot Password", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin", "Staff"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const { to, subject, body, studentId: rawStudentId, type } = await req.json();
    const studentId = rawStudentId ? Number(rawStudentId) : null;

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "to, subject, and body are required" }, { status: 400 });
    }

    const settings = await db.emailSetting.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!settings) {
      return NextResponse.json(
        {
          error:
            "No active email settings configured. Configure email settings in Settings > Email.",
        },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { id: session.id } });

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpEncryption === "SSL",
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to,
      subject,
      html: body,
    });

    await logActivity({
      actorName: user?.name || "System",
      action: "sent an email",
      target: `To: ${to} - Subject: ${subject}`,
    });

    await createNotification({
      title: "Email Sent",
      message: `Email "${subject}" sent to ${to}`,
      type: "Success",
    });

    if (studentId) {
      await db.student.update({
        where: { id: studentId },
        data: {
          lastActivity: `Email sent: ${subject}`,
        },
      });
    }

    return NextResponse.json({ success: true, messageId: null });
  } catch (error) {
    console.error("Email send error:", error);
    return apiError("Failed to send email. Check your SMTP settings.");
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const settings = await db.emailSetting.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      configured: !!settings,
      fromEmail: settings?.fromEmail || null,
      fromName: settings?.fromName || null,
      host: settings?.smtpHost || null,
    });
  } catch (error) {
    console.error("Email settings check error:", error);
    return apiError("Failed to check email settings");
  }
}

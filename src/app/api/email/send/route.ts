import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";
import { normalizeRecipients } from "@/lib/email-recipients";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedPOST = checkPermission(session, "email:create");
    if (deniedPOST) return deniedPOST;
    if (!session || !["Admin", "Super Admin", "Staff"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const { to, subject, body, studentId: rawStudentId, type: _type } = await req.json();
    const studentId = rawStudentId ? Number(rawStudentId) : null;
    const recipients = normalizeRecipients(to);

    if (recipients.length === 0 || !subject || !body) {
      return NextResponse.json({ error: "to, subject, and body are required" }, { status: 400 });
    }

    const recipientLabel = recipients.join(", ");

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
      to: recipients,
      subject,
      html: body,
    });

    await logActivity({
      actorName: user?.name || "System",
      action: "sent an email",
      target: `To: ${recipientLabel} - Subject: ${subject}`,
    });

    await createNotification({
      title: "Email Sent",
      message: `Email "${subject}" sent to ${recipientLabel}`,
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
    logError("Email send error:", error);
    return apiError("Failed to send email. Check your SMTP settings.");
  }
}

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "email:read");
    if (deniedGET) return deniedGET;
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
    logError("Email settings check error:", error);
    return apiError("Failed to check email settings");
  }
}

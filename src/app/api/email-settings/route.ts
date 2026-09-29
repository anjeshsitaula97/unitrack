import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const data = await req.json();
    const { smtpHost, smtpPort, smtpUser, smtpPass, smtpEncryption, fromEmail, fromName } = data;

    const existing = await db.emailSetting.findFirst({ orderBy: { createdAt: "desc" } });

    if (existing) {
      await db.emailSetting.update({
        where: { id: existing.id },
        data: {
          smtpHost,
          smtpPort: parseInt(smtpPort) || 587,
          smtpUser,
          smtpPass,
          smtpEncryption: smtpEncryption || "TLS",
          fromEmail,
          fromName,
          isActive: true,
        },
      });
    } else {
      await db.emailSetting.create({
        data: {
          smtpHost,
          smtpPort: parseInt(smtpPort) || 587,
          smtpUser,
          smtpPass,
          smtpEncryption: smtpEncryption || "TLS",
          fromEmail,
          fromName,
          isActive: true,
          type: "Global",
        },
      });
    }

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated email settings",
      target: "Email settings",
      details: JSON.stringify([
        {
          field: "settings",
          from: "",
          to: JSON.stringify({
            smtpHost,
            smtpPort: smtpPort || 587,
            smtpUser,
            smtpEncryption: smtpEncryption || "TLS",
            fromEmail,
            fromName,
          }),
        },
      ]),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Email settings error:", error);
    return apiError("Failed to save settings");
  }
}

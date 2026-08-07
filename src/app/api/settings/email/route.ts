import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError } from "@/lib/api-utils";
import { logActivity, getActorName } from "@/lib/activity";

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const settings = await db.emailSetting.findMany({
      include: {
        branch: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      settings.map((s) => ({ ...s, smtpPass: s.smtpPass ? "********" : "" }))
    );
  } catch (error) {
    console.error("Error fetching email settings:", error);
    return NextResponse.json({ error: "Failed to fetch email settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const body = await req.json();
    const {
      id,
      type,
      branchId,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpEncryption,
      fromEmail,
      fromName,
      isActive,
    } = body;

    if (!smtpHost || !smtpUser || !fromEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let setting;
    if (id) {
      // Update existing (preserve stored password when a masked/empty value is sent back)
      const existing = await db.emailSetting.findUnique({ where: { id: Number(id) } });
      const finalPass = smtpPass && smtpPass !== "********" ? smtpPass : existing?.smtpPass || "";

      setting = await db.emailSetting.update({
        where: { id: Number(id) },
        data: {
          smtpHost,
          smtpPort: parseInt(smtpPort),
          smtpUser,
          smtpPass: finalPass,
          smtpEncryption,
          fromEmail,
          fromName,
          isActive,
        },
      });
    } else {
      // Create new
      // Check if global or branch setting already exists
      if (type === "Global") {
        const existing = await db.emailSetting.findFirst({ where: { type: "Global" } });
        if (existing) {
          return NextResponse.json(
            { error: "Global email settings already exist. Update the existing one." },
            { status: 400 }
          );
        }
      } else if (branchId) {
        const existing = await db.emailSetting.findUnique({
          where: { branchId: Number(branchId) },
        });
        if (existing) {
          return NextResponse.json(
            { error: "Email settings for this branch already exist." },
            { status: 400 }
          );
        }
      }

      setting = await db.emailSetting.create({
        data: {
          type,
          branchId: type === "Branch" ? Number(branchId) : null,
          smtpHost,
          smtpPort: parseInt(smtpPort),
          smtpUser,
          smtpPass,
          smtpEncryption,
          fromEmail,
          fromName,
          isActive,
        },
      });

      await logActivity({
        actorName: await getActorName(),
        action: "created an email template",
        target: `${type || "Email template"} - ${fromEmail}`,
      });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Error saving email settings:", error);
    return NextResponse.json({ error: "Failed to save email settings" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["Admin", "Super Admin"].includes(session.role as string))
      return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const existing = await db.emailSetting.findUnique({ where: { id: Number(id) } });

    await db.emailSetting.delete({
      where: { id: Number(id) },
    });

    await logActivity({
      actorName: await getActorName(),
      action: "deleted an email template",
      target: existing?.fromEmail || id,
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete setting" }, { status: 500 });
  }
}

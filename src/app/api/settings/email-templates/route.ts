import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, apiError, checkPermission } from "@/lib/api-utils";
import { logError } from "@/lib/logger";
import { logActivity, getActorName } from "@/lib/activity";
import {
  EMAIL_TEMPLATE_CATALOG,
  ensureEmailTemplates,
  getTemplateDefinition,
} from "@/lib/email-templates";

/**
 * The list the settings page edits: every catalog template joined with its
 * stored row. Templates are code-defined, so an admin can restyle a body or
 * switch it off but cannot invent a key no code path will ever send.
 */
async function listTemplates() {
  const rows = await db.emailTemplate.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return EMAIL_TEMPLATE_CATALOG.map((def) => {
    const row = byKey.get(def.key);
    return {
      key: def.key,
      name: def.name,
      description: def.description,
      trigger: def.trigger,
      autoSend: def.autoSend,
      placeholders: def.placeholders,
      id: row?.id ?? null,
      subject: row?.subject ?? def.subject,
      body: row?.body ?? def.body,
      isEnabled: row?.isEnabled ?? true,
      // No stored row means the built-in default is in effect.
      isDefault: row === undefined,
    };
  });
}

export async function GET() {
  try {
    const session = await getSession();
    const denied = checkPermission(session, "email:read");
    if (denied) return denied;

    await ensureEmailTemplates();
    return NextResponse.json(await listTemplates());
  } catch (error) {
    logError("Fetch email templates", error);
    return apiError("Failed to fetch email templates");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    const denied = checkPermission(session, "email:update");
    if (denied) return denied;

    const body = await req.json();
    const key = typeof body?.key === "string" ? body.key : "";
    const def = getTemplateDefinition(key);
    if (!def) return apiError("Unknown email template", 400);

    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const templateBody = typeof body?.body === "string" ? body.body.trim() : "";
    if (!subject || !templateBody) {
      return apiError("Subject and body are required", 400);
    }
    const isEnabled = body?.isEnabled !== false;

    const existing = await db.emailTemplate.findFirst({ where: { key } });
    const saved = existing
      ? await db.emailTemplate.update({
          where: { id: existing.id },
          data: { subject, body: templateBody, isEnabled },
        })
      : await db.emailTemplate.create({
          data: { key, name: def.name, subject, body: templateBody, isEnabled, isDefault: true },
        });

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated an email template",
      target: def.name,
    });

    return NextResponse.json(saved);
  } catch (error) {
    logError("Update email template", error);
    return apiError("Failed to update email template");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const denied = checkPermission(session, "email:delete");
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") || "";
    const def = getTemplateDefinition(key);
    if (!def) return apiError("Unknown email template", 400);

    // Deleting the stored row resets the template: `listTemplates` (and every
    // send) falls back to the built-in default until the next GET re-seeds it.
    const existing = await db.emailTemplate.findFirst({ where: { key } });
    if (existing) {
      await db.emailTemplate.delete({ where: { id: existing.id } });
    }

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "reset an email template",
      target: def.name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Reset email template", error);
    return apiError("Failed to reset email template");
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/session";
import { logError } from "@/lib/logger";
import { normalizeEnabledModulesJson } from "@/lib/modules";
import { logActivity, getActorName } from "@/lib/activity";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const settings = await db.systemSettings.findFirst();

    const result = settings ?? {
      id: 1,
      country: "Nepal",
      currencyCode: "NPR",
      phoneCode: "+977",
      language: "English",
      showBSDate: false,
      enabledModules: normalizeEnabledModulesJson(null),
    };
    result.enabledModules = normalizeEnabledModulesJson(result.enabledModules);

    return NextResponse.json(result, {
      headers: {
        "Set-Cookie": `enabled_modules=${encodeURIComponent(result.enabledModules || "[]")}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch localization settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const existing = await db.systemSettings.findFirst();
    const enabledModules = normalizeEnabledModulesJson(data.enabledModules);
    const settings = await db.systemSettings.upsert({
      where: { id: 1 },
      update: {
        country: data.country,
        currencyCode: data.currencyCode,
        phoneCode: data.phoneCode,
        language: data.language,
        enableBranches: data.enableBranches,
        showBSDate: data.showBSDate ?? false,
        officeLatitude: data.officeLatitude != null ? parseFloat(data.officeLatitude) : null,
        officeLongitude: data.officeLongitude != null ? parseFloat(data.officeLongitude) : null,
        officeRadius: data.officeRadius != null ? parseFloat(data.officeRadius) : 100,
        enabledModules,
      },
      create: {
        country: data.country,
        currencyCode: data.currencyCode,
        phoneCode: data.phoneCode,
        language: data.language,
        enableBranches: data.enableBranches || false,
        showBSDate: data.showBSDate ?? false,
        officeLatitude: data.officeLatitude != null ? parseFloat(data.officeLatitude) : null,
        officeLongitude: data.officeLongitude != null ? parseFloat(data.officeLongitude) : null,
        officeRadius: data.officeRadius != null ? parseFloat(data.officeRadius) : 100,
        enabledModules,
      },
    });

    const session = await getSession();
    if (session) {
      await db.notification
        .create({
          data: {
            userId: String(session.id),
            title: "Localization Updated",
            message: `Country set to ${data.country}, currency: ${data.currencyCode}`,
            type: "Info",
          },
        })
        .catch(() => {});
    }

    await logActivity({
      actorName: await getActorName(session?.id),
      userId: session?.id,
      action: "updated localization settings",
      target: "Localization settings",
      details: JSON.stringify([
        {
          field: "showBSDate",
          from: String(existing?.showBSDate ?? false),
          to: String(data.showBSDate ?? false),
        },
      ]),
    });

    return NextResponse.json(settings, {
      headers: settings.enabledModules
        ? {
            "Set-Cookie": `enabled_modules=${encodeURIComponent(settings.enabledModules)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
          }
        : undefined,
    });
  } catch (error) {
    logError("Localization settings", error);
    return NextResponse.json({ error: "Failed to update localization settings" }, { status: 500 });
  }
}

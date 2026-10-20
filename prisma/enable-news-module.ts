import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
import { defaultEnabledModuleIds } from "../src/lib/modules";

const prisma = new PrismaClient();

/**
 * Adds the newly-introduced "news" module to the persisted enabledModules list.
 *
 * A stored enabledModules JSON array is authoritative, so an installation that
 * saved its module list before News existed would keep the sidebar entry hidden
 * until an admin toggled it on. This is additive and idempotent: it appends
 * "news" only when the stored list is a non-empty array (an empty/invalid value
 * already falls back to the defaults, which include news).
 */
async function main() {
  const rows = await prisma.systemSettings.findMany({
    select: { id: true, enabledModules: true },
  });

  if (rows.length === 0) {
    console.log("SKIP: no SystemSettings row (defaults already include news)");
    return;
  }

  for (const row of rows) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(row.enabledModules || "null");
    } catch {
      parsed = null;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.log(`SKIP (uses defaults): settings #${row.id}`);
      continue;
    }

    const current = parsed.filter((id): id is string => typeof id === "string");
    if (current.includes("news")) {
      console.log(`OK (already enabled): settings #${row.id}`);
      continue;
    }

    await prisma.systemSettings.update({
      where: { id: row.id },
      data: { enabledModules: JSON.stringify([...current, "news"]) },
    });
    console.log(`UPDATED: settings #${row.id} (+news). Defaults: ${defaultEnabledModuleIds().join(", ")}`);
  }
}

main()
  .catch((e) => {
    console.error("FAILED:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

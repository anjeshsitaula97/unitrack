import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
import { PERMISSION_CATALOG, roleSlugFor } from "../src/lib/permission-catalog";

const prisma = new PrismaClient();

/**
 * Adds the newly-introduced News permissions to existing role grant lists.
 *
 * `resolvePermissions` treats a stored grant list as authoritative, so a role
 * seeded before the News module existed would never see the new keys. This is
 * additive and idempotent: it only appends missing news:* defaults to built-in
 * roles (admin/staff/viewer) and leaves every other grant untouched. Empty
 * lists are skipped because they already fall back to the catalog defaults.
 */
const NEWS_PERMISSIONS = PERMISSION_CATALOG.filter((p) => p.module === "News");

async function main() {
  const roles = await prisma.role.findMany();
  for (const role of roles) {
    const slug = roleSlugFor(role.name);
    if (!slug) continue;

    const granted = NEWS_PERMISSIONS.filter((p) => p.defaultRoles.includes(slug)).map((p) => p.id);
    if (granted.length === 0) continue;

    let current: string[] = [];
    try {
      const parsed = JSON.parse(role.permissions || "[]");
      if (Array.isArray(parsed)) {
        current = parsed.filter((id): id is string => typeof id === "string");
      }
    } catch {
      /* fall through: treated as empty */
    }
    if (current.length === 0) {
      console.log(`SKIP (uses defaults): ${role.name}`);
      continue;
    }

    const missing = granted.filter((id) => !current.includes(id));
    if (missing.length === 0) {
      console.log(`OK (already granted): ${role.name}`);
      continue;
    }

    await prisma.role.update({
      where: { id: role.id },
      data: { permissions: JSON.stringify([...current, ...missing]) },
    });
    console.log(`UPDATED: ${role.name} (+${missing.join(", ")})`);
  }
}

main()
  .catch((e) => {
    console.error("FAILED:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

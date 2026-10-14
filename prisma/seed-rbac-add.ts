import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
import { PERMISSION_CATALOG, type RoleSlug } from "../src/lib/permission-catalog";

const prisma = new PrismaClient();

function catalogDefaultsFor(slug: RoleSlug): string[] {
  return PERMISSION_CATALOG.filter((p) => p.defaultRoles.includes(slug)).map((p) => p.id);
}

async function main() {
  const add = [
    {
      name: "Admin",
      description: "Full access to all modules and settings.",
      permissions: JSON.stringify(catalogDefaultsFor("admin")),
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      name: "Staff",
      description: "Day-to-day operational access across modules.",
      permissions: JSON.stringify(catalogDefaultsFor("staff")),
      color: "text-sky-600 bg-sky-50 border-sky-200",
    },
  ];

  for (const role of add) {
    const existing = await prisma.role.findFirst({ where: { name: role.name } });
    if (existing) {
      console.log(`EXISTS (skipped): ${role.name} (id ${existing.id}, ${role.permissions.length} chars)`);
      continue;
    }
    const created = await prisma.role.create({ data: role });
    console.log(`CREATED: ${created.name} (id ${created.id}) with ${JSON.parse(created.permissions || "[]").length} permissions`);
  }
}

main()
  .catch((e) => {
    console.error("FAILED:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
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

  const existingRoles = await prisma.role.findMany({
    where: { name: { in: add.map((role) => role.name) } },
  });
  const existingByName = new Map(existingRoles.map((role) => [role.name, role]));

  const results = await Promise.all(
    add.map(async (role) => {
      const existing = existingByName.get(role.name);
      if (existing) {
        return `EXISTS (skipped): ${role.name} (id ${existing.id}, ${role.permissions.length} chars)`;
      }
      const created = await prisma.role.create({ data: role });
      let permissionCount = 0;
      try {
        const parsed: unknown = JSON.parse(created.permissions || "[]");
        if (Array.isArray(parsed)) permissionCount = parsed.length;
      } catch {
        permissionCount = 0;
      }
      return `CREATED: ${created.name} (id ${created.id}) with ${permissionCount} permissions`;
    })
  );

  for (const line of results) {
    console.log(line);
  }
}

main()
  .catch((e) => {
    console.error("FAILED:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

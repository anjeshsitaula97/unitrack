import { PERMISSION_CATALOG, type RoleSlug } from "./permission-catalog";
import { runWithConsultancy } from "./consultancy";
import { db } from "./db";

/** Roles every new consultancy starts with, with their catalog-default grants. */
const DEFAULT_ROLE_SEEDS: Array<{
  name: string;
  slug: RoleSlug;
  description: string;
  color: string;
}> = [
  {
    name: "Admin",
    slug: "admin",
    description: "Full access to all modules and settings for this consultancy.",
    color: "text-rose-600 bg-rose-50 border-rose-200",
  },
  {
    name: "Staff",
    slug: "staff",
    description: "Day-to-day operational access across modules.",
    color: "text-sky-600 bg-sky-50 border-sky-200",
  },
  {
    name: "Viewer",
    slug: "viewer",
    description: "Read-only access to records.",
    color: "text-slate-600 bg-slate-50 border-slate-200",
  },
];

function catalogDefaultsFor(slug: RoleSlug): string[] {
  return PERMISSION_CATALOG.filter((p) => p.defaultRoles.includes(slug)).map((p) => p.id);
}

/** Next sequential consultancy code: C001, C002, ... */
export async function nextConsultancyCode(): Promise<string> {
  const rows = await db.consultancy.findMany({ select: { code: true } });
  let max = 0;
  for (const row of rows) {
    const match = /^C(\d+)$/.exec(row.code);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `C${String(max + 1).padStart(3, "0")}`;
}

/**
 * Gives a freshly created consultancy its own roles and settings row. Writes run
 * under a context bound to the NEW consultancy so the scoping extension tags the
 * rows correctly regardless of which consultancy the Super Admin currently has
 * selected.
 */
export async function seedConsultancyDefaults(consultancyId: number): Promise<void> {
  await runWithConsultancy({ consultancyId }, async () => {
    for (const seed of DEFAULT_ROLE_SEEDS) {
      const existing = await db.role.findFirst({ where: { name: seed.name } });
      if (existing) continue;
      await db.role.create({
        data: {
          name: seed.name,
          description: seed.description,
          permissions: JSON.stringify(catalogDefaultsFor(seed.slug)),
          color: seed.color,
        },
      });
    }

    const settings = await db.systemSettings.findFirst();
    if (!settings) {
      await db.systemSettings.create({ data: {} });
    }
  });
}

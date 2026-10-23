import { db } from "@/lib/db";
import type { MarqueeEntry } from "@/components/landing/motion";

/** Logos are streamed by the narrow public route rather than linked to
 *  /uploads/*, which requires a session an anonymous visitor never has. */
function logoHref(code: string): string {
  return `/api/marketing/consultancies/${encodeURIComponent(code)}/logo`;
}

/** Only an Active workspace is advertised on marketing surfaces. */
function isActive(status: string | null | undefined): boolean {
  return (status || "").trim().toLowerCase() === "active";
}

/**
 * The consultancies to advertise on the landing page, taken from the workspaces
 * in the system: every Active consultancy by name, with its uploaded logo when
 * it has one. Status is compared in JavaScript because the stored values are
 * written by hand in the admin UI, and MySQL collations differ on case.
 */
export async function loadMarketingCustomers(limit = 40): Promise<MarqueeEntry[]> {
  const rows = await db.consultancy.findMany({
    select: { code: true, name: true, status: true, logoUrl: true },
    orderBy: { name: "asc" },
  });

  return rows
    .filter((row) => isActive(row.status) && Boolean(row.name?.trim()))
    .slice(0, limit)
    .map((row) => {
      const logoUrl = (row.logoUrl || "").trim();
      return {
        name: row.name,
        // A workspace without a stored upload still gets its name in the band.
        ...(logoUrl.startsWith("/uploads/") ? { logo: logoHref(row.code) } : {}),
      };
    });
}

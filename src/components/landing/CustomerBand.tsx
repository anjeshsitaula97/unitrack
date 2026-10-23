import { Marquee } from "./motion";
import { loadMarketingCustomers } from "@/lib/marketing-customers";

/**
 * Auto-scrolling band of the consultancies on the platform, shown on the landing
 * page above the customer story. Names and logos come from the Consultancy
 * records themselves, so a workspace added in the admin appears here without a
 * code change and disappears when it is deactivated.
 *
 * The page around it revalidates hourly (see src/app/page.tsx), which is what
 * bounds the database read: a visitor never triggers this query, a timer does.
 */
export default async function CustomerBand() {
  let customers: Awaited<ReturnType<typeof loadMarketingCustomers>> = [];
  try {
    customers = await loadMarketingCustomers();
  } catch {
    // A database hiccup must not take the landing page down, and naming
    // hand-picked clients in its place would be a claim we cannot verify, so
    // the band simply leaves the page.
    return null;
  }

  if (customers.length === 0) return null;

  return (
    <div className="relative border-y border-slate-200/70 bg-slate-50">
      {/* Duration grows with the number of entries so the travel speed stays
          steady whether there are two clients or forty. */}
      <Marquee
        items={customers}
        label="Our customers"
        duration={Math.min(120, Math.max(20, customers.length * 4))}
      />
    </div>
  );
}

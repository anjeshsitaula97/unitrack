export type BillingCycle = "monthly" | "yearly";

export interface PricingPlan {
  id: string;
  tag: string;
  name: string;
  blurb: string;
  monthly: number;
  features: string[];
  cta: string;
  featured?: boolean;
}

export const ANNUAL_DISCOUNT = 0.25;

/**
 * All plan figures are the amounts charged by the checkout gateways
 * (eSewa / connectIPS process NPR, so the displayed figures are NPR figures).
 */
export const CHECKOUT_CURRENCY = "NPR";

export const PLANS: PricingPlan[] = [
  {
    id: "starter",
    tag: "Single Branch",
    name: "Starter Agency",
    blurb: "Perfect for new agencies getting started with their first intake cycles.",
    monthly: 3495,
    features: [
      "Maximum 5 Users",
      "Encrypted Document Vault (75GB — 15GB/user)",
      "Additional Users at ₹699/user/month",
      "Bulk Email Support",
      "Application Tracking",
    ],
    cta: "Start 30-Day Free Trial",
  },
  {
    id: "growth",
    tag: "Multi-Branch Scale",
    name: "Growth Agency",
    blurb: "The most popular choice for growing consultancies running multiple branches.",
    monthly: 7990,
    features: [
      "Maximum 10 Users",
      "Encrypted Document Vault (200GB — 20GB/user)",
      "Additional Users at ₹799/user/month",
      "Bulk Email with SMS Credit",
      "Application Sharing",
      "Priority Support",
      "Advanced Analytics",
      "Smart Audit Trail",
      "HR Management",
    ],
    cta: "Choose Growth Agency",
    featured: true,
  },
  {
    id: "enterprise",
    tag: "Global Consortia",
    name: "Enterprise Network",
    blurb: "Advanced power for multi-branch consultancies and global consortia.",
    monthly: 13485,
    features: [
      "Everything in Starter and Growth",
      "White Label Branding & Custom Domain",
      "Maximum 15 Users",
      "Encrypted Document Vault (375GB — 25GB/user)",
      "Additional Users at ₹899/user/month",
      "Complete HR Management",
      "API Access",
    ],
    cta: "Choose Enterprise Network",
  },
];

export function getPlanById(id: string): PricingPlan | undefined {
  return PLANS.find((plan) => plan.id === id);
}

export function isBillingCycle(value: unknown): value is BillingCycle {
  return value === "monthly" || value === "yearly";
}

/** Discounted monthly equivalent when billed yearly. */
export function getYearlyMonthly(plan: PricingPlan): number {
  return Math.round(plan.monthly * (1 - ANNUAL_DISCOUNT));
}

/** Price shown per month for the selected billing cycle. */
export function getMonthlyEquivalent(plan: PricingPlan, cycle: BillingCycle): number {
  return cycle === "yearly" ? getYearlyMonthly(plan) : plan.monthly;
}

/**
 * Total amount charged now for the selected billing cycle:
 * one month for monthly, twelve discounted months for yearly.
 */
export function getChargeAmount(plan: PricingPlan, cycle: BillingCycle): number {
  return cycle === "yearly" ? getYearlyMonthly(plan) * 12 : plan.monthly;
}

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

"use client";

import { useState } from "react";

type BillingCycle = "monthly" | "yearly";

interface PricingPlan {
  id: string;
  tag: string;
  name: string;
  blurb: string;
  monthly: number;
  features: string[];
  cta: string;
  featured?: boolean;
}

const ANNUAL_DISCOUNT = 0.25;

const PLANS: PricingPlan[] = [
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

const FAQS = [
  {
    question: "Can I cancel my subscription any time?",
    answer:
      "Yes, you can cancel or downgrade your plan directly from your dashboard settings with no questions asked.",
  },
  {
    question: "Is there a limit on file storage?",
    answer:
      "Limits vary based on your plan. Starter includes 75GB, Growth 200GB, and Enterprise 375GB of encrypted document vault storage.",
  },
  {
    question: "Do you offer migration from our current software?",
    answer:
      "Absolutely! Our team provides free data migration support for Growth and Enterprise customers.",
  },
  {
    question: "Which destinations do you support?",
    answer:
      "We support consultancies recruiting for 120+ study destinations, with specialized workflows for European countries like Italy, Austria, Germany, and Malta.",
  },
];

function formatRupees(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const isYearly = cycle === "yearly";

  return (
    <section className="w-full bg-white py-12 lg:py-16" id="pricing">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-label-pill text-label-pill uppercase">
            Simple, Transparent Pricing
          </div>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900">
            Scale with Agency Confidence
          </h2>
          <p className="font-body-lg text-body-lg text-slate-600">
            No hidden fees, no per-student commissions. Change your plan at any time and scale as
            you grow.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <div
            aria-label="Billing period"
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1"
            role="group"
          >
            <button
              aria-pressed={!isYearly}
              className={`px-5 py-2 rounded-full font-label-btn text-label-btn transition-colors ${
                !isYearly
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => setCycle("monthly")}
              type="button"
            >
              Monthly
            </button>
            <button
              aria-pressed={isYearly}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-label-btn text-label-btn transition-colors ${
                isYearly
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => setCycle("yearly")}
              type="button"
            >
              <span>Yearly</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-label-pill text-[10px] uppercase tracking-wide">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => {
            const featured = Boolean(plan.featured);
            const yearlyMonthly = Math.round(plan.monthly * (1 - ANNUAL_DISCOUNT));
            const price = isYearly ? yearlyMonthly : plan.monthly;

            return (
              <div
                className={
                  featured
                    ? "bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-6 relative ring-2 ring-indigo-500"
                    : "bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-6"
                }
                key={plan.id}
              >
                {featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white font-label-pill text-label-pill uppercase font-bold shadow-md">
                    Recommended
                  </div>
                )}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span
                      className={`font-label-pill text-label-pill uppercase ${
                        featured ? "text-indigo-300" : "text-slate-500"
                      }`}
                    >
                      {plan.tag}
                    </span>
                    <h3
                      className={`font-headline-sm text-headline-sm ${
                        featured ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`font-body-sm text-body-sm ${
                        featured ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {plan.blurb}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`font-metric-display text-metric-display ${
                          featured ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {formatRupees(price)}
                      </span>
                      <span
                        className={`font-body-md text-body-md ${
                          featured ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        / month
                      </span>
                    </div>
                    {isYearly && (
                      <p
                        className={`font-body-sm text-body-sm ${
                          featured ? "text-indigo-300" : "text-indigo-600"
                        }`}
                      >
                        {formatRupees(yearlyMonthly * 12)} billed annually — save 25%
                      </p>
                    )}
                  </div>
                  <ul
                    className={`space-y-3 font-body-sm text-body-sm ${
                      featured ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {plan.features.map((feature) => (
                      <li className="flex items-center gap-2.5" key={feature}>
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            featured ? "text-indigo-400" : "text-indigo-600"
                          }`}
                        >
                          check_circle
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  className={
                    featured
                      ? "w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-indigo-600 text-white font-label-btn text-label-btn text-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all"
                      : "w-full py-3 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-label-btn text-label-btn text-center transition-colors"
                  }
                  href="#live-demo"
                >
                  <span>{plan.cta}</span>
                  {featured && (
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  )}
                </a>
              </div>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto space-y-4 pt-4">
          <h3 className="font-headline-sm text-headline-sm text-slate-900 text-center">
            Common Questions
          </h3>
          <div className="space-y-3">
            {FAQS.map((item) => (
              <details
                className="group bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm"
                key={item.question}
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-body-md text-body-md text-slate-900 [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span className="material-symbols-outlined text-slate-500 transition-transform group-open:rotate-180">
                    expand_more
                  </span>
                </summary>
                <p className="pt-3 font-body-sm text-body-sm text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

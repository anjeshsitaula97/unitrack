"use client";

import { useState } from "react";
import { m } from "framer-motion";
import CheckoutModal from "@/components/CheckoutModal";
import { Eyebrow, Reveal, Stagger } from "@/components/landing/motion";
import { revealVariants } from "@/components/landing/motion-tokens";
import {
  ANNUAL_DISCOUNT,
  formatPrice,
  getChargeAmount,
  getMonthlyEquivalent,
  PLANS,
  type BillingCycle,
  type PricingPlan,
} from "@/lib/pricing";

const FAQS = [
  {
    question: "Can I cancel my subscription any time?",
    answer:
      "Yes. You can cancel or change your plan any time from your dashboard settings — no questions asked.",
  },
  {
    question: "Is there a limit on file storage?",
    answer:
      "It depends on your plan. Starter gives you 75GB, Growth 200GB, and Enterprise 375GB of secure document storage.",
  },
  {
    question: "Can you move our data from our current software?",
    answer: "Yes. Our team moves your data for free on the Growth and Enterprise plans.",
  },
  {
    question: "Which destinations do you support?",
    answer:
      "You can recruit for 120+ study destinations, with special workflows for European countries like Italy, Austria, Germany, and Malta.",
  },
];

export default function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [checkoutPlan, setCheckoutPlan] = useState<PricingPlan | null>(null);
  const isYearly = cycle === "yearly";

  return (
    <section
      className="relative w-full bg-[#05060b] py-16 lg:py-24 scroll-mt-28 border-t border-white/[0.06] overflow-hidden"
      id="pricing"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 space-y-10">
        <Reveal className="text-center max-w-2xl mx-auto space-y-4">
          <Eyebrow>Simple Pricing</Eyebrow>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
            Plans that <span className="text-grad">Grow With You</span>
          </h2>
          <p className="font-body-lg text-body-lg text-slate-400">
            No hidden fees and no commission per student. Change your plan any time as you grow.
          </p>
        </Reveal>

        <Reveal className="flex flex-wrap items-center justify-center gap-3">
          <div
            aria-label="Billing period"
            className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] ring-1 ring-white/10 p-1"
            role="group"
          >
            <button
              aria-pressed={!isYearly}
              className={`px-5 py-2 rounded-full font-label-btn text-label-btn transition-colors ${
                !isYearly
                  ? "bg-white/12 text-white ring-1 ring-white/15"
                  : "text-slate-400 hover:text-white"
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
                  ? "bg-white/12 text-white ring-1 ring-white/15"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setCycle("yearly")}
              type="button"
            >
              <span>Yearly</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/25 ring-1 ring-indigo-400/40 text-indigo-200 font-label-pill text-[10px] uppercase tracking-wide">
                Save {Math.round(ANNUAL_DISCOUNT * 100)}%
              </span>
            </button>
          </div>
        </Reveal>

        <Stagger className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => {
            const featured = Boolean(plan.featured);
            const price = getMonthlyEquivalent(plan, cycle);

            return (
              <m.div
                className={`fw group relative flex flex-col justify-between space-y-6 p-6 rounded-2xl overflow-hidden glow-hover ${
                  featured
                    ? "bg-gradient-to-b from-indigo-600/25 via-indigo-900/25 to-white/[0.04] text-white ring-2 ring-indigo-500/70 shadow-[0_0_80px_-24px_rgba(99,102,241,0.75)]"
                    : "bg-white/[0.03] text-white ring-1 ring-white/[0.08] hover:ring-indigo-400/30 transition-[ring-color] duration-300"
                }`}
                key={plan.id}
                variants={revealVariants}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 340, damping: 24 }}
              >
                {featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-label-pill text-label-pill uppercase font-bold shadow-lg shadow-indigo-950/80 ring-1 ring-white/20">
                    Recommended
                  </div>
                )}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span
                      className={`font-label-pill text-label-pill uppercase ${
                        featured ? "text-indigo-200" : "text-slate-500"
                      }`}
                    >
                      {plan.tag}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-white">{plan.name}</h3>
                    <p className="font-body-sm text-body-sm text-slate-400">{plan.blurb}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="font-metric-display text-metric-display text-white">
                        {formatPrice(price)}
                      </span>
                      <span className="font-body-md text-body-md text-slate-500">/ month</span>
                    </div>
                    {isYearly && (
                      <p
                        className={`font-body-sm text-body-sm ${featured ? "text-indigo-200" : "text-indigo-300"}`}
                      >
                        {formatPrice(getChargeAmount(plan, "yearly"))} billed annually — save{" "}
                        {Math.round(ANNUAL_DISCOUNT * 100)}%
                      </p>
                    )}
                  </div>
                  <ul className="space-y-3 font-body-sm text-body-sm text-slate-400">
                    {plan.features.map((feature) => (
                      <li className="flex items-center gap-2.5" key={feature}>
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            featured ? "text-indigo-300" : "text-indigo-400"
                          }`}
                        >
                          check_circle
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  className={
                    featured
                      ? "w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-label-btn text-label-btn text-center shadow-lg shadow-indigo-950/70 ring-1 ring-white/15 hover:from-indigo-400 hover:to-violet-400 transition-colors motion-cta"
                      : "w-full py-3 px-4 rounded-full bg-white/[0.07] ring-1 ring-white/10 hover:bg-white/[0.13] text-white font-label-btn text-label-btn text-center transition-colors motion-cta"
                  }
                  onClick={() => setCheckoutPlan(plan)}
                  type="button"
                >
                  <span>{plan.cta}</span>
                  {featured && (
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  )}
                </button>
              </m.div>
            );
          })}
        </Stagger>

        <Reveal className="max-w-3xl mx-auto space-y-4 pt-4">
          <h3 className="font-headline-sm text-headline-sm text-white text-center">
            Common Questions
          </h3>
          <div className="space-y-3">
            {FAQS.map((item) => (
              <details
                className="group bg-white/[0.03] ring-1 ring-white/[0.08] rounded-2xl px-6 py-4 hover:ring-white/15 transition-[ring-color]"
                key={item.question}
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-body-md text-body-md text-white [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span className="material-symbols-outlined text-slate-500 transition-transform group-open:rotate-180">
                    expand_more
                  </span>
                </summary>
                <p className="pt-3 font-body-sm text-body-sm text-slate-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>

      {checkoutPlan && (
        <CheckoutModal cycle={cycle} onClose={() => setCheckoutPlan(null)} plan={checkoutPlan} />
      )}
    </section>
  );
}

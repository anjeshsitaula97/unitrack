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
      className="relative w-full bg-white py-16 lg:py-24 scroll-mt-28 border-t border-slate-200/70 overflow-hidden"
      id="pricing"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 space-y-10">
        <Reveal className="text-center max-w-2xl mx-auto space-y-4">
          <Eyebrow>Simple Pricing</Eyebrow>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900">
            Plans that <span className="text-grad">Grow With You</span>
          </h2>
          <p className="font-body-lg text-body-lg text-slate-600">
            No hidden fees and no commission per student. Change your plan any time as you grow.
          </p>
        </Reveal>

        <Reveal className="flex flex-wrap items-center justify-center gap-3">
          <div
            aria-label="Billing period"
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 ring-1 ring-slate-200 p-1"
            role="group"
          >
            <button
              aria-pressed={!isYearly}
              className={`px-5 py-2 rounded-full font-label-btn text-label-btn transition-colors ${
                !isYearly
                  ? "bg-white text-slate-900 ring-1 ring-slate-200 shadow-sm"
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
                  ? "bg-white text-slate-900 ring-1 ring-slate-200 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => setCycle("yearly")}
              type="button"
            >
              <span>Yearly</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 ring-1 ring-indigo-300 text-indigo-700 font-label-pill text-[10px] uppercase tracking-wide">
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
                className={`fw group relative flex flex-col justify-between space-y-6 p-6 rounded-2xl overflow-hidden ${
                  featured
                    ? "bg-gradient-to-b from-indigo-50 via-white to-white text-slate-900 ring-2 ring-indigo-500 shadow-[0_30px_80px_-30px_rgba(79,70,229,0.45)]"
                    : "bg-white text-slate-900 ring-1 ring-slate-200 shadow-sm hover:ring-indigo-300 hover:shadow-lg hover:shadow-indigo-950/5 transition-[ring-color,box-shadow] duration-300"
                }`}
                key={plan.id}
                variants={revealVariants}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 340, damping: 24 }}
              >
                {featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-label-pill text-label-pill uppercase font-bold shadow-lg shadow-indigo-500/40 ring-1 ring-white/20">
                    Recommended
                  </div>
                )}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span
                      className={`font-label-pill text-label-pill uppercase ${
                        featured ? "text-indigo-600" : "text-slate-400"
                      }`}
                    >
                      {plan.tag}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-slate-900">
                      {plan.name}
                    </h3>
                    <p className="font-body-sm text-body-sm text-slate-500">{plan.blurb}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="font-metric-display text-metric-display text-slate-900">
                        {formatPrice(price)}
                      </span>
                      <span className="font-body-md text-body-md text-slate-500">/ month</span>
                    </div>
                    {isYearly && (
                      <p className="font-body-sm text-body-sm text-indigo-600">
                        {formatPrice(getChargeAmount(plan, "yearly"))} billed annually — save{" "}
                        {Math.round(ANNUAL_DISCOUNT * 100)}%
                      </p>
                    )}
                  </div>
                  <ul className="space-y-3 font-body-sm text-body-sm text-slate-600">
                    {plan.features.map((feature) => (
                      <li className="flex items-center gap-2.5" key={feature}>
                        <span className="material-symbols-outlined text-[18px] text-indigo-600">
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
                      ? "w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-label-btn text-label-btn text-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20 hover:from-indigo-500 hover:to-violet-500 transition-colors motion-cta"
                      : "w-full py-3 px-4 rounded-full bg-white ring-1 ring-slate-300 hover:bg-slate-50 text-slate-800 font-label-btn text-label-btn text-center shadow-sm transition-colors motion-cta"
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
                className="group bg-slate-50 ring-1 ring-slate-200/70 rounded-2xl px-6 py-4 hover:ring-slate-300 transition-[ring-color]"
                key={item.question}
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-body-md text-body-md text-slate-900 [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span className="material-symbols-outlined text-slate-400 transition-transform group-open:rotate-180">
                    expand_more
                  </span>
                </summary>
                <p className="pt-3 font-body-sm text-body-sm text-slate-500">{item.answer}</p>
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

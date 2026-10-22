"use client";

import { m } from "framer-motion";
import DemoForm from "@/components/DemoForm";
import { Counter, Eyebrow, Item, Reveal, Stagger } from "./motion";

const IMPACT = [
  {
    label: "Counselor Productivity",
    kind: "counter" as const,
    to: 320,
    prefix: "+",
    suffix: "%",
    bar: 0.85,
  },
  { label: "Deadlines Missed", kind: "text" as const, text: "ZERO", bar: 1 },
  {
    label: "Sub-Agent Transparency",
    kind: "counter" as const,
    to: 100,
    prefix: "",
    suffix: "%",
    bar: 1,
  },
];

export function Spotlight() {
  return (
    <section className="relative w-full bg-[#070912] py-16 lg:py-24 scroll-mt-28">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="relative grain rounded-3xl overflow-hidden p-6 lg:p-12 ring-1 ring-white/10 bg-gradient-to-br from-indigo-950/70 via-[#0a0c16] to-[#0a0c16]">
          <div
            aria-hidden
            className="motion-drift-slow absolute -right-24 -bottom-24 w-[420px] h-[420px] bg-indigo-600/20 blur-[110px] rounded-full"
          />
          <span
            aria-hidden
            className="motion-float absolute top-2 right-8 select-none text-[150px] leading-none font-black text-white/[0.05]"
          >
            &ldquo;
          </span>

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <Reveal className="lg:col-span-7 space-y-6">
              <Eyebrow dot>Customer Story &bull; Kathmandu</Eyebrow>
              <blockquote className="font-headline-md text-headline-md text-white leading-snug">
                &ldquo;UniTrack cut our visa filing time from 14 days down to 48 hours. Our
                counselors stopped juggling Excel sheets, nothing gets lost, and our university
                commission payouts are accurate to the rupee.&rdquo;
              </blockquote>
              <div className="flex items-center gap-4 pt-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-headline-sm flex items-center justify-center font-bold ring-1 ring-white/20">
                  RC
                </div>
                <div>
                  <div className="font-headline-sm text-[16px] text-white font-semibold">
                    Rohan Chitrakar
                  </div>
                  <div className="font-body-sm text-body-sm text-slate-400">
                    Managing Director, Apex Global Education Consultancies (Kathmandu, Pokhara &amp;
                    Sydney)
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="lg:col-span-5 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 backdrop-blur-md p-6 lg:p-8 space-y-6">
              <div className="font-label-pill text-label-pill uppercase text-indigo-300 tracking-wider">
                Results After 6 Months
              </div>
              <Stagger className="space-y-5">
                {IMPACT.map((s) => (
                  <Item key={s.label}>
                    <div className="flex items-center justify-between pb-3">
                      <span className="font-body-md text-body-md text-slate-400">{s.label}</span>
                      <span className="font-metric-display text-[26px] text-white">
                        {s.kind === "counter" ? (
                          <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} />
                        ) : (
                          s.text
                        )}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.07] overflow-hidden">
                      <m.div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 origin-left"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: s.bar }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                      />
                    </div>
                  </Item>
                ))}
              </Stagger>
              <div className="pt-2">
                <a
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.07] hover:bg-white/[0.13] ring-1 ring-white/10 text-white font-label-btn text-label-btn transition-colors motion-cta"
                  href="#live-demo"
                >
                  <span>Read the Full Story</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BottomCta() {
  return (
    <section
      id="live-demo"
      className="relative w-full bg-[#05060b] py-16 lg:py-24 scroll-mt-28 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="relative grain rounded-3xl bg-[#0a0c16] ring-1 ring-white/10 p-6 lg:p-12 overflow-hidden shadow-[0_50px_110px_-50px_rgba(79,70,229,0.5)]">
          <div
            aria-hidden
            className="motion-drift-slow absolute -top-32 right-[-12%] w-[560px] h-[560px] bg-indigo-600/25 blur-[130px] rounded-full"
          />
          <div
            aria-hidden
            className="motion-drift absolute -bottom-40 -left-24 w-[460px] h-[460px] bg-violet-600/15 blur-[120px] rounded-full"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <Reveal className="lg:col-span-7 space-y-5">
              <Eyebrow dot>Live Demo</Eyebrow>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
                Ready to <span className="text-grad">Simplify Your Consultancy?</span>
              </h2>
              <p className="font-body-md text-body-md text-slate-400 max-w-xl">
                Book a walkthrough at our Kathmandu office, or get a free trial account with sample
                student profiles in under 60 minutes.
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-2 font-body-sm text-body-sm">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <span className="material-symbols-outlined text-[16px]">check</span> Free
                  counselor training
                </span>
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <span className="material-symbols-outlined text-[16px]">check</span> We move your
                  existing data for free
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.12} className="lg:col-span-5">
              <DemoForm />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { m, useReducedMotion, useScroll, useTransform, type Transition } from "framer-motion";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { Counter, KineticHeadline, Reveal, Eyebrow } from "./motion";

// Three.js is heavy; load the globe only in the browser, after hydration.
const GlobeScene = dynamic(() => import("./GlobeScene"), { ssr: false });

const SPRING: Transition = { type: "spring", stiffness: 320, damping: 26, mass: 0.9 };

const METRICS = [
  { to: 50, decimals: 0, suffix: "K+", label: "Students Handled", accent: false },
  { to: 99.2, decimals: 1, suffix: "%", label: "Visa Success Rate", accent: true },
  { to: 3.5, decimals: 1, suffix: "x", label: "Faster Offer Letters", accent: false },
  { to: 4, decimals: 0, suffix: "+", label: "Study Destinations (AU, UK, US, CA)", accent: false },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 72]);
  const contentFade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      id="overview"
      ref={ref}
      className="relative grain overflow-hidden pt-40 sm:pt-44 pb-20 lg:pt-52 lg:pb-28"
    >
      {/* Layer: base wash + aurora fields (transform-only drift) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_65%_55%_at_50%_-5%,#241d63_0%,transparent_62%)]"
      />
      <div
        aria-hidden
        className="motion-drift absolute -top-28 left-[calc(50%-460px)] w-[920px] h-[440px] bg-indigo-600/25 blur-[130px] rounded-full -z-10"
      />
      <div
        aria-hidden
        className="motion-drift-slow absolute top-44 -right-40 w-[560px] h-[560px] bg-violet-600/20 blur-[120px] rounded-full -z-10"
      />
      <div
        aria-hidden
        className="motion-float absolute top-72 -left-40 w-[440px] h-[440px] bg-cyan-500/10 blur-[110px] rounded-full -z-10"
      />
      <div aria-hidden className="grid-lines absolute inset-0 -z-10" />

      {/* Layer: interactive 3D destination globe (WebGL). Sits behind the
          headline; hidden below lg and on devices without a GPU. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden lg:block opacity-70"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_30%,#05060b_78%)]" />
        <GlobeScene className="absolute inset-0 h-full w-full" />
      </div>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-[#05060b] -z-10"
      />

      {/* Floating HUD chips (Tier: support, CSS float) */}
      <div
        aria-hidden
        className="hidden lg:flex motion-float absolute left-[5%] top-[46%] items-center gap-2 rounded-full bg-white/[0.05] ring-1 ring-white/10 backdrop-blur-md px-4 py-2 text-[12px] font-semibold text-slate-300"
      >
        <span className="motion-pulse w-2 h-2 rounded-full bg-emerald-400" />
        Updates in real time
      </div>
      <div
        aria-hidden
        className="hidden lg:flex motion-float absolute right-[6%] top-[36%] items-center gap-2 rounded-full bg-white/[0.05] ring-1 ring-white/10 backdrop-blur-md px-4 py-2 text-[12px] font-semibold text-slate-300"
        style={{ animationDelay: "1.6s" }}
      >
        <span className="w-2 h-2 rounded-full bg-indigo-400" />
        GTE checks · 99.8% pass
      </div>

      <m.div
        className="relative max-w-[1440px] mx-auto px-6 lg:px-12"
        style={reduced ? undefined : { y: contentY, opacity: contentFade }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-7">
          <Reveal>
            <Eyebrow dot>
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                verified
              </span>
              A Product of Avenlixx Technologies
            </Eyebrow>
          </Reveal>

          <KineticHeadline
            className="font-display-hero text-display-hero-mobile md:text-display-hero text-white tracking-tight"
            delay={0.18}
            parts={[
              { text: "Run Your Study Abroad Consultancy" },
              { text: "From One Simple System", className: "text-grad" },
            ]}
          />

          <Reveal delay={0.55}>
            <p className="font-body-lg text-body-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Track every student from the first enquiry to their visa. Manage leads, IELTS and PTE
              classes, offer letters, documents, and commission payments &mdash; all in one place.
            </p>
          </Reveal>

          <Reveal delay={0.66}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <m.a
                href="#live-demo"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-label-btn text-label-btn px-7 py-3.5 rounded-full shadow-[0_20px_45px_-15px_rgba(99,102,241,0.75)] ring-1 ring-white/15 hover:from-indigo-400 hover:to-violet-400 transition-colors group"
              >
                <span>See a Live Demo</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </m.a>
              <m.a
                href="#crm-showcase"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white/[0.06] ring-1 ring-white/12 hover:bg-white/[0.1] text-white font-label-btn text-label-btn px-6 py-3.5 rounded-full backdrop-blur-md transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-500/25 ring-1 ring-indigo-400/40 flex items-center justify-center text-indigo-300">
                  <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                </div>
                <span>Take a Quick Tour</span>
              </m.a>
            </div>
          </Reveal>
        </div>

        {/* Trust metrics — animated counters in a glass panel */}
        <Reveal delay={0.8} y={24} className="mt-12 lg:mt-16">
          <div className="relative max-w-5xl mx-auto rounded-2xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-xl p-6 lg:p-7 overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"
            />
            <div className="text-center font-label-pill text-label-pill uppercase text-slate-500 tracking-wider mb-6">
              Trusted by 80+ Consultancies in Kathmandu, New Delhi, Sydney &amp; Toronto
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 text-center">
              {METRICS.map((m, i) => (
                <div
                  key={m.label}
                  className={`space-y-1 px-2 ${i > 0 ? "md:border-l md:border-white/10" : ""}`}
                >
                  <Counter
                    to={m.to}
                    decimals={m.decimals}
                    suffix={m.suffix}
                    className={`block font-metric-display text-metric-display ${
                      m.accent ? "text-indigo-400" : "text-white"
                    }`}
                  />
                  <div className="font-body-sm text-body-sm text-slate-500 font-medium">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </m.div>

      {/* Scroll cue */}
      <div className="relative mt-12 flex flex-col items-center gap-1.5 text-slate-600">
        <span className="text-[11px] font-bold uppercase tracking-[0.24em]">Scroll</span>
        <span className="motion-pulse material-symbols-outlined text-[18px]">expand_more</span>
      </div>
    </section>
  );
}

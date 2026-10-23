"use client";

import {
  m,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Transition,
} from "framer-motion";
import { useRef } from "react";
import { Counter, Eyebrow, KineticHeadline, Magnetic, Reveal } from "./motion";

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

  // Pointer parallax — pastel washes drift away from the cursor while the
  // orbit rings lean into it. Springs keep every layer on its own lag.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 55, damping: 20 });
  const sy = useSpring(py, { stiffness: 55, damping: 20 });
  const auroraX = useTransform(sx, (v) => v * -26);
  const auroraY = useTransform(sy, (v) => v * -18);
  const ringX = useTransform(sx, (v) => v * 14);
  const ringY = useTransform(sy, (v) => v * 10);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced) return;
    px.set(e.clientX / window.innerWidth - 0.5);
    py.set(e.clientY / window.innerHeight - 0.5);
  };

  return (
    <section
      id="overview"
      ref={ref}
      onPointerMove={onPointerMove}
      className="relative overflow-hidden pt-40 sm:pt-44 pb-20 lg:pt-52 lg:pb-28"
    >
      {/* Layer: base wash + pastel aurora fields (pointer parallax + CSS drift) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_65%_55%_at_50%_-5%,#e0e7ff_0%,transparent_62%)]"
      />
      <m.div
        aria-hidden
        className="absolute -top-28 left-[calc(50%-460px)] h-[440px] w-[920px] -z-10"
        style={reduced ? undefined : { x: auroraX, y: auroraY }}
      >
        <div className="motion-drift absolute inset-0 rounded-full bg-indigo-300/30 blur-[130px]" />
      </m.div>
      <m.div
        aria-hidden
        className="absolute top-44 -right-40 h-[560px] w-[560px] -z-10"
        style={reduced ? undefined : { x: auroraX, y: auroraY }}
      >
        <div className="motion-drift-slow absolute inset-0 rounded-full bg-violet-300/25 blur-[120px]" />
      </m.div>
      <m.div
        aria-hidden
        className="absolute top-72 -left-40 h-[440px] w-[440px] -z-10"
        style={reduced ? undefined : { x: auroraX, y: auroraY }}
      >
        <div className="motion-float absolute inset-0 rounded-full bg-cyan-200/40 blur-[110px]" />
      </m.div>
      <div aria-hidden className="grid-lines absolute inset-0 -z-10" />

      {/* Layer: orbit rings + rotating conic arc — motion-graphics backdrop
          behind the headline. Counter-rotating dashed circles (CSS) plus a
          masked conic gradient arc, all leaning with the cursor. */}
      <m.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
        style={reduced ? undefined : { x: ringX, y: ringY }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="orbit-ring h-[640px] w-[640px]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="orbit-ring reverse h-[880px] w-[880px] opacity-70" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="spin-slower conic-ring h-[760px] w-[760px] opacity-40" />
        </div>
      </m.div>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-white -z-10"
      />

      {/* Floating HUD chips (Tier: support, CSS float) */}
      <div
        aria-hidden
        className="motion-float absolute left-[5%] top-[46%] hidden items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-[12px] font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur-md lg:flex"
      >
        <span className="motion-pulse h-2 w-2 rounded-full bg-emerald-500" />
        Updates in real time
      </div>
      <div
        aria-hidden
        className="motion-float absolute right-[6%] top-[36%] hidden items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-[12px] font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur-md lg:flex"
        style={{ animationDelay: "1.6s" }}
      >
        <span className="h-2 w-2 rounded-full bg-indigo-500" />
        GTE checks · 99.8% pass
      </div>

      <m.div
        className="relative mx-auto max-w-[1440px] px-6 lg:px-12"
        style={reduced ? undefined : { y: contentY, opacity: contentFade }}
      >
        <div className="mx-auto max-w-4xl space-y-7 text-center">
          <Reveal>
            <Eyebrow dot>
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                verified
              </span>
              A Product of Avenlixx Technologies
            </Eyebrow>
          </Reveal>

          <KineticHeadline
            className="font-display-hero text-display-hero-mobile text-slate-900 tracking-tight md:text-display-hero"
            delay={0.18}
            parts={[
              { text: "Run Your Study Abroad Consultancy" },
              { text: "From One Simple System", className: "text-grad" },
            ]}
          />

          <Reveal delay={0.55}>
            <p className="font-body-lg text-body-lg mx-auto max-w-3xl leading-relaxed text-slate-600">
              Track every student from the first enquiry to their visa. Manage leads, IELTS and PTE
              classes, offer letters, documents, and commission payments &mdash; all in one place.
            </p>
          </Reveal>

          <Reveal delay={0.66}>
            <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
              <Magnetic className="w-full sm:w-auto">
                <m.a
                  href="#live-demo"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING}
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 font-label-btn text-label-btn text-white shadow-[0_20px_45px_-15px_rgba(99,102,241,0.55)] ring-1 ring-white/20 transition-colors hover:from-indigo-500 hover:to-violet-500 sm:w-auto"
                >
                  <span>See a Live Demo</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </m.a>
              </Magnetic>
              <Magnetic className="w-full sm:w-auto">
                <m.a
                  href="#crm-showcase"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING}
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-6 py-3.5 font-label-btn text-label-btn text-slate-800 shadow-sm ring-1 ring-slate-200 backdrop-blur-md transition-colors hover:bg-slate-50 sm:w-auto"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200">
                    <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                  </div>
                  <span>Take a Quick Tour</span>
                </m.a>
              </Magnetic>
            </div>
          </Reveal>
        </div>

        {/* Trust metrics — animated counters in a floating white panel */}
        <Reveal delay={0.8} y={24} className="mt-12 lg:mt-16">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white/80 p-6 shadow-[0_30px_80px_-40px_rgba(49,46,129,0.3)] ring-1 ring-slate-200 backdrop-blur-xl lg:p-7">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent"
            />
            <div className="mb-6 text-center font-label-pill text-label-pill uppercase tracking-wider text-slate-400">
              Trusted by 80+ Consultancies in Kathmandu, New Delhi, Sydney &amp; Toronto
            </div>
            <div className="grid grid-cols-2 gap-y-6 text-center md:grid-cols-4">
              {METRICS.map((m, i) => (
                <div
                  key={m.label}
                  className={`space-y-1 px-2 ${i > 0 ? "md:border-l md:border-slate-200" : ""}`}
                >
                  <Counter
                    to={m.to}
                    decimals={m.decimals}
                    suffix={m.suffix}
                    className={`block font-metric-display text-metric-display ${
                      m.accent ? "text-indigo-600" : "text-slate-900"
                    }`}
                  />
                  <div className="font-body-sm text-body-sm font-medium text-slate-500">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </m.div>

      {/* Scroll cue — traveling gradient dot on a hairline */}
      <div className="relative mt-12 flex flex-col items-center gap-2 text-slate-400">
        <span className="text-[11px] font-bold uppercase tracking-[0.24em]">Scroll</span>
        <span className="scroll-line" aria-hidden>
          <span className="scroll-dot" />
        </span>
      </div>
    </section>
  );
}

"use client";

import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { useRef, useState } from "react";
import { Eyebrow, Reveal, SpotlightItem, Stagger } from "./motion";
import { DUR, EASE } from "./motion-tokens";

const STAGES = [
  {
    icon: "person_add",
    label: "Enquiry",
    title: "Every enquiry lands in one pipeline",
    desc: "Meta Ads, walk-ins, forms and sub-agent referrals flow into a single queue and auto-assign to the right counselor.",
    metric: "0 leads lost",
  },
  {
    icon: "folder_shared",
    label: "Documents",
    title: "The vault checks files before the embassy does",
    desc: "SOPs, transcripts, bank statements and scorecards are scanned against GTE rules the moment they are uploaded.",
    metric: "99.8% GTE pass",
  },
  {
    icon: "school",
    label: "Offers",
    title: "Applications out, offers back — fast",
    desc: "Send tracked applications to 1,200+ partner universities across AU, CA, UK and US and watch statuses update live.",
    metric: "3.5x faster offers",
  },
  {
    icon: "flight_takeoff",
    label: "Visa",
    title: "Visa prep with zero surprises",
    desc: "Country checklists, funds calculators and mock interviews keep every filing embassy-ready the first time.",
    metric: "99.2% visa success",
  },
  {
    icon: "payments",
    label: "Commissions",
    title: "Every payout reconciled to the rupee",
    desc: "Branch, sub-agent and university commissions settle automatically with invoices and a full audit trail.",
    metric: "100% transparency",
  },
];

/* The journey rail: an S-curve the gradient draws as you scroll. Nodes sit
   on the curve at even x intervals; y alternates high/low. */
const PATH =
  "M 90 170 C 175 170 260 70 345 70 C 430 70 515 170 600 170 C 685 170 770 70 855 70 C 940 70 1025 170 1110 170";
const NODES = STAGES.map((_, i) => ({
  x: 90 + i * 255,
  y: i % 2 === 0 ? 170 : 70,
}));

/** Sticky, scroll-driven journey set piece (desktop, motion allowed).
 *  A gradient line draws across five milestone nodes while the stage card
 *  crossfades through the pipeline story. */
function Rail({ id }: { id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(STAGES.length - 1, Math.max(0, Math.floor(v * STAGES.length + 0.25)));
    setActive((prev) => (prev === next ? prev : next));
  });

  const stage = STAGES[active];

  return (
    <section
      ref={ref}
      id={id}
      className="relative hidden h-[300vh] bg-[#1e1b4b] lg:block"
      aria-label="Student journey"
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        {/* Backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,#312e81_0%,transparent_65%)]"
        />
        <div
          aria-hidden
          className="conic-aura spin-slower -top-56 left-[calc(50%-420px)] h-[840px] w-[840px] opacity-20"
        />
        <div aria-hidden className="grid-lines-dark absolute inset-0 opacity-60" />

        <div className="relative flex w-full max-w-5xl flex-col items-center">
          <Reveal className="flex flex-col items-center gap-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 font-label-pill text-label-pill uppercase tracking-wider text-indigo-200 ring-1 ring-white/20">
              <span className="motion-pulse h-1.5 w-1.5 rounded-full bg-cyan-400" />
              The Journey
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile text-white md:text-headline-lg">
              From First Enquiry to <span className="text-grad-dark">Visa in Hand</span>
            </h2>
          </Reveal>

          {/* Crossfading stage card — one story beat per scroll segment */}
          <div className="relative mt-8 h-52 w-full max-w-2xl sm:h-44">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={active}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: DUR.ui, ease: EASE }}
                className="absolute inset-0 space-y-3 text-center"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/30">
                    <span className="material-symbols-outlined text-[20px]">{stage.icon}</span>
                  </span>
                  <span className="font-label-pill text-label-pill uppercase tracking-wider text-indigo-300">
                    Step {active + 1} of {STAGES.length} &middot; {stage.label}
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-white">{stage.title}</h3>
                <p className="font-body-md text-body-md mx-auto max-w-xl text-slate-400">
                  {stage.desc}
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 font-label-pill text-label-pill uppercase text-cyan-300 ring-1 ring-cyan-400/25">
                  <span className="motion-pulse h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  {stage.metric}
                </span>
              </m.div>
            </AnimatePresence>
          </div>

          {/* Scroll-drawn rail with milestone nodes */}
          <div className="relative mt-4 w-full">
            <div className="relative aspect-[1200/260] w-full">
              <svg
                viewBox="0 0 1200 260"
                fill="none"
                aria-hidden
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <linearGradient
                    id="journey-grad"
                    x1="0"
                    y1="0"
                    x2="1200"
                    y2="0"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#6366f1" />
                    <stop offset="0.5" stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <path d={PATH} stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                <m.path
                  d={PATH}
                  stroke="url(#journey-grad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{ pathLength: scrollYProgress }}
                />
              </svg>
              {NODES.map((n, i) => {
                const done = i < active;
                const isActive = i === active;
                return (
                  <div
                    key={STAGES[i].label}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${(n.x / 1200) * 100}%`, top: `${(n.y / 260) * 100}%` }}
                  >
                    <div
                      className={`relative flex h-12 w-12 items-center justify-center rounded-full ring-1 transition-colors duration-300 ${
                        done
                          ? "bg-indigo-500/90 ring-indigo-300/50"
                          : isActive
                            ? "bg-[#0b0d17] ring-cyan-300/60"
                            : "bg-white/[0.04] ring-white/10"
                      }`}
                    >
                      {done ? (
                        <span className="material-symbols-outlined text-[18px] text-white">
                          check
                        </span>
                      ) : (
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            isActive ? "text-cyan-300" : "text-slate-500"
                          }`}
                        >
                          {STAGES[i].icon}
                        </span>
                      )}
                      {isActive && (
                        <span className="motion-pulse absolute inset-0 rounded-full ring-2 ring-cyan-300/40" />
                      )}
                    </div>
                    <span
                      className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${
                        isActive ? "text-white" : done ? "text-indigo-200" : "text-indigo-300/60"
                      }`}
                    >
                      {STAGES[i].label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Static fallback: mobile, reduced motion, and no-JS visitors get the same
 *  story as a plain cascading grid. */
function Static({ id }: { id?: string }) {
  return (
    <section
      id={id}
      className="relative w-full overflow-hidden bg-white py-16 lg:py-24"
      aria-label="Student journey"
    >
      <div
        aria-hidden
        className="absolute -top-40 left-1/3 h-[320px] w-[600px] rounded-full bg-indigo-200/50 blur-[130px]"
      />
      <div className="relative mx-auto max-w-[1440px] space-y-10 px-6 lg:px-12">
        <Reveal className="max-w-2xl space-y-4">
          <Eyebrow dot>The Journey</Eyebrow>
          <h2 className="font-headline-lg text-headline-lg-mobile text-slate-900 md:text-headline-lg">
            From First Enquiry to <span className="text-grad">Visa in Hand</span>
          </h2>
          <p className="font-body-lg text-body-lg text-slate-600">
            Five stages, one system — watch a student travel the whole pipeline without a single
            spreadsheet.
          </p>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((s, i) => (
            <SpotlightItem
              key={s.label}
              className="group relative flex h-full flex-col space-y-3 overflow-hidden rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80 transition-[ring-color,box-shadow] duration-300 hover:shadow-[0_24px_50px_-24px_rgba(49,46,129,0.25)] hover:ring-indigo-300"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200">
                  <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                </span>
                <span className="text-[26px] font-extrabold leading-none text-slate-900/[0.05]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="font-label-pill text-label-pill uppercase tracking-wider text-indigo-600">
                {s.label}
              </div>
              <h3 className="font-headline-sm text-headline-sm text-slate-900">{s.title}</h3>
              <p className="font-body-sm text-body-sm text-slate-500">{s.desc}</p>
              <div className="mt-auto pt-2 font-label-pill text-label-pill uppercase text-grad font-bold">
                {s.metric}
              </div>
            </SpotlightItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export default function Journey() {
  const reduced = useReducedMotion();
  if (reduced) return <Static id="journey" />;
  return (
    <>
      <div className="lg:hidden">
        <Static />
      </div>
      <Rail id="journey" />
    </>
  );
}

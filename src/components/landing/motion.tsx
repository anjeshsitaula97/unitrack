"use client";

import Image from "next/image";
import {
  LazyMotion,
  MotionConfig,
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

import { DUR, EASE, groupVariants, revealVariants } from "./motion-tokens";

/** Fine-pointer media query consumed via useSyncExternalStore: SSR-safe
 *  (server snapshot false), no setState-in-effect, and stays correct if the
 *  pointer type changes at runtime. */
function subscribeFinePointer(callback: () => void) {
  const mq = window.matchMedia("(pointer: fine)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
const getFinePointer = () => window.matchMedia("(pointer: fine)").matches;
const getFinePointerServer = () => false;

/**
 * Wraps the landing page in framer-motion's tiered reduced-motion config:
 * transform/layout animations are dropped for users who ask for reduce,
 * opacity and colour transitions survive (Tier 2/3 from accessible-animation).
 *
 * `LazyMotion` defers the animation feature bundle until after hydration and
 * `strict` guarantees every animated node uses the lightweight `m` component.
 */
export function MotionShell({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

/** One-shot reveal when scrolled into view. Adds `.fw` so the noscript
 *  fallback in page.tsx can force content visible without JS. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <m.div
      className={`fw ${className ?? ""}`}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: DUR.card, ease: EASE, delay }}
    >
      {children}
    </m.div>
  );
}

/** Stagger container — direct children should be motion elements carrying
 *  `variants={revealVariants}` (see Item) for the 60ms cascade. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div
      className={`fw ${className ?? ""}`}
      variants={groupVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </m.div>
  );
}

/** Stagger item — plain container that inherits the parent cascade. */
export function Item({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div className={`fw ${className ?? ""}`} variants={revealVariants}>
      {children}
    </m.div>
  );
}

/** Kinetic headline: masked word-by-word rise on load. Parts let one phrase
 *  carry a gradient class while the rest stays plain. */
export function KineticHeadline({
  parts,
  className,
  delay = 0.1,
  step = 0.05,
  as: Tag = "h1",
}: {
  parts: { text: string; className?: string }[];
  className?: string;
  delay?: number;
  step?: number;
  as?: "h1" | "h2";
}) {
  const words: { word: string; cls?: string; key: string }[] = [];
  for (const part of parts) {
    for (const word of part.text.split(/\s+/)) {
      if (word) words.push({ word, cls: part.className, key: `${word}-${words.length}` });
    }
  }

  return (
    <Tag className={`fw ${className ?? ""}`}>
      {words.map((w, i) => (
        <span key={w.key} className="inline-block overflow-hidden align-bottom">
          <m.span
            className={`inline-block ${w.cls ?? ""}`}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: DUR.hero, ease: EASE, delay: delay + i * step }}
          >
            {w.word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </m.span>
        </span>
      ))}
    </Tag>
  );
}

/** Animated statistic: counts up once when it enters view, writing straight to
 *  the DOM node (no per-frame React re-renders). SSR ships the final value so
 *  no-JS visitors always see the real number. */
export function Counter({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    if (!inView || reduced) return;
    const node = ref.current;
    if (!node) return;
    const duration = 1500;
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      node.textContent = format(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, to, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={`fw ${className ?? ""}`}>
      {format(to)}
    </span>
  );
}

/** Scroll-linked parallax (Tier 1 — skipped entirely for reduced motion). */
export function Parallax({
  children,
  className,
  distance = 40,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <div ref={ref} className={className}>
      <m.div className="fw" style={reduced ? undefined : { y }}>
        {children}
      </m.div>
    </div>
  );
}

/** A band entry: plain text, or a client whose logo sits above its name. */
export type MarqueeEntry = { name: string; logo?: string };

/** Logo slot for a band entry. Must be a file served from `public/` — the
 *  /uploads/* route returns 401 without a session, so an anonymous visitor
 *  could never load a consultancy's uploaded logo. A file that goes missing
 *  hides itself instead of leaving a broken image in the band. */
function MarqueeLogo({ src, name, slot }: { src: string; name: string; slot: boolean }) {
  const [failed, setFailed] = useState(false);
  const wrap = slot ? "flex h-10 items-center justify-center" : "flex items-center";
  if (failed) return <span className={wrap} aria-hidden="true" />;
  return (
    <span className={wrap}>
      <Image
        src={src}
        alt={`${name} logo`}
        width={160}
        height={40}
        onError={() => setFailed(true)}
        className="h-10 w-[160px] object-contain"
      />
    </span>
  );
}

/** Infinite band with a visible pause control (WCAG 2.2.2). Duplicated
 *  rows keep the -50% loop seamless; stops dead under prefers-reduce.
 *  Items may be plain strings or { name, logo } — when any entry carries a
 *  logo, every slot reserves the same height so the names share one baseline. */
export function Marquee({
  items,
  label,
  duration = 44,
}: {
  items: (string | MarqueeEntry)[];
  label: string;
  duration?: number;
}) {
  const [paused, setPaused] = useState(false);
  const hasLogo = items.some((item) => typeof item === "object" && Boolean(item.logo));

  const row = (rowKey: string, hidden: boolean) => (
    <div key={rowKey} aria-hidden={hidden || undefined} className="flex items-center shrink-0">
      {items.map((item, i) => {
        const entry: MarqueeEntry = typeof item === "string" ? { name: item } : item;
        return (
          <span key={`${rowKey}-${entry.name}-${i}`} className="flex items-center">
            <span className="flex flex-col items-center gap-2 px-7">
              {entry.logo ? (
                <MarqueeLogo src={entry.logo} name={entry.name} slot={hasLogo} />
              ) : (
                <span className={hasLogo ? "h-10" : "hidden"} />
              )}
              <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {entry.name}
              </span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="relative" role="region" aria-label={label}>
      <div className="marquee-mask overflow-hidden py-5">
        <div
          className="marquee-track"
          data-paused={paused}
          style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
        >
          {row("a", false)}
          {row("b", true)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:ring-slate-300 shadow-sm transition-colors"
      >
        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
          {paused ? "play_arrow" : "pause"}
        </span>
        {paused ? "Play" : "Pause"}
      </button>
    </div>
  );
}

/** Eyebrow pill used above every section heading. */
export function Eyebrow({
  children,
  className,
  dot = false,
}: {
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-indigo-50 ring-1 ring-indigo-200 px-3.5 py-1 font-label-pill text-label-pill uppercase tracking-wider text-indigo-700 ${className ?? ""}`}
    >
      {dot && <span className="motion-pulse h-1.5 w-1.5 rounded-full bg-cyan-500" />}
      {children}
    </span>
  );
}

/* ── Motion 2.0 primitives ──────────────────────────────────────────────
   Pointer-reactive and narrative add-ons. Every primitive early-returns
   for reduced-motion users and coarse pointers; transforms stay
   compositor-only and loop purely via CSS (see tailwind.css). */

/** Magnetic hover: the element leans toward the cursor and springs back
 *  on leave. Fine pointers only; inert for reduced motion. */
export function Magnetic({
  children,
  className,
  strength = 0.22,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const armed = useRef(false);
  const xRaw = useMotionValue(0);
  const yRaw = useMotionValue(0);
  const x = useSpring(xRaw, { stiffness: 200, damping: 18, mass: 0.6 });
  const y = useSpring(yRaw, { stiffness: 200, damping: 18, mass: 0.6 });

  useEffect(() => {
    armed.current = !reduced && window.matchMedia("(pointer: fine)").matches;
  }, [reduced]);

  return (
    <m.div
      ref={ref}
      className={`inline-block ${className ?? ""}`}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (!armed.current || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        xRaw.set((e.clientX - (r.left + r.width / 2)) * strength);
        yRaw.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        xRaw.set(0);
        yRaw.set(0);
      }}
    >
      {children}
    </m.div>
  );
}

/** Pointer 3D tilt with a tracked glare sheen (see .tilt-host in
 *  tailwind.css). Springs back to flat on pointer leave. */
export function Tilt({
  children,
  className,
  max = 4,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useSyncExternalStore(subscribeFinePointer, getFinePointer, getFinePointerServer);
  const rx = useSpring(0, { stiffness: 160, damping: 20 });
  const ry = useSpring(0, { stiffness: 160, damping: 20 });

  const active = !reduced && fine;

  return (
    <m.div
      ref={ref}
      className={`tilt-host relative ${className ?? ""}`}
      style={active ? { rotateX: rx, rotateY: ry, transformPerspective: 1200 } : undefined}
      onPointerMove={(e) => {
        if (!active || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * max * 2);
        rx.set(-(py - 0.5) * max * 2);
        ref.current.style.setProperty("--gx", `${px * 100}%`);
        ref.current.style.setProperty("--gy", `${py * 100}%`);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
      <span aria-hidden className="tilt-glare" />
    </m.div>
  );
}

/** Stagger child + cursor-following spotlight highlight (see
 *  .spotlight-card). Carries the reveal cascade so grids keep their
 *  60ms stagger while gaining the pointer-tracked light. */
export function SpotlightItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  return (
    <m.div
      ref={ref}
      variants={revealVariants}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 340, damping: 24 }}
      className={`fw spotlight-card ${className ?? ""}`}
      onPointerMove={(e) => {
        if (reduced || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        ref.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
        ref.current.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </m.div>
  );
}

/** Scroll-triggered word-by-word masked rise for editorial statements.
 *  Unlike KineticHeadline (load-time) this waits for viewport entry. */
export function WordReveal({
  text,
  className,
  step = 0.015,
}: {
  text: string;
  className?: string;
  step?: number;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <m.span
      className={`fw ${className ?? ""}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: step } } }}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden align-bottom">
          <m.span
            className="inline-block"
            variants={{
              hidden: { y: "110%", opacity: 0 },
              show: { y: "0%", opacity: 1, transition: { duration: DUR.hero, ease: EASE } },
            }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </m.span>
        </span>
      ))}
    </m.span>
  );
}

"use client";

import {
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* ── Motion language tokens (locked — see tailwind.css header) ─────────────── */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const DUR = { micro: 0.2, ui: 0.4, card: 0.4, hero: 0.7, big: 0.8 } as const;
export const STAGGER = 0.06;

/** Single element: 16px rise + fade, decelerating into rest. */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.card, ease: EASE } },
};

/** Container: 60ms cascade top-to-bottom, capped by child count. */
export const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER, delayChildren: 0.05 } },
};

/**
 * Wraps the landing page in framer-motion's tiered reduced-motion config:
 * transform/layout animations are dropped for users who ask for reduce,
 * opacity and colour transitions survive (Tier 2/3 from accessible-animation).
 */
export function MotionShell({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

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
    <motion.div
      className={`fw ${className ?? ""}`}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: DUR.card, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container — direct children should be motion elements carrying
 *  `variants={revealVariants}` (see Item) for the 60ms cascade. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={`fw ${className ?? ""}`}
      variants={groupVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

/** Stagger item — plain container that inherits the parent cascade. */
export function Item({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={`fw ${className ?? ""}`} variants={revealVariants}>
      {children}
    </motion.div>
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
  const words: { word: string; cls?: string }[] = [];
  for (const part of parts) {
    for (const word of part.text.split(/\s+/)) {
      if (word) words.push({ word, cls: part.className });
    }
  }

  return (
    <Tag className={`fw ${className ?? ""}`}>
      {words.map((w, i) => (
        <span key={`${w.word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className={`inline-block ${w.cls ?? ""}`}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: DUR.hero, ease: EASE, delay: delay + i * step }}
          >
            {w.word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
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
      <motion.div className="fw" style={reduced ? undefined : { y }}>
        {children}
      </motion.div>
    </div>
  );
}

/** Infinite text band with a visible pause control (WCAG 2.2.2). Duplicated
 *  rows keep the -50% loop seamless; stops dead under prefers-reduce. */
export function Marquee({
  items,
  label,
  duration = 44,
}: {
  items: string[];
  label: string;
  duration?: number;
}) {
  const [paused, setPaused] = useState(false);

  const row = (rowKey: string, hidden: boolean) => (
    <div key={rowKey} aria-hidden={hidden || undefined} className="flex items-center shrink-0">
      {items.map((text, i) => (
        <span key={`${rowKey}-${i}`} className="flex items-center">
          <span className="px-7 text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {text}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/80" />
        </span>
      ))}
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
        className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:ring-white/25 transition-colors"
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
      className={`inline-flex items-center gap-2 rounded-full bg-indigo-500/10 ring-1 ring-indigo-400/25 px-3.5 py-1 font-label-pill text-label-pill uppercase tracking-wider text-indigo-300 ${className ?? ""}`}
    >
      {dot && <span className="motion-pulse w-1.5 h-1.5 rounded-full bg-cyan-400" />}
      {children}
    </span>
  );
}

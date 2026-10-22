import type { Variants } from "framer-motion";

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

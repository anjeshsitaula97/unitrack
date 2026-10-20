"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Eyebrow, Parallax, Reveal, Stagger, revealVariants } from "./motion";
import BrowserFrame from "./BrowserFrame";

const COUNTRIES = [
  {
    code: "AU",
    name: "Australia",
    visa: "Subclass 500 Visa",
    tag: "CRICOS",
    rows: [
      { k: "Avg COE Turnaround:", v: "3-5 Days", accent: false },
      { k: "GTE Assessment Engine:", v: "Pre-Integrated", accent: true },
      { k: "Embassy Visa Success:", v: "99.4%", accent: false },
    ],
    footer: "180+ Active Universities",
  },
  {
    code: "CA",
    name: "Canada",
    visa: "Study Permit (SDS / Non-SDS)",
    tag: "DLI Sync",
    rows: [
      { k: "PAL Verification:", v: "Automated", accent: true },
      { k: "GIC Bank Tracking:", v: "Integrated", accent: false },
      { k: "Visa Approval Rate:", v: "97.8%", accent: false },
    ],
    footer: "210+ Colleges & Universities",
  },
  {
    code: "UK",
    name: "United Kingdom",
    visa: "Student Route (CAS)",
    tag: "UCAS Ready",
    rows: [
      { k: "CAS Issuance Speed:", v: "48 Hours", accent: false },
      { k: "28-Day Bank Rules:", v: "Auto Calculator", accent: true },
      { k: "Visa Approval Rate:", v: "99.1%", accent: false },
    ],
    footer: "140+ Russell & Modern Unis",
  },
  {
    code: "US",
    name: "United States",
    visa: "F-1 Student Visa",
    tag: "SEVIS / I-20",
    rows: [
      { k: "DS-160 Prep Audit:", v: "Standardized", accent: true },
      { k: "Mock Visa Interview LMS:", v: "Included", accent: false },
      { k: "Offer Ratio:", v: "96.5%", accent: false },
    ],
    footer: "300+ Accredited Campuses",
  },
];

export default function Destinations() {
  return (
    <section
      id="university-network"
      className="relative w-full bg-[#05060b] py-16 lg:py-24 scroll-mt-28"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <Reveal className="lg:col-span-7 space-y-5">
            <div className="space-y-4">
              <Eyebrow>Global Jurisdiction Matrix</Eyebrow>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
                Automated Rules for <span className="text-grad">Every Major Study Destination</span>
              </h2>
            </div>
            <p className="font-body-md text-body-md text-slate-400 max-w-xl">
              Each country comes pre-configured with embassy checklists, financial formula
              calculators, and immigration compliance frameworks.
            </p>
            <motion.a
              href="#live-demo"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 24 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold shadow-[0_16px_36px_-14px_rgba(99,102,241,0.8)] ring-1 ring-white/15 hover:from-indigo-400 hover:to-violet-400 transition-colors"
            >
              Explore University Network
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </motion.a>
          </Reveal>

          <Parallax className="lg:col-span-5" distance={28}>
            <BrowserFrame url="app.unitrack.io/universities">
              <Image
                src="/screenshots/universities.png"
                alt="UniTrack University Network — 15+ ranked institutions across AU, CA, UK, US"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-top"
              />
            </BrowserFrame>
          </Parallax>
        </div>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {COUNTRIES.map((c) => (
            <motion.article
              key={c.code}
              variants={revealVariants}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 340, damping: 24 }}
              className="fw group rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.08] p-5 space-y-4 glow-hover hover:ring-indigo-400/30 transition-[ring-color] duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-[15px]">
                    {c.code}
                  </div>
                  <div>
                    <div className="text-[18px] text-white font-bold font-headline-sm">
                      {c.name}
                    </div>
                    <div className="text-[12px] text-slate-500">{c.visa}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/25 text-indigo-300 font-label-pill text-[11px]">
                  {c.tag}
                </span>
              </div>
              <div className="space-y-3 text-body-sm text-body-sm">
                {c.rows.map((row) => (
                  <div key={row.k} className="flex justify-between gap-3">
                    <span className="text-slate-500">{row.k}</span>
                    <span
                      className={`font-semibold ${row.accent ? "text-indigo-300" : "text-slate-200"}`}
                    >
                      {row.v}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-white/[0.07] text-label-pill text-label-pill uppercase text-grad font-bold">
                {c.footer}
              </div>
            </motion.article>
          ))}
        </Stagger>
      </div>

      <div aria-hidden className="hairline mt-16 max-w-[1440px] mx-auto" />
    </section>
  );
}

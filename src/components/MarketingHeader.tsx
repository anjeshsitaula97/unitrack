"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, m, useMotionValueEvent, useScroll } from "framer-motion";

const NAV_LINKS = [
  { label: "Overview", href: "#overview" },
  { label: "Features", href: "#features" },
  { label: "Universities", href: "#university-network" },
  { label: "Student CRM", href: "#crm-showcase" },
  { label: "Visa Tools", href: "#university-network" },
  { label: "Pricing", href: "#pricing" },
  { label: "Live Demo", href: "#live-demo" },
];

export default function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <header className="fixed top-0 left-0 w-full z-50 pointer-events-none pt-3 sm:pt-4 px-3 sm:px-6 lg:px-8">
      <div className="relative max-w-[1360px] mx-auto pointer-events-auto">
        <div
          className={`relative bg-[#0a0b13]/85 backdrop-blur-2xl ring-1 rounded-2xl overflow-hidden shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)] transition-[background-color,ring-color] duration-300 ${
            scrolled ? "bg-[#0a0b13]/95 ring-white/15" : "ring-white/10"
          }`}
        >
          {/* Scroll progress hairline */}
          <m.div
            aria-hidden
            className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-indigo-500 via-violet-400 to-cyan-400"
            style={{ scaleX: scrollYProgress }}
          />

          {/* Main nav row */}
          <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-4">
            {/* Logo */}
            <a href="#overview" className="flex items-center gap-3 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 ring-1 ring-white/20 shadow-lg shadow-indigo-900/50 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                <span className="material-symbols-outlined text-white text-[20px]">hub</span>
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-headline-sm text-[15px] font-bold tracking-tight text-white">
                  UniTrack
                </span>
                <span className="text-[10px] uppercase tracking-widest text-indigo-300/80 font-bold">
                  By Avenlixx
                </span>
              </div>
            </a>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 overflow-hidden">
              {NAV_LINKS.map((link, i) => (
                <a
                  key={link.label + i}
                  href={link.href}
                  className={`px-3 py-2 text-[13px] font-medium rounded-full transition-colors ${
                    i === 0
                      ? "bg-white/10 text-white ring-1 ring-white/10 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 text-[13px] font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-full transition-colors"
              >
                Login
              </Link>
              <a
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-full ring-1 ring-white/15 shadow-lg shadow-indigo-950/60 hover:from-indigo-400 hover:to-violet-400 transition-colors motion-cta"
                href="#live-demo"
              >
                <span>Book a Demo</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.06] ring-1 ring-white/10 text-slate-300 hover:text-white hover:bg-white/[0.1] transition-colors"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileOpen}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {mobileOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <m.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden absolute left-0 right-0 mt-2 bg-[#0a0b13]/97 backdrop-blur-2xl rounded-2xl ring-1 ring-white/12 shadow-2xl px-4 py-3 space-y-1 overflow-hidden z-50"
            >
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm mb-1 text-center"
              >
                Login to UniTrack
              </Link>
              {NAV_LINKS.map((link, i) => (
                <a
                  key={link.label + i}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-slate-300 hover:bg-white/[0.06] hover:text-white text-sm font-medium transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#live-demo"
                onClick={() => setMobileOpen(false)}
                className="block w-full px-4 py-2.5 rounded-xl bg-white/[0.06] ring-1 ring-white/10 text-white font-semibold text-sm text-center mt-2"
              >
                Book a Demo
              </a>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

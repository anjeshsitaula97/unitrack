"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Overview", href: "#overview" },
  { label: "Features", href: "#features" },
  { label: "University Network", href: "#university-network" },
  { label: "Student CRM", href: "#crm-showcase" },
  { label: "Visa Automation", href: "#university-network" },
  { label: "Pricing", href: "#pricing" },
  { label: "Live Demo", href: "#live-demo" },
];

export default function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 pointer-events-none pt-3 sm:pt-4 px-3 sm:px-6 lg:px-8">
      <div className="relative max-w-[1360px] mx-auto pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-2xl shadow-lg shadow-slate-900/5 ring-1 ring-slate-200 rounded-2xl overflow-hidden">
          {/* Main nav row */}
          <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-4">
            {/* Logo */}
            <a href="#overview" className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-600 text-[20px]">hub</span>
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-headline-sm text-[15px] font-bold tracking-tight text-slate-900">UniTrack</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">By Avenlixx</span>
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
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
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
                className="hidden sm:inline-flex items-center px-4 py-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              >
                Login
              </Link>
              <a
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
                href="#live-demo"
              >
                <span>Book a Demo</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                aria-label="Toggle navigation menu"
              >
                <span className="material-symbols-outlined text-[18px]">{mobileOpen ? "close" : "menu"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="lg:hidden absolute left-0 right-0 mt-2 mx-0 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-lg border border-slate-200 px-4 py-3 space-y-1 overflow-hidden z-50">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block w-full px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-semibold text-sm mb-1 text-center"
            >
              Login to UniTrack
            </Link>
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.label + i}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#live-demo"
              onClick={() => setMobileOpen(false)}
              className="block w-full px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm text-center mt-2"
            >
              Book a Demo
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
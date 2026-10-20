import MarketingHeader from "@/components/MarketingHeader";
import PricingSection from "@/components/PricingSection";
import { Marquee, MotionShell } from "@/components/landing/motion";
import Hero from "@/components/landing/Hero";
import Showcase from "@/components/landing/Showcase";
import { Operations, Pillars } from "@/components/landing/Features";
import Destinations from "@/components/landing/Destinations";
import { BottomCta, Spotlight } from "@/components/landing/Story";

const CAPABILITIES = [
  "CRICOS Ready",
  "UCAS / Direct",
  "DLI Sync",
  "SEVP · SEVIS",
  "IELTS · PTE · TOEFL",
  "GTE Engine",
  "NepalPay · SWIFT",
  "WhatsApp Cloud API",
  "Biometric Attendance",
  "FERPA Verified",
  "GDPR Audited",
  "ISO 27001 Ready",
];

export default function LandingPage() {
  return (
    <MotionShell>
      <div className="bg-[#05060b] font-body-md text-body-md text-slate-300 min-h-screen">
        <style>{`
        html, body { background: #05060b; }
        html { scroll-behavior: smooth; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
        {/* Without JS the framer initial styles would hide content — .fw forces
            every reveal back to its visible resting state. */}
        <noscript>
          <style>{`.fw, .fw * { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>

        <MarketingHeader />

        <main className="w-full">
          <Hero />

          {/* Capability band — infinite marquee with a pause control (WCAG 2.2.2) */}
          <div className="relative border-y border-white/[0.06] bg-[#070912]">
            <Marquee items={CAPABILITIES} label="Platform capabilities" />
          </div>

          <Showcase />
          <Pillars />
          <Operations />
          <Destinations />
          <Spotlight />
          <PricingSection />
          <BottomCta />
        </main>

        <SiteFooter />
      </div>
    </MotionShell>
  );
}

function SiteFooter() {
  return (
    <footer className="w-full bg-[#030408] text-white pt-16 pb-10 border-t border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 ring-1 ring-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]">hub</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-white font-bold">
                UniTrack
              </span>
            </div>
            <p className="font-body-md text-body-md text-slate-400 max-w-sm">
              Enterprise operating intelligence platform built for leading education consultancies,
              global study abroad advisors, and cross-border university admission agencies.
            </p>
            <div className="pt-2 flex items-center gap-2 font-label-pill text-label-pill text-indigo-300">
              <span className="motion-pulse w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <span>Live Global Uptime: 99.98% Available</span>
            </div>
          </div>
          <div>
            <div className="font-headline-sm text-headline-sm text-white mb-4">Product Matrix</div>
            <ul className="space-y-2.5 font-body-sm text-body-sm text-slate-400">
              <li>
                <a className="hover:text-indigo-300 transition-colors" href="#overview">
                  Unified Overview
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-300 transition-colors" href="#features">
                  Platform Features
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-300 transition-colors" href="#crm-showcase">
                  Applicant CRM
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-300 transition-colors" href="#university-network">
                  Visa Workflow Engine
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-300 transition-colors" href="#university-network">
                  Institution Registry
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-300 transition-colors" href="#pricing">
                  Consultancy Tiers
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-300 transition-colors" href="#operations">
                  Leads Management
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-300 transition-colors" href="#operations">
                  HR &amp; Payroll
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-300 transition-colors" href="#operations">
                  Attendance &amp; Payslips
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-300 transition-colors" href="#operations">
                  Payments &amp; Expenses
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-headline-sm text-headline-sm text-white mb-4">Contact us</div>
            <ul className="space-y-3 font-body-sm text-body-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-[18px]">
                  location_on
                </span>
                <span>
                  <span className="block text-slate-300">Headquarters</span>
                  Buddhnagar-10, Kathmandu 44600, Nepal
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-[18px]">mail</span>
                <span>
                  <span className="block text-slate-300">Inquiries &amp; RFPs</span>
                  <a
                    className="hover:text-indigo-300 transition-colors"
                    href="mailto:support@unitrackcrm.com"
                  >
                    support@unitrackcrm.com
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-[18px]">call</span>
                <span>
                  <span className="block text-slate-300">Phone</span>
                  <a className="hover:text-indigo-300 transition-colors" href="tel:+9779717111363">
                    +977 9717111363
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-[18px]">
                  schedule
                </span>
                <span>
                  <span className="block text-slate-300">Operation Hours</span>
                  Sunday – Friday: 9:00 AM – 6:30 PM (NPT / UTC+5:45)
                </span>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-headline-sm text-headline-sm text-white mb-4">
              Trust &amp; Compliance
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/[0.05] ring-1 ring-white/[0.08]">
                <div className="font-label-pill text-label-pill uppercase text-indigo-200 mb-1">
                  FERPA Verified
                </div>
                <div className="font-body-sm text-body-sm text-slate-400">
                  Student education record data safeguard compliance.
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.05] ring-1 ring-white/[0.08]">
                <div className="font-label-pill text-label-pill uppercase text-indigo-200 mb-1">
                  GDPR Audited
                </div>
                <div className="font-body-sm text-body-sm text-slate-400">
                  End-to-end encrypted European data standards.
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.05] ring-1 ring-white/[0.08]">
                <div className="font-label-pill text-label-pill uppercase text-indigo-200 mb-1">
                  ISO 27001 Ready
                </div>
                <div className="font-body-sm text-body-sm text-slate-400">
                  Enterprise Grade Cloud Sec-Ops architecture.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 mt-2 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-slate-500">
          <p>
            &copy; 2025 UniTrack by Avenlixx Technologies. All rights reserved. Registered across
            international jurisdictions.
          </p>
          <div className="flex items-center gap-6">
            <a className="hover:text-indigo-300 transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-indigo-300 transition-colors" href="#">
              Terms of Service
            </a>
            <a className="hover:text-indigo-300 transition-colors" href="#">
              Security Center
            </a>
            <a className="hover:text-indigo-300 transition-colors" href="#">
              Status Portal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import DemoForm from "@/components/DemoForm";
import { Eyebrow, Reveal, WordReveal } from "./motion";

export function Spotlight() {
  return (
    <section className="relative w-full bg-slate-50 py-16 lg:py-24 scroll-mt-28">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_40px_90px_-50px_rgba(49,46,129,0.3)] ring-1 ring-slate-200 lg:p-12">
          <div
            aria-hidden
            className="motion-drift-slow absolute -right-24 -bottom-24 h-[420px] w-[420px] rounded-full bg-indigo-200/60 blur-[110px]"
          />
          <span
            aria-hidden
            className="motion-float absolute top-2 right-8 select-none text-[150px] leading-none font-black text-indigo-900/[0.06]"
          >
            &ldquo;
          </span>

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <Reveal className="lg:col-span-7 space-y-6">
              <Eyebrow dot>Customer Story &bull; Kathmandu</Eyebrow>
              <blockquote className="font-headline-md text-headline-md leading-snug text-slate-900">
                <WordReveal
                  step={0.012}
                  text="“UniTrack cut our visa filing time from 14 days down to 48 hours. Our counselors stopped juggling Excel sheets, nothing gets lost, and our university commission payouts are accurate to the rupee.”"
                />
              </blockquote>
              <div className="flex items-center gap-4 pt-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-headline-sm flex items-center justify-center font-bold ring-1 ring-slate-100">
                  RC
                </div>
                <div>
                  <div className="font-headline-sm text-[16px] text-slate-900 font-semibold">
                    Rohan Chitrakar
                  </div>
                  <div className="font-body-sm text-body-sm text-slate-500">
                    Managing Director, Apex Global Education Consultancies (Kathmandu, Pokhara &amp;
                    Sydney)
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="lg:col-span-5 rounded-2xl bg-indigo-50/60 ring-1 ring-indigo-100 p-6 lg:p-8 flex items-center justify-center">
              <Link
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 ring-1 ring-slate-200 text-slate-800 font-label-btn text-label-btn shadow-sm transition-colors motion-cta"
                href="/customer-story"
              >
                <span>Read the Full Story</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BottomCta() {
  return (
    <section
      id="live-demo"
      className="relative w-full bg-white py-16 lg:py-24 scroll-mt-28 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-6 ring-1 ring-indigo-400/40 shadow-[0_50px_110px_-40px_rgba(79,70,229,0.65)] lg:p-12">
          {/* Ambient light drifting across the gradient card */}
          <div
            aria-hidden
            className="motion-drift absolute -top-32 right-[-12%] h-[560px] w-[560px] rounded-full bg-white/10 blur-[130px]"
          />
          <div
            aria-hidden
            className="motion-drift-slow absolute -bottom-40 -left-24 h-[460px] w-[460px] rounded-full bg-cyan-300/15 blur-[120px]"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <Reveal className="lg:col-span-7 space-y-5">
              <Eyebrow dot>Live Demo</Eyebrow>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
                Ready to <span className="text-cyan-200">Simplify Your Consultancy?</span>
              </h2>
              <p className="font-body-md text-body-md text-indigo-100 max-w-xl">
                Book a walkthrough at our Kathmandu office, or get a free trial account with sample
                student profiles in under 60 minutes.
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-2 font-body-sm text-body-sm">
                <span className="flex items-center gap-1.5 text-cyan-200">
                  <span className="material-symbols-outlined text-[16px]">check</span> Free
                  counselor training
                </span>
                <span className="flex items-center gap-1.5 text-cyan-200">
                  <span className="material-symbols-outlined text-[16px]">check</span> We move your
                  existing data for free
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.12} className="lg:col-span-5">
              <DemoForm />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

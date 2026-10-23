"use client";

import Image from "next/image";
import { m } from "framer-motion";
import { Eyebrow, Parallax, Reveal } from "./motion";
import BrowserFrame from "./BrowserFrame";

export default function Destinations() {
  return (
    <section
      id="university-network"
      className="relative w-full bg-white py-16 lg:py-24 scroll-mt-28"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <Reveal className="lg:col-span-7 space-y-5">
            <div className="space-y-4">
              <Eyebrow>Study Destinations</Eyebrow>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900">
                Set Up for <span className="text-grad">Every Major Destination</span>
              </h2>
            </div>
            <p className="font-body-md text-body-md text-slate-600 max-w-xl">
              Each country comes ready with embassy checklists, money and funds calculators, and
              visa rules already set up.
            </p>
            <m.a
              href="#live-demo"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 24 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-[0_16px_36px_-14px_rgba(99,102,241,0.6)] ring-1 ring-white/20 hover:from-indigo-500 hover:to-violet-500 transition-colors"
            >
              Explore Universities
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </m.a>
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
      </div>

      <div aria-hidden className="hairline mt-16 max-w-[1440px] mx-auto" />
    </section>
  );
}

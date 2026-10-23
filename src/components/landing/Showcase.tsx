"use client";

import Image from "next/image";
import { m, useReducedMotion } from "framer-motion";
import { Reveal, Eyebrow, Tilt } from "./motion";
import { DUR, EASE } from "./motion-tokens";
import BrowserFrame from "./BrowserFrame";

export default function Showcase() {
  const reduced = useReducedMotion();

  return (
    <section
      className="relative w-full bg-white py-16 lg:py-24 scroll-mt-28 overflow-hidden"
      id="crm-showcase"
    >
      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 space-y-10">
        <Reveal className="max-w-3xl space-y-4">
          <Eyebrow dot>Student CRM · Dashboard</Eyebrow>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900">
            One Dashboard for <span className="text-grad">All Your Student Work</span>
          </h2>
        </Reveal>

        {/* Entrance: rise and settle; once landed, Tilt adds pointer 3D
            rotation with a tracked glare. reducedMotion drops transforms
            to opacity fades. */}
        <m.div
          className="fw"
          initial={{ opacity: 0, y: reduced ? 0 : 56, scale: reduced ? 1 : 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: DUR.big, ease: EASE }}
        >
          <Tilt max={4}>
            <BrowserFrame url="unitrackcrm.com/dashboard">
              <Image
                src="/screenshots/dashboard.png"
                alt="UniTrack Admin Dashboard — Real-time pipeline, analytics, and commission tracking"
                fill
                sizes="(max-width: 1440px) 100vw, 1440px"
                className="object-cover object-top"
              />
            </BrowserFrame>
          </Tilt>
        </m.div>
      </div>
    </section>
  );
}

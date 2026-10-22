"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { m, useReducedMotion } from "framer-motion";
import { Reveal, Eyebrow } from "./motion";
import { DUR, EASE } from "./motion-tokens";
import BrowserFrame from "./BrowserFrame";

const CoreScene = dynamic(() => import("./CoreScene"), { ssr: false });

export default function Showcase() {
  const reduced = useReducedMotion();

  return (
    <section
      className="relative w-full bg-[#070912] py-16 lg:py-24 scroll-mt-28 overflow-hidden"
      id="crm-showcase"
    >
      {/* WebGL platform core behind the frame — the "system" made visible. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,transparent_20%,#070912_75%)]" />
        <CoreScene className="absolute inset-0 h-full w-full" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 space-y-10">
        <Reveal className="max-w-3xl space-y-4">
          <Eyebrow dot>Student CRM · Dashboard</Eyebrow>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
            One Dashboard for <span className="text-grad">All Your Student Work</span>
          </h2>
        </Reveal>

        {/* Scroll-linked tilt: frame starts pitched back and settles flat as it
            enters. reducedMotion="user" drops the transform and fades only. */}
        <div style={{ perspective: 1600 }}>
          <m.div
            className="fw"
            initial={{
              opacity: 0,
              y: reduced ? 0 : 56,
              rotateX: reduced ? 0 : 14,
              scale: reduced ? 1 : 0.95,
            }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: DUR.big, ease: EASE }}
          >
            <BrowserFrame url="unitrackcrm.com/dashboard">
              <Image
                src="/screenshots/dashboard.png"
                alt="UniTrack Admin Dashboard — Real-time pipeline, analytics, and commission tracking"
                fill
                sizes="(max-width: 1440px) 100vw, 1440px"
                className="object-cover object-top"
              />
            </BrowserFrame>
          </m.div>
        </div>
      </div>
    </section>
  );
}

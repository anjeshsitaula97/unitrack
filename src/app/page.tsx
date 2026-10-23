import MarketingHeader from "@/components/MarketingHeader";
import PricingSection from "@/components/PricingSection";
import { MotionShell } from "@/components/landing/motion";
import CustomerBand from "@/components/landing/CustomerBand";
import SiteFooter from "@/components/landing/SiteFooter";
import Hero from "@/components/landing/Hero";
import Showcase from "@/components/landing/Showcase";
import Journey from "@/components/landing/Journey";
import { Operations, Pillars } from "@/components/landing/Features";
import Destinations from "@/components/landing/Destinations";
import { BottomCta, Spotlight } from "@/components/landing/Story";

/**
 * The customer band reads the Consultancy table, and the query result would
 * otherwise be baked into the static HTML at build time and never change. One
 * hour keeps a newly added workspace appearing without a deploy while visitors
 * still never pay for the query.
 */
export const revalidate = 3600;

export default function LandingPage() {
  return (
    <MotionShell>
      <div className="bg-white font-body-md text-body-md text-slate-600 min-h-screen">
        <style>{`
        html, body { background: #ffffff; }
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

          <Showcase />
          <Journey />
          <Pillars />
          <Operations />
          <Destinations />

          {/* Customers band — auto-scrolling, fed by the consultancies on the system */}
          <CustomerBand />

          <Spotlight />
          <PricingSection />
          <BottomCta />
        </main>

        <SiteFooter />
      </div>
    </MotionShell>
  );
}

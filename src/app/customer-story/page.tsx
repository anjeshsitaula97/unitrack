import type { Metadata } from "next";
import Link from "next/link";
import MarketingHeader from "@/components/MarketingHeader";
import SiteFooter from "@/components/landing/SiteFooter";
import {
  Counter,
  Eyebrow,
  Item,
  KineticHeadline,
  MotionShell,
  Reveal,
  Stagger,
} from "@/components/landing/motion";

export const metadata: Metadata = {
  title: "Customer Story — Apex Global Education Consultancies | UniTrack",
  description:
    "How a three-branch consultancy in Kathmandu, Pokhara and Sydney cut visa filing from 14 days to 48 hours and stopped missing deadlines after moving onto UniTrack.",
};

/** Modules this client runs in production, mirroring the product sections. */
const MODULES = [
  {
    icon: "groups",
    title: "Leads & enquiries",
    body: "Every enquiry from every branch lands in one queue with an owner, a source and a follow-up date, so nothing depends on who remembered to write it down.",
  },
  {
    icon: "workspace_premium",
    title: "IELTS and PTE classes",
    body: "Batches, rosters and results sit against the student file, so counselors see test progress before they talk about universities.",
  },
  {
    icon: "description",
    title: "Document vault",
    body: "Transcripts, passports and financial statements are versioned per student with the expiry dates that matter for each country's checklist.",
  },
  {
    icon: "flight_takeoff",
    title: "Applications and offers",
    body: "Applications move through university stages with statuses that update as replies arrive, instead of living in a spreadsheet column.",
  },
  {
    icon: "payments",
    title: "Commission and settlement",
    body: "University commissions, branch splits and sub-agent shares are calculated from the placement record, and each payout leaves an auditable trail.",
  },
  {
    icon: "verified",
    title: "Deadlines and alerts",
    body: "Intake closings, document expiries and visa appointment dates raise reminders to the counselor responsible, not to a shared inbox.",
  },
];

/** The figures quoted in the customer story card, with the context behind them. */
const RESULTS = [
  {
    to: 48,
    decimals: 0,
    prefix: "",
    suffix: " hrs",
    label: "Visa filing time",
    note: "Down from an average of 14 days, measured across the six months after go-live.",
  },
  {
    to: 320,
    decimals: 0,
    prefix: "+",
    suffix: "%",
    label: "Counselor productivity",
    note: "More files carried per counselor without adding headcount at any branch.",
  },
  {
    to: 100,
    decimals: 0,
    suffix: "%",
    label: "Sub-agent transparency",
    note: "Every affiliate sees the status of the students they referred, and nothing else.",
  },
];

const SWITCH_STEPS = [
  {
    title: "Their data came in, not retyped",
    body: "Existing student records were moved across by the UniTrack team as part of onboarding — no re-entry week, no parallel spreadsheet kept alive “just in case”.",
  },
  {
    title: "Counselors were trained on their own files",
    body: "Onboarding used the consultancy's real batches and real university list rather than a demo dataset, so the first session ended with work actually done.",
  },
  {
    title: "Branch reporting switched on day one",
    body: "Kathmandu, Pokhara and Sydney started reporting from the same pipeline, which is what made the commission settlement conversation possible at all.",
  },
];

export default function CustomerStoryPage() {
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
        <noscript>
          <style>{`.fw, .fw * { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>

        <MarketingHeader />

        <main className="w-full pt-28 lg:pt-32">
          {/* Story header */}
          <section className="relative w-full bg-white py-12 lg:py-16">
            <div className="max-w-[1080px] mx-auto px-6 lg:px-12">
              <Reveal className="space-y-5">
                <Eyebrow dot>Customer Story &bull; Kathmandu</Eyebrow>
                <KineticHeadline
                  delay={0.12}
                  parts={[
                    { text: "From 14 Days" },
                    { text: "To 48 Hours", className: "text-grad" },
                  ]}
                />
                <p className="font-body-lg text-body-lg max-w-3xl leading-relaxed text-slate-600">
                  Apex Global Education Consultancies runs three branches across two countries. For
                  years the visa desk ran on Excel, a shared drive and whoever remembered which
                  student was waiting on which document. This is how that changed &mdash; and what
                  the numbers looked like six months later.
                </p>
              </Reveal>

              <Reveal delay={0.2} className="pt-8">
                <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200/80 md:grid-cols-4">
                  {[
                    { k: "Client", v: "Apex Global Education" },
                    { k: "Sector", v: "Study abroad consultancy" },
                    { k: "Branches", v: "Kathmandu · Pokhara · Sydney" },
                    { k: "Review window", v: "First 6 months" },
                  ].map((row) => (
                    <div key={row.k}>
                      <dt className="font-label-pill text-label-pill uppercase tracking-wider text-slate-400">
                        {row.k}
                      </dt>
                      <dd className="pt-1 font-headline-sm text-[15px] text-slate-900">{row.v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </section>

          {/* The situation */}
          <section className="relative w-full bg-slate-50 py-16 lg:py-20">
            <div className="max-w-[1080px] mx-auto px-6 lg:px-12">
              <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_40px_90px_-50px_rgba(49,46,129,0.3)] ring-1 ring-slate-200 lg:p-10">
                <Reveal className="space-y-4">
                  <Eyebrow>The situation before UniTrack</Eyebrow>
                  <div className="space-y-4 font-body-md text-body-md leading-relaxed text-slate-600">
                    <p>
                      A student file moved between a counselor&rsquo;s notebook, an intake sheet and
                      a folder on the network drive. Filing a visa meant re-assembling that history
                      by hand, which is why the average case took fourteen days to become a
                      submission &mdash; and why two counselors with the same student could give two
                      different answers.
                    </p>
                    <p>
                      Deadlines were the sharpest edge. Intake closures, document expiries and
                      appointment windows lived in people&rsquo;s heads, so a missed date was a
                      matter of &ldquo;if&rdquo;, not &ldquo;when&rdquo;. Commission was worse: the
                      payout owed to each branch and each sub-agent had to be reconstructed from
                      offers months after the work, and every settlement call cost the director a
                      morning.
                    </p>
                    <p>
                      Growth made it unmanageable. A third branch and a widening affiliate network
                      multiplied the handovers, and the one thing the office could not buy was more
                      hours in the day.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* What they run */}
          <section className="relative w-full bg-white py-16 lg:py-24">
            <div className="max-w-[1080px] mx-auto px-6 lg:px-12 space-y-10">
              <Reveal className="space-y-4">
                <Eyebrow dot>What runs on UniTrack today</Eyebrow>
                <h2 className="font-headline-md text-headline-md text-slate-900">
                  One file per student, <span className="text-grad">end to end</span>
                </h2>
              </Reveal>

              <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {MODULES.map((mod) => (
                  <Item
                    key={mod.title}
                    className="rounded-2xl bg-white p-6 ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-[box-shadow,ring-color] duration-300 hover:shadow-[0_24px_50px_-24px_rgba(49,46,129,0.25)] hover:ring-indigo-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200">
                        <span className="material-symbols-outlined text-[20px]">{mod.icon}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="font-headline-sm text-[17px] text-slate-900 font-semibold">
                          {mod.title}
                        </div>
                        <p className="font-body-sm text-body-sm leading-relaxed text-slate-600">
                          {mod.body}
                        </p>
                      </div>
                    </div>
                  </Item>
                ))}
              </Stagger>
            </div>
          </section>

          {/* Results */}
          <section className="relative w-full bg-slate-50 py-16 lg:py-24">
            <div className="max-w-[1080px] mx-auto px-6 lg:px-12 space-y-10">
              <Reveal className="space-y-4">
                <Eyebrow dot>Results after 6 months</Eyebrow>
                <h2 className="font-headline-md text-headline-md text-slate-900">
                  What the office <span className="text-grad">actually felt</span>
                </h2>
              </Reveal>

              <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {RESULTS.map((r) => (
                  <Item key={r.label} className="rounded-2xl bg-white p-6 ring-1 ring-slate-200/80">
                    <Counter
                      to={r.to}
                      decimals={r.decimals}
                      prefix={r.prefix}
                      suffix={r.suffix}
                      className="block font-metric-display text-metric-display text-slate-900"
                    />
                    <div className="pt-2 font-headline-sm text-[15px] text-slate-900">
                      {r.label}
                    </div>
                    <p className="pt-1.5 font-body-sm text-body-sm leading-relaxed text-slate-500">
                      {r.note}
                    </p>
                  </Item>
                ))}
              </Stagger>

              <Reveal delay={0.1} className="rounded-2xl bg-white p-6 ring-1 ring-slate-200/80">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                    <span className="material-symbols-outlined text-[20px]">fact_check</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-headline-sm text-[17px] text-slate-900 font-semibold">
                      Deadlines missed: zero
                    </div>
                    <p className="font-body-sm text-body-sm leading-relaxed text-slate-600">
                      The metric the director quotes first. Not because the team started working
                      harder, but because the dates were in the system and the reminder reached the
                      counselor who owned the file.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* How the switch went */}
          <section className="relative w-full bg-white py-16 lg:py-20">
            <div className="max-w-[1080px] mx-auto px-6 lg:px-12 space-y-10">
              <Reveal className="space-y-4">
                <Eyebrow>Making the move</Eyebrow>
                <h2 className="font-headline-md text-headline-md text-slate-900">
                  The part consultancies <span className="text-grad">worry about</span>
                </h2>
              </Reveal>
              <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {SWITCH_STEPS.map((step, i) => (
                  <Item key={step.title} className="space-y-3 rounded-2xl bg-slate-50 p-6">
                    <div className="font-metric-display text-[22px] text-indigo-600">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="font-headline-sm text-[16px] text-slate-900 font-semibold">
                      {step.title}
                    </div>
                    <p className="font-body-sm text-body-sm leading-relaxed text-slate-600">
                      {step.body}
                    </p>
                  </Item>
                ))}
              </Stagger>
            </div>
          </section>

          {/* Pull quote */}
          <section className="relative w-full bg-slate-50 py-16 lg:py-20">
            <div className="max-w-[1080px] mx-auto px-6 lg:px-12">
              <Reveal className="relative overflow-hidden rounded-3xl bg-white p-8 ring-1 ring-slate-200 lg:p-12">
                <span
                  aria-hidden
                  className="motion-float absolute top-2 right-8 select-none text-[150px] leading-none font-black text-indigo-900/[0.06]"
                >
                  &ldquo;
                </span>
                <blockquote className="relative font-headline-md text-headline-md leading-snug text-slate-900">
                  UniTrack cut our visa filing time from 14 days down to 48 hours. Our counselors
                  stopped juggling Excel sheets, nothing gets lost, and our university commission
                  payouts are accurate to the rupee.
                </blockquote>
                <div className="relative flex items-center gap-4 pt-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-headline-sm flex items-center justify-center font-bold ring-1 ring-slate-100">
                    RC
                  </div>
                  <div>
                    <div className="font-headline-sm text-[16px] text-slate-900 font-semibold">
                      Rohan Chitrakar
                    </div>
                    <div className="font-body-sm text-body-sm text-slate-500">
                      Managing Director, Apex Global Education Consultancies (Kathmandu, Pokhara
                      &amp; Sydney)
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* Next step */}
          <section className="relative w-full bg-white py-16 lg:py-20">
            <div className="max-w-[1080px] mx-auto px-6 lg:px-12">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-8 ring-1 ring-indigo-400/40 shadow-[0_50px_110px_-40px_rgba(79,70,229,0.65)] lg:p-12">
                <div
                  aria-hidden
                  className="motion-drift absolute -top-32 right-[-12%] h-[460px] w-[460px] rounded-full bg-white/10 blur-[130px]"
                />
                <Reveal className="relative space-y-6">
                  <h2 className="font-headline-md text-headline-md text-white">
                    Want the same six months?
                  </h2>
                  <p className="font-body-md text-body-md max-w-xl text-indigo-100">
                    Book a walkthrough at our Kathmandu office, or get a free trial account with
                    sample student profiles in under 60 minutes. We move your existing data for
                    free.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/#live-demo"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-label-btn text-label-btn text-slate-900 shadow-sm transition-colors hover:bg-slate-100 motion-cta"
                    >
                      <span>Book a Demo</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-label-btn text-label-btn text-white ring-1 ring-white/40 transition-colors hover:bg-white/10"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      <span>Back to overview</span>
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter base="/" />
      </div>
    </MotionShell>
  );
}

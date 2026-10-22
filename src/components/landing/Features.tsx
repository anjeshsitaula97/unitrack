"use client";

import dynamic from "next/dynamic";
import { m } from "framer-motion";
import { Stagger, Reveal, Eyebrow } from "./motion";
import { revealVariants } from "./motion-tokens";

const ParticleFlow = dynamic(() => import("./ParticleFlow"), { ssr: false });

const PILLARS = [
  {
    icon: "hub",
    title: "Lead & Walk-in CRM",
    body: "Collect every student enquiry from Meta Ads, Google Forms, study expos, and office walk-ins. The system assigns each new lead to the right counselor straight away.",
    highlight: "Never lose an enquiry",
  },
  {
    icon: "lock_clock",
    title: "Document Vault & Pre-Screening",
    body: "Keep SOPs, transcripts, IELTS scorecards, relationship certificates, and bank statements in one secure place. Built-in checks scan each file and point out possible embassy issues early.",
    highlight: "99.8% GTE compliance",
  },
  {
    icon: "public",
    title: "University Application Pipeline",
    body: "Send applications to 1,200+ universities and colleges in Australia (CRICOS), the UK (UCAS/Direct), Canada (DLI), and the US (SEVP), and follow each one's live status.",
    highlight: "Faster admissions desk",
  },
  {
    icon: "receipt_long",
    title: "Branch & Sub-Agent Commissions",
    body: "Handle revenue splits across branches, affiliate referrals, and sub-agent commissions. Get automatic settlement invoices and clear payout records.",
    highlight: "NepalPay & SWIFT ready",
  },
  {
    icon: "menu_book",
    title: "Test Prep & Class Management",
    body: "Plan IELTS, PTE, and TOEFL batches, track student attendance, grade mock tests, and upload scorecards. Turn top scorers into admission candidates automatically.",
    highlight: "Classes & mock tests in sync",
  },
  {
    icon: "chat",
    title: "WhatsApp Portal for Students & Parents",
    body: "Keep students and parents updated at every step: offer received, GTE cleared, tuition paid, and visa submitted &mdash; through official WhatsApp messages.",
    highlight: "WhatsApp Cloud API ready",
  },
];

const OPERATIONS = [
  {
    icon: "person_search",
    title: "Leads Management",
    desc: "Bring enquiries from Meta Ads, walk-ins, website forms, and sub-agents into one list. Score, assign, and follow up on every lead with reminders, stage tracking, and conversion reports.",
    highlight: "No enquiry left behind",
  },
  {
    icon: "engineering",
    title: "HR & Payroll",
    desc: "Run your whole team in one place: staff records, departments and roles, contracts, leave balances, and salary details, with a full history of every change.",
    highlight: "From hiring to payday",
  },
  {
    icon: "fingerprint",
    title: "Attendance",
    desc: "Staff check in and out with biometric, kiosk, or mobile. Get daily timesheets, late and early flags, shift rosters, and monthly attendance sheets &mdash; no paper registers.",
    highlight: "Attendance updates live",
  },
  {
    icon: "receipt_long",
    title: "Payslips",
    desc: "Create payslips automatically from attendance and salary rules. Handle allowances, deductions, tax, and PF, then share secure digital payslips staff can download anytime.",
    highlight: "Monthly payroll in one click",
  },
  {
    icon: "account_balance_wallet",
    title: "Payments & Expenses",
    desc: "Track every rupee in and out: consultancy fees, commissions, vendor bills, office expenses, and refunds. Categorised ledgers and reports that match your bank statement.",
    highlight: "Books that always balance",
  },
];

function FeatureCard({
  icon,
  title,
  body,
  highlight,
  index,
}: {
  icon: string;
  title: string;
  body: string;
  highlight: string;
  index?: number;
}) {
  return (
    <m.article
      variants={revealVariants}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 340, damping: 24 }}
      className="fw group relative flex flex-col justify-between space-y-5 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.08] p-6 backdrop-blur-sm glow-hover hover:ring-indigo-400/30 transition-[ring-color] duration-300 overflow-hidden"
    >
      {index !== undefined && (
        <span
          aria-hidden
          className="absolute top-3 right-5 text-[46px] font-extrabold leading-none text-white/[0.04] select-none"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <div className="space-y-4 relative">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/25 flex items-center justify-center text-indigo-300 group-hover:ring-indigo-400/60 transition-[ring-color] duration-300">
          <span className="material-symbols-outlined text-[26px]">{icon}</span>
        </div>
        <h3 className="font-headline-sm text-headline-sm text-white">{title}</h3>
        <p className="font-body-md text-body-md text-slate-400">{body}</p>
      </div>
      <div className="pt-4 flex items-center justify-between font-label-btn text-label-btn relative">
        <span className="text-indigo-300 font-semibold">{highlight}</span>
        <div className="w-8 h-8 rounded-full bg-white/[0.06] ring-1 ring-white/10 flex items-center justify-center text-indigo-300 group-hover:bg-indigo-500/25 group-hover:ring-indigo-400/40 group-hover:translate-x-0.5 transition">
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </div>
      </div>
    </m.article>
  );
}

export function Pillars() {
  return (
    <section
      id="features"
      className="relative w-full bg-[#05060b] py-16 lg:py-24 scroll-mt-28 overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute -top-40 left-1/4 w-[600px] h-[320px] bg-indigo-700/12 blur-[130px] rounded-full"
      />
      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 space-y-12">
        <Reveal className="max-w-2xl space-y-4">
          <Eyebrow>Features</Eyebrow>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
            Made for <span className="text-grad">Study Abroad Agencies</span>
          </h2>
          <p className="font-body-lg text-body-lg text-slate-400">
            Most CRMs don&rsquo;t understand GTE checks, IELTS scores, sub-agent commissions, or
            embassy deadlines. UniTrack is built for the way education consultancies actually work.
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PILLARS.map((p) => (
            <FeatureCard key={p.title} {...p} />
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function Operations() {
  return (
    <section
      id="operations"
      className="relative w-full bg-[#070912] py-16 lg:py-24 scroll-mt-28 border-t border-white/[0.06] overflow-hidden"
    >
      {/* WebGL flow field — data moving through the back-office suite. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block opacity-55">
        <ParticleFlow className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,transparent_25%,#070912_80%)]" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 space-y-12">
        <Reveal className="max-w-2xl space-y-4">
          <Eyebrow>Back-Office Tools</Eyebrow>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
            Leads, People and Money &mdash; <span className="text-grad">All in One Place</span>
          </h2>
          <p className="font-body-lg text-body-lg text-slate-400">
            Alongside student work, UniTrack also runs your business: your sales leads, your
            team&rsquo;s attendance and payroll, and every payment and expense in your books.
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {OPERATIONS.map((f, i) => (
            <FeatureCard
              key={f.title}
              index={i}
              icon={f.icon}
              title={f.title}
              body={f.desc}
              highlight={f.highlight}
            />
          ))}
        </Stagger>
      </div>
    </section>
  );
}

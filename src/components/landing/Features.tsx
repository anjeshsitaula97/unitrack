"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Stagger, Reveal, Eyebrow, revealVariants } from "./motion";

const ParticleFlow = dynamic(() => import("./ParticleFlow"), { ssr: false });

const PILLARS = [
  {
    icon: "hub",
    title: "Omnichannel Lead & Walk-in CRM",
    body: "Capture student queries automatically from Meta Ads, Google Forms, study expos, and Putalisadak/Kalyan walk-ins. Smart algorithms assign qualified leads to specific branch counselors in real time.",
    highlight: "Zero lost inquiry guarantee",
  },
  {
    icon: "lock_clock",
    title: "Digital Document Vault & AI Pre-Screening",
    body: "Centralize SOPs, transcripts, IELTS scorecards, relationship certificates, and bank audit balance proofs. Built-in OCR checks verify validity and flag embassy red-flags instantly.",
    highlight: "99.8% GTE compliance",
  },
  {
    icon: "public",
    title: "Direct University Application Pipeline",
    body: "Submit applications seamlessly to over 1,200+ universities and colleges across Australia (CRICOS), UK (UCAS/Direct), Canada (DLI), and the US (SEVP) with synchronized live statuses.",
    highlight: "Fast-track admission desk",
  },
  {
    icon: "receipt_long",
    title: "Multi-Branch & Sub-Agent Commission Engine",
    body: "Manage multi-branch revenue splits, regional affiliate referrals, and sub-agent commission ledgers. Generate automated settlement invoices and payout records with complete transparency.",
    highlight: "NepalPay & SWIFT reconciliation",
  },
  {
    icon: "menu_book",
    title: "Test Prep & Batch LMS (IELTS, PTE, TOEFL)",
    body: "Schedule morning/evening batches, monitor student biometric attendances, grade mock tests, and upload diagnostic scorecards. Nurture high scorers into admission candidates automatically.",
    highlight: "LMS & Mock test sync",
  },
  {
    icon: "chat",
    title: "Parent & Student WhatsApp Portal",
    body: "Keep students and anxious parents in the loop at every milestone: Offer Received, GTE Clearance, Tuition Fee Remitted, and Visa Lodgement via official WhatsApp templates.",
    highlight: "WhatsApp Cloud API ready",
  },
];

const OPERATIONS = [
  {
    icon: "person_search",
    title: "Leads Management",
    desc: "Capture enquiries from Meta Ads, walk-ins, website forms and sub-agents into one pipeline. Score, assign and chase every lead with automated follow-up reminders, stage tracking and conversion analytics.",
    highlight: "No enquiry left behind",
  },
  {
    icon: "engineering",
    title: "HR & Payroll",
    desc: "Run your whole team on one system: employee records, departments and designations, contract terms, leave balances and salary structures with a full audit trail on every change.",
    highlight: "From onboarding to payday",
  },
  {
    icon: "fingerprint",
    title: "E-Attendance",
    desc: "Staff clock in and out with biometric, kiosk or mobile check-in. Daily timesheets, late/early flags, shift rosters and instant monthly attendance registers — no paper registers, no manual counting.",
    highlight: "Real-time attendance registers",
  },
  {
    icon: "receipt_long",
    title: "Payslip Management",
    desc: "Generate payslips automatically from attendance and salary rules. Handle allowances, deductions, tax and PF, then publish secure digital payslips employees can download any time.",
    highlight: "One-click monthly payroll",
  },
  {
    icon: "account_balance_wallet",
    title: "Payments & Expense Management",
    desc: "Track every rupee in and out — consultancy fees, commissions, vendor bills, office expenses and refunds. Categorised ledgers, payment records and expense reports that reconcile against your bank statement.",
    highlight: "Books that always reconcile",
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
    <motion.article
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
    </motion.article>
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
          <Eyebrow>Enterprise Capabilities</Eyebrow>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
            Engineered Specifically for <span className="text-grad">Modern Education Agencies</span>
          </h2>
          <p className="font-body-lg text-body-lg text-slate-400">
            Generic CRMs fail to understand GTE checks, IELTS score matrices, sub-agent commissions,
            and embassy deadlines. UniTrack is designed from the ground up for international student
            recruiters.
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
          <Eyebrow>Back-Office Operations Suite</Eyebrow>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
            Leads, People and Money — <span className="text-grad">Managed in One Place</span>
          </h2>
          <p className="font-body-lg text-body-lg text-slate-400">
            Beyond student operations, UniTrack runs the business side of your consultancy: your
            sales pipeline, your team&rsquo;s attendance and payroll, and every payment and expense
            in your books.
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

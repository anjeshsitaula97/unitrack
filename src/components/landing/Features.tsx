"use client";

import { SpotlightItem, Stagger, Reveal, Eyebrow } from "./motion";

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
    <>
      {index !== undefined && (
        <span
          aria-hidden
          className="absolute top-3 right-5 text-[46px] font-extrabold leading-none text-slate-900/[0.05] select-none"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <div className="relative space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 transition duration-300 group-hover:-rotate-3 group-hover:scale-110 group-hover:ring-indigo-400">
          <span className="material-symbols-outlined text-[26px]">{icon}</span>
        </div>
        <h3 className="font-headline-sm text-headline-sm text-slate-900">{title}</h3>
        <p className="font-body-md text-body-md text-slate-600">{body}</p>
      </div>
      <div className="relative flex items-center justify-between pt-4 font-label-btn text-label-btn">
        <span className="font-semibold text-indigo-600">{highlight}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-indigo-600 ring-1 ring-slate-200 transition group-hover:translate-x-0.5 group-hover:bg-indigo-600 group-hover:text-white group-hover:ring-indigo-600">
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </div>
      </div>
    </>
  );
}

export function Pillars() {
  return (
    <section
      id="features"
      className="relative w-full bg-white py-16 lg:py-24 scroll-mt-28 overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute -top-40 left-1/4 h-[320px] w-[600px] rounded-full bg-indigo-200/50 blur-[130px]"
      />
      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 space-y-12">
        <Reveal className="max-w-2xl space-y-4">
          <Eyebrow>Features</Eyebrow>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900">
            Made for <span className="text-grad">Study Abroad Agencies</span>
          </h2>
          <p className="font-body-lg text-body-lg text-slate-600">
            Most CRMs don&rsquo;t understand GTE checks, IELTS scores, sub-agent commissions, or
            embassy deadlines. UniTrack is built for the way education consultancies actually work.
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PILLARS.map((p) => (
            <SpotlightItem
              key={p.title}
              className="group relative flex h-full flex-col justify-between space-y-5 overflow-hidden rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80 transition-[ring-color,box-shadow] duration-300 hover:shadow-[0_24px_50px_-24px_rgba(49,46,129,0.25)] hover:ring-indigo-300"
            >
              <FeatureCard icon={p.icon} title={p.title} body={p.body} highlight={p.highlight} />
            </SpotlightItem>
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
      className="relative w-full bg-slate-50 py-16 lg:py-24 scroll-mt-28 border-t border-slate-200/70 overflow-hidden"
    >
      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 space-y-12">
        <Reveal className="max-w-2xl space-y-4">
          <Eyebrow>Back-Office Tools</Eyebrow>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900">
            Leads, People and Money &mdash; <span className="text-grad">All in One Place</span>
          </h2>
          <p className="font-body-lg text-body-lg text-slate-600">
            Alongside student work, UniTrack also runs your business: your sales leads, your
            team&rsquo;s attendance and payroll, and every payment and expense in your books.
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {OPERATIONS.map((f, i) => (
            <SpotlightItem
              key={f.title}
              className="group relative flex h-full flex-col justify-between space-y-5 overflow-hidden rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80 transition-[ring-color,box-shadow] duration-300 hover:shadow-[0_24px_50px_-24px_rgba(49,46,129,0.25)] hover:ring-indigo-300"
            >
              <FeatureCard
                index={i}
                icon={f.icon}
                title={f.title}
                body={f.desc}
                highlight={f.highlight}
              />
            </SpotlightItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

import MarketingHeader from "@/components/MarketingHeader";
import DemoForm from "@/components/DemoForm";
import PricingSection from "@/components/PricingSection";

export default function LandingPage() {
  return (
    <div className="bg-slate-50 font-body-md text-body-md text-slate-900 min-h-screen">
      <style>{`
        html { scroll-behavior: smooth; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      <MarketingHeader />

      <main className="w-full pt-32 bg-slate-50">
        <div className="flex flex-col w-full">
          {/* Hero Section */}
          <section className="relative w-full overflow-hidden pb-10 lg:pb-16" id="overview">
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[840px] h-[360px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            <div className="absolute top-44 right-[-10%] w-[420px] h-[420px] bg-violet-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
              {/* Hero Typography */}
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-slate-900 tracking-tight">
                  Supercharge Your Study Abroad Consultancy with{" "}
                  <span className="text-indigo-600">Intelligent Automation</span>
                </h1>
                <p className="font-body-lg text-body-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  From walk-in lead capture and IELTS/PTE preparation batches to university offer letters, document verification vaults, and commission payouts &mdash; UniTrack unites your entire international education operations in one compliant platform.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <a
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-indigo-600 text-white hover:bg-indigo-700 font-label-btn text-label-btn px-7 py-3.5 rounded-full shadow-lg shadow-indigo-600/20 transition-all group"
                    href="#live-demo"
                  >
                    <span>Request an Agency Walkthrough</span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>
                  </a>
                  <a
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-label-btn text-label-btn px-6 py-3.5 rounded-full shadow-sm transition-colors"
                    href="#crm-showcase"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                    </div>
                    <span>Watch 3-Min Interactive Tour</span>
                  </a>
                </div>
              </div>
              {/* Trust Metrics Ribbon */}
              <div className="mt-10 pt-8 bg-white border border-slate-200 backdrop-blur-md rounded-2xl shadow-sm p-6 max-w-5xl mx-auto">
                <div className="text-center font-label-pill text-label-pill uppercase text-slate-500 tracking-wider mb-6">
                  Powering 80+ Premier Educational Consultancies Across Kathmandu, New Delhi, Sydney &amp; Toronto
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="space-y-1">
                    <div className="font-metric-display text-metric-display text-slate-900">50K+</div>
                    <div className="font-body-sm text-body-sm text-slate-500 font-medium">Students Processed</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-metric-display text-metric-display text-indigo-600">99.2%</div>
                    <div className="font-body-sm text-body-sm text-slate-500 font-medium">Visa Accuracy Rate</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-metric-display text-metric-display text-slate-900">3.5x</div>
                    <div className="font-body-sm text-body-sm text-slate-500 font-medium">Faster Offer Letters</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-metric-display text-metric-display text-slate-900">12+</div>
                    <div className="font-body-sm text-body-sm text-slate-500 font-medium">Global Hubs (AU, UK, US, CA)</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

                    {/* CRM Pipeline Showcase */}
          <section className="w-full bg-white py-12 lg:py-16" id="crm-showcase">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 space-y-6">
              <div>
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900">
                  The Mission Control Console for Study Abroad Ops
                </h2>
              </div>

              <div className="bg-slate-900 shadow-2xl shadow-slate-900/20 rounded-2xl ring-1 ring-slate-800 overflow-hidden">
                <div className="bg-white/5 px-4 py-2.5 flex items-center gap-2 border-b border-slate-800">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#28c840]"></span>
                  <div className="flex-1 mx-4 h-6 rounded-lg bg-white/10 flex items-center px-3">
                    <span className="text-[10px] font-mono text-slate-400 truncate">app.unitrack.io/dashboard</span>
                  </div>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src="/screenshots/dashboard.png"
                    alt="UniTrack Admin Dashboard — Real-time pipeline, analytics, and commission tracking"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </section>

{/* 6 Core Pillars */}
          <section className="w-full bg-slate-50 py-12 lg:py-16" id="features">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 space-y-10">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-label-pill text-label-pill uppercase tracking-wider">
                  Enterprise Capabilities
                </div>
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900">
                  Engineered Specifically for Modern Education Agencies
                </h2>
                <p className="font-body-lg text-body-lg text-slate-600">
                  Generic CRMs fail to understand GTE checks, IELTS score matrices, sub-agent commissions, and embassy deadlines. UniTrack is designed from the ground up for international student recruiters.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Pillar 1 */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <span className="material-symbols-outlined text-[26px]">hub</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-slate-900">Omnichannel Lead &amp; Walk-in CRM</h3>
                    <p className="font-body-md text-body-md text-slate-600">
                      Capture student queries automatically from Meta Ads, Google Forms, study expos, and Putalisadak/Kalyan walk-ins. Smart algorithms assign qualified leads to specific branch counselors in real time.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-slate-900 font-label-btn text-label-btn">
                    <span className="text-indigo-600 font-semibold">Zero lost inquiry guarantee</span>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <span className="material-symbols-outlined text-[26px]">lock_clock</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-slate-900">Digital Document Vault &amp; AI Pre-Screening</h3>
                    <p className="font-body-md text-body-md text-slate-600">
                      Centralize SOPs, transcripts, IELTS scorecards, relationship certificates, and bank audit balance proofs. Built-in OCR checks verify validity and flag embassy red-flags instantly.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-slate-900 font-label-btn text-label-btn">
                    <span className="text-indigo-600 font-semibold">99.8% GTE compliance</span>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <span className="material-symbols-outlined text-[26px]">public</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-slate-900">Direct University Application Pipeline</h3>
                    <p className="font-body-md text-body-md text-slate-600">
                      Submit applications seamlessly to over 1,200+ universities and colleges across Australia (CRICOS), UK (UCAS/Direct), Canada (DLI), and the US (SEVP) with synchronized live statuses.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-slate-900 font-label-btn text-label-btn">
                    <span className="text-indigo-600 font-semibold">Fast-track admission desk</span>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>
                  </div>
                </div>

                {/* Pillar 4 */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <span className="material-symbols-outlined text-[26px]">receipt_long</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-slate-900">Multi-Branch &amp; Sub-Agent Commission Engine</h3>
                    <p className="font-body-md text-body-md text-slate-600">
                      Manage multi-branch revenue splits, regional affiliate referrals, and sub-agent commission ledgers. Generate automated settlement invoices and payout records with complete transparency.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-slate-900 font-label-btn text-label-btn">
                    <span className="text-indigo-600 font-semibold">NepalPay &amp; SWIFT reconciliation</span>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>
                  </div>
                </div>

                {/* Pillar 5 */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <span className="material-symbols-outlined text-[26px]">menu_book</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-slate-900">Test Prep &amp; Batch LMS (IELTS, PTE, TOEFL)</h3>
                    <p className="font-body-md text-body-md text-slate-600">
                      Schedule morning/evening batches, monitor student biometric attendances, grade mock tests, and upload diagnostic scorecards. Nurture high scorers into admission candidates automatically.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-slate-900 font-label-btn text-label-btn">
                    <span className="text-indigo-600 font-semibold">LMS &amp; Mock test sync</span>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>
                  </div>
                </div>

                {/* Pillar 6 */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <span className="material-symbols-outlined text-[26px]">chat</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-slate-900">Parent &amp; Student WhatsApp Portal</h3>
                    <p className="font-body-md text-body-md text-slate-600">
                      Keep students and anxious parents in the loop at every milestone: Offer Received, GTE Clearance, Tuition Fee Remitted, and Visa Lodgement via official WhatsApp templates.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-slate-900 font-label-btn text-label-btn">
                    <span className="text-indigo-600 font-semibold">WhatsApp Cloud API ready</span>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

                    {/* Global University Destinations */}
          <section className="w-full bg-white py-12 lg:py-16" id="university-network">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-label-pill text-label-pill uppercase">
                      Global Jurisdiction Matrix
                    </div>
                    <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900">
                      Automated Rules for Every Major Study Destination
                    </h2>
                  </div>
                  <p className="font-body-md text-body-md text-slate-600 max-w-xl">
                    Each country comes pre-configured with embassy checklists, financial formula calculators, and immigration compliance frameworks.
                  </p>
                  <a
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
                    href="#live-demo"
                  >
                    Explore University Network
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </div>
                <div className="lg:col-span-5 bg-slate-900 shadow-2xl shadow-slate-900/20 rounded-2xl ring-1 ring-slate-800 overflow-hidden mt-2 lg:mt-0">
                  <div className="bg-white/5 px-4 py-2.5 flex items-center gap-2 border-b border-slate-800">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f57]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#febc2e]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#28c840]"></span>
                    <div className="flex-1 mx-4 h-6 rounded-lg bg-white/10 flex items-center px-3">
                      <span className="text-[10px] font-mono text-slate-400 truncate">app.unitrack.io/universities</span>
                    </div>
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src="/screenshots/universities.png"
                      alt="UniTrack University Network — 15+ ranked institutions across AU, CA, UK, US"
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Australia */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 hover:-translate-y-1 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-headline-sm">AU</div>
                      <div>
                        <div className="font-headline-sm text-[18px] text-slate-900 font-bold">Australia</div>
                        <div className="font-body-sm text-[12px] text-slate-500">Subclass 500 Visa</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-label-pill text-[11px]">CRICOS</span>
                  </div>
                  <div className="space-y-3 text-body-sm text-body-sm text-slate-600">
                    <div className="flex justify-between"><span>Avg COE Turnaround:</span><span className="font-semibold text-slate-900">3-5 Days</span></div>
                    <div className="flex justify-between"><span>GTE Assessment Engine:</span><span className="font-semibold text-indigo-600">Pre-Integrated</span></div>
                    <div className="flex justify-between"><span>Embassy Visa Success:</span><span className="font-semibold text-slate-900">99.4%</span></div>
                  </div>
                  <div className="pt-2 text-label-pill text-label-pill uppercase text-indigo-600 font-bold">180+ Active Universities</div>
                </div>

                {/* Canada */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 hover:-translate-y-1 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-headline-sm">CA</div>
                      <div>
                        <div className="font-headline-sm text-[18px] text-slate-900 font-bold">Canada</div>
                        <div className="font-body-sm text-[12px] text-slate-500">Study Permit (SDS / Non-SDS)</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-label-pill text-[11px]">DLI Sync</span>
                  </div>
                  <div className="space-y-3 text-body-sm text-body-sm text-slate-600">
                    <div className="flex justify-between"><span>PAL Verification:</span><span className="font-semibold text-indigo-600">Automated</span></div>
                    <div className="flex justify-between"><span>GIC Bank Tracking:</span><span className="font-semibold text-slate-900">Integrated</span></div>
                    <div className="flex justify-between"><span>Visa Approval Rate:</span><span className="font-semibold text-slate-900">97.8%</span></div>
                  </div>
                  <div className="pt-2 text-label-pill text-label-pill uppercase text-indigo-600 font-bold">210+ Colleges &amp; Universities</div>
                </div>

                {/* United Kingdom */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 hover:-translate-y-1 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-headline-sm">UK</div>
                      <div>
                        <div className="font-headline-sm text-[18px] text-slate-900 font-bold">United Kingdom</div>
                        <div className="font-body-sm text-[12px] text-slate-500">Student Route (CAS)</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-label-pill text-[11px]">UCAS Ready</span>
                  </div>
                  <div className="space-y-3 text-body-sm text-body-sm text-slate-600">
                    <div className="flex justify-between"><span>CAS Issuance Speed:</span><span className="font-semibold text-slate-900">48 Hours</span></div>
                    <div className="flex justify-between"><span>28-Day Bank Rules:</span><span className="font-semibold text-indigo-600">Auto Calculator</span></div>
                    <div className="flex justify-between"><span>Visa Approval Rate:</span><span className="font-semibold text-slate-900">99.1%</span></div>
                  </div>
                  <div className="pt-2 text-label-pill text-label-pill uppercase text-indigo-600 font-bold">140+ Russell &amp; Modern Unis</div>
                </div>

                {/* United States */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 hover:-translate-y-1 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-headline-sm">US</div>
                      <div>
                        <div className="font-headline-sm text-[18px] text-slate-900 font-bold">United States</div>
                        <div className="font-body-sm text-[12px] text-slate-500">F-1 Student Visa</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-label-pill text-[11px]">SEVIS / I-20</span>
                  </div>
                  <div className="space-y-3 text-body-sm text-body-sm text-slate-600">
                    <div className="flex justify-between"><span>DS-160 Prep Audit:</span><span className="font-semibold text-indigo-600">Standardized</span></div>
                    <div className="flex justify-between"><span>Mock Visa Interview LMS:</span><span className="font-semibold text-slate-900">Included</span></div>
                    <div className="flex justify-between"><span>Offer Ratio:</span><span className="font-semibold text-slate-900">96.5%</span></div>
                  </div>
                  <div className="pt-2 text-label-pill text-label-pill uppercase text-indigo-600 font-bold">300+ Accredited Campuses</div>
                </div>
              </div>
            </div>
          </section>

{/* Spotlight Case Study */}
          <section className="w-full bg-slate-50 py-12 lg:py-16">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
              <div className="bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden p-6 lg:p-10 relative">
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 font-label-pill text-label-pill uppercase">
                      Spotlight Case Study &bull; Kathmandu Central Hub
                    </div>
                    <blockquote className="font-headline-md text-headline-md text-white leading-snug">
                      &ldquo;UniTrack reduced our visa filing turnaround from 14 days down to 48 hours. Our counselors no longer juggle Excel sheets or lose track of student affidavits, and our university commission payouts are settled accurately to the rupee.&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-headline-sm flex items-center justify-center font-bold">RC</div>
                      <div>
                        <div className="font-headline-sm text-[16px] text-white font-semibold">Rohan Chitrakar</div>
                        <div className="font-body-sm text-body-sm text-slate-400">Managing Director, Apex Global Education Consultancies (Kathmandu, Pokhara &amp; Sydney)</div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-5 bg-white/5 rounded-2xl p-6 lg:p-8 space-y-6">
                    <div className="font-label-pill text-label-pill uppercase text-indigo-200 tracking-wider">Measurable 6-Month Agency Impact</div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <span className="font-body-md text-body-md text-slate-400">Counselor Productivity</span>
                        <span className="font-metric-display text-[26px] text-indigo-300">+320%</span>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <span className="font-body-md text-body-md text-slate-400">Intake Deadlines Missed</span>
                        <span className="font-metric-display text-[26px] text-white">ZERO</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-body-md text-body-md text-slate-400">Sub-Agent Transparency</span>
                        <span className="font-metric-display text-[26px] text-indigo-300">100%</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <a className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-label-btn text-label-btn transition-colors" href="#live-demo">
                        <span>Read Full Consultancy Blueprint</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <PricingSection />

          {/* Bottom CTA & Demo Form */}
          <section className="w-full bg-slate-50 py-12 lg:py-16" id="live-demo">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
              <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[130px] rounded-full pointer-events-none"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                  <div className="lg:col-span-7 space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 font-label-pill text-label-pill uppercase tracking-wider">
                      On-Site &amp; Cloud Demonstrations
                    </div>
                    <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
                      Ready to Modernize Your Educational Consultancy Operations?
                    </h2>
                    <p className="font-body-md text-body-md text-slate-400 max-w-xl">
                      Schedule an in-person walkthrough at our Kathmandu Technology Lab or receive an instant sandbox trial with mock student profiles in under 60 minutes.
                    </p>
                    <div className="flex flex-wrap items-center gap-6 pt-2 font-body-sm text-body-sm text-slate-400">
                      <span className="flex items-center gap-1.5 text-indigo-300">
                        <span className="material-symbols-outlined text-[16px]">check</span> Free 1-on-1 counselor training
                      </span>
                      <span className="flex items-center gap-1.5 text-indigo-300">
                        <span className="material-symbols-outlined text-[16px]">check</span> Zero downtime data migration
                      </span>
                    </div>
                  </div>
                  <DemoForm />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-white pt-12 pb-10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[20px]">hub</span>
                </div>
                <span className="font-headline-sm text-headline-sm text-white font-bold">UniTrack</span>
              </div>
              <p className="font-body-md text-body-md text-slate-400 max-w-sm">
                Enterprise operating intelligence platform built for leading education consultancies, global study abroad advisors, and cross-border university admission agencies.
              </p>
              <div className="pt-2 flex items-center gap-2 font-label-pill text-label-pill text-indigo-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                <span>Live Global Uptime: 99.98% Available</span>
              </div>
            </div>
            <div>
              <div className="font-headline-sm text-headline-sm text-white mb-4">Product Matrix</div>
              <ul className="space-y-2.5 font-body-sm text-body-sm text-slate-400">
                <li><a className="hover:text-indigo-300 transition-colors" href="#overview">Unified Overview</a></li>
                <li><a className="hover:text-indigo-300 transition-colors" href="#features">Platform Features</a></li>
                <li><a className="hover:text-indigo-300 transition-colors" href="#crm-showcase">Applicant CRM</a></li>
                <li><a className="hover:text-indigo-300 transition-colors" href="#university-network">Visa Workflow Engine</a></li>
                <li><a className="hover:text-indigo-300 transition-colors" href="#university-network">Institution Registry</a></li>
                <li><a className="hover:text-indigo-300 transition-colors" href="#pricing">Consultancy Tiers</a></li>
              </ul>
            </div>
            <div>
              <div className="font-headline-sm text-headline-sm text-white mb-4">Global Hubs</div>
              <ul className="space-y-3 font-body-sm text-body-sm text-slate-400">
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-indigo-400 text-[18px]">location_on</span><span>Kathmandu, Nepal (HQ Tech Core)</span></li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-indigo-400 text-[18px]">location_on</span><span>Sydney, Australia</span></li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-indigo-400 text-[18px]">location_on</span><span>Toronto, Canada</span></li>
                <li className="flex items-start gap-2"><span className="material-symbols-outlined text-indigo-400 text-[18px]">location_on</span><span>London, United Kingdom</span></li>
              </ul>
            </div>
            <div>
              <div className="font-headline-sm text-headline-sm text-white mb-4">Trust &amp; Compliance</div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="font-label-pill text-label-pill uppercase text-indigo-200 mb-1">FERPA Verified</div>
                  <div className="font-body-sm text-body-sm text-slate-400">Student education record data safeguard compliance.</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="font-label-pill text-label-pill uppercase text-indigo-200 mb-1">GDPR Audited</div>
                  <div className="font-body-sm text-body-sm text-slate-400">End-to-end encrypted European data standards.</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="font-label-pill text-label-pill uppercase text-indigo-200 mb-1">ISO 27001 Ready</div>
                  <div className="font-body-sm text-body-sm text-slate-400">Enterprise Grade Cloud Sec-Ops architecture.</div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-slate-400">
            <p>&copy; 2025 UniTrack by Avenlixx Technologies. All rights reserved. Registered across international jurisdictions.</p>
            <div className="flex items-center gap-6">
              <a className="hover:text-indigo-300 transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-indigo-300 transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-indigo-300 transition-colors" href="#">Security Center</a>
              <a className="hover:text-indigo-300 transition-colors" href="#">Status Portal</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
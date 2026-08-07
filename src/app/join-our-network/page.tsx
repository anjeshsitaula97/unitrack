"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const BENEFITS = [
  {
    icon: "inventory_2",
    title: "150,000+ Programs",
    desc: "Access the largest catalog of academic programs across 1,500+ institutions in 180+ countries.",
  },
  {
    icon: "auto_awesome",
    title: "95% Success Rate",
    desc: "Our AI-powered tools check eligibility before submission, so your students get accepted — not rejected.",
  },
  {
    icon: "payments",
    title: "Fast Commission Payouts",
    desc: "Track earnings in real time and get paid quickly with transparent commission reporting.",
  },
  {
    icon: "bolt",
    title: "One-Click Multi-Apply",
    desc: "Apply to multiple universities simultaneously, saving hours of manual form-filling.",
  },
  {
    icon: "support_agent",
    title: "Built-In Student Services",
    desc: "Offer extras like language tests, student loans, visa timelines, and accommodation through one platform.",
  },
  {
    icon: "leaderboard",
    title: "Performance Dashboard",
    desc: "Monitor your application pipeline, conversion rates, and commissions from a single agent dashboard.",
  },
];

const STATS = [
  { value: "150,000+", label: "Programs Available" },
  { value: "1,500+", label: "Partner Institutions" },
  { value: "95%", label: "Application Success" },
  { value: "180+", label: "Countries Served" },
];

const STEPS = [
  {
    step: "01",
    title: "Create Your Agent Account",
    desc: "Register your agency and complete a quick verification to get access to the full agent platform.",
  },
  {
    step: "02",
    title: "Add Your Students",
    desc: "Import student profiles or add them one by one. UniTrack auto-matches them to eligible programs.",
  },
  {
    step: "03",
    title: "Submit and Earn",
    desc: "Submit applications with one click, track outcomes in real time, and earn commission for every successful enrollment.",
  },
];

export default function JoinOurNetworkPage() {
  const [formData, setFormData] = useState({
    agencyName: "",
    country: "",
    agencyType: "",
    website: "",
    contactName: "",
    email: "",
    phone: "",
    studentsPerYear: "",
    primaryMarkets: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0055c3] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">school</span>
            </div>
            <span className="text-xl font-extrabold text-[#131b31] tracking-tight">UniTrack</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/partner-with-us"
              className="text-sm font-semibold text-[#585d75] hover:text-[#0055c3] transition-colors hidden sm:block"
            >
              For Institutions
            </Link>
            <Link
              href="/login"
              className="bg-[#585d75] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#454a5e] transition-colors shadow-md"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#1a1f35] to-[#2d3259] text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#585d75]/25 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#585d75]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-white/90 font-bold text-xs uppercase tracking-widest mb-6">
                For Recruitment Agents
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Join Our Agent Network.
                <br />
                <span className="text-[#a5b4fc]">Earn More. Do Less.</span>
              </h1>
              <p className="text-white/80 text-lg sm:text-xl mb-10 leading-relaxed max-w-xl lg:max-w-none">
                Access 150,000+ programs, submit applications in one click, and earn competitive
                commissions — all from a single platform designed for recruitment agencies like
                yours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#agent-form"
                  className="bg-white text-[#2d3259] px-8 py-4 rounded-2xl font-extrabold text-lg shadow-2xl hover:bg-[#f0f0ff] transition-all active:scale-95 inline-block"
                >
                  Join Our Network
                </a>
                <a
                  href="#how-it-works"
                  className="bg-white/10 border border-white/25 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all inline-block"
                >
                  How It Works
                </a>
              </div>
            </div>
            {/* Right: Hero Image */}
            <div className="flex-1 w-full max-w-xl lg:max-w-none">
              <div
                className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                style={{ aspectRatio: "16/10" }}
              >
                <Image
                  src="/assets/images/agent_network_hero.png"
                  alt="Recruitment agents and students collaborating"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0A1628]/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#585d75] py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{s.value}</div>
                <div className="text-white/70 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F5F8FF]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block py-1 px-4 rounded-full bg-[#e5e6f0] text-[#585d75] text-xs font-bold uppercase tracking-widest mb-4">
                Why Join UniTrack
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#131b31] mb-4">
                The Smartest Platform for Agents
              </h2>
              <p className="text-[#434A63] text-base sm:text-lg max-w-2xl mx-auto">
                UniTrack gives recruitment agents the tools to place more students, earn higher
                commissions, and build a scalable business.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-[#EEEEF5] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#585d75] transition-colors duration-300">
                    <span className="material-symbols-outlined text-[#585d75] text-2xl group-hover:text-white transition-colors duration-300">
                      {b.icon}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#131b31] mb-2">{b.title}</h3>
                  <p className="text-[#5A6484] text-sm leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block py-1 px-4 rounded-full bg-[#e5e6f0] text-[#585d75] text-xs font-bold uppercase tracking-widest mb-4">
                Simple Process
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#131b31] mb-4">
                Start Earning in 3 Steps
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#585d75] text-white flex items-center justify-center text-2xl font-extrabold mx-auto mb-5 shadow-lg">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-bold text-[#131b31] mb-2">{s.title}</h3>
                  <p className="text-[#5A6484] text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="agent-form" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F5F8FF]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block py-1 px-4 rounded-full bg-[#e5e6f0] text-[#585d75] text-xs font-bold uppercase tracking-widest mb-4">
                Apply Now
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#131b31] mb-4">
                Join Our Agent Network
              </h2>
              <p className="text-[#434A63] text-base">
                Complete the form below. Our team will review your application and onboard you
                within 2 business days.
              </p>
            </div>
            {submitted ? (
              <div className="bg-white rounded-3xl p-12 shadow-xl text-center border border-green-100">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-green-500 text-5xl">
                    check_circle
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-[#131b31] mb-3">
                  Application Received!
                </h3>
                <p className="text-[#5A6484] text-base max-w-sm mx-auto mb-8">
                  Welcome to UniTrack! Our team will review your application and get in touch within
                  2 business days.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-[#585d75] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#454a5e] transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 space-y-6"
              >
                <h3 className="text-lg font-bold text-[#131b31] pb-2 border-b border-slate-100">
                  Agency Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                      Agency Name *
                    </label>
                    <input
                      name="agencyName"
                      required
                      value={formData.agencyName}
                      onChange={handleChange}
                      placeholder="e.g. Global Pathways Agency"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#585d75] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                      Country *
                    </label>
                    <input
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="e.g. Nepal"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#585d75] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                      Agency Type *
                    </label>
                    <select
                      name="agencyType"
                      required
                      value={formData.agencyType}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] focus:outline-none focus:ring-2 focus:ring-[#585d75] focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select type</option>
                      <option>Independent Education Agent</option>
                      <option>Recruitment Agency</option>
                      <option>Study Abroad Consultancy</option>
                      <option>School or College Counselor</option>
                      <option>Online Counseling Platform</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                      Website
                    </label>
                    <input
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://www.youragency.com"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#585d75] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                      Students Placed Per Year
                    </label>
                    <select
                      name="studentsPerYear"
                      value={formData.studentsPerYear}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] focus:outline-none focus:ring-2 focus:ring-[#585d75] focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select range</option>
                      <option>Under 20 students</option>
                      <option>20 to 100 students</option>
                      <option>100 to 500 students</option>
                      <option>500 to 1000 students</option>
                      <option>1000+ students</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                      Primary Markets
                    </label>
                    <input
                      name="primaryMarkets"
                      value={formData.primaryMarkets}
                      onChange={handleChange}
                      placeholder="e.g. South Asia, Southeast Asia"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#585d75] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#131b31] pb-2 border-b border-slate-100 pt-2">
                  Contact Person
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      name="contactName"
                      required
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#585d75] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@youragency.com"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#585d75] focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+977 98XXXXXXXX"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#585d75] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                    Tell Us About Your Agency
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your agency, where your students are going, or any questions you have about the network..."
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#585d75] focus:border-transparent transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#585d75] text-white py-4 rounded-xl font-extrabold text-base hover:bg-[#454a5e] transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">handshake</span>Join Our
                      Network
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="bg-[#0A1628] py-14 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Have Questions? We are Here.
            </h2>
            <p className="text-white/70 text-base mb-8">
              Mon to Fri, 9am to 6pm UTC. Our agent support team typically responds within a few
              hours.
            </p>
            <a
              href="mailto:agents@unitrack.com"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all text-sm"
            >
              <span className="material-symbols-outlined text-lg">mail</span>
              agents@unitrack.com
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

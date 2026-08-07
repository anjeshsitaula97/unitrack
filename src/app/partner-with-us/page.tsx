"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const BENEFITS = [
  {
    icon: "public",
    title: "Global Student Reach",
    desc: "Connect with 1.5M+ students from 180+ nationalities actively searching for programs like yours.",
  },
  {
    icon: "trending_up",
    title: "10% Higher Conversion",
    desc: "Receive higher-quality applications with built-in eligibility checks that improve your enrolment conversion rate.",
  },
  {
    icon: "speed",
    title: "40% Less Manual Work",
    desc: "Our smart automation handles document collection, status updates, and applicant communication for you.",
  },
  {
    icon: "verified",
    title: "Verified Student Profiles",
    desc: "Every student profile is verified — you only see serious applicants who meet your admission requirements.",
  },
  {
    icon: "analytics",
    title: "Real-Time Analytics",
    desc: "Track application volume, conversion funnels, and enrolment trends with a live dashboard built for institutions.",
  },
  {
    icon: "support_agent",
    title: "Dedicated Partner Support",
    desc: "A dedicated account manager and 24/7 technical support team to ensure your success.",
  },
];

const STATS = [
  { value: "1,500+", label: "Partner Institutions" },
  { value: "1.5M+", label: "Active Students" },
  { value: "180+", label: "Countries" },
  { value: "95%", label: "Application Success Rate" },
];

const STEPS = [
  {
    step: "01",
    title: "Submit Your Interest",
    desc: "Fill out the partnership form below. Our team will review your institution within 2 business days.",
  },
  {
    step: "02",
    title: "Onboarding Call",
    desc: "A dedicated partner manager will walk you through the platform, set up your profile, and upload your programs.",
  },
  {
    step: "03",
    title: "Go Live and Grow",
    desc: "Your institution goes live and starts receiving verified student applications from day one.",
  },
];

export default function PartnerWithUsPage() {
  const [formData, setFormData] = useState({
    institutionName: "",
    country: "",
    institutionType: "",
    website: "",
    contactName: "",
    email: "",
    phone: "",
    programs: "",
    annualEnrolment: "",
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
              href="/join-our-network"
              className="text-sm font-semibold text-[#585d75] hover:text-[#0055c3] transition-colors hidden sm:block"
            >
              For Agents
            </Link>
            <Link
              href="/login"
              className="bg-[#0055c3] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#0044a0] transition-colors shadow-md"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#0d2260] to-[#0055c3] text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1E6DEB]/25 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0055c3]/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-white/90 font-bold text-xs uppercase tracking-widest mb-6">
                For Academic Institutions
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Partner with UniTrack.
                <br />
                <span className="text-[#93c5fd]">Grow Your Global Enrolment.</span>
              </h1>
              <p className="text-white/80 text-lg sm:text-xl mb-10 leading-relaxed max-w-xl lg:max-w-none">
                Join 1,500+ institutions worldwide using UniTrack to attract verified international
                students, streamline admissions, and grow enrolment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#partner-form"
                  className="bg-white text-[#0055c3] px-8 py-4 rounded-2xl font-extrabold text-lg shadow-2xl hover:bg-[#f0f4ff] transition-all active:scale-95 inline-block"
                >
                  Apply for Partnership
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
                  src="/assets/images/partner_hero.png"
                  alt="University campus with international students"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0A1628]/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0055c3] py-8 px-4 sm:px-6 lg:px-8">
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
              <span className="inline-block py-1 px-4 rounded-full bg-[#dce8ff] text-[#0055c3] text-xs font-bold uppercase tracking-widest mb-4">
                Why Partner With Us
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#131b31] mb-4">
                Everything You Need to Grow
              </h2>
              <p className="text-[#434A63] text-base sm:text-lg max-w-2xl mx-auto">
                UniTrack gives your institution the tools, visibility, and students to hit your
                enrolment goals.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-[#EEF4FF] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#0055c3] transition-colors duration-300">
                    <span className="material-symbols-outlined text-[#0055c3] text-2xl group-hover:text-white transition-colors duration-300">
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
              <span className="inline-block py-1 px-4 rounded-full bg-[#dce8ff] text-[#0055c3] text-xs font-bold uppercase tracking-widest mb-4">
                Simple Process
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#131b31] mb-4">
                Get Started in 3 Steps
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#0055c3] text-white flex items-center justify-center text-2xl font-extrabold mx-auto mb-5 shadow-lg">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-bold text-[#131b31] mb-2">{s.title}</h3>
                  <p className="text-[#5A6484] text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="partner-form" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F5F8FF]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block py-1 px-4 rounded-full bg-[#dce8ff] text-[#0055c3] text-xs font-bold uppercase tracking-widest mb-4">
                Apply Now
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#131b31] mb-4">
                Start Your Partnership
              </h2>
              <p className="text-[#434A63] text-base">
                Fill out the form below and our team will review your application within 2 business
                days.
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
                  Thank you for applying. Our partnership team will contact you within 2 business
                  days.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-[#0055c3] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#0044a0] transition-colors"
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
                  Institution Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                      Institution Name *
                    </label>
                    <input
                      name="institutionName"
                      required
                      value={formData.institutionName}
                      onChange={handleChange}
                      placeholder="e.g. University of Edinburgh"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition-all"
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
                      placeholder="e.g. United Kingdom"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                      Institution Type *
                    </label>
                    <select
                      name="institutionType"
                      required
                      value={formData.institutionType}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select type</option>
                      <option>Public University</option>
                      <option>Private University</option>
                      <option>College or Community College</option>
                      <option>Vocational Institute</option>
                      <option>Language School</option>
                      <option>Online Institution</option>
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
                      placeholder="https://www.example.ac.uk"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                      Annual Int&apos;l Enrolment
                    </label>
                    <select
                      name="annualEnrolment"
                      value={formData.annualEnrolment}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select range</option>
                      <option>Under 100 students</option>
                      <option>100 to 500 students</option>
                      <option>500 to 2000 students</option>
                      <option>2000 to 10000 students</option>
                      <option>10000+ students</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                      Programs Offered
                    </label>
                    <input
                      name="programs"
                      value={formData.programs}
                      onChange={handleChange}
                      placeholder="e.g. BSc Computer Science, MBA..."
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition-all"
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
                      placeholder="Dr. Jane Smith"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition-all"
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
                      placeholder="partnerships@example.ac.uk"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition-all"
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
                      placeholder="+44 20 1234 5678"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2">
                    Additional Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your institution, recruitment goals, or any questions..."
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0055c3] text-white py-4 rounded-xl font-extrabold text-base hover:bg-[#0044a0] transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">send</span>Submit
                      Partnership Application
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
              Have Questions? Talk to Our Team.
            </h2>
            <p className="text-white/70 text-base mb-8">
              Mon to Fri, 9am to 6pm UTC. We typically respond within a few hours.
            </p>
            <a
              href="mailto:partners@unitrack.com"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all text-sm"
            >
              <span className="material-symbols-outlined text-lg">mail</span>
              partners@unitrack.com
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import PartnerApplicationForm from "./PartnerApplicationForm";
import {
  PartnerFooterCta,
  PartnerHero,
  PartnerInfoSections,
  PartnerSubmittedCard,
} from "./PartnerSections";

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
        <PartnerHero />
        <PartnerInfoSections />

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
              <PartnerSubmittedCard />
            ) : (
              <PartnerApplicationForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={loading}
              />
            )}
          </div>
        </section>

        <PartnerFooterCta />
      </main>
    </div>
  );
}

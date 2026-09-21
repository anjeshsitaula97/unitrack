"use client";

import { useState } from "react";

export default function DemoForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="lg:col-span-5 bg-white/5 backdrop-blur-md p-6 lg:p-8 rounded-2xl space-y-4">
      <div className="font-headline-sm text-[18px] text-white font-bold">
        Schedule Personalized Agency Demo
      </div>
      {!submitted ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <div>
            <label className="block font-label-pill text-label-pill uppercase text-slate-400 mb-1">Consultancy Name</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder:text-slate-500 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="e.g. Landmark Educational Hub"
              required
              type="text"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-pill text-label-pill uppercase text-slate-400 mb-1">Branch Count</label>
              <select className="w-full px-3 py-2.5 rounded-xl bg-white/10 text-white font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option className="text-slate-900">1 Branch</option>
                <option className="text-slate-900">2 - 4 Branches</option>
                <option className="text-slate-900">5+ Branches</option>
              </select>
            </div>
            <div>
              <label className="block font-label-pill text-label-pill uppercase text-slate-400 mb-1">Primary Intake Hub</label>
              <select className="w-full px-3 py-2.5 rounded-xl bg-white/10 text-white font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option className="text-slate-900">Kathmandu, Nepal</option>
                <option className="text-slate-900">Sydney, Australia</option>
                <option className="text-slate-900">New Delhi, India</option>
                <option className="text-slate-900">Other Regional</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-label-pill text-label-pill uppercase text-slate-400 mb-1">Direct Phone / WhatsApp</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder:text-slate-500 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="+977 980-0000000"
              required
              type="tel"
            />
          </div>
          <button
            className="w-full mt-2 py-3 px-4 rounded-full bg-indigo-600 text-white font-label-btn text-label-btn font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition-all"
            type="submit"
          >
            <span>Confirm Walkthrough Session</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-indigo-500/20 text-indigo-200 text-[14px] font-body-sm text-center">
          Request received. A senior education solution consultant will WhatsApp you within 30 minutes.
        </div>
      )}
    </div>
  );
}
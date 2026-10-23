"use client";

import { useState } from "react";

export default function DemoForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="lg:col-span-5 rounded-2xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur-md lg:p-8 space-y-4">
      <div className="font-headline-sm text-[18px] text-white font-bold">Book a Free Demo</div>
      {!submitted ? (
        <form
          className="space-y-3"
          action={() => {
            setSubmitted(true);
          }}
        >
          <div>
            <label
              className="block font-label-pill text-label-pill uppercase text-indigo-100 mb-1"
              htmlFor="demo-consultancy-name"
            >
              Consultancy Name
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder:text-indigo-200/70 ring-1 ring-white/15 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-white"
              id="demo-consultancy-name"
              placeholder="e.g. Landmark Educational Hub"
              required
              type="text"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block font-label-pill text-label-pill uppercase text-indigo-100 mb-1"
                htmlFor="demo-branch-count"
              >
                Branch Count
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 text-white ring-1 ring-white/15 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-white"
                id="demo-branch-count"
              >
                <option className="text-slate-900">1 Branch</option>
                <option className="text-slate-900">2 - 4 Branches</option>
                <option className="text-slate-900">5+ Branches</option>
              </select>
            </div>
            <div>
              <label
                className="block font-label-pill text-label-pill uppercase text-indigo-100 mb-1"
                htmlFor="demo-intake-hub"
              >
                Main Office
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 text-white ring-1 ring-white/15 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-white"
                id="demo-intake-hub"
              >
                <option className="text-slate-900">Kathmandu, Nepal</option>
                <option className="text-slate-900">Sydney, Australia</option>
                <option className="text-slate-900">New Delhi, India</option>
                <option className="text-slate-900">Other Regional</option>
              </select>
            </div>
          </div>
          <div>
            <label
              className="block font-label-pill text-label-pill uppercase text-indigo-100 mb-1"
              htmlFor="demo-phone"
            >
              Direct Phone / WhatsApp
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder:text-indigo-200/70 ring-1 ring-white/15 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-white"
              id="demo-phone"
              placeholder="+977 980-0000000"
              required
              type="tel"
            />
          </div>
          <button
            className="w-full mt-2 py-3 px-4 rounded-full bg-white text-indigo-700 font-label-btn text-label-btn font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/30 hover:bg-indigo-50 transition"
            type="submit"
          >
            <span>Book My Demo</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-white/15 text-white text-[14px] font-body-sm text-center">
          Thanks! Our team will WhatsApp you within 30 minutes.
        </div>
      )}
    </div>
  );
}

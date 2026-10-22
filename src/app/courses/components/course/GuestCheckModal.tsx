"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { GuestDetails } from "./types";

export default function GuestCheckModal({
  onClose,
  onSave,
  initialDetails,
}: {
  onClose: () => void;
  onSave: (details: GuestDetails) => void;
  initialDetails: GuestDetails;
}) {
  const [details, setDetails] = useState<GuestDetails>(initialDetails);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden border border-white/20">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-800">Guest Student Details</h3>
            <button type="button" aria-label="Close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="guest-qualification"
                className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
              >
                Highest Qualification
              </label>
              <select
                id="guest-qualification"
                value={details.qualification}
                onChange={(e) => setDetails({ ...details, qualification: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition cursor-pointer"
              >
                <option value="">Select Qualification…</option>
                <option value="+2/Grade XII">+2 / Grade XII</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="guest-score"
                className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
              >
                GPA / Percentage
              </label>
              <input
                id="guest-score"
                type="text"
                value={details.score}
                onChange={(e) => setDetails({ ...details, score: e.target.value })}
                placeholder="e.g. 3.5 or 75%"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="guest-test-type"
                  className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
                >
                  English Test
                </label>
                <select
                  id="guest-test-type"
                  value={details.testType}
                  onChange={(e) => setDetails({ ...details, testType: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition cursor-pointer"
                >
                  <option value="">Select Test…</option>
                  <option value="IELTS">IELTS</option>
                  <option value="PTE">PTE</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="DuoLingo">DuoLingo</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="guest-overall-score"
                  className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
                >
                  Overall Score
                </label>
                <input
                  id="guest-overall-score"
                  type="text"
                  value={details.overallScore}
                  onChange={(e) => setDetails({ ...details, overallScore: e.target.value })}
                  placeholder="e.g. 7.0 or 65"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 border border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(details);
                onClose();
              }}
              className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition text-xs uppercase tracking-widest"
            >
              Save &amp; Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

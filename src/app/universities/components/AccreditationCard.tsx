"use client";

import React from "react";
import { Award, X } from "lucide-react";

const ACCREDITATION_BODIES = [
  "NECHE",
  "WSCUC",
  "HLC",
  "SACSCOC",
  "QAA",
  "ASIIN",
  "AAQ",
  "CPE",
  "NIAD-QE",
  "KCUE",
  "NAAC",
  "ANVUR",
  "CHE",
  "TEQSA",
  "CACUSS",
];

interface AccreditationCardProps {
  form: any;
  update: (field: string, value: any) => void;
  accInput: string;
  setAccInput: (value: string) => void;
}

export default function AccreditationCard({
  form,
  update,
  accInput,
  setAccInput,
}: AccreditationCardProps) {
  const addAccreditation = () => {
    const trimmed = accInput.trim();
    if (!trimmed) return;
    update("accreditation", [...(form.accreditation || []), trimmed]);
    setAccInput("");
  };

  const removeAccreditation = (index: number) => {
    const list = [...(form.accreditation || [])];
    list.splice(index, 1);
    update("accreditation", list);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="size-8 bg-violet-50 rounded-lg flex items-center justify-center">
          <Award size={16} className="text-violet-600" />
        </div>
        <h2 className="text-base font-bold text-slate-700">Accreditation</h2>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={accInput}
              onChange={(e) => setAccInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAccreditation();
                }
              }}
              list="accreditation-list"
              placeholder="Type accreditation body name…"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <datalist id="accreditation-list">
              {ACCREDITATION_BODIES.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </div>
          <button
            type="button"
            onClick={addAccreditation}
            className="btn-primary px-4 text-sm whitespace-nowrap"
            aria-label="Add accreditation body"
          >
            Add
          </button>
        </div>

        {(form.accreditation || []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(form.accreditation || []).map((item: string, idx: number) => (
              <div
                key={item}
                className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-200"
              >
                {item}
                <button
                  type="button"
                  aria-label={`Remove ${item}`}
                  onClick={() => removeAccreditation(idx)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

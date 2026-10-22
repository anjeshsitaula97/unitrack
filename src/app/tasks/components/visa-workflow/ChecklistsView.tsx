"use client";

import { Plus, ListChecks, FileText } from "lucide-react";
import ChecklistRow from "./ChecklistRow";
import type { VisaWorkflowController } from "./useVisaWorkflow";

export default function ChecklistsView({ workflow }: { workflow: VisaWorkflowController }) {
  const { country, visaType, checklists, generateChecklistPDF, setShowChecklistModal } = workflow;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Document Checklist</h2>
          <p className="text-sm text-slate-500 mt-1">
            Required paperwork for {country} {visaType}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={generateChecklistPDF}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-[color,background-color,border-color,box-shadow,transform,opacity] flex items-center gap-2 shadow-lg shadow-emerald-100"
          >
            <FileText size={16} /> Generate PDF
          </button>
          <button
            type="button"
            onClick={() => setShowChecklistModal(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-[color,background-color,border-color,box-shadow,transform,opacity] flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Plus size={16} /> Add Requirement
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Document
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Requirements
              </th>
              <th className="text-center px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest w-28">
                Status
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest w-20">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {checklists.map((item) => (
              <ChecklistRow key={item.id} item={item} workflow={workflow} />
            ))}
          </tbody>
        </table>
        {checklists.length === 0 && (
          <div className="py-20 text-center">
            <ListChecks size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">
              No document requirements added yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

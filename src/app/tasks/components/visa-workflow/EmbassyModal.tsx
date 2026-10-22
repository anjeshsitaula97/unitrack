"use client";

import type { VisaWorkflowController } from "./useVisaWorkflow";

export default function EmbassyModal({ workflow }: { workflow: VisaWorkflowController }) {
  const { setShowEmbassyModal, handleEmbassySubmit, isSubmitting, embassyForm, setEmbassyForm } =
    workflow;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        aria-label="Close embassy dialog"
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={() => setShowEmbassyModal(false)}
      />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-100 bg-indigo-50/30">
          <h2 className="text-xl font-black text-slate-800">Embassy Details</h2>
        </div>
        <form
          onSubmit={handleEmbassySubmit}
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar"
        >
          <input
            aria-label="Embassy/Consulate Name"
            required
            placeholder="Embassy/Consulate Name"
            value={embassyForm.name}
            onChange={(e) => setEmbassyForm({ ...embassyForm, name: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-indigo-500"
          />
          <input
            aria-label="Address"
            placeholder="Address"
            value={embassyForm.address}
            onChange={(e) => setEmbassyForm({ ...embassyForm, address: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              aria-label="Phone"
              placeholder="Phone"
              value={embassyForm.phone}
              onChange={(e) => setEmbassyForm({ ...embassyForm, phone: e.target.value })}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500"
            />
            <input
              aria-label="Email"
              type="email"
              placeholder="Email"
              value={embassyForm.email}
              onChange={(e) => setEmbassyForm({ ...embassyForm, email: e.target.value })}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500"
            />
          </div>
          <input
            aria-label="Website URL"
            placeholder="Website URL"
            value={embassyForm.website}
            onChange={(e) => setEmbassyForm({ ...embassyForm, website: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500"
          />
          <input
            aria-label="Working Hours (e.g. Mon-Fri 9AM-4PM)"
            placeholder="Working Hours (e.g. Mon-Fri 9AM-4PM)"
            value={embassyForm.workingHours}
            onChange={(e) => setEmbassyForm({ ...embassyForm, workingHours: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500"
          />
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEmbassyModal(false)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

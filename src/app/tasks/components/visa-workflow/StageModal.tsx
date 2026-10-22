"use client";

import type { VisaWorkflowController } from "./useVisaWorkflow";

export default function StageModal({ workflow }: { workflow: VisaWorkflowController }) {
  const { setShowStageModal, handleStageSubmit, isSubmitting, stageForm, setStageForm } = workflow;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        aria-label="Close stage dialog"
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={() => setShowStageModal(false)}
      />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-100 bg-indigo-50/30">
          <h2 className="text-xl font-black text-slate-800">Add Workflow Stage</h2>
        </div>
        <form onSubmit={handleStageSubmit} className="p-6 space-y-4">
          <input
            aria-label="Stage Name (e.g. Initial Assessment)"
            required
            placeholder="Stage Name (e.g. Initial Assessment)"
            value={stageForm.name}
            onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-indigo-500"
          />
          <textarea
            aria-label="Description"
            rows={2}
            placeholder="Description"
            value={stageForm.description}
            onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500 resize-none"
          />
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowStageModal(false)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
            >
              Add Stage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

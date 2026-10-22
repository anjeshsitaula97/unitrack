"use client";

import { X } from "lucide-react";
import type { VisaWorkflowController } from "./useVisaWorkflow";

export default function ChecklistModal({ workflow }: { workflow: VisaWorkflowController }) {
  const {
    setShowChecklistModal,
    setEditingChecklist,
    setChecklistForm,
    setDescriptionInput,
    handleChecklistSubmit,
    isSubmitting,
    checklistForm,
    descriptionInput,
    editingChecklist,
  } = workflow;

  const resetAndClose = () => {
    setShowChecklistModal(false);
    setEditingChecklist(null);
    setChecklistForm({ title: "", descriptions: [], isRequired: true });
    setDescriptionInput("");
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        aria-label="Close checklist dialog"
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={resetAndClose}
      />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-100 bg-indigo-50/30">
          <h2 className="text-xl font-black text-slate-800">
            {editingChecklist ? "Edit Document/Checklist Item" : "Add Document/Checklist Item"}
          </h2>
        </div>
        <form onSubmit={handleChecklistSubmit} className="p-6 space-y-4">
          <input
            aria-label="Document Name (e.g. Passport)"
            required
            placeholder="Document Name (e.g. Passport)"
            value={checklistForm.title}
            onChange={(e) => setChecklistForm({ ...checklistForm, title: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-indigo-500"
          />
          <div role="group" aria-labelledby="checklist-requirements-label" className="space-y-2">
            <span
              id="checklist-requirements-label"
              className="text-xs font-bold text-slate-500 uppercase tracking-widest"
            >
              Requirements
            </span>
            {checklistForm.descriptions.map((d) => (
              <div key={d} className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5">
                <span className="flex-1 text-sm text-slate-700">{d}</span>
                <button
                  aria-label="Remove checklist item"
                  type="button"
                  onClick={() => {
                    setChecklistForm({
                      ...checklistForm,
                      descriptions: checklistForm.descriptions.filter((item) => item !== d),
                    });
                  }}
                  className="p-1 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-[color,background-color,border-color,box-shadow,transform,opacity] shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                aria-label="Add a requirement..."
                placeholder="Add a requirement..."
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && descriptionInput.trim()) {
                    e.preventDefault();
                    setChecklistForm({
                      ...checklistForm,
                      descriptions: [...checklistForm.descriptions, descriptionInput.trim()],
                    });
                    setDescriptionInput("");
                  }
                }}
              />
              <button
                type="button"
                disabled={!descriptionInput.trim()}
                onClick={() => {
                  setChecklistForm({
                    ...checklistForm,
                    descriptions: [...checklistForm.descriptions, descriptionInput.trim()],
                  });
                  setDescriptionInput("");
                }}
                className="px-4 py-2.5 bg-indigo-100 text-indigo-600 font-bold rounded-xl hover:bg-indigo-200 disabled:opacity-50 transition-[color,background-color,border-color,box-shadow,transform,opacity] shrink-0"
              >
                Add
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRequired"
              checked={checklistForm.isRequired}
              onChange={(e) => setChecklistForm({ ...checklistForm, isRequired: e.target.checked })}
              className="size-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isRequired" className="text-sm font-bold text-slate-700">
              Required Document
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={resetAndClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
            >
              {editingChecklist ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

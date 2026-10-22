"use client";

import { Plus } from "lucide-react";

export default function AddWorkflowStageForm({
  newStageName,
  newStageDesc,
  savingStage,
  onNameChange,
  onDescChange,
  onAddStage,
}: {
  newStageName: string;
  newStageDesc: string;
  savingStage: boolean;
  onNameChange: (value: string) => void;
  onDescChange: (value: string) => void;
  onAddStage: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Add Workflow Stage</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          aria-label="Stage name"
          placeholder="Stage name (e.g. Document Verification)"
          value={newStageName}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onAddStage()}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent outline-none"
        />
        <input
          type="text"
          aria-label="Stage description"
          placeholder="Description (optional)"
          value={newStageDesc}
          onChange={(e) => onDescChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onAddStage()}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent outline-none"
        />
        <button
          type="button"
          onClick={onAddStage}
          disabled={savingStage || !newStageName.trim()}
          className="px-4 py-2 bg-[#1d4ed8] text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Plus size={16} />
          {savingStage ? "Adding…" : "Add"}
        </button>
      </div>
    </div>
  );
}

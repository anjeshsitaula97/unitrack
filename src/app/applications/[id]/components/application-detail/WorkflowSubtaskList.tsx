"use client";

import { Check, Plus, Trash2, X } from "lucide-react";
import type { Subtask } from "./types";

export default function WorkflowSubtaskList({
  stageId,
  subtasks,
  adding,
  subtaskInput,
  onToggleSubtask,
  onDeleteSubtask,
  onStartAdd,
  onSubtaskInputChange,
  onAddSubtask,
  onCancelSubtask,
}: {
  stageId: string;
  subtasks: Subtask[];
  adding: boolean;
  subtaskInput: string;
  onToggleSubtask: (stageId: string, subtaskId: string) => void;
  onDeleteSubtask: (stageId: string, subtaskId: string) => void;
  onStartAdd: (stageId: string) => void;
  onSubtaskInputChange: (stageId: string, value: string) => void;
  onAddSubtask: (stageId: string) => void;
  onCancelSubtask: (stageId: string) => void;
}) {
  return (
    <div className="px-5 py-3 space-y-1">
      {subtasks.map((st) => (
        <div
          key={st.id}
          className="group flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50"
        >
          <button
            type="button"
            onClick={() => onToggleSubtask(stageId, st.id)}
            aria-label={st.done ? "Mark subtask incomplete" : "Mark subtask complete"}
            className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              st.done
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-slate-300 hover:border-[#1d4ed8]"
            }`}
          >
            {st.done && <Check size={12} strokeWidth={3} />}
          </button>
          <span
            className={`text-sm flex-1 ${st.done ? "line-through text-slate-400" : "text-slate-700"}`}
          >
            {st.title}
          </span>
          <button
            type="button"
            onClick={() => onDeleteSubtask(stageId, st.id)}
            aria-label="Delete subtask"
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {adding ? (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            autoFocus
            aria-label="Subtask title"
            placeholder="Subtask title"
            value={subtaskInput}
            onChange={(e) => onSubtaskInputChange(stageId, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddSubtask(stageId);
              }
              if (e.key === "Escape") {
                onCancelSubtask(stageId);
              }
            }}
            className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent outline-none"
          />
          <button
            type="button"
            onClick={() => onAddSubtask(stageId)}
            disabled={!subtaskInput.trim()}
            aria-label="Add subtask"
            className="px-2 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={() => onCancelSubtask(stageId)}
            aria-label="Cancel subtask"
            className="px-2 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-300"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onStartAdd(stageId)}
          className="flex items-center gap-2 text-xs font-semibold text-[#1d4ed8] hover:text-blue-700 pt-1 pb-1"
        >
          <Plus size={14} />
          Add subtask
        </button>
      )}
    </div>
  );
}

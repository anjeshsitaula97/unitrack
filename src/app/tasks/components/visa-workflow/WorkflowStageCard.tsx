"use client";

import {
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  X,
  ClipboardCheck,
  Search,
  Shield,
  Stamp,
  Plane,
  ScrollText,
  BookOpen,
  FileText,
} from "lucide-react";
import type { VisaWorkflowController } from "./useVisaWorkflow";
import type { WorkflowStage } from "./types";
import { deleteItem, parseSubtasks } from "./utils";

export default function WorkflowStageCard({
  stage,
  index,
  total,
  workflow,
}: {
  stage: WorkflowStage;
  index: number;
  total: number;
  workflow: VisaWorkflowController;
}) {
  const {
    addingSubtaskStageId,
    setAddingSubtaskStageId,
    newSubtaskTitle,
    setNewSubtaskTitle,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    fetchStages,
  } = workflow;

  return (
    <div className="flex items-start group">
      <div className="relative flex flex-col items-center text-center w-64">
        {/* Connection Line */}
        {index < total - 1 && (
          <div className="absolute top-8 left-1/2 w-full h-[3px] bg-gradient-to-r from-indigo-200 via-indigo-100 to-indigo-200 z-0" />
        )}

        {/* Stage Circle */}
        <div className="relative z-10 size-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50 mb-4 group-hover:shadow-xl group-hover:shadow-indigo-300/50 group-hover:scale-105 transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {(() => {
            const Icon = [
              ClipboardCheck,
              Search,
              Shield,
              Stamp,
              Plane,
              ScrollText,
              BookOpen,
              FileText,
            ][index % 8];
            return <Icon size={18} />;
          })()}

          <button
            aria-label="Delete stage"
            type="button"
            onClick={() => deleteItem("/api/workflow-stages", stage.id, fetchStages)}
            className="absolute -top-1.5 -right-1.5 p-1.5 bg-white shadow-md text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-[color,background-color,border-color,box-shadow,transform,opacity] rounded-lg border border-slate-50 hover:scale-110 active:scale-90"
          >
            <Trash2 size={10} />
          </button>
        </div>

        {/* Content Card */}
        <div className="px-3 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm group-hover:shadow-lg group-hover:border-indigo-100 transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-300 w-full mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 group-hover:text-indigo-600 transition-colors">
            {stage.name}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium leading-snug line-clamp-2 mb-2">
            {stage.description || "Application processing stage."}
          </p>
          {(() => {
            const subs = parseSubtasks(stage.subtasks);
            return (
              <div className="space-y-1 mt-2 border-t border-slate-100 pt-2">
                {subs.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-1.5 group/sub">
                    <button
                      aria-label="Toggle subtask completion"
                      type="button"
                      onClick={() => toggleSubtask(stage.id, sub.id)}
                      className={`size-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${sub.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-indigo-400"}`}
                    >
                      {sub.done && <CheckCircle2 size={8} />}
                    </button>
                    <span
                      className={`text-[10px] font-medium flex-1 text-left truncate ${sub.done ? "text-slate-400 line-through" : "text-slate-600"}`}
                    >
                      {sub.title}
                    </span>
                    <button
                      aria-label="Delete subtask"
                      type="button"
                      onClick={() => deleteSubtask(stage.id, sub.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover/sub:opacity-100 transition-[color,background-color,border-color,box-shadow,transform,opacity]"
                    >
                      <Trash2 size={8} />
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}
          {addingSubtaskStageId === stage.id ? (
            <div className="flex items-center gap-1 mt-2">
              <input
                aria-label="Subtask title..."
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSubtask(stage.id);
                  if (e.key === "Escape") {
                    setAddingSubtaskStageId(null);
                    setNewSubtaskTitle("");
                  }
                }}
                placeholder="Subtask title..."
                autoFocus
                className="flex-1 px-2 py-1 text-[10px] border border-indigo-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <button
                aria-label="Add subtask"
                type="button"
                onClick={() => addSubtask(stage.id)}
                className="p-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus size={8} />
              </button>
              <button
                aria-label="Cancel adding subtask"
                type="button"
                onClick={() => {
                  setAddingSubtaskStageId(null);
                  setNewSubtaskTitle("");
                }}
                className="p-1 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200"
              >
                <X size={8} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAddingSubtaskStageId(stage.id);
                setNewSubtaskTitle("");
              }}
              className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-600 transition-colors"
            >
              <Plus size={10} /> Add subtask
            </button>
          )}
        </div>

        {/* Connector Arrow */}
        {index < total - 1 && (
          <div className="absolute top-[22px] left-[calc(50%+3.5rem)] z-20 flex items-center justify-center size-5 bg-white rounded-full border border-indigo-50 shadow-sm">
            <ChevronRight size={10} className="text-indigo-400" />
          </div>
        )}
      </div>
    </div>
  );
}

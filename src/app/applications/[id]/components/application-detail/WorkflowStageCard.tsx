"use client";

import { GripVertical, Trash2 } from "lucide-react";
import WorkflowSubtaskList from "./WorkflowSubtaskList";
import { parseSubtasks } from "./utils";
import type { WorkflowStage } from "./types";

export default function WorkflowStageCard({
  stage,
  index,
  addingSubtaskTo,
  subtaskInputs,
  onDeleteStage,
  onToggleSubtask,
  onDeleteSubtask,
  onStartAddSubtask,
  onSubtaskInputChange,
  onAddSubtask,
  onCancelSubtask,
}: {
  stage: WorkflowStage;
  index: number;
  addingSubtaskTo: string | null;
  subtaskInputs: Record<string, string>;
  onDeleteStage: (stageId: string) => void;
  onToggleSubtask: (stageId: string, subtaskId: string) => void;
  onDeleteSubtask: (stageId: string, subtaskId: string) => void;
  onStartAddSubtask: (stageId: string) => void;
  onSubtaskInputChange: (stageId: string, value: string) => void;
  onAddSubtask: (stageId: string) => void;
  onCancelSubtask: (stageId: string) => void;
}) {
  const subtasks = parseSubtasks(stage.subtasks);
  const doneCount = subtasks.filter((s) => s.done).length;
  const progress = subtasks.length > 0 ? Math.round((doneCount / subtasks.length) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div className="cursor-grab text-slate-400 hover:text-slate-600">
          <GripVertical size={18} />
        </div>
        <div className="w-8 h-8 bg-[#1d4ed8] text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 text-sm">{stage.name}</h4>
          {stage.description && (
            <p className="text-xs text-slate-500 mt-0.5">{stage.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {subtasks.length > 0 && (
            <span className="text-xs font-semibold text-slate-500">
              {doneCount}/{subtasks.length}
            </span>
          )}
          <button
            type="button"
            onClick={() => onDeleteStage(stage.id)}
            className="text-slate-400 hover:text-red-500 transition-colors"
            title="Delete stage"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {subtasks.length > 0 && (
        <div className="px-5 pt-3">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <WorkflowSubtaskList
        stageId={stage.id}
        subtasks={subtasks}
        adding={addingSubtaskTo === stage.id}
        subtaskInput={subtaskInputs[stage.id] || ""}
        onToggleSubtask={onToggleSubtask}
        onDeleteSubtask={onDeleteSubtask}
        onStartAdd={onStartAddSubtask}
        onSubtaskInputChange={onSubtaskInputChange}
        onAddSubtask={onAddSubtask}
        onCancelSubtask={onCancelSubtask}
      />
    </div>
  );
}

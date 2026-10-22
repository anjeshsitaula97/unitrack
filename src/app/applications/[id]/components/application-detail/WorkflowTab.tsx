"use client";

import { Loader2 } from "lucide-react";
import AddWorkflowStageForm from "./AddWorkflowStageForm";
import WorkflowStageCard from "./WorkflowStageCard";
import type { WorkflowStage } from "./types";

export default function WorkflowTab({
  wfStages,
  wfLoading,
  newStageName,
  newStageDesc,
  savingStage,
  addingSubtaskTo,
  subtaskInputs,
  onNameChange,
  onDescChange,
  onAddStage,
  onDeleteStage,
  onToggleSubtask,
  onDeleteSubtask,
  onStartAddSubtask,
  onSubtaskInputChange,
  onAddSubtask,
  onCancelSubtask,
}: {
  wfStages: WorkflowStage[];
  wfLoading: boolean;
  newStageName: string;
  newStageDesc: string;
  savingStage: boolean;
  addingSubtaskTo: string | null;
  subtaskInputs: Record<string, string>;
  onNameChange: (value: string) => void;
  onDescChange: (value: string) => void;
  onAddStage: () => void;
  onDeleteStage: (stageId: string) => void;
  onToggleSubtask: (stageId: string, subtaskId: string) => void;
  onDeleteSubtask: (stageId: string, subtaskId: string) => void;
  onStartAddSubtask: (stageId: string) => void;
  onSubtaskInputChange: (stageId: string, value: string) => void;
  onAddSubtask: (stageId: string) => void;
  onCancelSubtask: (stageId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <AddWorkflowStageForm
        newStageName={newStageName}
        newStageDesc={newStageDesc}
        savingStage={savingStage}
        onNameChange={onNameChange}
        onDescChange={onDescChange}
        onAddStage={onAddStage}
      />

      {wfLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} />
          <span className="text-sm">Loading workflow…</span>
        </div>
      ) : wfStages.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
          No workflow stages yet. Add one above to start tracking this application.
        </div>
      ) : (
        wfStages.map((stage, idx) => (
          <WorkflowStageCard
            key={stage.id}
            stage={stage}
            index={idx}
            addingSubtaskTo={addingSubtaskTo}
            subtaskInputs={subtaskInputs}
            onDeleteStage={onDeleteStage}
            onToggleSubtask={onToggleSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onStartAddSubtask={onStartAddSubtask}
            onSubtaskInputChange={onSubtaskInputChange}
            onAddSubtask={onAddSubtask}
            onCancelSubtask={onCancelSubtask}
          />
        ))
      )}
    </div>
  );
}

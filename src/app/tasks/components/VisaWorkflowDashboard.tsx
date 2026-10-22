"use client";

import { Loader2 } from "lucide-react";
import { useVisaWorkflow } from "./visa-workflow/useVisaWorkflow";
import VisaWorkflowTabs from "./visa-workflow/VisaWorkflowTabs";
import WorkflowProcessView from "./visa-workflow/WorkflowProcessView";
import ChecklistsView from "./visa-workflow/ChecklistsView";
import EmbassyView from "./visa-workflow/EmbassyView";
import TasksView from "./visa-workflow/TasksView";
import TaskModal from "./visa-workflow/TaskModal";
import EmbassyModal from "./visa-workflow/EmbassyModal";
import ChecklistModal from "./visa-workflow/ChecklistModal";
import PdfPreviewModal from "./visa-workflow/PdfPreviewModal";
import StageModal from "./visa-workflow/StageModal";
import type { VisaWorkflowDashboardProps } from "./visa-workflow/types";

export default function VisaWorkflowDashboard({ country, visaType }: VisaWorkflowDashboardProps) {
  const workflow = useVisaWorkflow(country, visaType);

  if (workflow.isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin" size={32} />
        <p className="text-sm font-medium">Loading {visaType} details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <VisaWorkflowTabs activeTab={workflow.activeTab} onChange={workflow.setActiveTab} />

      {/* Process View */}
      {workflow.activeTab === "process" && <WorkflowProcessView workflow={workflow} />}

      {/* Checklists View */}
      {workflow.activeTab === "checklists" && <ChecklistsView workflow={workflow} />}

      {/* Embassy View */}
      {workflow.activeTab === "embassy" && <EmbassyView workflow={workflow} />}

      {/* Kanban Board View */}
      {workflow.activeTab === "tasks" && <TasksView workflow={workflow} />}

      {/* Modals */}

      {/* Task Modal */}
      {workflow.showTaskModal && <TaskModal workflow={workflow} />}

      {/* Embassy Modal */}
      {workflow.showEmbassyModal && <EmbassyModal workflow={workflow} />}

      {/* Checklist Modal */}
      {workflow.showChecklistModal && <ChecklistModal workflow={workflow} />}

      {/* PDF Preview Modal */}
      {workflow.pdfPreviewUrl && (
        <PdfPreviewModal workflow={workflow} pdfPreviewUrl={workflow.pdfPreviewUrl} />
      )}

      {/* Stage Modal */}
      {workflow.showStageModal && <StageModal workflow={workflow} />}
    </div>
  );
}

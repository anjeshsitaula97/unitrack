"use client";

import { useState } from "react";
import { useVisaWorkflowActions } from "./useVisaWorkflowActions";
import { useVisaWorkflowData } from "./useVisaWorkflowData";
import { useStageScroll } from "./useStageScroll";
import type { TaskView, VisaWorkflowTab } from "./types";

export function useVisaWorkflow(country: string, visaType: string) {
  const [activeTab, setActiveTab] = useState<VisaWorkflowTab>("process");
  const [taskView, setTaskView] = useState<TaskView>("grid");

  const data = useVisaWorkflowData(country, visaType);
  const scroll = useStageScroll();
  const actions = useVisaWorkflowActions({
    country,
    visaType,
    checklists: data.checklists,
    workflowStages: data.workflowStages,
    embassyForm: data.embassyForm,
    stageForm: data.stageForm,
    setStageForm: data.setStageForm,
    fetchTasks: data.fetchTasks,
    fetchEmbassy: data.fetchEmbassy,
    fetchChecklists: data.fetchChecklists,
    fetchStages: data.fetchStages,
  });

  return {
    country,
    visaType,
    activeTab,
    setActiveTab,
    taskView,
    setTaskView,
    ...data,
    ...scroll,
    ...actions,
  };
}

export type VisaWorkflowController = ReturnType<typeof useVisaWorkflow>;

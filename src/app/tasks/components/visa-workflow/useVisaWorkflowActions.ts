"use client";

import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import { generateChecklistPdf } from "./generateChecklistPdf";
import type {
  ChecklistForm,
  EmbassyForm,
  StageForm,
  TaskForm,
  VisaChecklist,
  WorkflowStage,
} from "./types";
import { parseSubtasks } from "./utils";

export function useVisaWorkflowActions({
  country,
  visaType,
  checklists,
  workflowStages,
  embassyForm,
  stageForm,
  setStageForm,
  fetchTasks,
  fetchEmbassy,
  fetchChecklists,
  fetchStages,
}: {
  country: string;
  visaType: string;
  checklists: VisaChecklist[];
  workflowStages: WorkflowStage[];
  embassyForm: EmbassyForm;
  stageForm: StageForm;
  setStageForm: React.Dispatch<React.SetStateAction<StageForm>>;
  fetchTasks: () => void;
  fetchEmbassy: () => void;
  fetchChecklists: () => void;
  fetchStages: () => void;
}) {
  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEmbassyModal, setShowEmbassyModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  // Forms state
  const [taskForm, setTaskForm] = useState<TaskForm>({
    title: "",
    description: "",
    status: "Todo",
    priority: "Medium",
    dueDate: "",
    assignee: "",
  });
  const [checklistForm, setChecklistForm] = useState<ChecklistForm>({
    title: "",
    descriptions: [],
    isRequired: true,
  });
  const [descriptionInput, setDescriptionInput] = useState("");
  const [editingChecklist, setEditingChecklist] = useState<VisaChecklist | null>(null);
  const [addingSubtaskStageId, setAddingSubtaskStageId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Submission Handlers
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...taskForm, country, visaType }),
      });
      if (res.ok) {
        toast.success("Task created successfully");
        setShowTaskModal(false);
        setTaskForm({
          title: "",
          description: "",
          status: "Todo",
          priority: "Medium",
          dueDate: "",
          assignee: "",
        });
        fetchTasks();
      }
    } catch (_err) {
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmbassySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/embassy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...embassyForm, country, visaType }),
      });
      if (res.ok) {
        toast.success("Embassy details saved");
        setShowEmbassyModal(false);
        fetchEmbassy();
      }
    } catch (_err) {
      toast.error("Failed to save embassy details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChecklistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingChecklist;
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/visa-checklists", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEdit ? { id: editingChecklist.id } : { country, visaType }),
          title: checklistForm.title,
          description: JSON.stringify(checklistForm.descriptions),
          isRequired: checklistForm.isRequired,
        }),
      });
      if (res.ok) {
        toast.success(isEdit ? "Checklist item updated" : "Checklist item added");
        setShowChecklistModal(false);
        setEditingChecklist(null);
        setChecklistForm({ title: "", descriptions: [], isRequired: true });
        setDescriptionInput("");
        fetchChecklists();
      } else {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        toast.error(err.error || "Failed to save checklist item");
      }
    } catch (_err) {
      toast.error(isEdit ? "Failed to update checklist item" : "Failed to add checklist item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateChecklistPDF = useCallback(async () => {
    const blob = generateChecklistPdf(checklists, country, visaType);
    const url = URL.createObjectURL(blob);
    setPdfPreviewUrl(url);
  }, [checklists, country, visaType]);

  const closePdfPreview = () => {
    setPdfPreviewUrl(null);
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
  };

  const handleStageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/workflow-stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...stageForm, country, visaType }),
      });
      if (res.ok) {
        toast.success("Workflow stage added");
        setShowStageModal(false);
        setStageForm({ name: "", description: "", order: workflowStages.length + 2 });
        fetchStages();
      }
    } catch (_err) {
      toast.error("Failed to add workflow stage");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchTasks();
    } catch (_err) {
      toast.error("Failed to update task status");
    }
  };

  const addSubtask = async (stageId: string) => {
    if (!newSubtaskTitle.trim()) return;
    const stage = workflowStages.find((s) => s.id === stageId);
    if (!stage) return;
    const current = parseSubtasks(stage.subtasks);
    const updated = [
      ...current,
      { id: crypto.randomUUID(), title: newSubtaskTitle.trim(), done: false },
    ];
    try {
      await fetch("/api/workflow-stages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: stageId, subtasks: updated }),
      });
      setNewSubtaskTitle("");
      setAddingSubtaskStageId(null);
      fetchStages();
    } catch {
      toast.error("Failed to add subtask");
    }
  };

  const toggleSubtask = async (stageId: string, subtaskId: string) => {
    const stage = workflowStages.find((s) => s.id === stageId);
    if (!stage) return;
    const current = parseSubtasks(stage.subtasks);
    const updated = current.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s));
    try {
      await fetch("/api/workflow-stages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: stageId, subtasks: updated }),
      });
      fetchStages();
    } catch {
      toast.error("Failed to update subtask");
    }
  };

  const deleteSubtask = async (stageId: string, subtaskId: string) => {
    const stage = workflowStages.find((s) => s.id === stageId);
    if (!stage) return;
    const current = parseSubtasks(stage.subtasks);
    const updated = current.filter((s) => s.id !== subtaskId);
    try {
      await fetch("/api/workflow-stages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: stageId, subtasks: updated }),
      });
      fetchStages();
    } catch {
      toast.error("Failed to delete subtask");
    }
  };

  return {
    showTaskModal,
    setShowTaskModal,
    showEmbassyModal,
    setShowEmbassyModal,
    showChecklistModal,
    setShowChecklistModal,
    showStageModal,
    setShowStageModal,
    isSubmitting,
    pdfPreviewUrl,
    setPdfPreviewUrl,
    taskForm,
    setTaskForm,
    checklistForm,
    setChecklistForm,
    descriptionInput,
    setDescriptionInput,
    editingChecklist,
    setEditingChecklist,
    addingSubtaskStageId,
    setAddingSubtaskStageId,
    newSubtaskTitle,
    setNewSubtaskTitle,
    handleTaskSubmit,
    handleEmbassySubmit,
    handleChecklistSubmit,
    generateChecklistPDF,
    closePdfPreview,
    handleStageSubmit,
    updateTaskStatus,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  };
}

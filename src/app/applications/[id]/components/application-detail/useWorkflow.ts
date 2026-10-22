"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/fetch-client";
import { parseSubtasks } from "./utils";
import type { MainTab, Subtask, WorkflowStage } from "./types";

export function useWorkflow({ id, mainTab }: { id: string; mainTab: MainTab }) {
  const [wfStages, setWfStages] = useState<WorkflowStage[]>([]);
  const [wfLoading, setWfLoading] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [newStageDesc, setNewStageDesc] = useState("");
  const [savingStage, setSavingStage] = useState(false);
  const [addingSubtaskTo, setAddingSubtaskTo] = useState<string | null>(null);
  const [subtaskInputs, setSubtaskInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mainTab !== "Workflow" || !id) return;
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (!cancelled) setWfLoading(true);
        return api.get<WorkflowStage[]>(`/api/applications/${id}/workflow`, {
          showError: false,
        });
      })
      .then((data) => {
        if (!cancelled) setWfStages(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load workflow");
      })
      .finally(() => {
        if (!cancelled) setWfLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mainTab, id]);

  const handleAddStage = async () => {
    if (savingStage) return;
    if (!newStageName.trim()) return;
    setSavingStage(true);
    try {
      const res = await fetch(`/api/applications/${id}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStageName.trim(),
          description: newStageDesc.trim() || undefined,
        }),
      });
      if (res.ok) {
        const stage = await res.json();
        setWfStages((prev) => [...prev, { ...stage, subtasks: stage.subtasks || "[]" }]);
        setNewStageName("");
        setNewStageDesc("");
        toast.success("Stage added");
      } else {
        toast.error("Failed to add stage");
      }
    } catch {
      toast.error("Failed to add stage");
    } finally {
      setSavingStage(false);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    try {
      const res = await fetch(`/api/applications/${id}/workflow`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      });
      if (res.ok) {
        setWfStages((prev) =>
          prev.filter((s) => s.id !== stageId).map((s, i) => ({ ...s, order: i + 1 }))
        );
        toast.success("Stage deleted");
      }
    } catch {
      toast.error("Failed to delete stage");
    }
  };

  const _handleReorderStages = async (dragIdx: number, dropIdx: number) => {
    const reordered = [...wfStages];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dropIdx, 0, moved);
    const updated = reordered.map((s, i) => ({ ...s, order: i + 1 }));
    setWfStages(updated);
    try {
      await fetch(`/api/applications/${id}/workflow`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stages: updated.map((s) => ({ id: s.id, order: s.order })) }),
      });
    } catch {
      toast.error("Failed to reorder");
    }
  };

  const handleStartAddSubtask = (stageId: string) => {
    setAddingSubtaskTo(stageId);
  };

  const handleSubtaskInputChange = (stageId: string, value: string) => {
    setSubtaskInputs((prev) => ({ ...prev, [stageId]: value }));
  };

  const handleCancelSubtask = (stageId: string) => {
    setAddingSubtaskTo(null);
    setSubtaskInputs((prev) => ({ ...prev, [stageId]: "" }));
  };

  const handleAddSubtask = async (stageId: string) => {
    const title = (subtaskInputs[stageId] || "").trim();
    if (!title) return;
    const stage = wfStages.find((s) => s.id === stageId);
    if (!stage) return;
    const existing = parseSubtasks(stage.subtasks);
    const newSubtask: Subtask = { id: crypto.randomUUID(), title, done: false };
    const updated = [...existing, newSubtask];
    setWfStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, subtasks: JSON.stringify(updated) } : s))
    );
    setSubtaskInputs((prev) => ({ ...prev, [stageId]: "" }));
    setAddingSubtaskTo(null);
    try {
      await fetch(`/api/applications/${id}/workflow`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stages: [{ id: stageId, subtasks: JSON.stringify(updated) }] }),
      });
    } catch {
      toast.error("Failed to add subtask");
    }
  };

  const handleToggleSubtask = async (stageId: string, subtaskId: string) => {
    const stage = wfStages.find((s) => s.id === stageId);
    if (!stage) return;
    const updated = parseSubtasks(stage.subtasks).map((st) =>
      st.id === subtaskId ? { ...st, done: !st.done } : st
    );
    setWfStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, subtasks: JSON.stringify(updated) } : s))
    );
    try {
      await fetch(`/api/applications/${id}/workflow`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stages: [{ id: stageId, subtasks: JSON.stringify(updated) }] }),
      });
    } catch {
      toast.error("Failed to update subtask");
    }
  };

  const handleDeleteSubtask = async (stageId: string, subtaskId: string) => {
    const stage = wfStages.find((s) => s.id === stageId);
    if (!stage) return;
    const updated = parseSubtasks(stage.subtasks).filter((st) => st.id !== subtaskId);
    setWfStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, subtasks: JSON.stringify(updated) } : s))
    );
    try {
      await fetch(`/api/applications/${id}/workflow`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stages: [{ id: stageId, subtasks: JSON.stringify(updated) }] }),
      });
    } catch {
      toast.error("Failed to delete subtask");
    }
  };

  return {
    wfStages,
    wfLoading,
    newStageName,
    setNewStageName,
    newStageDesc,
    setNewStageDesc,
    savingStage,
    addingSubtaskTo,
    setAddingSubtaskTo,
    subtaskInputs,
    setSubtaskInputs,
    handleAddStage,
    handleDeleteStage,
    _handleReorderStages,
    handleStartAddSubtask,
    handleSubtaskInputChange,
    handleCancelSubtask,
    handleAddSubtask,
    handleToggleSubtask,
    handleDeleteSubtask,
  };
}

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  User,
  Building,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  ListChecks,
  CheckCircle2,
  FileText,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  ClipboardCheck,
  Search,
  Shield,
  Stamp,
  Plane,
  ScrollText,
  BookOpen,
  X,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: string | null;
}

interface EmbassyDetail {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  workingHours: string | null;
}

interface VisaChecklist {
  id: string;
  title: string;
  description: string | null;
  isRequired: boolean;
}

interface WorkflowStage {
  id: string;
  name: string;
  order: number;
  description: string | null;
  subtasks: string;
}

const priorityColors: Record<string, string> = {
  Low: "text-slate-400",
  Medium: "text-blue-500",
  High: "text-amber-500",
  Urgent: "text-red-500",
};

const statuses = ["Todo", "In Progress", "Review", "Done"];

const deleteItem = async (endpoint: string, id: string, fetchFn: () => void) => {
  if (!confirm("Are you sure you want to delete this?")) return;
  try {
    const res = await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted successfully");
      fetchFn();
    }
  } catch (err) {
    toast.error("Failed to delete");
  }
};

export default function VisaWorkflowDashboard({
  country,
  visaType,
}: {
  country: string;
  visaType: string;
}) {
  const [activeTab, setActiveTab] = useState<"process" | "embassy" | "checklists" | "tasks">(
    "process"
  );
  const [taskView, setTaskView] = useState<"grid" | "list">("grid");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [embassyDetail, setEmbassyDetail] = useState<EmbassyDetail | null>(null);
  const [checklists, setChecklists] = useState<VisaChecklist[]>([]);
  const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scrollBy = useCallback(
    (direction: "left" | "right") => {
      const el = scrollRef.current;
      if (!el) return;
      const amount = el.clientWidth * 0.7;
      el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
      setTimeout(updateScrollButtons, 350);
    },
    [updateScrollButtons]
  );

  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEmbassyModal, setShowEmbassyModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  // Forms state
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "Todo",
    priority: "Medium",
    dueDate: "",
    assignee: "",
  });
  const [embassyForm, setEmbassyForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    workingHours: "",
  });
  const [checklistForm, setChecklistForm] = useState({
    title: "",
    descriptions: [] as string[],
    isRequired: true,
  });
  const [descriptionInput, setDescriptionInput] = useState("");
  const [editingChecklist, setEditingChecklist] = useState<VisaChecklist | null>(null);
  const [stageForm, setStageForm] = useState({ name: "", description: "", order: 0 });
  const [addingSubtaskStageId, setAddingSubtaskStageId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/tasks?country=${encodeURIComponent(country)}&visaType=${encodeURIComponent(visaType)}`
      );
      if (res.ok) setTasks(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, [country, visaType]);

  const fetchEmbassy = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/embassy?country=${encodeURIComponent(country)}&visaType=${encodeURIComponent(visaType)}`
      );
      if (res.ok) {
        const data = await res.json();
        setEmbassyDetail(data);
        if (data) {
          setEmbassyForm({
            name: data.name,
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
            website: data.website || "",
            workingHours: data.workingHours || "",
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [country, visaType]);

  const fetchChecklists = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/visa-checklists?country=${encodeURIComponent(country)}&visaType=${encodeURIComponent(visaType)}`
      );
      if (res.ok) setChecklists(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, [country, visaType]);

  const fetchStages = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/workflow-stages?country=${encodeURIComponent(country)}&visaType=${encodeURIComponent(visaType)}`
      );
      if (res.ok) {
        const data = await res.json();
        setWorkflowStages(data);
        setStageForm((prev) => ({ ...prev, order: data.length + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  }, [country, visaType]);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchTasks(), fetchEmbassy(), fetchChecklists(), fetchStages()]);
    setIsLoading(false);
  }, [fetchTasks, fetchEmbassy, fetchChecklists, fetchStages]);

  const fetchAllDataRef = useRef(fetchAllData);
  useEffect(() => {
    fetchAllDataRef.current = fetchAllData;
    fetchAllDataRef.current();
  }, [fetchAllData]);

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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      toast.error(isEdit ? "Failed to update checklist item" : "Failed to add checklist item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateChecklistPDF = useCallback(async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageW = doc.internal.pageSize.getWidth();
    const centerX = pageW / 2;

    // --- Consulate emblem (shield shape) ---
    const emblemY = 22;
    doc.setDrawColor(79, 70, 229);
    doc.setFillColor(79, 70, 229);
    // Shield outline
    doc.lines(
      [
        [0, 6],
        [-5, 0],
        [-3, -2],
        [0, -12],
        [3, -2],
        [5, 0],
        [3, 2],
        [0, 12],
        [-3, 2],
      ],
      centerX - 5,
      emblemY - 6,
      [1, 1],
      "F"
    );
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(country.charAt(0).toUpperCase(), centerX, emblemY + 1.5, { align: "center" });

    // --- Visa Type heading ---
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(visaType, centerX, 48, { align: "center" });

    // --- Subtitle ---
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Document Checklist", centerX, 57, { align: "center" });

    // --- Decorative line ---
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(centerX - 20, 62, centerX + 20, 62);

    // --- Paragraph break / introductory text ---
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Below is the complete list of documents required for the above visa type.",
      centerX,
      74,
      { align: "center" }
    );

    // --- Two-column table: Document | Requirements ---
    const bodyRows = checklists.map((item) => {
      let descs: string[] = [];
      if (item.description) {
        try {
          const p = JSON.parse(item.description);
          if (Array.isArray(p)) descs = p;
          else descs = [item.description];
        } catch {
          descs = [item.description];
        }
      }
      return [item.title, descs.length > 0 ? descs.map((d) => `• ${d}`).join("\n") : "—"];
    });

    autoTable(doc, {
      startY: 82,
      head: [["Document", "Requirements"]],
      body: bodyRows,
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
        halign: "center",
      },
      bodyStyles: { fontSize: 9, textColor: [55, 65, 81] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 52, cellPadding: 4, fontStyle: "bold" },
        1: { cellWidth: "auto", cellPadding: 4 },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data: any) => {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.setFont("helvetica", "normal");
        doc.text(`Page ${pageCount}`, pageW / 2, 292, { align: "center" });
        doc.text("UniTrack — Visa Document Checklist", pageW / 2, 284, { align: "center" });
      },
    });

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPdfPreviewUrl(url);
  }, [checklists, country, visaType]);

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
    } catch (err) {
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
    } catch (err) {
      toast.error("Failed to update task status");
    }
  };

  const parseSubtasks = (subtasksJson: string): { id: string; title: string; done: boolean }[] => {
    try {
      return JSON.parse(subtasksJson || "[]");
    } catch {
      return [];
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

  if (isLoading) {
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
      <div className="flex bg-slate-100/50 p-1.5 rounded-2xl w-fit">
        {[
          { id: "process", label: "Workflow Process", icon: <CheckCircle2 size={16} /> },
          { id: "checklists", label: "Digital Checklists", icon: <ListChecks size={16} /> },
          { id: "embassy", label: "Embassy Details", icon: <Building size={16} /> },
          { id: "tasks", label: "Task Board", icon: <FileText size={16} /> },
        ].map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === tab.id
                ? "bg-white text-indigo-600 shadow-sm font-semibold"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Process View */}
      {activeTab === "process" && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Application Pipeline</h2>
              <p className="text-sm text-slate-500 mt-1">
                Configure automated stages for {country} {visaType}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowStageModal(true)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
            >
              <Plus size={16} /> New Stage
            </button>
          </div>

          <div className="relative">
            {workflowStages.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner relative overflow-hidden">
                <div className="absolute -top-10 -right-10 size-40 bg-indigo-50/50 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 size-40 bg-violet-50/50 rounded-full blur-3xl" />
                <div className="relative size-24 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100/50">
                  <ClipboardCheck size={36} className="text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No Stages Defined</h3>
                <p className="text-sm text-slate-500">Add your first processing stage to begin.</p>
              </div>
            ) : (
              <>
                <div
                  ref={scrollRef}
                  onScroll={updateScrollButtons}
                  className="flex items-start gap-0 overflow-x-hidden pb-12 pt-10 px-8"
                >
                  {workflowStages.map((stage, index) => (
                    <div key={stage.id} className="flex items-start group">
                      <div className="relative flex flex-col items-center text-center w-64">
                        {/* Connection Line */}
                        {index < workflowStages.length - 1 && (
                          <div className="absolute top-8 left-1/2 w-full h-[3px] bg-gradient-to-r from-indigo-200 via-indigo-100 to-indigo-200 z-0" />
                        )}

                        {/* Stage Circle */}
                        <div className="relative z-10 size-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50 mb-4 group-hover:shadow-xl group-hover:shadow-indigo-300/50 group-hover:scale-105 transition-all duration-300">
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
                            type="button"
                            onClick={() =>
                              deleteItem("/api/workflow-stages", stage.id, fetchStages)
                            }
                            className="absolute -top-1.5 -right-1.5 p-1.5 bg-white shadow-md text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg border border-slate-50 hover:scale-110 active:scale-90"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>

                        {/* Content Card */}
                        <div className="px-3 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm group-hover:shadow-lg group-hover:border-indigo-100 transition-all duration-300 w-full mx-auto relative overflow-hidden">
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
                                      type="button"
                                      onClick={() => deleteSubtask(stage.id, sub.id)}
                                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover/sub:opacity-100 transition-all"
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
                                type="button"
                                onClick={() => addSubtask(stage.id)}
                                className="p-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                              >
                                <Plus size={8} />
                              </button>
                              <button
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
                        {index < workflowStages.length - 1 && (
                          <div className="absolute top-[22px] left-[calc(50%+3.5rem)] z-20 flex items-center justify-center size-5 bg-white rounded-full border border-indigo-50 shadow-sm">
                            <ChevronRight size={10} className="text-indigo-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {canScrollLeft && (
                  <button
                    type="button"
                    onClick={() => scrollBy("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 size-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-white transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                {canScrollRight && (
                  <button
                    type="button"
                    onClick={() => scrollBy("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 size-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-white transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Checklists View */}
      {activeTab === "checklists" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Document Checklist</h2>
              <p className="text-sm text-slate-500 mt-1">
                Required paperwork for {country} {visaType}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={generateChecklistPDF}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
              >
                <FileText size={16} /> Generate PDF
              </button>
              <button
                type="button"
                onClick={() => setShowChecklistModal(true)}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                <Plus size={16} /> Add Requirement
              </button>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Document
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Requirements
                  </th>
                  <th className="text-center px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest w-28">
                    Status
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest w-20">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {checklists.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-8 rounded-lg flex items-center justify-center ${item.isRequired ? "bg-red-50" : "bg-green-50"}`}
                        >
                          <ListChecks
                            size={16}
                            className={item.isRequired ? "text-red-500" : "text-green-500"}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-800">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {(() => {
                        const raw = item.description;
                        let descs: string[] = [];
                        if (raw) {
                          try {
                            const p = JSON.parse(raw);
                            if (Array.isArray(p)) descs = p;
                            else descs = [raw];
                          } catch {
                            descs = [raw];
                          }
                        }
                        return descs.length > 0 ? (
                          <ul className="space-y-1">
                            {descs.map((d: string, i: number) => (
                              <li key={i} className="text-sm text-slate-500 flex items-start gap-2">
                                <span className="mt-1.5 size-1.5 rounded-full bg-slate-300 shrink-0" />
                                {d}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${item.isRequired ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"}`}
                      >
                        {item.isRequired ? "Mandatory" : "Optional"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingChecklist(item);
                            let descs: string[] = [];
                            if (item.description) {
                              try {
                                const p = JSON.parse(item.description);
                                if (Array.isArray(p)) descs = p;
                                else descs = [item.description];
                              } catch {
                                descs = [item.description];
                              }
                            }
                            setChecklistForm({
                              title: item.title,
                              descriptions: descs,
                              isRequired: item.isRequired,
                            });
                            setDescriptionInput("");
                            setShowChecklistModal(true);
                          }}
                          className="p-2 text-indigo-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all"
                          title="Edit requirement"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            deleteItem("/api/visa-checklists", item.id, fetchChecklists)
                          }
                          className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                          title="Delete requirement"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {checklists.length === 0 && (
              <div className="py-20 text-center">
                <ListChecks size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">
                  No document requirements added yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embassy View */}
      {activeTab === "embassy" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Diplomatic Mission</h2>
              <p className="text-sm text-slate-500 mt-1">Contact details for {country} Consulate</p>
            </div>
            <button
              type="button"
              onClick={() => setShowEmbassyModal(true)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
            >
              <Edit2 size={16} /> {embassyDetail ? "Modify Records" : "Setup Embassy"}
            </button>
          </div>

          {embassyDetail ? (
            <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 size-96 bg-indigo-50/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8 mb-12 pb-12 border-b border-slate-50">
                <div className="size-24 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-100">
                  <Building size={48} />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">
                    {embassyDetail.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {country}
                    </span>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {visaType} Mission
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {embassyDetail.address && (
                  <div className="group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <MapPin size={20} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Headquarters
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-700 leading-relaxed pl-13">
                      {embassyDetail.address}
                    </p>
                  </div>
                )}
                {embassyDetail.phone && (
                  <div className="group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Phone size={20} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Direct Line
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-700 leading-relaxed">
                      {embassyDetail.phone}
                    </p>
                  </div>
                )}
                {embassyDetail.email && (
                  <div className="group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Mail size={20} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Official Email
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-700 leading-relaxed break-all">
                      {embassyDetail.email}
                    </p>
                  </div>
                )}
                {embassyDetail.website && (
                  <div className="group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Globe size={20} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Digital Portal
                      </p>
                    </div>
                    <a
                      href={
                        embassyDetail.website.startsWith("http")
                          ? embassyDetail.website
                          : `https://${embassyDetail.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-lg font-black text-indigo-600 hover:underline"
                    >
                      {embassyDetail.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                {embassyDetail.workingHours && (
                  <div className="group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Clock size={20} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Operation Hours
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-700 leading-relaxed">
                      {embassyDetail.workingHours}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-24 text-center shadow-inner relative overflow-hidden">
              <div className="absolute -top-10 -right-10 size-40 bg-indigo-50/50 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 size-40 bg-violet-50/50 rounded-full blur-3xl" />
              <div className="relative size-24 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100/50">
                <Building size={36} className="text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Mission Records Missing</h3>
              <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
                Add the diplomatic mission contact details to assist with the visa application
                process.
              </p>
              <button
                type="button"
                onClick={() => setShowEmbassyModal(true)}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Configure Embassy
              </button>
            </div>
          )}
        </div>
      )}

      {/* Kanban Board View */}
      {activeTab === "tasks" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Mission Control</h2>
              <p className="text-sm text-slate-500 mt-1">
                Manage operational tasks for {country} {visaType}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
                <button
                  type="button"
                  onClick={() => setTaskView("grid")}
                  className={`p-2 rounded-lg transition-all ${taskView === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  title="Kanban Board"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setTaskView("list")}
                  className={`p-2 rounded-lg transition-all ${taskView === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowTaskModal(true)}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                <Plus size={16} /> New Objective
              </button>
            </div>
          </div>

          {taskView === "grid" ? (
            <div className="flex gap-6 min-h-[600px] overflow-x-auto pb-6 custom-scrollbar">
              {statuses.map((status) => {
                const statusTasks = [];
                for (const t of tasks) {
                  if (t.status === status) statusTasks.push(t);
                }
                return (
                  <div
                    key={status}
                    className="flex flex-col gap-4 min-w-[300px] w-full max-w-[350px]"
                  >
                    <div className="flex items-center justify-between px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-2 rounded-full ${
                            status === "Done"
                              ? "bg-green-500"
                              : status === "In Progress"
                                ? "bg-blue-500"
                                : status === "Review"
                                  ? "bg-amber-500"
                                  : "bg-slate-300"
                          }`}
                        />
                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-600">
                          {status}
                        </h3>
                      </div>
                      <span className="bg-slate-50 text-slate-400 text-[10px] font-black px-2.5 py-0.5 rounded-lg border border-slate-100">
                        {statusTasks.length}
                      </span>
                    </div>

                    <div className="flex-1 bg-slate-50/30 rounded-[2.5rem] p-4 space-y-4 border border-slate-100/50">
                      {statusTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white p-6 rounded-[1.75rem] shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all group relative"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                                task.priority === "Urgent"
                                  ? "bg-red-50 text-red-600"
                                  : task.priority === "High"
                                    ? "bg-amber-50 text-amber-600"
                                    : task.priority === "Medium"
                                      ? "bg-blue-50 text-blue-600"
                                      : "bg-slate-50 text-slate-400"
                              }`}
                            >
                              {task.priority}
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteItem("/api/tasks", task.id, fetchTasks)}
                              className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <h4 className="text-sm font-black text-slate-800 mb-2 leading-snug group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-6 line-clamp-2">
                            {task.description ||
                              "No additional context provided for this objective."}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2">
                              <div className="size-6 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-400">
                                <User size={12} />
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                {task.assignee || "Unassigned"}
                              </span>
                            </div>
                            <div className="relative group/select">
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                className="appearance-none text-[9px] font-black uppercase tracking-widest bg-slate-50 text-white hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all outline-none cursor-pointer pr-6"
                              >
                                {statuses.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                              <ChevronRight
                                size={10}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-slate-300 pointer-events-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {statusTasks.length === 0 && (
                        <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300 italic">
                          Empty column
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Task Detail
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Assignee
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-24 text-center">
                        <div className="size-16 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                          <FileText size={24} className="text-indigo-400" />
                        </div>
                        <p className="text-sm text-slate-500">No tasks found for this workflow.</p>
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                              {task.title}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-1">
                              {task.description || "No description"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                              task.priority === "Urgent"
                                ? "bg-red-50 text-red-600"
                                : task.priority === "High"
                                  ? "bg-amber-50 text-amber-600"
                                  : task.priority === "Medium"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-slate-50 text-slate-400"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative w-fit">
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                              className="appearance-none text-[9px] font-black uppercase tracking-widest bg-slate-100 text-white hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all outline-none cursor-pointer pr-6"
                            >
                              {statuses.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <ChevronRight
                              size={10}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-slate-300 pointer-events-none"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="size-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                              <User size={12} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                              {task.assignee || "Unassigned"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => deleteItem("/api/tasks", task.id, fetchTasks)}
                            className="p-2 text-red-800 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setShowTaskModal(false)}
          />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-slate-100 bg-indigo-50/30">
              <h2 className="text-xl font-black text-slate-800">New Task</h2>
            </div>
            <form onSubmit={handleTaskSubmit} className="p-6 space-y-4">
              <input
                required
                placeholder="Task Title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-indigo-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-600"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Priority</option>
                </select>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-600"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                rows={3}
                placeholder="Description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500 resize-none"
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embassy Modal */}
      {showEmbassyModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setShowEmbassyModal(false)}
          />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-slate-100 bg-indigo-50/30">
              <h2 className="text-xl font-black text-slate-800">Embassy Details</h2>
            </div>
            <form
              onSubmit={handleEmbassySubmit}
              className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar"
            >
              <input
                required
                placeholder="Embassy/Consulate Name"
                value={embassyForm.name}
                onChange={(e) => setEmbassyForm({ ...embassyForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-indigo-500"
              />
              <input
                placeholder="Address"
                value={embassyForm.address}
                onChange={(e) => setEmbassyForm({ ...embassyForm, address: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Phone"
                  value={embassyForm.phone}
                  onChange={(e) => setEmbassyForm({ ...embassyForm, phone: e.target.value })}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={embassyForm.email}
                  onChange={(e) => setEmbassyForm({ ...embassyForm, email: e.target.value })}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500"
                />
              </div>
              <input
                placeholder="Website URL"
                value={embassyForm.website}
                onChange={(e) => setEmbassyForm({ ...embassyForm, website: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500"
              />
              <input
                placeholder="Working Hours (e.g. Mon-Fri 9AM-4PM)"
                value={embassyForm.workingHours}
                onChange={(e) => setEmbassyForm({ ...embassyForm, workingHours: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500"
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEmbassyModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checklist Modal */}
      {showChecklistModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => {
              setShowChecklistModal(false);
              setEditingChecklist(null);
              setChecklistForm({ title: "", descriptions: [], isRequired: true });
              setDescriptionInput("");
            }}
          />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-slate-100 bg-indigo-50/30">
              <h2 className="text-xl font-black text-slate-800">
                {editingChecklist ? "Edit Document/Checklist Item" : "Add Document/Checklist Item"}
              </h2>
            </div>
            <form onSubmit={handleChecklistSubmit} className="p-6 space-y-4">
              <input
                required
                placeholder="Document Name (e.g. Passport)"
                value={checklistForm.title}
                onChange={(e) => setChecklistForm({ ...checklistForm, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-indigo-500"
              />
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Requirements
                </label>
                {checklistForm.descriptions.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5"
                  >
                    <span className="flex-1 text-sm text-slate-700">{d}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...checklistForm.descriptions];
                        next.splice(i, 1);
                        setChecklistForm({ ...checklistForm, descriptions: next });
                      }}
                      className="p-1 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
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
                    className="px-4 py-2.5 bg-indigo-100 text-indigo-600 font-bold rounded-xl hover:bg-indigo-200 disabled:opacity-50 transition-all shrink-0"
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
                  onChange={(e) =>
                    setChecklistForm({ ...checklistForm, isRequired: e.target.checked })
                  }
                  className="size-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isRequired" className="text-sm font-bold text-slate-700">
                  Required Document
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowChecklistModal(false);
                    setEditingChecklist(null);
                    setChecklistForm({ title: "", descriptions: [], isRequired: true });
                    setDescriptionInput("");
                  }}
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
      )}

      {/* PDF Preview Modal */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => {
              setPdfPreviewUrl(null);
              URL.revokeObjectURL(pdfPreviewUrl);
            }}
          />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slide-up flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-black text-slate-800">Checklist Preview</h2>
                <p className="text-xs text-slate-500">
                  {country} — {visaType}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdfPreviewUrl}
                  download={`${country.replace(/\s+/g, "_")}_${visaType.replace(/\s+/g, "_")}_Checklist.pdf`}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm"
                >
                  <Download size={15} /> Download
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setPdfPreviewUrl(null);
                    URL.revokeObjectURL(pdfPreviewUrl);
                  }}
                  className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-full min-h-[70vh]"
                title="Checklist PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stage Modal */}
      {showStageModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setShowStageModal(false)}
          />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-slate-100 bg-indigo-50/30">
              <h2 className="text-xl font-black text-slate-800">Add Workflow Stage</h2>
            </div>
            <form onSubmit={handleStageSubmit} className="p-6 space-y-4">
              <input
                required
                placeholder="Stage Name (e.g. Initial Assessment)"
                value={stageForm.name}
                onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-indigo-500"
              />
              <textarea
                rows={2}
                placeholder="Description"
                value={stageForm.description}
                onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500 resize-none"
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStageModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                >
                  Add Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

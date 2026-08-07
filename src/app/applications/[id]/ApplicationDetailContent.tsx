"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  GripVertical,
  Info,
  Loader2,
  Maximize2,
  MoreVertical,
  Plus,
  Share2,
  Trash2,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_APPLICATION_STATUSES,
  getApplicationStatuses,
  getStageSequence,
  type ApplicationStatus,
} from "@/lib/application-statuses";

interface ApplicationDetail {
  id: string;
  studentId: string;
  universityId: string;
  courseId: string;
  status: string;
  appliedDate: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    nationality?: string;
    address?: string;
  };
  university: {
    id: string;
    name: string;
    country: string;
    city?: string;
    website?: string;
  };
  course: {
    id: string;
    name: string;
    level: string;
    duration?: string;
    tuitionFee?: string;
    currency?: string;
    faculty?: string;
    intake?: string;
    prerequisites?: string;
    requirements?: string;
  };
}

interface StudentDoc {
  id: string;
  name: string;
  url: string;
  status?: string | null;
  type?: string | null;
  academicDocument?: { id: string; name: string } | null;
}

type ReqFilter = "All" | "Pending" | "Approved" | "Rejected" | "In Review";
type MainTab =
  | "Requirements"
  | "Student records"
  | "Workflow"
  | "Notes"
  | "Commission"
  | "Settings";

function appIdShort(id: string | number) {
  const str = String(id);
  const digits = str.replace(/\D/g, "");
  if (digits.length >= 7) return digits.slice(-7);
  return str.slice(-8).toUpperCase();
}

function initials(first: string, last: string) {
  return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "?";
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeDocStatus(status?: string | null): ReqFilter {
  const s = (status || "Pending").toLowerCase();
  if (s.includes("reject") || s.includes("declin")) return "Rejected";
  if (s.includes("review") || s.includes("process") || s === "uploaded" || s === "pending")
    return "In Review";
  if (s.includes("approv") || s === "verified" || s === "complete" || s === "completed") {
    return "Approved";
  }
  return "Pending";
}

function stageOfStatus(status: string, statuses: ApplicationStatus[]): string {
  return statuses.find((s) => s.name === status)?.stage ?? "";
}

export default function ApplicationDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [appStatuses, setAppStatuses] = useState<ApplicationStatus[]>(DEFAULT_APPLICATION_STATUSES);
  const [docs, setDocs] = useState<StudentDoc[]>([]);
  const [appCount, setAppCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("Requirements");
  const [reqFilter, setReqFilter] = useState<ReqFilter>("All");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Pending: true,
    Approved: true,
    Rejected: true,
    "In Review": true,
  });
  const [manageOpen, setManageOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState<string | null>("Application details");
  const [academicDocNames, setAcademicDocNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [uploadingReq, setUploadingReq] = useState<string | null>(null);

  const handleUploadClick = (reqName: string) => {
    setUploadTarget(reqName);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const reqName = uploadTarget;
    e.target.value = "";
    if (!file || !reqName) return;
    setUploadingReq(reqName);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!upRes.ok) {
        const err = await upRes.json();
        toast.error(err.error || "Upload failed");
        return;
      }
      const up = await upRes.json();
      const res = await fetch(`/api/students/${detail?.studentId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reqName,
          url: up.url,
          fileSize: file.size,
          fileType: file.type || "",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to save document");
        return;
      }
      const doc = await res.json();
      setDocs((prev) => [...prev, doc]);
      toast.success(`${reqName} uploaded`);
    } catch {
      toast.error("Error uploading document");
    } finally {
      setUploadingReq(null);
    }
  };

  // Workflow state
  const [wfStages, setWfStages] = useState<
    Array<{
      id: string;
      name: string;
      order: number;
      description?: string | null;
      subtasks: string;
    }>
  >([]);
  const [wfLoading, setWfLoading] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [newStageDesc, setNewStageDesc] = useState("");
  const [addingStage, setAddingStage] = useState(false);
  const [addingSubtaskTo, setAddingSubtaskTo] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [subtaskInputs, setSubtaskInputs] = useState<Record<string, string>>({});

  // Notes state
  const [notes, setNotes] = useState<
    Array<{
      id: string;
      content: string;
      createdAt: string;
      author: { id: string; name: string } | null;
    }>
  >([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/applications/${id}`);
        if (!res.ok) throw new Error("Failed");
        const app = await res.json();
        if (cancelled) return;
        setDetail(app);

        const [studentRes, appsRes, acadDocsRes, statusRes] = await Promise.all([
          fetch(`/api/students/${app.studentId}`),
          fetch(`/api/applications?studentId=${app.studentId}`),
          fetch("/api/academic-documents"),
          fetch("/api/settings/application-statuses"),
        ]);
        if (studentRes.ok) {
          const student = await studentRes.json();
          if (!cancelled) setDocs(Array.isArray(student.documents) ? student.documents : []);
        }
        if (appsRes.ok) {
          const apps = await appsRes.json();
          if (!cancelled) {
            if (typeof apps.total === "number") setAppCount(apps.total || 1);
            else {
              const list = Array.isArray(apps) ? apps : apps.data || [];
              setAppCount(list.length || 1);
            }
          }
        }
        if (acadDocsRes.ok) {
          const docsList = await acadDocsRes.json();
          if (!cancelled)
            setAcademicDocNames(Array.isArray(docsList) ? docsList.map((d: any) => d.name) : []);
        }
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (!cancelled && statusData?.statuses) {
            setAppStatuses(getApplicationStatuses(JSON.stringify(statusData.statuses)));
          }
        }
      } catch {
        toast.error("Failed to load application details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (mainTab !== "Workflow" || !id) return;
    let cancelled = false;
    (async () => {
      setWfLoading(true);
      try {
        const res = await fetch(`/api/applications/${id}/workflow`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setWfStages(data);
        }
      } catch {
        toast.error("Failed to load workflow");
      } finally {
        if (!cancelled) setWfLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mainTab, id]);

  useEffect(() => {
    if (mainTab !== "Notes" || !id) return;
    let cancelled = false;
    (async () => {
      setNotesLoading(true);
      try {
        const res = await fetch(`/api/applications/${id}/notes`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setNotes(Array.isArray(data) ? data : []);
        }
      } catch {
        toast.error("Failed to load notes");
      } finally {
        if (!cancelled) setNotesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mainTab, id]);

  const handleAddNote = async () => {
    if (!newNote.trim() || addingNote) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/applications/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to add note");
        return;
      }
      const note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setNewNote("");
      toast.success("Note added");
    } catch {
      toast.error("Error adding note");
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/applications/${id}/notes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to delete note");
        return;
      }
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success("Note deleted");
    } catch {
      toast.error("Error deleting note");
    }
  };

  const coursePrereqs = useMemo(() => {
    if (!detail?.course?.prerequisites) return [];
    try {
      const parsed = JSON.parse(detail.course.prerequisites);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return typeof detail.course.prerequisites === "string" && detail.course.prerequisites.trim()
        ? [detail.course.prerequisites]
        : [];
    }
  }, [detail]);

  const courseReqs = useMemo(() => {
    if (!detail?.course?.requirements) return [];
    try {
      const parsed = JSON.parse(detail.course.requirements);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return typeof detail.course.requirements === "string" && detail.course.requirements.trim()
        ? [detail.course.requirements]
        : [];
    }
  }, [detail]);

  const docReqs = useMemo(() => {
    return courseReqs.filter((r: string) => academicDocNames.includes(r));
  }, [courseReqs, academicDocNames]);

  const generalReqs = useMemo(() => {
    return courseReqs.filter((r: string) => !academicDocNames.includes(r));
  }, [courseReqs, academicDocNames]);

  const matchedDocReqs = useMemo(() => {
    return docReqs.map((req: string) => {
      const matched = docs.find(
        (d: any) =>
          d.name?.toLowerCase().includes(req.toLowerCase()) ||
          d.academicDocument?.name?.toLowerCase().includes(req.toLowerCase())
      );
      const normStatus = matched ? normalizeDocStatus(matched.status) : null;
      const isUploaded = !!matched;
      const isApproved = normStatus === "Approved";
      return { name: req, doc: matched || null, isUploaded, isApproved };
    });
  }, [docReqs, docs]);

  const requirementRows = useMemo(() => {
    const rows = matchedDocReqs.map((r: any) => ({
      name: r.name,
      status: !r.doc ? "Missing" : r.isApproved ? "Approved" : normalizeDocStatus(r.doc.status),
    }));
    generalReqs.forEach((req: string) => {
      rows.push({ name: req, status: "Missing" });
    });
    return rows;
  }, [matchedDocReqs, generalReqs]);

  const allDocsComplete = docReqs.length > 0 && matchedDocReqs.every((d) => d.isApproved);
  const missingDocsCount = matchedDocReqs.filter((d) => !d.isApproved).length;

  const matchedPrereqs = useMemo(() => {
    return coursePrereqs.map((req) => {
      const matched = docs.find(
        (d) =>
          d.name?.toLowerCase().includes(req.toLowerCase()) ||
          d.academicDocument?.name?.toLowerCase().includes(req.toLowerCase())
      );
      return { name: req, doc: matched || null };
    });
  }, [coursePrereqs, docs]);

  const grouped = useMemo(() => {
    const groups: Record<Exclude<ReqFilter, "All">, StudentDoc[]> = {
      Pending: [],
      Approved: [],
      Rejected: [],
      "In Review": [],
    };
    docs.forEach((doc) => {
      groups[normalizeDocStatus(doc.status) as Exclude<ReqFilter, "All">].push(doc);
    });
    return groups;
  }, [docs]);

  const visibleSections = useMemo(() => {
    const order: Exclude<ReqFilter, "All">[] = ["Pending", "Approved", "In Review", "Rejected"];
    return order.filter((key) => {
      if (reqFilter !== "All" && reqFilter !== key) return false;
      // Always show Pending + Approved in the default All view (design)
      if (reqFilter === "All" && (key === "Pending" || key === "Approved")) return true;
      return grouped[key].length > 0 || reqFilter === key;
    });
  }, [grouped, reqFilter]);

  const handleStatusUpdate = async (status: string) => {
    if (!detail || status === detail.status) {
      setManageOpen(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDetail((prev) =>
          prev ? { ...prev, status: updated.status, updatedAt: updated.updatedAt } : null
        );
        toast.success(`Status updated to ${updated.status}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
      setManageOpen(false);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Application", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } catch {
        toast.error("Unable to share");
      }
    }
  };

  // --- Workflow handlers ---
  const parseSubtasks = (raw: string) => {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  };

  const handleAddStage = async () => {
    if (!newStageName.trim()) return;
    setAddingStage(true);
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
      setAddingStage(false);
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

  const handleReorderStages = async (dragIdx: number, dropIdx: number) => {
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

  const handleAddSubtask = async (stageId: string) => {
    const title = (subtaskInputs[stageId] || "").trim();
    if (!title) return;
    const stage = wfStages.find((s) => s.id === stageId);
    if (!stage) return;
    const existing = parseSubtasks(stage.subtasks);
    const newSubtask = { id: crypto.randomUUID(), title, done: false };
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
    const updated = parseSubtasks(stage.subtasks).map(
      (st: { id: string; title: string; done: boolean }) =>
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
    const updated = parseSubtasks(stage.subtasks).filter(
      (st: { id: string }) => st.id !== subtaskId
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
      toast.error("Failed to delete subtask");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} />
        <span className="text-sm font-medium">Loading application…</span>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500 font-medium mb-4">Application not found</p>
        <button
          type="button"
          onClick={() => router.push("/applications")}
          className="px-4 py-2 bg-[#1d4ed8] text-white rounded-lg text-sm font-medium"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  const progressStages = getStageSequence(appStatuses);
  const currentStage = stageOfStatus(detail.status, appStatuses);
  const doneThrough = progressStages.indexOf(currentStage);
  const studentName = `${detail.student.firstName} ${detail.student.lastName}`;
  const title = [
    detail.course.level,
    detail.course.name,
    detail.university.city || detail.university.name,
  ]
    .filter(Boolean)
    .join(" - ");

  const sectionMeta: Record<
    Exclude<ReqFilter, "All">,
    { wrap: string; iconWrap: string; icon: React.ReactNode }
  > = {
    Pending: {
      wrap: "bg-amber-50/30 border-amber-200",
      iconWrap: "bg-amber-100 text-amber-700",
      icon: <Clock size={20} className="text-amber-600" />,
    },
    Approved: {
      wrap: "bg-emerald-50/30 border-emerald-200",
      iconWrap: "bg-emerald-100 text-emerald-700",
      icon: <Check size={20} className="text-emerald-600" />,
    },
    Rejected: {
      wrap: "bg-red-50/30 border-red-200",
      iconWrap: "bg-red-100 text-red-700",
      icon: <FileText size={20} className="text-red-600" />,
    },
    "In Review": {
      wrap: "bg-blue-50/30 border-blue-200",
      iconWrap: "bg-blue-100 text-blue-700",
      icon: <Clock size={20} className="text-blue-600" />,
    },
  };

  return (
    <div className="animate-fade-in text-slate-800 pb-24">
      {/* Application Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 leading-snug">{title}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
            <span>
              App ID: <span className="font-medium text-slate-700">{appIdShort(detail.id)}</span>
            </span>
            <span>
              Main selected intake:{" "}
              <span className="font-medium text-slate-700">
                {detail.course.intake || "Not specified"}
              </span>
            </span>
            <span>
              Campus:{" "}
              <span className="font-medium text-slate-700">
                {detail.university.name}
                {detail.university.city ? ` — ${detail.university.city}` : ""}
              </span>
            </span>
          </div>
        </div>
        <div className="flex gap-3 shrink-0 relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setManageOpen((o) => !o)}
              className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Manage App
              <ChevronDown size={16} className="ml-2" />
            </button>
            {manageOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Update status
                </p>
                {appStatuses.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    disabled={saving}
                    onClick={() => handleStatusUpdate(s.name)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center justify-between ${
                      detail.status === s.name ? "text-[#1d4ed8] font-semibold" : "text-slate-700"
                    }`}
                  >
                    {s.name}
                    {detail.status === s.name && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center px-4 py-2 bg-[#1d4ed8] text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Share2 size={16} className="mr-2" />
            Share access
          </button>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 overflow-x-auto">
        <div className="flex items-center min-w-[800px]">
          {progressStages.map((stage, i) => {
            const done = i <= doneThrough;
            const isLast = i === progressStages.length - 1;
            return (
              <React.Fragment key={stage}>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      done ? "bg-emerald-500 text-white" : "border-2 border-slate-300 bg-white"
                    }`}
                  >
                    {done && <Check size={14} strokeWidth={3} />}
                  </div>
                  <span
                    className={`text-xs font-medium text-center whitespace-pre-line ${
                      done ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {stage}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={`h-0.5 flex-grow mx-2.5 ${
                      i < doneThrough ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left column */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                {initials(detail.student.firstName, detail.student.lastName)}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{studentName}</h3>
                <button
                  type="button"
                  onClick={() => router.push(`/students/${detail.studentId}`)}
                  className="text-sm text-[#1d4ed8] underline text-left"
                >
                  {String(detail.studentId).slice(-7)} • {appCount} application
                  {appCount !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Applied:{" "}
              <span className="text-slate-900 font-semibold">{formatDate(detail.appliedDate)}</span>
            </p>
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Program details</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-1">
                {detail.course.name} · {detail.course.level}
              </p>
              {detail.course.tuitionFee && (
                <p className="text-xs text-slate-500">
                  Tuition: {detail.course.currency || ""} {detail.course.tuitionFee}
                </p>
              )}
              {detail.university.website && (
                <a
                  href={detail.university.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-[#1d4ed8] font-bold hover:underline"
                >
                  Learn more <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {[
              { key: "Application details", warn: false },
              { key: "Student", warn: !detail.student.email || !detail.student.phone },
              { key: "Exams", warn: false },
              { key: "Payment details", warn: false },
            ].map((item) => (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => setSideOpen(sideOpen === item.key ? null : item.key)}
                  className="w-full flex justify-between items-center px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    {item.key}
                    {item.warn && <span className="text-amber-500 text-xs">⚠</span>}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${sideOpen === item.key ? "rotate-180" : ""}`}
                  />
                </button>
                {sideOpen === item.key && (
                  <div className="mt-1 px-4 py-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1.5">
                    {item.key === "Application details" && (
                      <>
                        <p>
                          <span className="font-semibold text-slate-800">Status:</span>{" "}
                          {detail.status}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">Updated:</span>{" "}
                          {formatDate(detail.updatedAt)}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">University:</span>{" "}
                          {detail.university.name}, {detail.university.country}
                        </p>
                      </>
                    )}
                    {item.key === "Student" && (
                      <>
                        <p>
                          <span className="font-semibold text-slate-800">Email:</span>{" "}
                          {detail.student.email || "—"}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">Phone:</span>{" "}
                          {detail.student.phone || "—"}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">Nationality:</span>{" "}
                          {detail.student.nationality || "—"}
                        </p>
                      </>
                    )}
                    {item.key === "Exams" && (
                      <p className="text-slate-500">
                        No exam records attached to this application.
                      </p>
                    )}
                    {item.key === "Payment details" && (
                      <p className="text-slate-500">
                        {detail.course.tuitionFee
                          ? `Listed tuition: ${detail.course.currency || ""} ${detail.course.tuitionFee}`
                          : "No payment details recorded."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Right column */}
        <section className="col-span-12 lg:col-span-9">
          <div className="border-b border-slate-200 mb-6 flex gap-8 overflow-x-auto">
            {(
              [
                "Requirements",
                "Student records",
                "Workflow",
                "Notes",
                "Commission",
                "Settings",
              ] as MainTab[]
            ).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMainTab(tab)}
                className={`pb-3 border-b-2 text-sm whitespace-nowrap transition-colors ${
                  mainTab === tab
                    ? "border-[#1d4ed8] text-[#1d4ed8] font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-700 font-medium"
                }`}
              >
                {tab === "Notes" ? `Notes (${notes.length})` : tab}
              </button>
            ))}
          </div>

          {mainTab === "Requirements" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                  {(["All", "Pending", "Approved", "Rejected", "In Review"] as ReqFilter[]).map(
                    (f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setReqFilter(f)}
                        className={`px-4 py-1.5 rounded-md text-xs transition-all ${
                          reqFilter === f
                            ? "font-bold bg-white shadow-sm text-slate-800"
                            : "font-semibold text-slate-500 hover:bg-white/50"
                        }`}
                      >
                        {f}
                      </button>
                    )
                  )}
                </div>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-700"
                >
                  <Filter size={16} className="mr-2" />
                  Filters
                  <ChevronDown size={16} className="ml-2" />
                </button>
              </div>

              {/* Course Prerequisites Overview */}
              {coursePrereqs.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm">Course Prerequisites</h3>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {matchedPrereqs.map((prereq, i) => {
                      const badgeInfo = !prereq.doc
                        ? { label: "Missing", className: "bg-amber-100 text-amber-700" }
                        : (() => {
                            const norm = normalizeDocStatus(prereq.doc.status);
                            if (norm === "Approved")
                              return {
                                label: "Approved",
                                className: "bg-emerald-100 text-emerald-700",
                              };
                            if (norm === "In Review")
                              return { label: "In Review", className: "bg-blue-100 text-blue-700" };
                            if (norm === "Rejected")
                              return { label: "Rejected", className: "bg-red-100 text-red-700" };
                            return { label: "Pending", className: "bg-amber-100 text-amber-700" };
                          })();
                      return (
                        <div
                          key={`prereq-${i}`}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText size={16} className="text-slate-400 shrink-0" />
                            <span className="text-sm font-medium text-slate-700 truncate">
                              {prereq.name}
                            </span>
                          </div>
                          <span
                            className={`shrink-0 ml-3 px-2 py-0.5 rounded text-[10px] font-bold ${badgeInfo.className}`}
                          >
                            {badgeInfo.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Course Requirements */}
              {requirementRows.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm">Course Requirements</h3>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {requirementRows.map((row, i) => {
                      const badgeInfo =
                        row.status === "Approved"
                          ? { label: "Approved", className: "bg-emerald-100 text-emerald-700" }
                          : row.status === "In Review"
                            ? { label: "In Review", className: "bg-blue-100 text-blue-700" }
                            : row.status === "Rejected"
                              ? { label: "Rejected", className: "bg-red-100 text-red-700" }
                              : row.status === "Missing"
                                ? { label: "Missing", className: "bg-amber-100 text-amber-700" }
                                : { label: "Pending", className: "bg-amber-100 text-amber-700" };
                      return (
                        <div
                          key={`req-${i}`}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText size={16} className="text-slate-400 shrink-0" />
                            <span className="text-sm font-medium text-slate-700 truncate">
                              {row.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeInfo.className}`}
                            >
                              {badgeInfo.label}
                            </span>
                            {row.status !== "Approved" && (
                              <button
                                type="button"
                                disabled={uploadingReq === row.name}
                                onClick={() => handleUploadClick(row.name)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#1d4ed8] text-[#1d4ed8] rounded text-xs font-bold hover:bg-[#1d4ed8]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {uploadingReq === row.name ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Upload size={12} />
                                )}
                                {uploadingReq === row.name ? "Uploading…" : "Upload"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt,.csv"
                    className="hidden"
                    onChange={handleFileSelected}
                  />
                </div>
              )}

              <div className="space-y-4">
                {visibleSections.length === 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
                    No documents found for this student yet.
                  </div>
                )}
                {visibleSections.map((section) => {
                  const meta = sectionMeta[section];
                  const items = grouped[section];
                  const open = openSections[section];
                  return (
                    <div key={section} className={`border rounded-xl overflow-hidden ${meta.wrap}`}>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
                        }
                        className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {meta.icon}
                          <span className="font-bold text-slate-900">
                            {section} ({items.length})
                          </span>
                        </div>
                        {open ? (
                          <ChevronUp size={20} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={20} className="text-slate-400" />
                        )}
                      </button>
                      {open && (
                        <div className="px-4 pb-4 space-y-3">
                          {items.length === 0 ? (
                            <p className="text-xs text-slate-500 px-1">
                              No items in this category.
                            </p>
                          ) : (
                            items.map((doc) => (
                              <div
                                key={doc.id}
                                className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${meta.iconWrap}`}
                                  >
                                    <FileText size={18} />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-medium text-slate-800 block truncate">
                                      {doc.academicDocument?.name || doc.name}
                                    </span>
                                    {doc.academicDocument?.name &&
                                      doc.name !== doc.academicDocument.name && (
                                        <span className="text-[11px] text-slate-400 truncate block">
                                          {doc.name}
                                        </span>
                                      )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {section === "Pending" && (
                                    <>
                                      <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-1.5 bg-[#1d4ed8] text-white rounded text-xs font-bold inline-flex items-center gap-1"
                                      >
                                        <Upload size={12} />
                                        View
                                      </a>
                                    </>
                                  )}
                                  {section === "In Review" && (
                                    <>
                                      <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-1.5 border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-slate-50"
                                      >
                                        <Maximize2 size={14} className="mr-2" />
                                        Details
                                      </a>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          try {
                                            const res = await fetch(
                                              `/api/students/documents/${doc.id}/status`,
                                              {
                                                method: "PATCH",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ status: "Approved" }),
                                              }
                                            );
                                            if (res.ok) {
                                              const updated = await res.json();
                                              setDocs((prev) =>
                                                prev.map((d) =>
                                                  d.id === doc.id
                                                    ? { ...d, status: updated.status }
                                                    : d
                                                )
                                              );
                                              toast.success("Document approved");
                                            } else {
                                              toast.error("Failed to approve document");
                                            }
                                          } catch {
                                            toast.error("Failed to approve document");
                                          }
                                        }}
                                        className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 transition-colors"
                                      >
                                        <Check size={14} className="mr-1" />
                                        Approve
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          try {
                                            const res = await fetch(
                                              `/api/students/documents/${doc.id}/status`,
                                              {
                                                method: "PATCH",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ status: "Rejected" }),
                                              }
                                            );
                                            if (res.ok) {
                                              const updated = await res.json();
                                              setDocs((prev) =>
                                                prev.map((d) =>
                                                  d.id === doc.id
                                                    ? { ...d, status: updated.status }
                                                    : d
                                                )
                                              );
                                              toast.success("Document rejected");
                                            } else {
                                              toast.error("Failed to reject document");
                                            }
                                          } catch {
                                            toast.error("Failed to reject document");
                                          }
                                        }}
                                        className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
                                      >
                                        <X size={14} className="mr-1" />
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {section !== "Pending" && section !== "In Review" && (
                                    <>
                                      <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-1.5 border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-slate-50"
                                      >
                                        <Maximize2 size={14} className="mr-2" />
                                        Details
                                      </a>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {mainTab === "Student records" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 text-sm">
              <p>
                <span className="font-semibold text-slate-800">Name:</span> {studentName}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Email:</span> {detail.student.email}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Phone:</span>{" "}
                {detail.student.phone || "—"}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Nationality:</span>{" "}
                {detail.student.nationality || "—"}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Address:</span>{" "}
                {detail.student.address || "—"}
              </p>
              <button
                type="button"
                onClick={() => router.push(`/students/${detail.studentId}`)}
                className="mt-2 text-[#1d4ed8] font-semibold text-sm hover:underline"
              >
                Open full student profile →
              </button>
            </div>
          )}

          {mainTab === "Workflow" && (
            <div className="space-y-4">
              {/* Add Stage Form */}
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Add Workflow Stage</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Stage name (e.g. Document Verification)"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddStage()}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newStageDesc}
                    onChange={(e) => setNewStageDesc(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddStage()}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddStage}
                    disabled={addingStage || !newStageName.trim()}
                    className="px-4 py-2 bg-[#1d4ed8] text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    <Plus size={16} />
                    {addingStage ? "Adding…" : "Add"}
                  </button>
                </div>
              </div>

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
                wfStages.map((stage, idx) => {
                  const subtasks = parseSubtasks(stage.subtasks);
                  const doneCount = subtasks.filter((s: { done: boolean }) => s.done).length;
                  const progress =
                    subtasks.length > 0 ? Math.round((doneCount / subtasks.length) * 100) : 0;
                  return (
                    <div
                      key={stage.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                    >
                      {/* Stage Header */}
                      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                        <div className="cursor-grab text-slate-400 hover:text-slate-600">
                          <GripVertical size={18} />
                        </div>
                        <div className="w-8 h-8 bg-[#1d4ed8] text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                          {idx + 1}
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
                            onClick={() => handleDeleteStage(stage.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete stage"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {subtasks.length > 0 && (
                        <div className="px-5 pt-3">
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Subtasks */}
                      <div className="px-5 py-3 space-y-1">
                        {subtasks.map((st: { id: string; title: string; done: boolean }) => (
                          <div
                            key={st.id}
                            className="group flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleSubtask(stage.id, st.id)}
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
                              onClick={() => handleDeleteSubtask(stage.id, st.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}

                        {/* Add subtask */}
                        {addingSubtaskTo === stage.id ? (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Subtask title"
                              value={subtaskInputs[stage.id] || ""}
                              onChange={(e) =>
                                setSubtaskInputs((prev) => ({
                                  ...prev,
                                  [stage.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddSubtask(stage.id);
                                }
                                if (e.key === "Escape") {
                                  setAddingSubtaskTo(null);
                                  setSubtaskInputs((prev) => ({ ...prev, [stage.id]: "" }));
                                }
                              }}
                              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSubtask(stage.id)}
                              disabled={!(subtaskInputs[stage.id] || "").trim()}
                              className="px-2 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAddingSubtaskTo(null);
                                setSubtaskInputs((prev) => ({ ...prev, [stage.id]: "" }));
                              }}
                              className="px-2 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-300"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAddingSubtaskTo(stage.id)}
                            className="flex items-center gap-2 text-xs font-semibold text-[#1d4ed8] hover:text-blue-700 pt-1 pb-1"
                          >
                            <Plus size={14} />
                            Add subtask
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {mainTab === "Notes" && (
            <div className="space-y-4">
              {/* Add note */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <label
                  htmlFor="application-note-input"
                  className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-2"
                >
                  Add a note
                </label>
                <textarea
                  id="application-note-input"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                  placeholder="Write a note about this application…"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-400">Ctrl/⌘ + Enter to save</span>
                  <button
                    type="button"
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || addingNote}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingNote ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    Add Note
                  </button>
                </div>
              </div>

              {/* Notes list */}
              {notesLoading ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Loading notes…
                </div>
              ) : notes.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
                  No notes on this application yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-indigo-50 text-[#1d4ed8] flex items-center justify-center text-[10px] font-black">
                            {(note.author?.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {note.author?.name || "Unknown user"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(note.createdAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {mainTab === "Commission" && (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
              Commission details are not configured for this application.
            </div>
          )}

          {mainTab === "Settings" && (
            <div className="space-y-6">
              {/* Application Status */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 text-sm">Application status</h3>
                <p className="text-xs text-slate-500 mt-1 mb-5">
                  Set the application status here. The process tracker below updates automatically
                  to match the selected status.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {appStatuses.map((s) => {
                    const active = detail.status === s.name;
                    const stepLabel = s.stage;
                    return (
                      <button
                        key={s.name}
                        type="button"
                        disabled={saving}
                        onClick={() => handleStatusUpdate(s.name)}
                        className={`text-left rounded-xl border-2 p-4 transition-all ${
                          active
                            ? "border-[#1d4ed8] bg-[#1d4ed8]/5"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        } disabled:opacity-60 disabled:cursor-wait`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-sm font-bold ${active ? "text-[#1d4ed8]" : "text-slate-800"}`}
                          >
                            {s.name}
                          </span>
                          {active ? (
                            <CheckCircle2 size={18} className="text-[#1d4ed8]" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border-2 border-slate-200" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Process stage:{" "}
                          <span className="font-semibold text-slate-700">{stepLabel}</span>
                        </div>
                        {active && saving && (
                          <Loader2 size={14} className="animate-spin mt-2 text-[#1d4ed8]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Process overview */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 text-sm mb-1">Application process</h3>
                <p className="text-xs text-slate-500 mb-4">
                  This is how the status maps to the process tracker shown at the top of the page.
                </p>
                <div className="space-y-3">
                  {progressStages.map((stage, i) => {
                    const done = i <= doneThrough;
                    const current = i === doneThrough;
                    return (
                      <div
                        key={stage}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                          current
                            ? "border-[#1d4ed8]/40 bg-[#1d4ed8]/5"
                            : "border-slate-100 bg-slate-50/50"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            done
                              ? "bg-emerald-500 text-white"
                              : "border-2 border-slate-300 bg-white"
                          }`}
                        >
                          {done && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span
                          className={`text-sm whitespace-pre-line ${current ? "font-bold text-slate-900" : "text-slate-600"}`}
                        >
                          {stage}
                        </span>
                        {current && (
                          <span className="ml-auto shrink-0 px-2 py-0.5 rounded-full bg-[#1d4ed8] text-white text-[10px] font-bold">
                            Current
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2 text-sm">
                <h3 className="font-bold text-slate-900 text-sm mb-2">Application details</h3>
                <p>
                  <span className="font-semibold text-slate-800">Status:</span> {detail.status}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Applied:</span>{" "}
                  {formatDate(detail.appliedDate)}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Last updated:</span>{" "}
                  {formatDate(detail.updatedAt)}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">University:</span>{" "}
                  {detail.university.name}, {detail.university.country}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Course:</span> {detail.course.name}{" "}
                  ({detail.course.level})
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Intake:</span>{" "}
                  {detail.course.intake || "Not specified"}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Floating actions */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-30">
        <button
          type="button"
          onClick={() => router.push("/applications")}
          className="bg-indigo-900 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl hover:bg-indigo-800 transition-all text-sm font-medium"
        >
          Back to list
          <ChevronUp size={16} />
        </button>
        <button
          type="button"
          onClick={() =>
            toast.message("Application help", {
              description: `Status: ${detail.status}. Change it in the Settings tab — the process tracker updates automatically.`,
            })
          }
          className="w-12 h-12 bg-white border border-indigo-200 rounded-full flex items-center justify-center shadow-xl hover:bg-indigo-50 transition-all text-indigo-600"
          aria-label="Help"
        >
          <Info size={22} />
        </button>
      </div>
    </div>
  );
}

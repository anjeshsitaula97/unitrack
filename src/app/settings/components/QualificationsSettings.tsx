"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, Edit2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import { loadQualifications, type Qualification } from "./settings-shared";
import SettingsHeader from "./SettingsHeader";

export default function QualificationsSettings() {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [newQualName, setNewQualName] = useState("");
  const [newQualLevel, setNewQualLevel] = useState(0);
  const [editingQual, setEditingQual] = useState<Qualification | null>(null);
  const [deleteQualId, setDeleteQualId] = useState<string | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    loadQualifications(ac.signal)
      .then((data) => setQualifications(data))
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const handleAddQual = async () => {
    if (busyRef.current) return;
    if (!newQualName.trim()) return;
    busyRef.current = true;
    try {
      const res = await fetch("/api/qualifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newQualName, level: newQualLevel }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to add qualification");
        return;
      }
      const data = await res.json();
      setQualifications([...qualifications, data]);
      setNewQualName("");
      setNewQualLevel(0);
      toast.success("Qualification added");
    } catch (_err) {
      toast.error("Error adding qualification");
    } finally {
      busyRef.current = false;
    }
  };

  const handleUpdateQual = async () => {
    if (busyRef.current) return;
    if (!editingQual || !editingQual.name.trim()) return;
    busyRef.current = true;
    try {
      const res = await fetch(`/api/qualifications/${editingQual.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingQual.name, level: editingQual.level }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to update qualification");
        return;
      }
      const data = await res.json();
      setQualifications(qualifications.map((q) => (q.id === editingQual.id ? data : q)));
      setEditingQual(null);
      toast.success("Qualification updated");
    } catch (_err) {
      toast.error("Error updating qualification");
    } finally {
      busyRef.current = false;
    }
  };

  const handleDeleteQual = async (id: string) => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      const res = await fetch(`/api/qualifications/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to delete qualification");
        return;
      }
      setQualifications(qualifications.filter((q) => q.id !== id));
      toast.success("Qualification deleted");
    } catch (_err) {
      toast.error("Error deleting qualification");
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <SettingsHeader
        icon={<BookOpen size={18} />}
        title="Education Qualifications"
        description="Manage the standard qualification levels available for student education history."
      />

      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            type="text"
            value={newQualName}
            onChange={(e) => setNewQualName(e.target.value)}
            placeholder="e.g. SLC, +2, Bachelor's, Master's"
            aria-label="New qualification name"
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <select
            value={newQualLevel}
            onChange={(e) => setNewQualLevel(Number(e.target.value))}
            aria-label="Qualification level"
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value={0}>No Level (Custom)</option>
            <option value={1}>Level 1: SEE / SLC / Grade 10</option>
            <option value={2}>Level 2: +2 / PCL / Grade 12</option>
            <option value={3}>Level 3: Bachelor / Undergraduate</option>
            <option value={4}>Level 4: Master / Postgraduate</option>
            <option value={5}>Level 5: PhD / Doctorate</option>
          </select>
          <button
            type="button"
            onClick={handleAddQual}
            className="btn-primary flex items-center gap-2"
            aria-label="Add"
          >
            <Plus size={18} /> Add
          </button>
        </div>

        <div className="space-y-2">
          {qualifications.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group"
            >
              {editingQual?.id === q.id ? (
                <div className="flex items-center gap-2 flex-1 mr-2">
                  <input
                    type="text"
                    value={editingQual.name}
                    onChange={(e) => setEditingQual({ ...editingQual, name: e.target.value })}
                    aria-label="Qualification name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateQual();
                      if (e.key === "Escape") setEditingQual(null);
                    }}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={editingQual.level}
                    onChange={(e) =>
                      setEditingQual({ ...editingQual, level: Number(e.target.value) })
                    }
                    aria-label="Qualification level"
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={0}>Custom</option>
                    <option value={1}>Level 1</option>
                    <option value={2}>Level 2</option>
                    <option value={3}>Level 3</option>
                    <option value={4}>Level 4</option>
                    <option value={5}>Level 5</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleUpdateQual}
                    aria-label="Save"
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingQual(null)}
                    aria-label="Cancel"
                    className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-bold text-slate-700">{q.name}</span>
                  {q.level && (
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full">
                      Level {q.level}
                    </span>
                  )}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => setEditingQual(q)}
                      aria-label="Edit"
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteQualId(q.id)}
                      aria-label="Delete"
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {qualifications.length === 0 && (
            <div className="py-10 text-center text-slate-400">No qualifications added yet.</div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteQualId}
        title="Delete Qualification"
        message="Are you sure you want to delete this qualification? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteQualId) handleDeleteQual(deleteQualId);
          setDeleteQualId(null);
        }}
        onCancel={() => setDeleteQualId(null)}
      />
    </div>
  );
}

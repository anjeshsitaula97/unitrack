"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { DOC_THEME, loadAcademicDocs, type AcademicItem } from "./settings-shared";
import AcademicSection from "./AcademicSection";

export default function AcademicDocManager() {
  const [academicDocs, setAcademicDocs] = useState<AcademicItem[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<AcademicItem | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    loadAcademicDocs(ac.signal)
      .then((data) => {
        setAcademicDocs(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        if (!ac.signal.aborted) toast.error("Failed to load academic documents");
      });
    return () => ac.abort();
  }, []);

  const handleAdd = async () => {
    if (busyRef.current) return;
    if (!newName.trim()) return;
    busyRef.current = true;
    try {
      const res = await fetch("/api/academic-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to add academic document");
        return;
      }
      const data = await res.json();
      setAcademicDocs([...(academicDocs ?? []), data]);
      setNewName("");
      toast.success("Academic document added");
    } catch (_err) {
      toast.error("Error adding academic document");
    } finally {
      busyRef.current = false;
    }
  };

  const handleUpdate = async () => {
    if (busyRef.current) return;
    if (!editing || !editing.name.trim()) return;
    busyRef.current = true;
    try {
      const res = await fetch("/api/academic-documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to update academic document");
        return;
      }
      const data = await res.json();
      setAcademicDocs((academicDocs ?? []).map((d) => (d.id === editing.id ? data : d)));
      setEditing(null);
      toast.success("Academic document updated");
    } catch (_err) {
      toast.error("Error updating academic document");
    } finally {
      busyRef.current = false;
    }
  };

  const handleDelete = async (id: string) => {
    if (busyRef.current) return;
    if (!confirm("Are you sure you want to delete this academic document?")) return;
    busyRef.current = true;
    try {
      const res = await fetch(`/api/academic-documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAcademicDocs((academicDocs ?? []).filter((d) => d.id !== id));
        toast.success("Academic document deleted");
      } else {
        toast.error("Failed to delete academic document");
      }
    } catch (_err) {
      toast.error("Error deleting academic document");
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <AcademicSection
      title="Documents Required"
      description="Required documents shown in the Course and Application forms"
      icon={<BookOpen size={18} />}
      theme={DOC_THEME}
      items={academicDocs}
      newName={newName}
      setNewName={setNewName}
      editing={editing}
      setEditing={setEditing}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      loading={isLoading}
      emptyText="No document types defined yet."
      placeholder="Add new document type..."
    />
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { FACULTY_THEME, loadFaculties, type AcademicItem } from "./settings-shared";
import AcademicSection from "./AcademicSection";

export default function FacultyManager() {
  const [faculties, setFaculties] = useState<AcademicItem[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<AcademicItem | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    loadFaculties(ac.signal)
      .then((data) => {
        setFaculties(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        if (!ac.signal.aborted) toast.error("Failed to load faculties");
      });
    return () => ac.abort();
  }, []);

  const handleAdd = async () => {
    if (busyRef.current) return;
    if (!newName.trim()) return;
    busyRef.current = true;
    try {
      const res = await fetch("/api/faculties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to add faculty");
        return;
      }
      const data = await res.json();
      setFaculties([...(faculties ?? []), data]);
      setNewName("");
      toast.success("Faculty added");
    } catch (_err) {
      toast.error("Error adding faculty");
    } finally {
      busyRef.current = false;
    }
  };

  const handleUpdate = async () => {
    if (busyRef.current) return;
    if (!editing || !editing.name.trim()) return;
    busyRef.current = true;
    try {
      const res = await fetch("/api/faculties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to update faculty");
        return;
      }
      const data = await res.json();
      setFaculties((faculties ?? []).map((f) => (f.id === editing.id ? data : f)));
      setEditing(null);
      toast.success("Faculty updated");
    } catch (_err) {
      toast.error("Error updating faculty");
    } finally {
      busyRef.current = false;
    }
  };

  const handleDelete = async (id: string) => {
    if (busyRef.current) return;
    if (!confirm("Are you sure you want to delete this faculty?")) return;
    busyRef.current = true;
    try {
      const res = await fetch(`/api/faculties?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFaculties((faculties ?? []).filter((f) => f.id !== id));
        toast.success("Faculty deleted");
      } else {
        toast.error("Failed to delete faculty");
      }
    } catch (_err) {
      toast.error("Error deleting faculty");
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <AcademicSection
      title="Faculties"
      icon={<LayoutGrid size={18} />}
      theme={FACULTY_THEME}
      items={faculties}
      newName={newName}
      setNewName={setNewName}
      editing={editing}
      setEditing={setEditing}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      loading={isLoading}
      emptyText="No faculties defined yet."
      placeholder="Add new faculty..."
    />
  );
}

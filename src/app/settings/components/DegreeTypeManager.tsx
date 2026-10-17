"use client";

import { useEffect, useRef, useState } from "react";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { DEGREE_THEME, loadDegreeTypes, type AcademicItem } from "./settings-shared";
import AcademicSection from "./AcademicSection";

export default function DegreeTypeManager() {
  const [degreeTypes, setDegreeTypes] = useState<AcademicItem[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<AcademicItem | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    loadDegreeTypes(ac.signal)
      .then((data) => {
        setDegreeTypes(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        if (!ac.signal.aborted) toast.error("Failed to load degree types");
      });
    return () => ac.abort();
  }, []);

  const handleAdd = async () => {
    if (busyRef.current) return;
    if (!newName.trim()) return;
    busyRef.current = true;
    try {
      const res = await fetch("/api/degree-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to add degree type");
        return;
      }
      const data = await res.json();
      setDegreeTypes([...(degreeTypes ?? []), data]);
      setNewName("");
      toast.success("Degree type added");
    } catch (_err) {
      toast.error("Error adding degree type");
    } finally {
      busyRef.current = false;
    }
  };

  const handleUpdate = async () => {
    if (busyRef.current) return;
    if (!editing || !editing.name.trim()) return;
    busyRef.current = true;
    try {
      const res = await fetch("/api/degree-types", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to update degree type");
        return;
      }
      const data = await res.json();
      setDegreeTypes((degreeTypes ?? []).map((d) => (d.id === editing.id ? data : d)));
      setEditing(null);
      toast.success("Degree type updated");
    } catch (_err) {
      toast.error("Error updating degree type");
    } finally {
      busyRef.current = false;
    }
  };

  const handleDelete = async (id: string) => {
    if (busyRef.current) return;
    if (!confirm("Are you sure you want to delete this degree type?")) return;
    busyRef.current = true;
    try {
      const res = await fetch(`/api/degree-types?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDegreeTypes((degreeTypes ?? []).filter((d) => d.id !== id));
        toast.success("Degree type deleted");
      } else {
        toast.error("Failed to delete degree type");
      }
    } catch (_err) {
      toast.error("Error deleting degree type");
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <AcademicSection
      title="Degree Types"
      icon={<GraduationCap size={18} />}
      theme={DEGREE_THEME}
      items={degreeTypes}
      newName={newName}
      setNewName={setNewName}
      editing={editing}
      setEditing={setEditing}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      loading={isLoading}
      emptyText="No degree types defined yet."
      placeholder="Add new degree type..."
    />
  );
}

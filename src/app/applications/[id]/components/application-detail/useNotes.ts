"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/fetch-client";
import type { ApplicationNote, MainTab } from "./types";

export function useNotes({ id, mainTab }: { id: string; mainTab: MainTab }) {
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (mainTab !== "Notes" || !id) return;
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (!cancelled) setNotesLoading(true);
        return api.get<ApplicationNote[]>(`/api/applications/${id}/notes`, {
          showError: false,
        });
      })
      .then((data) => {
        if (!cancelled) setNotes(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load notes");
      })
      .finally(() => {
        if (!cancelled) setNotesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mainTab, id]);

  const handleAddNote = async () => {
    if (savingNote) return;
    if (!newNote.trim()) return;
    setSavingNote(true);
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
      setSavingNote(false);
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

  return {
    notes,
    notesLoading,
    newNote,
    setNewNote,
    savingNote,
    handleAddNote,
    handleDeleteNote,
  };
}

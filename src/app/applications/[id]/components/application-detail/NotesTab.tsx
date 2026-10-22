"use client";

import { Loader2 } from "lucide-react";
import AddNoteForm from "./AddNoteForm";
import NoteCard from "./NoteCard";
import type { ApplicationNote } from "./types";

export default function NotesTab({
  notes,
  notesLoading,
  newNote,
  savingNote,
  onNoteChange,
  onAddNote,
  onDeleteNote,
}: {
  notes: ApplicationNote[];
  notesLoading: boolean;
  newNote: string;
  savingNote: boolean;
  onNoteChange: (value: string) => void;
  onAddNote: () => void;
  onDeleteNote: (noteId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <AddNoteForm
        newNote={newNote}
        savingNote={savingNote}
        onNoteChange={onNoteChange}
        onAddNote={onAddNote}
      />

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
            <NoteCard key={note.id} note={note} onDeleteNote={onDeleteNote} />
          ))}
        </div>
      )}
    </div>
  );
}

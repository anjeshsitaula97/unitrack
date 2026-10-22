"use client";

import { Loader2, Plus } from "lucide-react";

export default function AddNoteForm({
  newNote,
  savingNote,
  onNoteChange,
  onAddNote,
}: {
  newNote: string;
  savingNote: boolean;
  onNoteChange: (value: string) => void;
  onAddNote: () => void;
}) {
  return (
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
        onChange={(e) => onNoteChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onAddNote();
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
          onClick={onAddNote}
          disabled={!newNote.trim() || savingNote}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savingNote ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add Note
        </button>
      </div>
    </div>
  );
}

"use client";

import { Trash2 } from "lucide-react";
import type { ApplicationNote } from "./types";

export default function NoteCard({
  note,
  onDeleteNote,
}: {
  note: ApplicationNote;
  onDeleteNote: (noteId: string) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 group">
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
          onClick={() => onDeleteNote(note.id)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
          title="Delete note"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{note.content}</p>
    </div>
  );
}

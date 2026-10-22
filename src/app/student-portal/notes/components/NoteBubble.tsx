import { Trash2 } from "lucide-react";
import type { Note } from "./note-types";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function AuthorBadge({ mine, role }: { mine: boolean; role: string | null }) {
  return (
    <span
      className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
        mine
          ? "bg-white/15 text-indigo-50"
          : "bg-indigo-50 text-indigo-600 border border-indigo-100"
      }`}
    >
      {mine ? "Student" : role || "Staff"}
    </span>
  );
}

function DeleteButton({
  mine,
  onDelete,
  variant,
}: {
  mine: boolean;
  onDelete: () => void;
  variant: "bubble" | "reply";
}) {
  const base = "p-1 rounded-lg hover:text-red-500 transition-colors";
  const look =
    variant === "reply"
      ? "text-slate-400 hover:bg-red-50"
      : mine
        ? "hover:bg-white/15 text-indigo-200"
        : "hover:bg-red-50 text-slate-400";
  return (
    <button type="button" onClick={onDelete} className={`${base} ${look}`} title="Delete">
      <Trash2 size={12} />
    </button>
  );
}

export function NoteReplyBubble({
  note,
  formatTime,
  onRemove,
}: {
  note: Note;
  formatTime: (value: string) => string;
  onRemove: (note: Note) => void;
}) {
  const mine = note.authorType === "student";
  return (
    <div
      className={`p-3 rounded-xl border ${
        mine
          ? "bg-indigo-50 border-indigo-100 text-slate-700"
          : "bg-white border-slate-200 text-slate-700 shadow-sm"
      }`}
    >
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-semibold text-slate-700">{mine ? "You" : note.authorName}</p>
        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
          {mine ? "Student" : note.authorRole || "Staff"}
        </span>
        <span className="text-[10px] text-slate-400 ml-auto">{formatTime(note.createdAt)}</span>
        {mine && <DeleteButton mine={mine} variant="reply" onDelete={() => onRemove(note)} />}
      </div>
      <p className="mt-1 text-sm whitespace-pre-wrap">{note.content}</p>
    </div>
  );
}

export default function NoteBubble({
  note,
  formatTime,
  onToggleReply,
  onRemove,
}: {
  note: Note;
  formatTime: (value: string) => string;
  onToggleReply: () => void;
  onRemove: (note: Note) => void;
}) {
  const mine = note.authorType === "student";
  return (
    <div
      className={`p-3.5 rounded-2xl border ${
        mine
          ? "bg-indigo-600 text-white border-indigo-600 ml-10"
          : "bg-white text-slate-700 border-slate-200 shadow-sm mr-0"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`size-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
            mine ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-600"
          }`}
        >
          {initials(note.authorName)}
        </div>
        <p className={`text-xs font-semibold ${mine ? "text-indigo-100" : "text-slate-700"}`}>
          {mine ? "You" : note.authorName}
        </p>
        <AuthorBadge mine={mine} role={note.authorRole} />
        <span className={`text-[10px] ml-auto ${mine ? "text-indigo-200" : "text-slate-400"}`}>
          {formatTime(note.createdAt)}
        </span>
        {mine && <DeleteButton mine={mine} variant="bubble" onDelete={() => onRemove(note)} />}
      </div>
      <p
        className={`mt-1.5 text-sm leading-relaxed whitespace-pre-wrap ${
          mine ? "text-white" : "text-slate-700"
        }`}
      >
        {note.content}
      </p>
      <button
        type="button"
        onClick={onToggleReply}
        className={`mt-1 text-[11px] font-semibold ${
          mine ? "text-indigo-200 hover:text-white" : "text-indigo-600 hover:text-indigo-800"
        }`}
      >
        Reply
      </button>
    </div>
  );
}

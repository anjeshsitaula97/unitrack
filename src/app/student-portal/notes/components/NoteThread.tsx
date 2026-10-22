import { Loader2, Send } from "lucide-react";
import NoteBubble, { NoteReplyBubble } from "./NoteBubble";
import type { Note } from "./note-types";

export default function NoteThread({
  note,
  replies,
  formatTime,
  replyTarget,
  setReplyTarget,
  replyText,
  setReplyText,
  posting,
  onReply,
  onRemove,
}: {
  note: Note;
  replies: Note[];
  formatTime: (value: string) => string;
  replyTarget: string | null;
  setReplyTarget: (value: string | null) => void;
  replyText: string;
  setReplyText: (value: string) => void;
  posting: boolean;
  onReply: (parentId: string) => void;
  onRemove: (note: Note) => void;
}) {
  const mine = note.authorType === "student";
  return (
    <div>
      <NoteBubble
        note={note}
        formatTime={formatTime}
        onRemove={onRemove}
        onToggleReply={() => {
          setReplyTarget(replyTarget === note.id ? null : note.id);
          setReplyText("");
        }}
      />

      {replyTarget === note.id && (
        <div className="mt-2 ml-8 flex items-start gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${mine ? "the team" : note.authorName}…`}
            rows={2}
            autoFocus
            className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
          <button
            type="button"
            onClick={() => onReply(note.id)}
            disabled={!replyText.trim() || posting}
            className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send reply"
          >
            {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      )}

      {replies.length > 0 && (
        <div className="mt-2 ml-8 space-y-2 border-l-2 border-indigo-100 pl-3">
          {replies.map((r) => (
            <NoteReplyBubble key={r.id} note={r} formatTime={formatTime} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}

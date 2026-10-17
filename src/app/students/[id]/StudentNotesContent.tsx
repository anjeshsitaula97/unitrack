"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader2,
  Send,
  Reply,
  Edit2,
  Trash2,
  MessageSquare,
  StickyNote,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/fetch-client";

interface Note {
  id: string;
  studentId: string;
  content: string;
  authorType: "staff" | "student";
  authorName: string;
  authorRole: string | null;
  authorId: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-US", { timeZone: "UTC" });
};

function RoleBadge({ note }: { note: Note }) {
  const isStudent = note.authorType === "student";
  return (
    <span
      className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
        isStudent
          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
          : "bg-indigo-50 text-indigo-600 border border-indigo-100"
      }`}
    >
      {note.authorRole || (isStudent ? "Student" : "Staff")}
    </span>
  );
}

function NoteComposer({
  value,
  onChange,
  submitting,
  onAdd,
}: {
  value: string;
  onChange: (v: string) => void;
  submitting: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
      <div className="flex items-center gap-2 mb-2">
        <StickyNote size={16} className="text-indigo-600" />
        <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
          Notes &amp; Communication
        </p>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">
        Add a note or message here — staff see it immediately and the student can read and reply
        from their portal.
      </p>
      <textarea
        aria-label="Note content"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a note to the student or the team…"
        rows={3}
        className="w-full px-3 py-2.5 text-sm bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
      />
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={onAdd}
          disabled={!value.trim() || submitting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          Add Note
        </button>
      </div>
    </div>
  );
}

function NoteThread({
  notes,
  meId,
  submitting,
  editingId,
  setEditingId,
  editText,
  setEditText,
  replyTarget,
  setReplyTarget,
  replyText,
  setReplyText,
  onSaveEdit,
  onReplySubmit,
  onRemove,
  endRef,
}: {
  notes: Note[];
  meId: string | null;
  submitting: boolean;
  editingId: string | null;
  setEditingId: (v: string | null) => void;
  editText: string;
  setEditText: (v: string) => void;
  replyTarget: string | null;
  setReplyTarget: (v: string | null) => void;
  replyText: string;
  setReplyText: (v: string) => void;
  onSaveEdit: (note: Note) => void;
  onReplySubmit: (parentId: string) => void;
  onRemove: (note: Note) => void;
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  const isMine = (note: Note) =>
    note.authorType === "staff" && note.authorId !== null && note.authorId === meId;
  const topNotes = notes.filter((n) => !n.parentId);
  const repliesOf = (parentId: string) => notes.filter((n) => n.parentId === parentId);

  if (topNotes.length === 0) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
          <MessageSquare className="text-slate-200" size={32} />
        </div>
        <p className="text-slate-500 font-bold">No notes yet</p>
        <p className="text-slate-400 text-sm">
          Start the conversation by adding the first note above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {topNotes.map((note) => {
        const mine = isMine(note);
        const replies = repliesOf(note.id);
        return (
          <div
            key={note.id}
            className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`size-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    note.authorType === "student"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  {initials(note.authorName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{note.authorName}</p>
                    <RoleBadge note={note} />
                    <span className="text-[10px] text-slate-400">{formatTime(note.createdAt)}</span>
                  </div>
                  {editingId === note.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        aria-label="Edit note content"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        autoFocus
                        className="w-full px-3 py-2 text-sm bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSaveEdit(note)}
                          disabled={!editText.trim() || submitting}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
                        >
                          <Check size={12} /> Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg text-[11px] font-bold uppercase tracking-widest"
                        >
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTarget(replyTarget === note.id ? null : note.id);
                        setReplyText("");
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Reply size={12} /> Reply
                    </button>
                    {mine && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(note.id);
                            setEditText(note.content);
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemove(note)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {replyTarget === note.id && (
              <div className="px-4 pb-4 border-t border-slate-50 bg-slate-50/50">
                <div className="mt-3 flex items-start gap-2">
                  <textarea
                    aria-label={`Reply to ${note.authorName}`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${note.authorName}…`}
                    rows={2}
                    autoFocus
                    className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => onReplySubmit(note.id)}
                    disabled={!replyText.trim() || submitting}
                    aria-label="Post reply"
                    title="Post reply"
                    className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {replies.length > 0 && (
              <div className="border-t border-slate-50 bg-slate-50/40 px-4 py-3 space-y-3 ml-6">
                {replies.map((replyNote) => {
                  const replyMine = isMine(replyNote);
                  return (
                    <div key={replyNote.id} className="flex items-start gap-3">
                      <div
                        className={`size-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                          replyNote.authorType === "student"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-indigo-100 text-indigo-600"
                        }`}
                      >
                        {initials(replyNote.authorName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold text-slate-800">
                            {replyNote.authorName}
                          </p>
                          <RoleBadge note={replyNote} />
                          <span className="text-[10px] text-slate-400">
                            {formatTime(replyNote.createdAt)}
                          </span>
                        </div>
                        {editingId === replyNote.id ? (
                          <div className="mt-1 space-y-2">
                            <textarea
                              aria-label="Edit reply content"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              rows={2}
                              autoFocus
                              className="w-full px-3 py-2 text-sm bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onSaveEdit(replyNote)}
                                disabled={!editText.trim() || submitting}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
                              >
                                <Check size={12} /> Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg text-[11px] font-bold uppercase tracking-widest"
                              >
                                <X size={12} /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-0.5 text-sm text-slate-600 whitespace-pre-wrap ml-2 border-l-2 border-indigo-100 pl-2">
                            {replyNote.content}
                          </p>
                        )}
                        {replyMine && (
                          <div className="mt-1 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(replyNote.id);
                                setEditText(replyNote.content);
                              }}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <Edit2 size={11} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemove(replyNote)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}

export default function StudentNotesContent({ studentId }: { studentId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/students/${studentId}/notes`);
      if (res.status === 403) {
        setForbidden(true);
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setNotes(Array.isArray(data) ? data : []);
      }
    } catch {
      // Keep whatever is already rendered; silent like the rest of the app.
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    api
      .get<{ id?: string | number }>("/api/auth/me", { showError: false })
      .then((d) => {
        if (d?.id) setMeId(String(d.id));
      })
      .catch(() => {});
  }, []);

  const fetchNotesRef = useRef(fetchNotes);
  useEffect(() => {
    fetchNotesRef.current();
  }, []);

  // Poll so a message the student sends from their portal shows up here without
  // a manual refresh.
  useEffect(() => {
    const interval = setInterval(() => fetchNotesRef.current(), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes.length]);

  const addNote = async () => {
    const content = noteText.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/students/${studentId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const created = (await res.json()) as Note;
        setNotes((prev) => [...prev, created]);
        setNoteText("");
        toast.success("Note added");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to add note");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setSubmitting(false);
    }
  };

  const reply = async (parentId: string) => {
    const content = replyText.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/students/${studentId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });
      if (res.ok) {
        const created = (await res.json()) as Note;
        setNotes((prev) => [...prev, created]);
        setReplyTarget(null);
        setReplyText("");
        toast.success("Reply posted");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to post reply");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setSubmitting(false);
    }
  };

  const saveEdit = async (note: Note) => {
    const content = editText.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/students/${studentId}/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const updated = (await res.json()) as Note;
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        setEditingId(null);
        setEditText("");
        toast.success("Note updated");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to update note");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setSubmitting(false);
    }
  };

  const removeNote = async (note: Note) => {
    if (!window.confirm("Delete this note? Replies will remain as standalone notes.")) return;
    try {
      const res = await fetch(`/api/students/${studentId}/notes/${note.id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== note.id));
        toast.success("Note deleted");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to delete note");
      }
    } catch {
      toast.error("Error connecting to server");
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
        <Loader2 className="animate-spin" size={32} />
        <p className="text-sm font-bold">Loading notes…</p>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
          <MessageSquare className="text-slate-300" size={32} />
        </div>
        <p className="text-slate-500 font-bold">You don&apos;t have access to notes</p>
        <p className="text-slate-400 text-sm">
          Ask an administrator to grant the Students → notes permission.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <NoteComposer
        value={noteText}
        onChange={setNoteText}
        submitting={submitting}
        onAdd={addNote}
      />
      <NoteThread
        notes={notes}
        meId={meId}
        submitting={submitting}
        editingId={editingId}
        setEditingId={setEditingId}
        editText={editText}
        setEditText={setEditText}
        replyTarget={replyTarget}
        setReplyTarget={setReplyTarget}
        replyText={replyText}
        setReplyText={setReplyText}
        onSaveEdit={saveEdit}
        onReplySubmit={reply}
        onRemove={removeNote}
        endRef={endRef}
      />
    </div>
  );
}

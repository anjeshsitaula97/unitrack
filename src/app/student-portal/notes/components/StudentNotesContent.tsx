"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Send, Loader2, ArrowLeft, MessageSquare, Trash2, StickyNote } from "lucide-react";
import { toast } from "sonner";

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
  return d.toLocaleDateString();
};

export default function StudentNotesContent() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/student-portal/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent poll failures
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotesRef = useRef(fetchNotes);
  useEffect(() => {
    fetchNotesRef.current();
  }, []);

  // Poll so new replies from the team show up automatically.
  useEffect(() => {
    const interval = setInterval(() => fetchNotesRef.current(), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes.length]);

  const addNote = async () => {
    const content = noteText.trim();
    if (!content || posting) return;
    setPosting(true);
    try {
      const res = await fetch("/api/student-portal/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const created = (await res.json()) as Note;
        setNotes((prev) => [...prev, created]);
        setNoteText("");
        toast.success("Message sent");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to send message");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setPosting(false);
    }
  };

  const reply = async (parentId: string) => {
    const content = replyText.trim();
    if (!content || posting) return;
    setPosting(true);
    try {
      const res = await fetch("/api/student-portal/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });
      if (res.ok) {
        const created = (await res.json()) as Note;
        setNotes((prev) => [...prev, created]);
        setReplyTarget(null);
        setReplyText("");
        toast.success("Reply sent");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to send reply");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setPosting(false);
    }
  };

  const removeNote = async (note: Note) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      const res = await fetch(`/api/student-portal/notes?id=${note.id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== note.id));
        toast.success("Message deleted");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to delete message");
      }
    } catch {
      toast.error("Error connecting to server");
    }
  };

  const topNotes = notes.filter((n) => !n.parentId);
  const repliesOf = (parentId: string) => notes.filter((n) => n.parentId === parentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin size-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/student-portal/dashboard"
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="Back to portal"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="text-indigo-600" size={20} />
            Notes &amp; Messages
          </h1>
          <p className="text-xs text-slate-400">Chat with your counselor and the UniTrack team</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-indigo-50/60">
          <div className="flex items-center gap-2 mb-2">
            <StickyNote size={15} className="text-indigo-600" />
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Send a message
            </p>
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Ask a question or send an update to the team…"
            rows={3}
            className="w-full px-3 py-2.5 text-sm bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={addNote}
              disabled={!noteText.trim() || posting}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {posting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Send
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 bg-slate-50/50">
          {topNotes.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No messages yet. Send the first one above!</p>
            </div>
          ) : (
            topNotes.map((note) => {
              const mine = note.authorType === "student";
              const replies = repliesOf(note.id);
              return (
                <div key={note.id}>
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
                      <p
                        className={`text-xs font-semibold ${mine ? "text-indigo-100" : "text-slate-700"}`}
                      >
                        {mine ? "You" : note.authorName}
                      </p>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                          mine
                            ? "bg-white/15 text-indigo-50"
                            : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                        }`}
                      >
                        {mine ? "Student" : note.authorRole || "Staff"}
                      </span>
                      <span
                        className={`text-[10px] ml-auto ${mine ? "text-indigo-200" : "text-slate-400"}`}
                      >
                        {formatTime(note.createdAt)}
                      </span>
                      {mine && (
                        <button
                          type="button"
                          onClick={() => removeNote(note)}
                          className={`p-1 rounded-lg ${mine ? "hover:bg-white/15" : "hover:bg-red-50"} ${mine ? "text-indigo-200" : "text-slate-400"} hover:text-red-500 transition-colors`}
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
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
                      onClick={() => {
                        setReplyTarget(replyTarget === note.id ? null : note.id);
                        setReplyText("");
                      }}
                      className={`mt-1 text-[11px] font-semibold ${
                        mine
                          ? "text-indigo-200 hover:text-white"
                          : "text-indigo-600 hover:text-indigo-800"
                      }`}
                    >
                      Reply
                    </button>
                  </div>

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
                        onClick={() => reply(note.id)}
                        disabled={!replyText.trim() || posting}
                        className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Send reply"
                      >
                        {posting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Send size={16} />
                        )}
                      </button>
                    </div>
                  )}

                  {replies.length > 0 && (
                    <div className="mt-2 ml-8 space-y-2 border-l-2 border-indigo-100 pl-3">
                      {replies.map((r) => {
                        const rMine = r.authorType === "student";
                        return (
                          <div
                            key={r.id}
                            className={`p-3 rounded-xl border ${
                              rMine
                                ? "bg-indigo-50 border-indigo-100 text-slate-700"
                                : "bg-white border-slate-200 text-slate-700 shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <p className="text-[11px] font-semibold text-slate-700">
                                {rMine ? "You" : r.authorName}
                              </p>
                              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                {rMine ? "Student" : r.authorRole || "Staff"}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-auto">
                                {formatTime(r.createdAt)}
                              </span>
                              {rMine && (
                                <button
                                  type="button"
                                  onClick={() => removeNote(r)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                            <p className="mt-1 text-sm whitespace-pre-wrap">{r.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}

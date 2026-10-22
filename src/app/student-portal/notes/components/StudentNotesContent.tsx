"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Send, Loader2, ArrowLeft, MessageSquare, StickyNote } from "lucide-react";
import NoteThread from "./NoteThread";
import type { Note } from "./note-types";
import { toast } from "sonner";

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

  const noteInFlightRef = useRef(false);

  const addNote = async () => {
    const content = noteText.trim();
    if (!content || noteInFlightRef.current) return;
    noteInFlightRef.current = true;
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
      noteInFlightRef.current = false;
      setPosting(false);
    }
  };

  const reply = async (parentId: string) => {
    const content = replyText.trim();
    if (!content || noteInFlightRef.current) return;
    noteInFlightRef.current = true;
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
      noteInFlightRef.current = false;
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
            aria-label="Ask a question or send an update to the team…"
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
            topNotes.map((note) => (
              <NoteThread
                key={note.id}
                note={note}
                replies={repliesOf(note.id)}
                formatTime={formatTime}
                replyTarget={replyTarget}
                setReplyTarget={setReplyTarget}
                replyText={replyText}
                setReplyText={setReplyText}
                posting={posting}
                onReply={reply}
                onRemove={removeNote}
              />
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}

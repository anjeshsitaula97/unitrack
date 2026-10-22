"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { safeJson } from "@/lib/fetch-client";
import ChatPanel from "./ChatPanel";
import ConversationSidebar from "./ConversationSidebar";
import type { Conversation, Message, StudentUser } from "./chat-types";

export default function AdminStudentMessagesContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [studentList, setStudentList] = useState<StudentUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const [sessionId, setSessionId] = useState<string>("");

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/student-messages/conversations");
      if (res.ok) setConversations(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/student-messages/messages?conversationId=${convId}`);
      if (res.ok) setMessages(await res.json());
    } catch {}
  };

  const fetchMessagesRef = useRef(fetchMessages);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const [meRes, convRes, studentsRes] = await Promise.all([
          fetch("/api/auth/me", { credentials: "include", signal: controller.signal }),
          fetch("/api/student-messages/conversations", { signal: controller.signal }),
          fetch("/api/student-messages/students", { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        const me = await safeJson(meRes);
        if (me?.id) setSessionId(me.id);
        if (convRes.ok) setConversations(await convRes.json());
        const students = await safeJson(studentsRes);
        setStudentList(Array.isArray(students) ? students : []);
      } catch {
        if (controller.signal.aborted) return;
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessagesRef.current(selectedConv);
      pollRef.current = setInterval(() => fetchMessagesRef.current(selectedConv), 5000);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async (studentId: string) => {
    try {
      const res = await fetch("/api/student-messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      if (res.ok) {
        const conv = await res.json();
        setShowNewChat(false);
        setSelectedConv(conv.id);
        fetchConversations();
      }
    } catch {}
  };

  const sendInFlightRef = useRef(false);

  const sendMessage = async () => {
    if (!input.trim() || !selectedConv) return;
    if (sendInFlightRef.current) return;
    sendInFlightRef.current = true;
    setSending(true);
    try {
      const res = await fetch("/api/student-messages/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedConv, content: input.trim() }),
      });
      if (res.ok) {
        setInput("");
        fetchMessages(selectedConv);
        fetchConversations();
      }
    } catch {
    } finally {
      sendInFlightRef.current = false;
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedConvData = conversations.find((c) => c.id === selectedConv);
  const filteredStudents = studentList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin size-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <ConversationSidebar
        conversations={conversations}
        selectedConv={selectedConv}
        onSelect={setSelectedConv}
        showNewChat={showNewChat}
        setShowNewChat={setShowNewChat}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredStudents={filteredStudents}
        onStartConversation={startConversation}
        formatTime={formatTime}
      />

      <ChatPanel
        selectedConvData={selectedConvData}
        messages={messages}
        sessionId={sessionId}
        formatTime={formatTime}
        input={input}
        setInput={setInput}
        handleKeyDown={handleKeyDown}
        sendMessage={sendMessage}
        sending={sending}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
}

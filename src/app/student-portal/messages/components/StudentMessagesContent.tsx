"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessageSquare, Send, Loader2, User, ChevronRight, Search, ArrowLeft } from "lucide-react";
import { safeJson } from "@/lib/fetch-client";

interface Conversation {
  id: string;
  studentId: string;
  staffId: string;
  subject: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  updatedAt: string;
  staff: { id: string; name: string; email: string; avatar: string | null; role: string };
  messages: { content: string; createdAt: string }[];
}

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export default function StudentMessagesContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/student-portal/conversations");
      if (res.ok) setConversations(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/student-portal/messages?conversationId=${convId}`);
      if (res.ok) setMessages(await res.json());
    } catch {}
  };

  const fetchConversationsRef = useRef(fetchConversations);
  const fetchMessagesRef = useRef(fetchMessages);

  useEffect(() => {
    fetchConversationsRef.current();
    fetch("/api/chat/users")
      .then(safeJson)
      .then((d) => {
        const users: StaffUser[] = (d.users || []).filter((u: StaffUser) => u.role !== "student");
        setStaffList(users);
      })
      .catch(() => {});
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

  const startConversation = async (staffId: string) => {
    try {
      const res = await fetch("/api/student-portal/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId }),
      });
      if (res.ok) {
        const conv = await res.json();
        setShowNewChat(false);
        setSelectedConv(conv.id);
        fetchConversations();
      }
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedConv || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/student-portal/messages", {
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
  const filteredStaff = staffList.filter(
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
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <Link
            href="/student-portal/dashboard"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Back to portal"
          >
            <ArrowLeft size={18} />
          </Link>
          <h2 className="font-bold text-sm text-slate-800 flex-1">Messages</h2>
          <button
            type="button"
            onClick={() => setShowNewChat(!showNewChat)}
            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            title="New Conversation"
          >
            <MessageSquare size={16} />
          </button>
        </div>

        {showNewChat && (
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <div className="relative mb-2">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredStaff.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => startConversation(s.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-indigo-50 transition-colors text-left"
                >
                  <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px] flex-shrink-0">
                    {s.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-700 truncate">{s.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{s.role}</p>
                  </div>
                </button>
              ))}
              {filteredStaff.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">No staff found</p>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No conversations yet</p>
              <p className="text-[10px] text-slate-400 mt-1">Click + to start a new chat</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                type="button"
                key={conv.id}
                onClick={() => setSelectedConv(conv.id)}
                className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors ${selectedConv === conv.id ? "bg-indigo-50/50" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                    {conv.staff.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {conv.staff.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  {conv.lastMessageAt && (
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={48} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">Select a conversation</p>
              <p className="text-xs text-slate-300 mt-1">
                Choose a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3 bg-white">
              <button
                type="button"
                onClick={() => setSelectedConv(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors md:hidden"
                title="Back to conversations"
              >
                <ChevronRight size={18} className="rotate-180" />
              </button>
              <div className="size-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                {selectedConvData?.staff.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {selectedConvData?.staff.name}
                </p>
                <p className="text-[11px] text-slate-400 capitalize">
                  {selectedConvData?.staff.role}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xs text-slate-400">No messages yet. Start the conversation!</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMine = msg.senderId === selectedConvData?.studentId;
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                        isMine
                          ? "bg-indigo-600 text-white rounded-br-md"
                          : "bg-white text-slate-700 border border-slate-200 rounded-bl-md shadow-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${isMine ? "text-indigo-200" : "text-slate-400"}`}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

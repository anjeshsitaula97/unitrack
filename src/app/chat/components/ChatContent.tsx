"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Search, Send, MessageSquare, Plus, X } from "lucide-react";
import { safeJson } from "@/lib/fetch-client";

interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; avatar: string | null };
}

interface ChatRoom {
  id: string;
  name: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
  members: { id: string; name: string; avatar: string | null }[];
  messages: ChatMessage[];
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ChatContent() {
  const [sessionUser, setSessionUser] = useState<{ id: string; name: string } | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(safeJson)
      .then((data) => {
        if (data.id) setSessionUser({ id: data.id, name: data.name || "" });
      })
      .catch(() => {});
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/rooms");
      if (res.ok) setRooms(await res.json());
    } catch {}
  }, []);

  const fetchMessages = useCallback(async (roomId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?roomId=${roomId}`);
      if (res.ok) setMessages(await res.json());
    } catch {}
  }, []);

  const fetchRoomsRef = useRef(fetchRooms);
  useEffect(() => {
    fetchRoomsRef.current = fetchRooms;
    fetchRoomsRef.current();
  }, [fetchRooms]);
  useEffect(() => {
    const interval = setInterval(() => fetchRoomsRef.current(), 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessagesRef = useRef(fetchMessages);
  useEffect(() => {
    if (!activeRoomId) return;
    fetchMessagesRef.current = fetchMessages;
    fetchMessagesRef.current(activeRoomId);
    const interval = setInterval(() => fetchMessagesRef.current(activeRoomId), 5000);
    return () => clearInterval(interval);
  }, [activeRoomId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || !activeRoomId || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: activeRoomId, content: inputText.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setInputText("");
        fetchRooms();
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

  const openNewChat = async () => {
    const res = await fetch("/api/chat/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
    setShowNewChat(true);
  };

  const startDirectChat = async (userId: string) => {
    try {
      const res = await fetch("/api/chat/rooms/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const room = await res.json();
        setRooms((prev) => {
          const exists = prev.find((r) => r.id === room.id);
          return exists ? prev : [room, ...prev];
        });
        setActiveRoomId(room.id);
        setShowNewChat(false);
      }
    } catch {}
  };

  const otherMember = (room: ChatRoom) => {
    if (!sessionUser) return null;
    return room.members.find((m) => m.id !== sessionUser.id) || room.members[0];
  };

  const roomName = (room: ChatRoom) => {
    if (room.name) return room.name;
    const om = otherMember(room);
    return om ? om.name : "Unknown";
  };

  const roomAvatar = (room: ChatRoom) => {
    const om = otherMember(room);
    const name = om?.name || "?";
    const initials = name
      .split(" ")
      .map((s) => s[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    return (
      <div className="size-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
        {om?.avatar ? (
          <Image
            src={om.avatar}
            alt=""
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-0 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Left panel – conversation list */}
      <div className="w-80 shrink-0 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-3 border-b border-slate-200 flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <button
            type="button"
            onClick={openNewChat}
            title="New Chat"
            className="size-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6">
              <MessageSquare size={36} className="mb-3 opacity-40" />
              <p className="text-xs font-medium">No conversations yet</p>
              <p className="text-[11px] mt-1">Click + to start a new chat</p>
            </div>
          )}
          {(searchQuery
            ? rooms.filter((r) => roomName(r).toLowerCase().includes(searchQuery.toLowerCase()))
            : rooms
          ).map((room) => {
            const isActive = room.id === activeRoomId;
            const lastMsg = room.messages?.[0];
            return (
              <button
                type="button"
                key={room.id}
                onClick={() => setActiveRoomId(room.id)}
                className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors border-b border-slate-100 ${
                  isActive
                    ? "bg-indigo-50"
                    : "hover:bg-slate-100"
                }`}
              >
                {roomAvatar(room)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium truncate ${isActive ? "text-indigo-700" : "text-slate-700"}`}
                    >
                      {roomName(room)}
                    </span>
                    {lastMsg && (
                      <span className="text-[10px] text-slate-400 ml-2 shrink-0">
                        {formatTime(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {lastMsg
                      ? (lastMsg.senderId === sessionUser?.id ? "You: " : "") + lastMsg.content
                      : "No messages yet"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel – messages */}
      <div className="flex-1 flex flex-col">
        {!activeRoom ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">Select a conversation</p>
              <p className="text-xs mt-1">Choose from the left or start a new one</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3 bg-white">
              {activeRoom && roomAvatar(activeRoom)}
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  {roomName(activeRoom)}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {activeRoom.type === "GROUP" ? "Group" : "Direct message"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/30">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <p className="text-xs">No messages yet. Say hello!</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMine = msg.senderId === sessionUser?.id;
                const senderName = msg.sender?.name || "Unknown";
                const initials = senderName
                  .split(" ")
                  .map((s) => s[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isMine ? "flex-row-reverse" : ""}`}>
                    <div
                      className={`size-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                        isMine
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {msg.sender?.avatar ? (
                        <Image
                          src={msg.sender.avatar}
                          alt=""
                          width={28}
                          height={28}
                          className="size-7 rounded-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div
                      className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col`}
                    >
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                          isMine
                            ? "bg-indigo-600 text-white rounded-br-md"
                            : "bg-white text-slate-700 border border-slate-200 rounded-bl-md"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span
                        className={`text-[10px] text-slate-400 mt-1 ${isMine ? "text-right" : "text-left"} px-1`}
                      >
                        {formatTime(msg.createdAt)}
                      </span>
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
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!inputText.trim() || sending}
                  className="size-9 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="button"
          tabIndex={0}
          onClick={() => setShowNewChat(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowNewChat(false);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">
                New Conversation
              </h3>
              <button
                type="button"
                onClick={() => setShowNewChat(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3">
              <div className="relative mb-3">
                <Search
                  size={15}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div className="max-h-72 overflow-y-auto space-y-0.5">
                {filteredUsers.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-8">No users found</p>
                )}
                {filteredUsers.map((u) => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => startDirectChat(u.id)}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="size-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                      {u.avatar ? (
                        <Image
                          src={u.avatar}
                          alt=""
                          width={32}
                          height={32}
                          className="size-8 rounded-full object-cover"
                        />
                      ) : (
                        u.name
                          .split(" ")
                          .map((s) => s[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {u.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {u.role} &middot; {u.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

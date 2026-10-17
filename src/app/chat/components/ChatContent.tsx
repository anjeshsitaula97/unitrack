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

type SessionUser = { id: string; name: string } | null;

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getOtherMember(room: ChatRoom, sessionUser: SessionUser) {
  if (!sessionUser) return null;
  return room.members.find((m) => m.id !== sessionUser.id) || room.members[0];
}

function getRoomName(room: ChatRoom, sessionUser: SessionUser) {
  if (room.name) return room.name;
  const om = getOtherMember(room, sessionUser);
  return om ? om.name : "Unknown";
}

function MessageTime({ iso }: { iso: string }) {
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  return (
    <>
      {isToday
        ? d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          })
        : d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          })}
    </>
  );
}

function RoomAvatar({ room, sessionUser }: { room: ChatRoom; sessionUser: SessionUser }) {
  const om = getOtherMember(room, sessionUser);
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
        initialsOf(om?.name || "?")
      )}
    </div>
  );
}

function ConversationList({
  rooms,
  activeRoomId,
  searchQuery,
  sessionUser,
  onSearchChange,
  onSelect,
  onNewChat,
}: {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  searchQuery: string;
  sessionUser: SessionUser;
  onSearchChange: (value: string) => void;
  onSelect: (roomId: string) => void;
  onNewChat: () => void;
}) {
  const visibleRooms = searchQuery
    ? rooms.filter((r) =>
        getRoomName(r, sessionUser).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rooms;

  return (
    <div className="w-80 shrink-0 border-r border-slate-200 flex flex-col bg-slate-50/50">
      <div className="p-3 border-b border-slate-200 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Search conversations"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <button
          type="button"
          onClick={onNewChat}
          title="New Chat"
          aria-label="New chat"
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
        {visibleRooms.map((room) => {
          const isActive = room.id === activeRoomId;
          const lastMsg = room.messages?.[0];
          return (
            <button
              type="button"
              key={room.id}
              onClick={() => onSelect(room.id)}
              className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors border-b border-slate-100 ${
                isActive ? "bg-indigo-50" : "hover:bg-slate-100"
              }`}
            >
              <RoomAvatar room={room} sessionUser={sessionUser} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium truncate ${isActive ? "text-indigo-700" : "text-slate-700"}`}
                  >
                    {getRoomName(room, sessionUser)}
                  </span>
                  {lastMsg && (
                    <span className="text-[10px] text-slate-400 ml-2 shrink-0">
                      <MessageTime iso={lastMsg.createdAt} />
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
  );
}

function MessageThread({
  room,
  messages,
  sessionUser,
  inputText,
  busy,
  messagesEndRef,
  inputRef,
  onInputChange,
  onSend,
  onKeyDown,
}: {
  room: ChatRoom;
  messages: ChatMessage[];
  sessionUser: SessionUser;
  inputText: string;
  busy: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3 bg-white">
        <RoomAvatar room={room} sessionUser={sessionUser} />
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{getRoomName(room, sessionUser)}</h3>
          <p className="text-[11px] text-slate-400">
            {room.type === "GROUP" ? "Group" : "Direct message"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/30">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p className="text-xs">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === sessionUser?.id;
          const senderName = msg.sender?.name || "Unknown";
          return (
            <div key={msg.id} className={`flex gap-2.5 ${isMine ? "flex-row-reverse" : ""}`}>
              <div
                className={`size-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                  isMine ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"
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
                  initialsOf(senderName)
                )}
              </div>
              <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
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
                  <MessageTime iso={msg.createdAt} />
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            aria-label="Type a message"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!inputText.trim() || busy}
            aria-label="Send message"
            className="size-9 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NewChatModal({
  filteredUsers,
  searchQuery,
  onSearchChange,
  onSelectUser,
  onClose,
}: {
  filteredUsers: ChatUser[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectUser: (userId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close new chat"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">New Conversation</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
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
              aria-label="Search users"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
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
                onClick={() => onSelectUser(u.id)}
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
                    initialsOf(u.name)
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{u.name}</p>
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
  );
}

export default function ChatContent() {
  const [sessionUser, setSessionUser] = useState<{ id: string; name: string } | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [busy, setBusy] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/auth/me", { credentials: "include", signal: ac.signal })
      .then(safeJson)
      .then((data) => {
        if (data.id) setSessionUser({ id: data.id, name: data.name || "" });
      })
      .catch(() => {});
    return () => ac.abort();
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
    if (!inputText.trim() || !activeRoomId || busy) return;
    setBusy(true);
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
      setBusy(false);
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

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-0 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Left panel – conversation list */}
      <ConversationList
        rooms={rooms}
        activeRoomId={activeRoomId}
        searchQuery={searchQuery}
        sessionUser={sessionUser}
        onSearchChange={setSearchQuery}
        onSelect={setActiveRoomId}
        onNewChat={openNewChat}
      />

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
          <MessageThread
            room={activeRoom}
            messages={messages}
            sessionUser={sessionUser}
            inputText={inputText}
            busy={busy}
            messagesEndRef={messagesEndRef}
            inputRef={inputRef}
            onInputChange={setInputText}
            onSend={sendMessage}
            onKeyDown={handleKeyDown}
          />
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <NewChatModal
          filteredUsers={filteredUsers}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectUser={startDirectChat}
          onClose={() => setShowNewChat(false)}
        />
      )}
    </div>
  );
}

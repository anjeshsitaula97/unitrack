import React from "react";
import { ChevronRight, MessageSquare } from "lucide-react";
import ChatComposer from "@/components/ChatComposer";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface PanelConversation {
  id: string;
  studentId: string;
  staff: { id: string; name: string; role: string };
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function StudentChatPanel({
  selectedConvData,
  messages,
  formatTime,
  input,
  setInput,
  handleKeyDown,
  sendMessage,
  sending,
  messagesEndRef,
  onBack,
}: {
  selectedConvData: PanelConversation | undefined;
  messages: Message[];
  formatTime: (value: string) => string;
  input: string;
  setInput: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  sendMessage: () => void;
  sending: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      {!selectedConvData ? (
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
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3 bg-white">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors md:hidden"
              title="Back to conversations"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <div className="size-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
              {initials(selectedConvData.staff.name)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{selectedConvData.staff.name}</p>
              <p className="text-[11px] text-slate-400 capitalize">{selectedConvData.staff.role}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xs text-slate-400">No messages yet. Start the conversation!</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMine = msg.senderId === selectedConvData.studentId;
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

          <ChatComposer
            value={input}
            onChange={setInput}
            onKeyDown={handleKeyDown}
            onSend={sendMessage}
            sending={sending}
          />
        </>
      )}
    </div>
  );
}

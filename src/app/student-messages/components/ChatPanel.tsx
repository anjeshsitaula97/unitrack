import React from "react";
import { MessageSquare } from "lucide-react";
import ChatComposer from "@/components/ChatComposer";
import { getInitials, type Conversation, type Message } from "./chat-types";

export default function ChatPanel({
  selectedConvData,
  messages,
  sessionId,
  formatTime,
  input,
  setInput,
  handleKeyDown,
  sendMessage,
  sending,
  messagesEndRef,
}: {
  selectedConvData: Conversation | undefined;
  messages: Message[];
  sessionId: string;
  formatTime: (value: string) => string;
  input: string;
  setInput: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  sendMessage: () => void;
  sending: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex-1 flex flex-col">
      {!selectedConvData ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare size={48} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">Select a conversation</p>
            <p className="text-xs text-slate-300 mt-1">
              Choose a student conversation from the sidebar
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3 bg-white">
            <div className="size-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">
              {getInitials(selectedConvData.student.name)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {selectedConvData.student.name}
              </p>
              <p className="text-[11px] text-slate-400">
                {selectedConvData.staff
                  ? `Assigned to ${selectedConvData.staff.name}`
                  : "Unassigned"}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xs text-slate-400">No messages yet. Start the conversation!</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMine = msg.senderId === sessionId;
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

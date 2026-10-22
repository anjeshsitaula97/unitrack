import { GraduationCap, MessageSquare, Search } from "lucide-react";
import { getInitials, type Conversation, type StudentUser } from "./chat-types";

export default function ConversationSidebar({
  conversations,
  selectedConv,
  onSelect,
  showNewChat,
  setShowNewChat,
  searchTerm,
  setSearchTerm,
  filteredStudents,
  onStartConversation,
  formatTime,
}: {
  conversations: Conversation[];
  selectedConv: string | null;
  onSelect: (id: string) => void;
  showNewChat: boolean;
  setShowNewChat: (value: boolean) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredStudents: StudentUser[];
  onStartConversation: (studentId: string) => void;
  formatTime: (value: string) => string;
}) {
  return (
    <div className="w-72 border-r border-slate-200 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-sm text-slate-800">Messages</h2>
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
              aria-label="Search students..."
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {filteredStudents.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => onStartConversation(s.id)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-indigo-50 transition-colors text-left"
              >
                <div className="size-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-[10px] flex-shrink-0">
                  {getInitials(s.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-700 truncate">{s.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{s.email}</p>
                </div>
              </button>
            ))}
            {filteredStudents.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-2">No students found</p>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {conversations.length === 0 ? (
          <div className="p-6 text-center">
            <GraduationCap size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No conversations yet</p>
            <p className="text-[10px] text-slate-400 mt-1">Click + to message a student</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              type="button"
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors ${selectedConv === conv.id ? "bg-indigo-50/50" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0">
                  {getInitials(conv.student.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700 truncate">
                    {conv.student.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {conv.staff ? `→ ${conv.staff.name}` : "Unassigned"} ·{" "}
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
  );
}

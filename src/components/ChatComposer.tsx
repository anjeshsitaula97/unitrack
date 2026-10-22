"use client";

import { Loader2, Send } from "lucide-react";

export default function ChatComposer({
  value,
  onChange,
  onKeyDown,
  onSend,
  sending,
}: {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
  sending: boolean;
}) {
  return (
    <div className="px-4 py-3 border-t border-slate-200 bg-white">
      <div className="flex items-center gap-2">
        <input
          aria-label="Type a message..."
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
        />
        <button
          aria-label="Send message"
          type="button"
          onClick={onSend}
          disabled={!value.trim() || sending}
          className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}

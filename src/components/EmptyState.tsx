"use client";

import React from "react";
import { Inbox, Plus } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        {icon || <Inbox size={28} className="text-slate-400" />}
      </div>
      <h3 className="text-base font-bold text-slate-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

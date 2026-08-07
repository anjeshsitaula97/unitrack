"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const variantStyles = {
  danger: {
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    buttonBg: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    buttonBg: "bg-amber-600 hover:bg-amber-700",
  },
  info: {
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
    buttonBg: "bg-indigo-600 hover:bg-indigo-700",
  },
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const s = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm animate-slide-up overflow-hidden">
        <div className="p-6">
          <button
            type="button"
            aria-label="Close"
            onClick={onCancel}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X size={16} />
          </button>

          <div className={`size-12 rounded-xl flex items-center justify-center ${s.iconBg} mb-4`}>
            <AlertTriangle size={24} className={s.iconColor} />
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
          <p className="text-sm text-slate-500 mb-6">{message}</p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-2.5 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 ${s.buttonBg}`}
            >
              {loading && (
                <svg className="animate-spin size-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

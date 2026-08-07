"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

interface FormHeaderProps {
  universityId?: string;
  formName: string;
  onBack: () => void;
}

export default function FormHeader({ universityId, formName, onBack }: FormHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        type="button"
        onClick={onBack}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <ArrowLeft size={18} />
      </button>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {universityId ? "Edit University" : "Add University"}
        </h1>
        <p className="text-sm text-slate-400">
          {universityId
            ? `Editing ${formName || "university"}`
            : "Register a new university on the platform"}
        </p>
      </div>
    </div>
  );
}

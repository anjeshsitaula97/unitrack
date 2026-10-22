"use client";

import { Megaphone, Plus } from "lucide-react";

export default function MarketingHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Megaphone size={24} className="text-indigo-600" />
          Marketing Materials
        </h1>
        <p className="text-slate-500 mt-1">
          Manage marketing requests, track progress, and access delivered assets
        </p>
      </div>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
      >
        <Plus size={18} /> New Request
      </button>
    </div>
  );
}

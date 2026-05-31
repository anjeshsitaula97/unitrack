import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-y-4">
        <Loader2 className="animate-spin size-8 text-indigo-600" />
        <p className="text-slate-500">Loading…</p>
      </div>
    </div>
  );
};

"use client";

import { Loader2, Megaphone, Plus } from "lucide-react";
import MarketingRequestRow from "./MarketingRequestRow";
import type { MarketingRequest } from "./types";

export default function MarketingRequestsList({
  requests,
  isLoading,
  onCreate,
  onUpdateStatus,
  onDownload,
}: {
  requests: MarketingRequest[];
  isLoading: boolean;
  onCreate: () => void;
  onUpdateStatus: (requestId: number, status: string) => void;
  onDownload: (url: string, fileName: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto" size={32} />
          <p className="mt-4 text-slate-500">Loading marketing requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center">
          <Megaphone size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No marketing requests found</h3>
          <p className="text-slate-500 mb-6">Create your first marketing request to get started</p>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} /> New Request
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {requests.map((request) => (
            <MarketingRequestRow
              key={request.id}
              request={request}
              onUpdateStatus={onUpdateStatus}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

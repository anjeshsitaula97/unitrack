"use client";

import { CheckCircle, Clock, Megaphone } from "lucide-react";
import type { MarketingRequest } from "./types";

export default function MarketingStats({ requests }: { requests: MarketingRequest[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Total Requests</p>
            <p className="text-2xl font-bold text-slate-900">{requests.length}</p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
            <Megaphone size={24} />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="text-2xl font-bold text-slate-900">
              {requests.filter((r) => r.status === "In Progress").length}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <Clock size={24} />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Completed</p>
            <p className="text-2xl font-bold text-slate-900">
              {requests.filter((r) => r.status === "Completed").length}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg text-green-600">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { safeJson } from "@/lib/fetch-client";

interface PaymentRow {
  id: number;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  date: string;
  description: string | null;
}

interface PaymentSummary {
  payments: PaymentRow[];
  totalPaid: number;
  pendingAmount: number;
}

const statusColors: Record<string, string> = {
  Paid: "text-emerald-600 bg-emerald-50",
  Completed: "text-emerald-600 bg-emerald-50",
  Pending: "text-amber-600 bg-amber-50",
  Failed: "text-red-600 bg-red-50",
  Refunded: "text-purple-600 bg-purple-50",
};

export default function StudentPayments() {
  const [data, setData] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student-portal/payments")
      .then(safeJson)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">My Payments</h1>
        <p className="text-slate-500 text-sm mt-1">Track your payment history</p>
      </div>
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                Total Paid
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                NPR {data?.totalPaid?.toLocaleString() || 0}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                Pending
              </div>
              <div className="text-2xl font-black text-amber-600 mt-1">
                NPR {data?.pendingAmount?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          {data?.payments?.length === 0 ? (
            <div className="py-20 text-center">
              <CreditCard className="mx-auto text-slate-200 mb-3" size={48} />
              <p className="text-slate-500 font-medium">No payments recorded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.payments?.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800">
                      {p.currency} {p.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {p.method} &middot; {new Date(p.date).toLocaleDateString()}
                    </div>
                    {p.description && (
                      <div className="text-xs text-slate-500 mt-1">{p.description}</div>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[p.status] || "text-slate-600 bg-slate-50"}`}
                  >
                    {p.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

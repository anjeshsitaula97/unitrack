"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  BookOpen,
  GraduationCap,
  Loader2,
  Package,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";

interface RecentConsultancy {
  id: number;
  code: string;
  name: string;
  status: string;
  logoUrl: string | null;
  packageName: string | null;
  packageExpiryDate: string | null;
  maxUsers: number | null;
  createdAt: string;
  userCount: number;
}

interface OmStats {
  consultancies: { total: number; active: number; inactive: number; expiringSoon: number };
  totals: { users: number; students: number; universities: number; courses: number };
  recentConsultancies: RecentConsultancy[];
}

function daysToExpiry(value: string | null): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function PackageBadge({ expiry }: { expiry: string | null }) {
  const days = daysToExpiry(expiry);
  if (days === null) return <span className="text-[11px] text-slate-400">No expiry</span>;
  if (days < 0) {
    return (
      <span className="inline-flex items-center text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
        Expired {Math.abs(days)}d ago
      </span>
    );
  }
  if (days <= 30) {
    return (
      <span className="inline-flex items-center text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
        Expires in {days}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
      Active
    </span>
  );
}

function formatDateShort(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function OmDashboard() {
  const [stats, setStats] = useState<OmStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/om/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = stats
    ? [
        {
          label: "Consultancies",
          value: stats.consultancies.total,
          sub: `${stats.consultancies.active} active`,
          icon: <Building2 size={18} />,
          accent: "bg-indigo-50 text-indigo-600",
        },
        {
          label: "Platform Users",
          value: stats.totals.users,
          sub: "across all workspaces",
          icon: <Users size={18} />,
          accent: "bg-sky-50 text-sky-600",
        },
        {
          label: "Students",
          value: stats.totals.students,
          sub: "platform-wide",
          icon: <GraduationCap size={18} />,
          accent: "bg-emerald-50 text-emerald-600",
        },
        {
          label: "Universities",
          value: stats.totals.universities,
          sub: `${stats.totals.courses} courses`,
          icon: <BookOpen size={18} />,
          accent: "bg-amber-50 text-amber-600",
        },
      ]
    : [];

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Platform Overview</h1>
          <p className="text-sm text-slate-400">
            A platform-wide view across every consultancy workspace.
          </p>
        </div>
        <Link href="/om/consultancies" className="btn-primary inline-flex items-center gap-1.5">
          <Plus size={15} /> Manage Consultancies
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      )}

      {!isLoading && error && (
        <div className="card p-8 text-center text-sm text-slate-500">
          Failed to load platform stats. Please refresh.
        </div>
      )}

      {!isLoading && stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`size-10 rounded-xl flex items-center justify-center ${kpi.accent}`}
                  >
                    {kpi.icon}
                  </span>
                  <TrendingUp size={16} className="text-slate-200" />
                </div>
                <p className="text-3xl font-bold text-slate-800 tabular-nums">
                  {kpi.value.toLocaleString()}
                </p>
                <p className="text-sm font-semibold text-slate-600 mt-1">{kpi.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {stats.consultancies.expiringSoon > 0 && (
            <div className="card p-4 mb-6">
              <div className="flex items-center gap-3 text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-100">
                <Package className="flex-shrink-0" size={20} />
                <p className="text-sm">
                  <span className="font-bold">
                    {stats.consultancies.expiringSoon} package
                    {stats.consultancies.expiringSoon === 1 ? "" : "s"}
                  </span>{" "}
                  expiring within the next 30 days. Review the consultancies list to renew.
                </p>
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">Recent Consultancies</h2>
              <Link
                href="/om/consultancies"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-slate-50/60">
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                      Consultancy
                    </th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                      Package
                    </th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                      Expiry
                    </th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                      Users
                    </th>
                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentConsultancies.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center overflow-hidden shrink-0">
                            {c.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={c.logoUrl}
                                alt={c.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 size={16} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {c.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{c.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        {c.packageName ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                            <Package size={13} className="text-slate-400" /> {c.packageName}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-500">
                            {formatDateShort(c.packageExpiryDate)}
                          </span>
                          <PackageBadge expiry={c.packageExpiryDate} />
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                          <Users size={13} className="text-slate-400" />
                          {c.userCount.toLocaleString()}
                          {c.maxUsers != null && (
                            <span className="text-slate-400">/ {c.maxUsers.toLocaleString()}</span>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            c.status === "Active"
                              ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                              : "text-amber-600 bg-amber-50 border-amber-100"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.recentConsultancies.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                        No consultancies yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
            <Link
              href="/om/consultancies"
              className="card p-5 flex items-center gap-3 hover:border-indigo-200 transition-colors"
            >
              <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Consultancies</p>
                <p className="text-xs text-slate-400">Create &amp; manage workspaces</p>
              </div>
            </Link>
            <Link
              href="/settings/backups"
              className="card p-5 flex items-center gap-3 hover:border-indigo-200 transition-colors"
            >
              <div className="size-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Package size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Database Backups</p>
                <p className="text-xs text-slate-400">Export &amp; restore data</p>
              </div>
            </Link>
            <Link
              href="/audit"
              className="card p-5 flex items-center gap-3 hover:border-indigo-200 transition-colors"
            >
              <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Audit Trail</p>
                <p className="text-xs text-slate-400">Track platform activity</p>
              </div>
            </Link>
            <Link
              href="/dashboard"
              className="card p-5 flex items-center gap-3 hover:border-indigo-200 transition-colors"
            >
              <div className="size-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Main App</p>
                <p className="text-xs text-slate-400">Return to the workspace</p>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

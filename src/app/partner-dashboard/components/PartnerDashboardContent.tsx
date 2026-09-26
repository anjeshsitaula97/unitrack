"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Handshake,
  Building2,
  Users,
  FileText,
  BadgeDollarSign,
  Loader2,
  GraduationCap,
  Clock,
} from "lucide-react";
import { safeJson } from "@/lib/fetch-client";

function toNumber(value?: string | number | null): number {
  if (value === undefined || value === null || value === "") return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

function hasCommission(item: {
  commissionType?: string | null;
  commissionValue?: string | number | null;
}): boolean {
  return toNumber(item.commissionValue) > 0 && !!item.commissionType;
}

function commissionLabel(item: {
  commissionType?: string | null;
  commissionValue?: string | number | null;
  commissionCurrency?: string | null;
}): string {
  const value = toNumber(item.commissionValue);
  if (value <= 0) return "-";
  if (item.commissionType === "Flat") {
    const currency = item.commissionCurrency || "USD";
    return `${currency} ${value.toLocaleString()}`;
  }
  return `${value}%`;
}

interface DashboardPartner {
  id: string;
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  _count?: { students?: number };
}

interface DashboardUniversity {
  id: string;
  name: string;
  partnerId?: string | null;
  country?: string | null;
  partner?: { name?: string } | null;
  commissionType?: string | null;
  commissionValue?: string | number | null;
  commissionCurrency?: string | null;
}

interface DashboardStudent {
  id: string;
  name: string;
  email?: string | null;
  partnerId?: string | null;
  partner?: { name?: string } | null;
  interestedCountry?: string | null;
  status?: string | null;
}

export default function PartnerDashboardContent() {
  const [userName, setUserName] = useState("Partner");
  const [_userRole, setUserRole] = useState("B2B Partner");
  const [partners, setPartners] = useState<DashboardPartner[]>([]);
  const [universities, setUniversities] = useState<DashboardUniversity[]>([]);
  const [students, setStudents] = useState<DashboardStudent[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const adDateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    let cancelled = false;

    const normalizeList = <T,>(json: unknown): T[] => {
      if (Array.isArray(json)) return json as T[];
      const data = (json as { data?: unknown })?.data;
      return Array.isArray(data) ? (data as T[]) : [];
    };

    (async () => {
      setLoading(true);
      try {
        const [me, partnerList, univList, studentList, appList] = await Promise.all([
          fetch("/api/auth/me", { credentials: "include" })
            .then(safeJson)
            .catch(() => null),
          fetch("/api/partners")
            .then(safeJson)
            .catch(() => []),
          fetch("/api/universities?status=Active&perPage=500")
            .then(safeJson)
            .catch(() => []),
          fetch("/api/students?perPage=500")
            .then(safeJson)
            .catch(() => []),
          fetch("/api/applications?perPage=1")
            .then(safeJson)
            .catch(() => null),
        ]);
        if (cancelled) return;
        if (me?.name) setUserName(me.name.split(" ")[0]);
        if (me?.role) setUserRole(me.role);
        setPartners(Array.isArray(partnerList) ? partnerList : []);
        setUniversities(normalizeList<DashboardUniversity>(univList));
        setStudents(normalizeList<DashboardStudent>(studentList));
        setTotalApplications(
          typeof appList?.total === "number" ? appList.total : normalizeList(appList).length
        );
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const partnerUniversities = useMemo(
    () => universities.filter((u) => u.partnerId != null),
    [universities]
  );

  const partnerCommissions = useMemo(
    () => partnerUniversities.filter(hasCommission),
    [partnerUniversities]
  );

  const referredStudents = useMemo(
    () => students.filter((s) => s.partner != null || s.partnerId != null),
    [students]
  );

  const totalReferred = useMemo(() => {
    const counted = partners.reduce((sum, p) => sum + (p._count?.students || 0), 0);
    return Math.max(counted, referredStudents.length);
  }, [partners, referredStudents]);

  const topPartners = useMemo(
    () =>
      [...partners]
        .sort((a, b) => (b._count?.students || 0) - (a._count?.students || 0))
        .slice(0, 6),
    [partners]
  );

  const recentPartnerUniversities = useMemo(
    () => [...partnerUniversities].slice(0, 6),
    [partnerUniversities]
  );

  const kpis = [
    {
      id: "partners",
      label: "Total Partners",
      value: partners.length.toLocaleString(),
      icon: <Handshake size={16} />,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      id: "partner-universities",
      label: "Partner Universities",
      value: partnerUniversities.length.toLocaleString(),
      icon: <Building2 size={16} />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      id: "students-referred",
      label: "Students Referred",
      value: totalReferred.toLocaleString(),
      icon: <Users size={16} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "applications",
      label: "Total Applications",
      value: totalApplications.toLocaleString(),
      icon: <FileText size={16} />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      id: "commissions",
      label: "Partner Commissions",
      value: partnerCommissions.length.toLocaleString(),
      icon: <BadgeDollarSign size={16} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-0.5">
            Good morning, {userName}!
          </h1>
          <p className="text-sm text-slate-400">
            B2B Partner overview — partnerships, referrals, and commissions
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span className="flex items-center gap-1.5 font-tabular" suppressHydrationWarning>
            <Clock size={14} /> {timeStr}
          </span>
          <span className="text-slate-300">|</span>
          <span>{adDateStr}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin size-8 text-cyan-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {kpis.map((k) => (
              <div
                key={k.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3"
              >
                <div
                  className={`size-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center flex-shrink-0`}
                >
                  {k.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-bold text-slate-800 dark:text-white font-tabular">
                    {k.value}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium truncate">{k.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-indigo-600" />
                  <h2 className="font-bold text-slate-800 dark:text-white text-sm">
                    Recent Partner Universities
                  </h2>
                </div>
                <Link
                  href="/universities"
                  className="text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {recentPartnerUniversities.length === 0 && (
                  <p className="p-6 text-center text-xs text-slate-400">
                    No partner universities yet.
                  </p>
                )}
                {recentPartnerUniversities.map((u) => (
                  <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {(u.name[0] || "?").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        {u.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {u.country || "Global"} • {u.partner?.name || "Partner"}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      {commissionLabel(u)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Handshake size={16} className="text-cyan-600" />
                  <h2 className="font-bold text-slate-800 dark:text-white text-sm">Top Partners</h2>
                </div>
                <Link
                  href="/partnership"
                  className="text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  View partnerships
                </Link>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {topPartners.length === 0 && (
                  <p className="p-6 text-center text-xs text-slate-400">
                    No partners registered yet.
                  </p>
                )}
                {topPartners.map((p, i) => (
                  <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                    <span className="size-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {p.contactPerson || p.email || "—"}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-lg px-2 py-0.5">
                      <Users size={11} /> {p._count?.students || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-emerald-600" />
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">
                  Recently Referred Students
                </h2>
              </div>
              <Link
                href="/students"
                className="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-700/20 border-b border-slate-100 dark:border-slate-700">
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Student
                    </th>
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Partner
                    </th>
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Interested Country
                    </th>
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {referredStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-xs text-slate-400">
                        No referred students yet.
                      </td>
                    </tr>
                  )}
                  {referredStudents.slice(0, 8).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                          {s.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{s.email || "—"}</p>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {s.partner?.name || "—"}
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {s.interestedCountry || "—"}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                          {s.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

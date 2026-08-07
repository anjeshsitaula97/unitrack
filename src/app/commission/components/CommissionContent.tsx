"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  BadgeDollarSign,
  Percent,
  Handshake,
  Scale,
  Search,
  Loader2,
  GraduationCap,
  Plus,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { COUNTRIES } from "@/lib/data/countries";
import { getCountryFlag } from "@/lib/country-flags";

interface Univ {
  id: string;
  name: string;
  country: string;
  color?: string;
  logo?: string;
  status: string;
  type?: string;
  founded?: string | number | null;
  partnerId?: string | null;
  partner?: { id: string; name: string } | null;
  partnershipAmount?: string | number | null;
  commissionType?: string | null;
  commissionValue?: string | number | null;
  commissionCurrency?: string | null;
}

interface Course {
  id: string;
  name: string;
  universityId: string;
  university?: string;
  universityLogo?: string | null;
  status?: string;
  courseCode?: string | null;
  commissionType?: string | null;
  commissionValue?: string | number | null;
  commissionCurrency?: string | null;
}

interface CommissionRow {
  key: string;
  kind: "university" | "course";
  univId: string;
  courseId: string | null;
  name: string;
  subtitle: string;
  color?: string;
  logo?: string;
  commissionType?: string | null;
  commissionValue?: string | number | null;
  commissionCurrency?: string | null;
  partnershipAmount?: string | number | null;
  country: string;
}

interface ModalInitial {
  kind: "university" | "course";
  univId: string;
  courseId: string | null;
  commissionType?: string | null;
  commissionValue?: string | number | null;
  commissionCurrency?: string | null;
  partnershipAmount?: string | number | null;
}

function currencySymbol(country: string): string {
  return COUNTRIES.find((c) => c.name === country)?.currencySymbol || "$";
}

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

async function fetchAll<T>(baseUrl: string): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let total = Infinity;
  while (all.length < total) {
    const separator = baseUrl.includes("?") ? "&" : "?";
    const res = await fetch(`${baseUrl}${separator}page=${page}&perPage=100`);
    if (!res.ok) throw new Error("Failed to fetch data");
    const json = await res.json();
    const list = (Array.isArray(json) ? json : json.data || []) as T[];
    total = typeof json.total === "number" ? json.total : list.length;
    all.push(...list);
    if (list.length === 0 || all.length >= total) break;
    page++;
  }
  return all;
}

export default function CommissionContent() {
  const [universities, setUniversities] = useState<Univ[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<ModalInitial | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [univList, courseList] = await Promise.all([
          fetchAll<Univ>("/api/universities?status=Active"),
          fetchAll<Course>("/api/courses?status=Active"),
        ]);
        if (!cancelled) {
          setUniversities(univList);
          setCourses(courseList);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load commission data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const commissioned = useMemo(() => universities.filter(hasCommission), [universities]);
  const commissionedCourses = useMemo(() => courses.filter(hasCommission), [courses]);
  const allCommissioned = useMemo(
    () => [
      ...universities.filter(hasCommission).map((u) => ({
        type: u.commissionType,
        value: u.commissionValue,
        currency: u.commissionCurrency,
      })),
      ...courses.filter(hasCommission).map((c) => ({
        type: c.commissionType,
        value: c.commissionValue,
        currency: c.commissionCurrency,
      })),
    ],
    [universities, courses]
  );

  const _percentageCount = useMemo(
    () => allCommissioned.filter((c) => c.type === "Percentage").length,
    [allCommissioned]
  );

  const totalFlatValue = useMemo(
    () =>
      allCommissioned
        .filter((c) => c.type === "Flat")
        .reduce((sum, c) => sum + toNumber(c.value), 0),
    [allCommissioned]
  );

  const rows: CommissionRow[] = useMemo(() => {
    const univRows: CommissionRow[] = commissioned.map((u) => ({
      key: `u-${u.id}`,
      kind: "university",
      univId: u.id,
      courseId: null,
      name: u.name,
      subtitle: u.partner?.name ? `Partner: ${u.partner.name}` : "Direct / No partner",
      color: u.color,
      logo: u.logo,
      commissionType: u.commissionType,
      commissionValue: u.commissionValue,
      commissionCurrency: u.commissionCurrency,
      partnershipAmount: u.partnershipAmount,
      country: u.country,
    }));
    const courseRows: CommissionRow[] = commissionedCourses.map((c) => ({
      key: `c-${c.id}`,
      kind: "course",
      univId: c.universityId,
      courseId: c.id,
      name: c.name,
      subtitle: c.courseCode
        ? `${c.university || "Unknown"} • ${c.courseCode}`
        : c.university || "Unknown",
      commissionType: c.commissionType,
      commissionValue: c.commissionValue,
      commissionCurrency: c.commissionCurrency,
      country: "",
    }));
    return [...univRows, ...courseRows];
  }, [commissioned, commissionedCourses]);

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        (r.commissionCurrency || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  function openAdd() {
    setModalInitial(null);
    setModalOpen(true);
  }

  function openEdit(row: CommissionRow) {
    setModalInitial({
      kind: row.kind,
      univId: row.univId,
      courseId: row.courseId,
      commissionType: row.commissionType,
      commissionValue: row.commissionValue,
      commissionCurrency: row.commissionCurrency,
      partnershipAmount: row.partnershipAmount,
    });
    setModalOpen(true);
  }

  async function handleSave(
    univId: string,
    courseId: string,
    commissionType: string,
    commissionValue: string,
    commissionCurrency: string,
    partnershipAmount: string
  ) {
    if (!univId) return;
    setSaving(true);
    try {
      const type = commissionType === "None" ? "Percentage" : commissionType;
      const value =
        commissionType === "None" || commissionValue.trim() === ""
          ? null
          : parseFloat(commissionValue);
      const currency =
        commissionType === "None" || value === null ? null : commissionCurrency.trim() || null;

      if (courseId) {
        const course = courses.find((c) => c.id === courseId);
        if (!course) throw new Error("Course not found");
        const body = {
          ...course,
          commissionType: type,
          commissionValue: value,
          commissionCurrency: currency,
        };
        const res = await fetch(`/api/courses/${courseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update course commission");
        const updated = await res.json();
        setCourses((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
        toast.success(`Commission saved for ${course.name}`);
      } else {
        const univ = universities.find((u) => u.id === univId);
        if (!univ) throw new Error("University not found");
        const res = await fetch(`/api/universities/${univId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: univ.name,
            country: univ.country,
            type: univ.type || "Public",
            status: univ.status || "Active",
            partnerId: univ.partnerId || null,
            establishedYear: univ.founded,
            partnershipAmount:
              partnershipAmount.trim() === "" ? null : parseFloat(partnershipAmount),
            commissionType: type,
            commissionValue: value,
            commissionCurrency: currency,
          }),
        });
        if (!res.ok) throw new Error("Failed to update university commission");
        const updated = await res.json();
        setUniversities((prev) =>
          prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
        );
        toast.success(`Commission saved for ${univ.name}`);
      }
      setModalOpen(false);
      setModalInitial(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save commission");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin size-8 text-indigo-600" />
      </div>
    );
  }

  const stats = [
    {
      id: "cm-configured",
      label: "Commissions Configured",
      value: allCommissioned.length.toLocaleString(),
      icon: <BadgeDollarSign size={14} />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      id: "cm-universities",
      label: "Universities",
      value: commissioned.length.toLocaleString(),
      icon: <Building2 size={14} />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      id: "cm-courses",
      label: "Courses",
      value: commissionedCourses.length.toLocaleString(),
      icon: <GraduationCap size={14} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: "cm-flat",
      label: "Flat Commission Value",
      value: `$${totalFlatValue.toLocaleString()}`,
      icon: <Scale size={14} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const commissionBadge = (type?: string | null) => (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
        type === "Percentage" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
      }`}
    >
      {type || "Percentage"}
    </span>
  );

  const levelBadge = (kind: "university" | "course") => (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
        kind === "university" ? "bg-violet-50 text-violet-600" : "bg-indigo-50 text-indigo-600"
      }`}
    >
      {kind === "university" ? <Building2 size={11} /> : <GraduationCap size={11} />}
      {kind}
    </span>
  );

  const amountDisplay = (row: CommissionRow) => {
    const type = row.commissionType;
    const value = toNumber(row.commissionValue);
    if (value <= 0) return "-";
    if (type === "Flat") {
      const currency = row.commissionCurrency;
      const sym = currency || (row.country ? currencySymbol(row.country) : "$");
      return `${sym} ${value.toLocaleString()}`;
    }
    return `${value}%`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Commission</h1>
          <p className="text-sm text-slate-400">
            Configure commission structures per university and per course
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/partnership" className="btn-secondary">
            <Handshake size={15} />
            View Partnerships
          </Link>
          <button
            type="button"
            onClick={openAdd}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={15} />
            Add Commission
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.id} className="card px-4 py-3 flex items-center gap-3">
            <div
              className={`size-8 rounded-lg ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0`}
            >
              {s.icon}
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">{s.label}</div>
              <div className={`text-lg font-bold ${s.color} font-tabular`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative flex-1 min-w-[260px] max-w-sm mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search universities, courses, partners, currencies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-slate-100 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Level
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  University / Course
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Commission Type
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Commission Value
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Currency
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-6">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 text-sm italic">
                    {rows.length === 0
                      ? "No commissions configured yet. Click “Add Commission” to set one up for a university or course."
                      : "No commissions match your search."}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4">{levelBadge(row.kind)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold overflow-hidden relative flex-shrink-0"
                          style={{
                            backgroundColor:
                              row.kind === "university" ? row.color || "#7c3aed" : "#6366f1",
                          }}
                        >
                          {row.logo ? (
                            <Image
                              src={row.logo}
                              alt=""
                              fill
                              className="object-contain"
                              sizes="32px"
                            />
                          ) : (
                            row.name[0] || "?"
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{row.name}</p>
                          <p className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-bold">
                            {row.kind === "university" && getCountryFlag(row.country) && (
                              <Image
                                src={getCountryFlag(row.country)}
                                alt=""
                                width={24}
                                height={24}
                                className="w-4 h-3 rounded-sm object-cover"
                              />
                            )}
                            {row.subtitle}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">{commissionBadge(row.commissionType)}</td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-black text-slate-700 font-tabular">
                        {amountDisplay(row)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {row.commissionCurrency || "-"}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1d4ed8] hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info box */}
      <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-5 mt-6">
        <div className="size-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
          <Building2 size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-900 mb-1">How commissions work</h4>
          <p className="text-xs text-indigo-700 leading-relaxed">
            Commission structures (percentage or flat) are configured per university and per course.
            A course-level commission overrides the university default. When a student enrolled
            through a partner successfully enrolls, the configured commission is used to calculate
            agent payouts.
          </p>
        </div>
      </div>

      {modalOpen && (
        <CommissionModal
          universities={universities}
          courses={courses}
          initial={modalInitial}
          saving={saving}
          onClose={() => {
            if (!saving) setModalOpen(false);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function CommissionModal({
  universities,
  courses,
  initial,
  saving,
  onClose,
  onSave,
}: {
  universities: Univ[];
  courses: Course[];
  initial: ModalInitial | null;
  saving: boolean;
  onClose: () => void;
  onSave: (
    univId: string,
    courseId: string,
    commissionType: string,
    commissionValue: string,
    commissionCurrency: string,
    partnershipAmount: string
  ) => Promise<void>;
}) {
  const initialNone =
    !initial ||
    !toNumber(initial.commissionValue) ||
    !initial.commissionType ||
    initial.commissionValue === null;
  const [univId, setUnivId] = useState(initial?.univId || "");
  const [courseId, setCourseId] = useState(initial?.courseId || "");
  const [commissionType, setCommissionType] = useState(
    initial && !initialNone ? (initial.commissionType === "Flat" ? "Flat" : "Percentage") : "None"
  );
  const [commissionValue, setCommissionValue] = useState(
    initial?.commissionValue ? String(initial.commissionValue) : ""
  );
  const [commissionCurrency, setCommissionCurrency] = useState(initial?.commissionCurrency || "");
  const [partnershipAmount, setPartnershipAmount] = useState(
    initial?.partnershipAmount ? String(initial.partnershipAmount) : ""
  );

  const _selectedUniv = universities.find((u) => u.id === univId);
  const univCourses = useMemo(
    () => courses.filter((c) => c.universityId === univId),
    [courses, univId]
  );
  const isCourseLevel = !!courseId;

  function handleUnivChange(id: string) {
    setUnivId(id);
    setCourseId("");
    if (id && !commissionCurrency) {
      const u = universities.find((x) => x.id === id);
      if (u?.commissionCurrency) setCommissionCurrency(u.commissionCurrency);
    }
  }

  function handleTypeChange(opt: "Percentage" | "Flat" | "None") {
    setCommissionType(opt);
    if (opt === "None") {
      setCommissionValue("");
      setCommissionCurrency("");
    }
  }

  const valueInvalid =
    !univId ||
    (commissionType !== "None" &&
      (commissionValue.trim() === "" || parseFloat(commissionValue) <= 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="size-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 text-indigo-600">
            <BadgeDollarSign size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {initial ? "Edit Commission" : "Add Commission"}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Select a university and optional course
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            University <span className="text-red-500">*</span>
          </label>
          <select
            value={univId}
            onChange={(e) => handleUnivChange(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
          >
            <option value="">Select a university...</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.country || "Global"}
              </option>
            ))}
          </select>
        </div>

        {univId && (
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Course <span className="text-slate-300 font-medium normal-case">(optional)</span>
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
            >
              <option value="">University-level commission (no course)</option>
              {univCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {univCourses.length === 0 && (
              <p className="mt-1 text-[10px] text-slate-400 font-medium">
                No courses found for this university.
              </p>
            )}
          </div>
        )}

        {univId && !isCourseLevel && (
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Partnership Amount
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 5000 (optional)"
              value={partnershipAmount}
              onChange={(e) => setPartnershipAmount(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
        )}

        {univId && (
          <>
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Commission Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Percentage", "Flat", "None"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleTypeChange(opt)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      commissionType === opt
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {opt === "Percentage" ? (
                      <span className="inline-flex items-center gap-1">
                        <Percent size={12} /> {opt}
                      </span>
                    ) : opt === "Flat" ? (
                      <span className="inline-flex items-center gap-1">
                        <Scale size={12} /> {opt}
                      </span>
                    ) : (
                      opt
                    )}
                  </button>
                ))}
              </div>
            </div>

            {commissionType !== "None" && (
              <>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Commission Value
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder={
                        commissionType === "Percentage" ? "e.g. 10 (%)" : "e.g. 500 (flat)"
                      }
                      value={commissionValue}
                      onChange={(e) => setCommissionValue(e.target.value)}
                      className="w-full pl-4 pr-12 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      {commissionType === "Percentage" ? "%" : "amt"}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Currency
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. USD"
                    value={commissionCurrency}
                    onChange={(e) => setCommissionCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium uppercase"
                  />
                </div>
              </>
            )}
          </>
        )}

        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onSave(
                univId,
                courseId,
                commissionType,
                commissionValue,
                commissionCurrency,
                partnershipAmount
              )
            }
            disabled={saving || valueInvalid}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Commission
          </button>
        </div>
      </div>
    </div>
  );
}

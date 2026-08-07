"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Handshake,
  Users,
  DollarSign,
  Plus,
  X,
  Mail,
  Phone,
  Globe,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { COUNTRIES } from "@/lib/data/countries";
import { getCountryFlag } from "@/lib/country-flags";

interface Partner {
  id: string;
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  description?: string | null;
  countries?: string | null;
  _count?: { students: number };
}

interface Univ {
  id: string;
  name: string;
  country: string;
  color?: string;
  logo?: string;
  status: string;
  partnerId?: string | null;
  partner?: { id: string; name: string } | null;
  partnershipAmount?: string | number | null;
}

type Tab = "partnerships" | "partners";

function parseCountries(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return typeof raw === "string" && raw.trim() ? [raw] : [];
  }
}

function currencySymbol(country: string): string {
  return COUNTRIES.find((c) => c.name === country)?.currencySymbol || "$";
}

function formatAmount(value?: string | number | null): string {
  const num = Number(value);
  if (!value || isNaN(num) || num <= 0) return "-";
  return num.toLocaleString();
}

export default function PartnershipContent() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [universities, setUniversities] = useState<Univ[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("partnerships");
  const [search, setSearch] = useState("");
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    countries: [] as string[],
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [partnersRes, univRes] = await Promise.all([
          fetch("/api/partners"),
          fetch("/api/universities?perPage=500&status=Active"),
        ]);
        if (partnersRes.ok) {
          const p = await partnersRes.json();
          if (!cancelled) setPartners(Array.isArray(p) ? p : []);
        }
        if (univRes.ok) {
          const u = await univRes.json();
          const list = Array.isArray(u) ? u : u.data || [];
          if (!cancelled) setUniversities(list);
        }
      } catch {
        toast.error("Failed to load partnership data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddPartner = async () => {
    if (!newPartner.name) {
      toast.error("Partner name is required");
      return;
    }
    if (newPartner.countries.length === 0) {
      toast.error("Select at least one country");
      return;
    }
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPartner),
      });
      const data = await res.json();
      if (res.ok) {
        setPartners([data, ...partners]);
        setNewPartner({
          name: "",
          contactPerson: "",
          email: "",
          phone: "",
          address: "",
          countries: [],
        });
        setShowAddPartner(false);
        toast.success("Partner added successfully");
      } else {
        toast.error(data.error || "Failed to add partner");
      }
    } catch {
      toast.error("Error adding partner");
    }
  };

  const partneredUniversities = useMemo(
    () => universities.filter((u) => u.partnerId),
    [universities]
  );

  const totalPartnershipAmount = useMemo(
    () => partneredUniversities.reduce((sum, u) => sum + (Number(u.partnershipAmount) || 0), 0),
    [partneredUniversities]
  );

  const partnerStudentCount = useMemo(
    () => partners.reduce((sum, p) => sum + (p._count?.students || 0), 0),
    [partners]
  );

  const universityCountByPartner = useMemo(() => {
    const map: Record<string, number> = {};
    partneredUniversities.forEach((u) => {
      if (u.partnerId) map[u.partnerId] = (map[u.partnerId] || 0) + 1;
    });
    return map;
  }, [partneredUniversities]);

  const filteredPartnerships = useMemo(() => {
    if (!search) return partneredUniversities;
    const q = search.toLowerCase();
    return partneredUniversities.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q) ||
        u.partner?.name?.toLowerCase().includes(q)
    );
  }, [partneredUniversities, search]);

  const filteredPartners = useMemo(() => {
    if (!search) return partners;
    const q = search.toLowerCase();
    return partners.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.contactPerson?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q)
    );
  }, [partners, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin size-8 text-indigo-600" />
      </div>
    );
  }

  const stats = [
    {
      id: "pt-total-partners",
      label: "Total Partners",
      value: partners.length.toLocaleString(),
      icon: <Handshake size={14} />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      id: "pt-partnered",
      label: "Partnered Universities",
      value: partneredUniversities.length.toLocaleString(),
      icon: <Building2 size={14} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "pt-students",
      label: "Students via Partners",
      value: partnerStudentCount.toLocaleString(),
      icon: <Users size={14} />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      id: "pt-amount",
      label: "Partnership Value",
      value: `$${totalPartnershipAmount.toLocaleString()}`,
      icon: <DollarSign size={14} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Partnership</h1>
          <p className="text-sm text-slate-400">
            {partners.length.toLocaleString()} partner companies ·{" "}
            {partneredUniversities.length.toLocaleString()} partnered universities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddPartner(!showAddPartner)}
            className="btn-primary"
          >
            <Plus size={15} />
            {showAddPartner ? "Cancel" : "Add Partner"}
          </button>
        </div>
      </div>

      {showAddPartner && (
        <div className="card p-6 border-2 border-indigo-100 animate-slide-down mb-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Register New Partner Company</h3>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowAddPartner(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div>
              <label
                htmlFor="partnership-partner-name"
                className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
              >
                Partner Name
              </label>
              <input
                id="partnership-partner-name"
                type="text"
                value={newPartner.name}
                onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                placeholder="e.g. UniPath International"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="partnership-partner-contact"
                className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
              >
                Contact Person
              </label>
              <input
                id="partnership-partner-contact"
                type="text"
                value={newPartner.contactPerson}
                onChange={(e) => setNewPartner({ ...newPartner, contactPerson: e.target.value })}
                placeholder="e.g. John Doe"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="partnership-partner-email"
                className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
              >
                Email Address
              </label>
              <input
                id="partnership-partner-email"
                type="email"
                value={newPartner.email}
                onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                placeholder="partner@example.com"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="partnership-partner-phone"
                className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
              >
                Phone Number
              </label>
              <input
                id="partnership-partner-phone"
                type="tel"
                value={newPartner.phone}
                onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                placeholder="+977 9800 000 000"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="partnership-partner-address"
                className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
              >
                Office Address
              </label>
              <input
                id="partnership-partner-address"
                type="text"
                value={newPartner.address}
                onChange={(e) => setNewPartner({ ...newPartner, address: e.target.value })}
                placeholder="Kathmandu, Nepal"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="partnership-partner-countries"
                className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
              >
                Countries
              </label>
              {newPartner.countries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {newPartner.countries.map((c) => (
                    <span
                      key={c}
                      className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold inline-flex items-center gap-1"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() =>
                          setNewPartner({
                            ...newPartner,
                            countries: newPartner.countries.filter((x) => x !== c),
                          })
                        }
                        className="hover:text-red-500"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <select
                id="partnership-partner-countries"
                value=""
                onChange={(e) => {
                  if (e.target.value && !newPartner.countries.includes(e.target.value))
                    setNewPartner({
                      ...newPartner,
                      countries: [...newPartner.countries, e.target.value],
                    });
                }}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
              >
                <option value="">Select a country...</option>
                {COUNTRIES.filter((c) => !newPartner.countries.includes(c.name)).map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddPartner(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="button" onClick={handleAddPartner} className="btn-primary">
              Create Partner
            </button>
          </div>
        </div>
      )}

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

      {/* Search + Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setTab("partnerships")}
            className={`px-4 py-1.5 rounded-md text-xs transition-all ${
              tab === "partnerships"
                ? "font-bold bg-white shadow-sm text-slate-800"
                : "font-semibold text-slate-500 hover:bg-white/50"
            }`}
          >
            Partnerships
          </button>
          <button
            type="button"
            onClick={() => setTab("partners")}
            className={`px-4 py-1.5 rounded-md text-xs transition-all ${
              tab === "partners"
                ? "font-bold bg-white shadow-sm text-slate-800"
                : "font-semibold text-slate-500 hover:bg-white/50"
            }`}
          >
            Partners
          </button>
        </div>
        <div className="relative flex-1 min-w-[260px] max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              tab === "partnerships" ? "Search universities or partners..." : "Search partners..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-100 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {tab === "partnerships" ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    University
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Partner
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Partnership Amount
                  </th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-6">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPartnerships.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 text-sm italic">
                      No university partnerships found.
                    </td>
                  </tr>
                ) : (
                  filteredPartnerships.map((univ) => (
                    <tr key={univ.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold overflow-hidden relative"
                            style={{ backgroundColor: univ.color || "#6366f1" }}
                          >
                            {univ.logo ? (
                              <Image
                                src={univ.logo}
                                alt=""
                                fill
                                className="object-contain"
                                sizes="32px"
                              />
                            ) : (
                              univ.name[0] || "U"
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{univ.name}</p>
                            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-bold">
                              {getCountryFlag(univ.country) && (
                                <Image
                                  src={getCountryFlag(univ.country)}
                                  alt=""
                                  width={24}
                                  height={24}
                                  className="w-4 h-3 rounded-sm object-cover"
                                />
                              )}
                              {univ.country || "Global"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                          <Handshake size={13} />
                          {univ.partner?.name || "Direct / None"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-sm font-black text-slate-700 font-tabular">
                          {univ.partnershipAmount
                            ? `${currencySymbol(univ.country)} ${formatAmount(univ.partnershipAmount)}`
                            : "-"}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <Link
                          href={`/universities/${univ.id}`}
                          className="text-xs font-bold text-[#1d4ed8] hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPartners.length === 0 ? (
            <div className="col-span-full card p-12 text-center text-slate-400 text-sm italic">
              No partner companies found.
            </div>
          ) : (
            filteredPartners.map((partner) => {
              const countries = parseCountries(partner.countries);
              const univCount = universityCountByPartner[partner.id] || 0;
              return (
                <div
                  key={partner.id}
                  className="card p-5 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Handshake size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 truncate">{partner.name}</h3>
                      {partner.contactPerson && (
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                          {partner.contactPerson}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-4 text-xs text-slate-500">
                    {partner.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{partner.email}</span>
                      </div>
                    )}
                    {partner.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{partner.phone}</span>
                      </div>
                    )}
                    {countries.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Globe size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{countries.join(", ")}</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                    <div className="text-center">
                      <p className="text-sm font-black text-slate-700 font-tabular">{univCount}</p>
                      <p className="text-[10px] text-slate-400">Universities</p>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <p className="text-sm font-black text-slate-700 font-tabular">
                        {partner._count?.students || 0}
                      </p>
                      <p className="text-[10px] text-slate-400">Students</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-indigo-600 font-tabular">
                        {countries.length}
                      </p>
                      <p className="text-[10px] text-slate-400">Countries</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

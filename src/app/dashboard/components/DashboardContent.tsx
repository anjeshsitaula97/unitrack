"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Settings2,
  RotateCcw,
  GripVertical,
  Loader2,
  Plus,
  X,
  Building2,
  BookOpen,
  Users,
  Zap,
  TrendingUp,
  UserCheck,
  FileText,
  ClipboardList,
  BarChart3,
  PieChart,
  Activity,
  Table2,
  Clock,
} from "lucide-react";
import { safeJson } from "@/lib/fetch-client";
import { toast } from "sonner";
import { ADToBS } from "bikram-sambat-js";
import { AVAILABLE_KPIS } from "./kpi-data";
import KPIBentoGrid from "./KPIBentoGrid";
import RecentActivityFeed from "./RecentActivityFeed";
import RecentUniversitiesTable from "./RecentUniversitiesTable";

const CoursesPerUniversityChart = dynamic(() => import("./CoursesPerUniversityChart"), {
  ssr: false,
});
const EnrollmentTrendChart = dynamic(() => import("./EnrollmentTrendChart"), { ssr: false });
const FacultyDistributionChart = dynamic(() => import("./FacultyDistributionChart"), {
  ssr: false,
});

const defaultWidgets = [
  { id: "kpi", label: "KPI Grid", visible: true, component: "kpi" },
  {
    id: "courses-chart",
    label: "Courses Per University",
    visible: true,
    component: "courses-chart",
  },
  {
    id: "enrollment-chart",
    label: "Enrollment Trend",
    visible: true,
    component: "enrollment-chart",
  },
  { id: "faculty-chart", label: "Faculty Distribution", visible: true, component: "faculty-chart" },
  { id: "activity", label: "Recent Activity", visible: true, component: "activity" },
  { id: "universities", label: "Recent Universities", visible: true, component: "universities" },
];

const DEFAULT_KPIS = [
  "kpi-total-universities",
  "kpi-total-courses",
  "kpi-enrolled-students",
  "kpi-active-courses",
  "kpi-growth",
];

const WIDGET_LIBRARY = [
  {
    id: "courses-chart",
    label: "Courses Per University",
    icon: BarChart3,
    description: "Bar chart of top 8 universities by course count",
    category: "Charts",
  },
  {
    id: "enrollment-chart",
    label: "Enrollment Trend",
    icon: TrendingUp,
    description: "Area chart showing courses added over time",
    category: "Charts",
  },
  {
    id: "faculty-chart",
    label: "Faculty Distribution",
    icon: PieChart,
    description: "Donut chart of course distribution by faculty",
    category: "Charts",
  },
  {
    id: "activity",
    label: "Recent Activity",
    icon: Activity,
    description: "Real-time platform activity feed",
    category: "Tables",
  },
  {
    id: "universities",
    label: "Recent Universities",
    icon: Table2,
    description: "Table of recently listed universities",
    category: "Tables",
  },
];

const KPI_ICON_MAP: Record<string, React.ReactNode> = {
  "kpi-total-universities": <Building2 size={16} />,
  "kpi-total-courses": <BookOpen size={16} />,
  "kpi-enrolled-students": <Users size={16} />,
  "kpi-active-courses": <Zap size={16} />,
  "kpi-growth": <TrendingUp size={16} />,
  "kpi-total-leads": <UserCheck size={16} />,
  "kpi-total-students": <Users size={16} />,
  "kpi-total-applications": <FileText size={16} />,
  "kpi-total-tasks": <ClipboardList size={16} />,
};

const NEPALI_MONTHS = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangshir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

function formatBSDate(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${NEPALI_MONTHS[month - 1] || month} ${day}, ${year}`;
}

function widgetSize(widget: { component: string }) {
  if (widget.component === "kpi") return "col-span-full";
  if (widget.component === "universities") return "lg:col-span-2 xl:col-span-2";
  return "lg:col-span-1";
}

export default function DashboardContent() {
  const [_userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("Admin");
  const [widgets, setWidgets] = useState(defaultWidgets);
  const [kpis, setKpis] = useState<string[]>(DEFAULT_KPIS);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [showBSDate, setShowBSDate] = useState(false);
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
  const bsDateStr = (() => {
    try {
      const ad = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      return formatBSDate(ADToBS(ad));
    } catch {
      return "";
    }
  })();

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/auth/me", { signal: ac.signal, credentials: "include" })
      .then(safeJson)
      .then((data) => {
        if (data.name) setUserName(data.name.split(" ")[0]);
        if (data.role) setUserRole(data.role);
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  useEffect(() => {
    fetch("/api/dashboard-layout")
      .then(safeJson)
      .then((data) => {
        if (!data?.layout) return;
        if (Array.isArray(data.layout)) {
          const savedIds = data.layout.map((w: { id: string }) => w.id);
          const merged: typeof defaultWidgets = savedIds.flatMap((id: string) => {
            const saved = data.layout.find((w: { id: string }) => w.id === id);
            const def = defaultWidgets.find((w) => w.id === id);
            const result = saved && def ? { ...def, ...saved } : def;
            return result ? [result] : [];
          }) as typeof defaultWidgets;
          const missing = defaultWidgets.filter((w) => !savedIds.includes(w.id));
          setWidgets([...merged, ...missing]);
        } else if (typeof data.layout === "object" && data.layout !== null) {
          const d = data.layout as Record<string, unknown>;
          const savedWidgets = (d.widgets ?? []) as { id: string; visible: boolean }[];
          if (savedWidgets.length > 0) {
            const savedIds = savedWidgets.map((w) => w.id);
            const merged: typeof defaultWidgets = savedIds.flatMap((id: string) => {
              const saved = savedWidgets.find((w) => w.id === id);
              const def = defaultWidgets.find((w) => w.id === id);
              const result = saved && def ? { ...def, ...saved } : def;
              return result ? [result] : [];
            }) as typeof defaultWidgets;
            const missing = defaultWidgets.filter((w) => !savedIds.includes(w.id));
            setWidgets([...merged, ...missing]);
          }
          const savedKpis = d.kpis;
          if (Array.isArray(savedKpis)) setKpis(savedKpis as string[]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/settings/localization")
      .then(safeJson)
      .then((data) => {
        if (data && !data.error && typeof data.showBSDate === "boolean") {
          setShowBSDate(data.showBSDate);
        }
      })
      .catch(() => {});
  }, []);

  const saveLayout = useCallback(
    async (newWidgets: typeof widgets, newKpis?: string[]) => {
      setSaving(true);
      try {
        const kpisToSave = newKpis ?? kpis;
        await fetch("/api/dashboard-layout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            layout: {
              widgets: newWidgets.map((w) => ({ id: w.id, visible: w.visible })),
              kpis: kpisToSave,
            },
          }),
        });
      } catch {
        toast.error("Failed to save layout");
      } finally {
        setSaving(false);
      }
    },
    [kpis]
  );

  const toggleBSDate = useCallback(async () => {
    const next = !showBSDate;
    setShowBSDate(next);
    try {
      const res = await fetch("/api/settings/localization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showBSDate: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setShowBSDate(!next);
    }
  }, [showBSDate]);

  const toggleWidget = (id: string) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
    setWidgets(updated);
    saveLayout(updated);
  };

  const addWidget = (id: string) => {
    const existing = widgets.find((w) => w.id === id);
    if (existing) {
      if (!existing.visible) {
        const updated = widgets.map((w) => (w.id === id ? { ...w, visible: true } : w));
        setWidgets(updated);
        saveLayout(updated);
        toast.success("Widget added");
      } else {
        toast.info("Widget already visible");
      }
    } else {
      const lib = WIDGET_LIBRARY.find((w) => w.id === id);
      if (lib) {
        const updated = [
          ...widgets,
          { id: lib.id, label: lib.label, visible: true, component: lib.id },
        ];
        setWidgets(updated);
        saveLayout(updated);
        toast.success("Widget added");
      }
    }
    setShowAddWidget(false);
  };

  const toggleKpi = (id: string) => {
    const next = kpis.includes(id) ? kpis.filter((k) => k !== id) : [...kpis, id];
    setKpis(next);
    saveLayout(widgets, next);
  };

  const handleKpiChange = (nextKpis: string[]) => {
    setKpis(nextKpis);
    saveLayout(widgets, nextKpis);
  };

  const resetLayout = () => {
    setWidgets(defaultWidgets);
    setKpis(DEFAULT_KPIS);
    setShowBSDate(false);
    saveLayout(defaultWidgets, DEFAULT_KPIS);
    toast.success("Layout reset to default");
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move";
    setDragId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!dragId || dragId === id) return;
    const visible = widgets.filter((w) => w.visible);
    const fromIdx = visible.findIndex((w) => w.id === dragId);
    const toIdx = visible.findIndex((w) => w.id === id);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...visible];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const hidden = widgets.filter((w) => !w.visible);
    setWidgets([...reordered, ...hidden]);
    setDragId(id);
  };

  const handleDragEnd = () => {
    setDragId(null);
    saveLayout(widgets);
  };

  const visibleWidgets = widgets.filter((w) => w.visible);
  const activeKpis = kpis.filter((id) => AVAILABLE_KPIS.some((k) => k.id === id));

  const renderWidget = (widget: (typeof widgets)[0]) => {
    switch (widget.component) {
      case "kpi":
        return <KPIBentoGrid visibleKpis={activeKpis} onKpiChange={handleKpiChange} />;
      case "courses-chart":
        return <CoursesPerUniversityChart />;
      case "enrollment-chart":
        return <EnrollmentTrendChart />;
      case "faculty-chart":
        return <FacultyDistributionChart />;
      case "activity":
        return <RecentActivityFeed />;
      case "universities":
        return <RecentUniversitiesTable />;
      default:
        return null;
    }
  };

  const availableKpis = AVAILABLE_KPIS.filter((k) => !kpis.includes(k.id));
  const availableWidgets = WIDGET_LIBRARY.filter((w) => {
    const existing = widgets.find((w2) => w2.id === w.id);
    return !existing || !existing.visible;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-0.5">
            Good morning, {userRole}!
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-1.5 font-tabular" suppressHydrationWarning>
              <Clock size={14} /> {timeStr}
            </span>
            <span className="text-slate-300">|</span>
            <span>{adDateStr} AD</span>
            {showBSDate && bsDateStr && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-amber-600 font-medium">{bsDateStr} B.S.</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saving && <Loader2 className="animate-spin text-slate-400" size={16} />}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddWidget(!showAddWidget)}
              className="px-3 py-2 bg-indigo-600 border border-indigo-600 rounded-xl text-xs font-semibold text-white hover:bg-indigo-700 flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Widget
            </button>
            {showAddWidget && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-4 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-slate-800">Add Widget</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddWidget(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                  >
                    <X size={14} />
                  </button>
                </div>

                {availableKpis.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                      KPI Cards
                    </h4>
                    <div className="space-y-1">
                      {availableKpis.map((k) => (
                        <button
                          type="button"
                          key={k.id}
                          onClick={() => {
                            toggleKpi(k.id);
                            setShowAddWidget(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition-colors group"
                        >
                          <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                            {KPI_ICON_MAP[k.id] || k.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700">
                              {k.title}
                            </p>
                            <p className="text-[11px] text-slate-400">{k.category}</p>
                          </div>
                          <Plus
                            size={14}
                            className="text-slate-300 group-hover:text-indigo-500 transition-colors flex-shrink-0"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {availableWidgets.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                      Widgets
                    </h4>
                    <div className="space-y-1">
                      {availableWidgets.map((w) => (
                        <button
                          type="button"
                          key={w.id}
                          onClick={() => addWidget(w.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group"
                        >
                          <div className="size-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 flex-shrink-0">
                            <w.icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700">
                              {w.label}
                            </p>
                            <p className="text-[11px] text-slate-400">{w.description}</p>
                          </div>
                          <Plus
                            size={14}
                            className="text-slate-300 group-hover:text-indigo-500 transition-colors flex-shrink-0"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {availableKpis.length === 0 && availableWidgets.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">
                    All items are already on your dashboard
                  </p>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowCustomize(!showCustomize)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Settings2 size={14} /> Customize
          </button>
          <button
            type="button"
            onClick={resetLayout}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {showCustomize && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
          <h3 className="font-bold text-sm text-slate-800 mb-3">
            Toggle Widgets &amp; KPIs
          </h3>
          <div className="space-y-3">
            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Dashboard Widgets
              </h4>
              <div className="flex flex-wrap gap-2">
                {widgets.map((w) => (
                  <label
                    key={w.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={w.visible}
                      onChange={() => toggleWidget(w.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-slate-600">
                      {w.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Individual KPI Cards
              </h4>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_KPIS.map((k) => (
                  <label
                    key={k.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={kpis.includes(k.id)}
                      onChange={() => toggleKpi(k.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-600">{k.title}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Display Options
              </h4>
              <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={showBSDate}
                  onChange={toggleBSDate}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-600">
                  Show B.S. Date
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {visibleWidgets.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <p className="font-medium">All widgets are hidden</p>
          <button type="button" onClick={resetLayout} className="text-indigo-600 text-sm mt-2">
            Restore defaults
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          {visibleWidgets.map((widget) => (
            <div
              key={widget.id}
              draggable
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragOver={(e) => handleDragOver(e, widget.id)}
              onDragEnd={handleDragEnd}
              className={`${widgetSize(widget)} relative group ${dragId === widget.id ? "opacity-50" : ""}`}
            >
              <div
                className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400"
                style={{ cursor: "grab" }}
              >
                <GripVertical size={14} />
              </div>
              {renderWidget(widget)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

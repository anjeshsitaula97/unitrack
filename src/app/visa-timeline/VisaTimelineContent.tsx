"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  Loader2,
  Search,
  ChevronRight,
  ChevronLeft,
  Globe,
  FileText,
  Layout,
} from "lucide-react";
import { safeJson } from "@/lib/fetch-client";

interface WorkflowCountry {
  id: string;
  name: string;
  code: string | null;
}

interface VisaType {
  id: string;
  label: string;
  description: string | null;
}

interface TimelineTask {
  id: string;
  title: string;
  status?: string | null;
  priority?: string | null;
  dueDate?: string | null;
}

interface TimelineStage {
  id: string;
  name: string;
  description?: string | null;
  progress: number;
  isActive: boolean;
  completedTasks?: number;
  totalTasks?: number;
  tasks?: TimelineTask[];
  applications?: unknown[];
}

interface TimelineData {
  stages: TimelineStage[];
  summary?: {
    overallProgress?: number;
    totalStages?: number;
    completedStages?: number;
  };
  visaTasks?: unknown[];
}

function getStageIcon(stage: TimelineStage) {
  if (stage.progress === 100) return CheckCircle;
  if (stage.isActive) return Clock;
  return Circle;
}

function getStageColor(stage: TimelineStage) {
  if (stage.progress === 100) return "text-emerald-500";
  if (stage.isActive) return "text-indigo-500";
  return "text-slate-300";
}

function getPriorityColor(p: string) {
  switch (p) {
    case "High":
    case "Urgent":
      return "text-red-600 bg-red-50";
    case "Medium":
      return "text-amber-600 bg-amber-50";
    default:
      return "text-slate-600 bg-slate-50";
  }
}

const Breadcrumbs = ({
  view,
  selectedCountry,
  selectedVisa,
  onBackToCountries,
  onBackToVisas,
}: {
  view: "countries" | "visas" | "timeline";
  selectedCountry: string | null;
  selectedVisa: string | null;
  onBackToCountries: () => void;
  onBackToVisas: () => void;
}) => (
  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
    <button
      type="button"
      onClick={onBackToCountries}
      className={`hover:text-indigo-600 transition-colors ${view === "countries" ? "text-indigo-600" : ""}`}
    >
      Countries
    </button>
    {selectedCountry && (
      <>
        <ChevronRight size={14} />
        <button
          type="button"
          onClick={onBackToVisas}
          className={`hover:text-indigo-600 transition-colors ${view === "visas" ? "text-indigo-600" : ""}`}
        >
          {selectedCountry}
        </button>
      </>
    )}
    {selectedVisa && (
      <>
        <ChevronRight size={14} />
        <span className="text-indigo-600">{selectedVisa} Timeline</span>
      </>
    )}
  </div>
);

function VisaTimelineContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlView = searchParams.get("view") as "countries" | "visas" | "timeline" | null;
  const urlCountry = searchParams.get("country");
  const urlVisa = searchParams.get("visa");

  const [view, setView] = useState<"countries" | "visas" | "timeline">(urlView || "countries");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(urlCountry || null);
  const [selectedVisa, setSelectedVisa] = useState<string | null>(urlVisa || null);
  const [workflowCountries, setWorkflowCountries] = useState<WorkflowCountry[] | undefined>(
    undefined
  );
  const [visaTypes, setVisaTypes] = useState<VisaType[] | undefined>(undefined);
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [prevTimelineParams, setPrevTimelineParams] = useState({
    view,
    selectedCountry,
    selectedVisa,
  });
  if (
    prevTimelineParams.view !== view ||
    prevTimelineParams.selectedCountry !== selectedCountry ||
    prevTimelineParams.selectedVisa !== selectedVisa
  ) {
    setPrevTimelineParams({ view, selectedCountry, selectedVisa });
    setLoadingTimeline(true);
  }

  const syncUrl = useCallback(
    (v: string, country: string | null, visa: string | null) => {
      const params = new URLSearchParams();
      if (v !== "countries") params.set("view", v);
      if (country) params.set("country", country);
      if (visa) params.set("visa", visa);
      const qs = params.toString();
      router.replace(qs ? `/visa-timeline?${qs}` : "/visa-timeline", { scroll: false });
    },
    [router]
  );

  const setViewAndUrl = useCallback(
    (v: "countries" | "visas" | "timeline") => {
      setView(v);
      if (v === "countries") {
        setSelectedCountry(null);
        setSelectedVisa(null);
        setTimelineData(null);
        syncUrl(v, null, null);
      } else {
        syncUrl(v, selectedCountry, selectedVisa);
      }
    },
    [selectedCountry, selectedVisa, syncUrl]
  );

  const setCountryAndUrl = useCallback(
    (country: string | null) => {
      setSelectedCountry(country);
      setSelectedVisa(null);
      setTimelineData(null);
      syncUrl(country ? "visas" : "countries", country, null);
      if (country) setView("visas");
      else setView("countries");
    },
    [syncUrl]
  );

  const setVisaAndUrl = useCallback(
    (visa: string | null) => {
      setSelectedVisa(visa);
      setTimelineData(null);
      if (visa) {
        setView("timeline");
        syncUrl("timeline", selectedCountry, visa);
      } else {
        syncUrl("visas", selectedCountry, null);
      }
    },
    [selectedCountry, syncUrl]
  );

  useEffect(() => {
    fetch("/api/learning-hub/countries")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setWorkflowCountries(d))
      .catch(() => {})
      .finally(() => setLoadingCountries(false));
  }, []);

  useEffect(() => {
    fetch("/api/visa-types")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setVisaTypes(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (view === "timeline" && selectedCountry && selectedVisa) {
      const params = new URLSearchParams();
      params.set("country", selectedCountry);
      params.set("visaType", selectedVisa);
      fetch(`/api/visa-timeline?${params.toString()}`)
        .then(safeJson)
        .then((d) => {
          setTimelineData(d);
          setLoadingTimeline(false);
        })
        .catch(() => setLoadingTimeline(false));
    }
  }, [view, selectedCountry, selectedVisa]);

  const filteredCountries = (workflowCountries ?? []).filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layout className="text-indigo-600" />
            Visa Timeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {view === "countries" &&
              `${(workflowCountries ?? []).length.toLocaleString()} countries with visa workflows.`}
            {view === "visas" && `Select a visa type for ${selectedCountry}.`}
            {view === "timeline" &&
              `${timelineData?.stages?.length || 0} stages for ${selectedCountry} ${selectedVisa}.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {view !== "countries" && (
            <button
              type="button"
              onClick={() => setViewAndUrl("countries")}
              className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              All Countries
            </button>
          )}
          {view === "visas" && selectedCountry && (
            <button
              type="button"
              onClick={() => setCountryAndUrl(selectedCountry)}
              className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          )}
        </div>
      </div>

      <Breadcrumbs
        view={view}
        selectedCountry={selectedCountry}
        selectedVisa={selectedVisa}
        onBackToCountries={() => setViewAndUrl("countries")}
        onBackToVisas={() => setCountryAndUrl(selectedCountry)}
      />

      <div className="flex-1">
        {/* Step 1: Countries */}
        {view === "countries" && (
          <div>
            {loadingCountries ? (
              <div className="py-20 flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : (workflowCountries ?? []).length === 0 ? (
              <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
                <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe size={48} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">
                  No Countries Found
                </h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                  Add countries in the Country Workflow page to enable visa timelines.
                </p>
              </div>
            ) : (
              <>
                <div className="relative mb-6 max-w-xs">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                  {filteredCountries.map((country) => (
                    <button
                      type="button"
                      key={country.id}
                      onClick={() => setCountryAndUrl(country.name)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setCountryAndUrl(country.name);
                        }
                      }}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(79,70,229,0.15)] hover:border-indigo-100 transition-all group text-center flex flex-col items-center relative cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 via-violet-300/10 to-transparent pointer-events-none rounded-2xl" />
                      <div className="absolute -top-12 -right-12 size-24 bg-indigo-50/50 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-colors" />

                      <div className="w-20 h-14 rounded-xl overflow-hidden mb-4 shadow-md border-2 border-white group-hover:scale-110 transition-all duration-500 ring-1 ring-slate-100 relative">
                        {country.code ? (
                          <Image
                            src={`https://flagcdn.com/w160/${country.code.toLowerCase()}.png`}
                            alt={country.name}
                            fill
                            className="object-contain"
                            unoptimized
                            sizes="80px"
                          />
                        ) : (
                          <Globe size={32} className="m-auto mt-3 text-slate-200" />
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors mb-1.5">
                        {country.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Active
                        </span>
                      </div>

                      <div className="w-full h-px bg-slate-50 mb-3" />

                      <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                        View Timeline <ChevronRight size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Visa Types */}
        {view === "visas" && selectedCountry && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Select Visa Category</h2>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Globe size={14} className="text-indigo-400" /> {selectedCountry} visa timelines
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(visaTypes ?? []).length === 0 ? (
                <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
                  <FileText size={48} className="mx-auto mb-4 text-slate-200" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    No visa types defined.
                  </p>
                </div>
              ) : (
                (visaTypes ?? []).map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    tabIndex={0}
                    onClick={() => setVisaAndUrl(type.label)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setVisaAndUrl(type.label);
                      }
                    }}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(79,70,229,0.15)] hover:border-indigo-100 transition-all group text-center flex flex-col items-center relative cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-400/20 via-pink-300/10 to-transparent pointer-events-none rounded-2xl" />
                    <div className="absolute -top-12 -right-12 size-24 bg-rose-50/50 rounded-full blur-3xl group-hover:bg-rose-100/50 transition-colors" />

                    <div className="w-20 h-14 rounded-xl overflow-hidden mb-4 shadow-md border-2 border-white group-hover:scale-110 transition-all duration-500 ring-1 ring-slate-100 relative flex items-center justify-center bg-slate-50">
                      <FileText size={28} className="text-rose-500" />
                    </div>

                    <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors mb-1.5">
                      {type.label}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Active
                      </span>
                    </div>

                    <div className="w-full h-px bg-slate-50 mb-3" />

                    <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                      Open Timeline <ChevronRight size={14} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 3: Timeline */}
        {view === "timeline" && selectedCountry && selectedVisa && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            {loadingTimeline ? (
              <div className="py-20 flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : !timelineData || timelineData.stages?.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100 shadow-inner relative overflow-hidden">
                <div className="absolute -top-10 -right-10 size-40 bg-indigo-50/50 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 size-40 bg-violet-50/50 rounded-full blur-3xl" />
                <div className="relative size-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100/50">
                  <AlertTriangle size={32} className="text-indigo-400" />
                </div>
                <p className="text-slate-500 font-medium">No stages configured</p>
                <p className="text-slate-400 text-sm mt-1">
                  Add workflow stages in the admin panel to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3">
                  <div className="relative">
                    {timelineData.stages.map((stage, index: number) => {
                      const Icon = getStageIcon(stage);
                      const color = getStageColor(stage);
                      const isLast = index === timelineData.stages.length - 1;

                      return (
                        <div key={stage.id} className="relative flex gap-4 pb-8">
                          {!isLast && (
                            <div
                              className={`absolute left-[15px] top-8 w-0.5 h-full -z-10 ${stage.progress === 100 ? "bg-emerald-200" : "bg-slate-200"}`}
                            />
                          )}
                          <div className="flex flex-col items-center">
                            <div
                              className={`size-8 rounded-full border-2 flex items-center justify-center ${stage.progress === 100 ? "border-emerald-400 bg-emerald-50" : stage.isActive ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white"}`}
                            >
                              <Icon size={16} className={color} />
                            </div>
                          </div>
                          <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-slate-800">{stage.name}</h3>
                              <div className="flex items-center gap-2">
                                {stage.progress === 100 ? (
                                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    Completed
                                  </span>
                                ) : stage.isActive ? (
                                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                    In Progress
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                                    Pending
                                  </span>
                                )}
                                <span className="text-xs text-slate-400">
                                  {stage.completedTasks}/{stage.totalTasks} tasks
                                </span>
                              </div>
                            </div>

                            {stage.description && (
                              <p className="text-sm text-slate-500 mb-3">{stage.description}</p>
                            )}

                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${stage.progress === 100 ? "bg-emerald-400" : "bg-indigo-400"}`}
                                style={{ width: `${stage.progress}%` }}
                              />
                            </div>

                            {stage.tasks && stage.tasks.length > 0 && (
                              <div className="space-y-1.5">
                                {stage.tasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-50 text-sm"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`size-2 rounded-full ${task.status === "Done" || task.status === "Completed" ? "bg-emerald-400" : task.status === "In Progress" ? "bg-indigo-400" : "bg-slate-300"}`}
                                      />
                                      <span
                                        className={
                                          task.status === "Done" || task.status === "Completed"
                                            ? "text-slate-400 line-through"
                                            : "text-slate-700"
                                        }
                                      >
                                        {task.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {task.priority && (
                                        <span
                                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}
                                        >
                                          {task.priority}
                                        </span>
                                      )}
                                      {task.dueDate && (
                                        <span className="text-xs text-slate-400">
                                          {new Date(task.dueDate).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {stage.applications && stage.applications.length > 0 && (
                              <div className="mt-2 text-xs text-slate-400">
                                {stage.applications.length} related application(s)
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-5 h-fit sticky top-20">
                  <h3 className="font-bold text-slate-800 mb-4">Progress Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Overall Progress</div>
                      <div className="text-3xl font-black text-indigo-600 mt-1">
                        {timelineData.summary?.overallProgress || 0}%
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Total Stages</span>
                        <span className="font-bold text-slate-800">
                          {timelineData.summary?.totalStages || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Completed</span>
                        <span className="font-bold text-emerald-600">
                          {timelineData.summary?.completedStages || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Visa Tasks</span>
                        <span className="font-bold text-slate-800">
                          {timelineData.visaTasks?.length || 0}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${timelineData.summary?.overallProgress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VisaTimelineContent() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      }
    >
      <VisaTimelineContentInner />
    </Suspense>
  );
}

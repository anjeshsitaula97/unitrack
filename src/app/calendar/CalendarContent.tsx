"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ListTodo,
  Briefcase,
  CreditCard,
  Phone,
  ArrowUpRight,
  Plus,
  X,
  Loader2,
  Sun,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SkeletonText } from "@/components/Skeleton";
import { toast } from "sonner";
import { safeJson } from "@/lib/fetch-client";

const typeConfig: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  application: {
    label: "Application",
    icon: Briefcase,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  task: { label: "Task", icon: ListTodo, color: "bg-amber-100 text-amber-700 border-amber-200" },
  leave: {
    label: "Leave",
    icon: CalendarDays,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  followup: { label: "Follow-Up", icon: Phone, color: "bg-rose-100 text-rose-700 border-rose-200" },
  payment: {
    label: "Payment",
    icon: CreditCard,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  holiday: { label: "Holiday", icon: Sun, color: "bg-red-100 text-red-700 border-red-200" },
};

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  url?: string;
  type?: string;
  color?: string;
  status?: string;
  note?: string;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  type?: string;
}

export default function CalendarContent() {
  const router = useRouter();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [holidaySubmitting, setHolidaySubmitting] = useState(false);
  const [holidayType, setHolidayType] = useState("Public");

  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);

  useEffect(() => {
    const start = new Date(currentYear, currentMonth - 1, 1).toISOString();
    const end = new Date(currentYear, currentMonth + 2, 0).toISOString();
    Promise.all([
      fetch(`/api/calendar?start=${start}&end=${end}`).then(safeJson),
      fetch("/api/holidays").then(safeJson),
    ])
      .then(([evts, hols]) => {
        setEvents(Array.isArray(evts) ? evts : []);
        setHolidays(Array.isArray(hols) ? hols : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentMonth, currentYear]);

  const daysInMonth = monthEnd.getDate();
  const startDayOfWeek = monthStart.getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const dayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const dateStr = new Date(currentYear, currentMonth, selectedDay).toDateString();
    let dayEvts = events.filter((e) => new Date(e.start).toDateString() === dateStr);
    if (typeFilter !== "all") dayEvts = dayEvts.filter((e) => e.type === typeFilter);
    return dayEvts;
  }, [selectedDay, events, currentMonth, currentYear, typeFilter]);

  const getDayEvents = (day: number) => {
    const dateStr = new Date(currentYear, currentMonth, day).toDateString();
    return events.filter((e) => {
      const evStart = new Date(e.start).toDateString();
      const evEnd = new Date(e.end).toDateString();
      return (
        evStart === dateStr ||
        evEnd === dateStr ||
        (new Date(e.start) <= new Date(dateStr) && new Date(e.end) >= new Date(dateStr))
      );
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">Calendar</h1>
        <button
          type="button"
          onClick={() => {
            setHolidayDate("");
            setHolidayName("");
            setHolidayType("Public");
            setShowHolidayModal(true);
          }}
          className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-all flex items-center gap-1.5"
        >
          <Sun size={14} />
          Manage Holidays
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          ["all", "All"],
          ["application", "Applications"],
          ["task", "Tasks"],
          ["leave", "Leave"],
          ["followup", "Follow-ups"],
          ["payment", "Payments"],
          ["holiday", "Holidays"],
        ].map(([key, label]) => (
          <button
            type="button"
            key={key}
            onClick={() => setTypeFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${typeFilter === key ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <ChevronLeft size={18} className="text-slate-500" />
              </button>
              <h2 className="font-bold text-slate-800">{monthName}</h2>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <ChevronRight size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-100">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="min-h-[100px] border-b border-r border-slate-50"
                />
              ))}
              {days.map((day) => {
                const dayEvts = getDayEvents(day);
                const isToday =
                  day === today.getDate() &&
                  currentMonth === today.getMonth() &&
                  currentYear === today.getFullYear();
                const isSelected = day === selectedDay;

                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                    className={`min-h-[100px] border-b border-r border-slate-50 p-1.5 text-left transition-colors hover:bg-slate-50 relative
                      ${isSelected ? "bg-indigo-50 ring-2 ring-indigo-200 z-10" : ""}`}
                  >
                    <div
                      className={`size-6 rounded-full flex items-center justify-center text-xs font-semibold mb-1
                      ${isToday ? "bg-indigo-600 text-white" : isSelected ? "text-indigo-600" : "text-slate-600"}`}
                    >
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvts.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className={`text-[10px] font-semibold px-1 py-0.5 rounded truncate ${(e.type && typeConfig[e.type]?.color) || "bg-slate-100 text-slate-600"}`}
                        >
                          {e.title}
                        </div>
                      ))}
                      {dayEvts.length > 3 && (
                        <div className="text-[10px] text-slate-400 font-semibold px-1">
                          +{dayEvts.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          {selectedDay ? (
            <>
              <h3 className="font-bold text-slate-800 mb-3">
                {new Date(currentYear, currentMonth, selectedDay).toLocaleDateString("default", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              {loading ? (
                <SkeletonText lines={4} />
              ) : dayEvents.length === 0 ? (
                <div className="text-sm text-slate-400 py-8 text-center">No events this day</div>
              ) : (
                <div className="space-y-2">
                  {dayEvents.map((e) => {
                    const config = (e.type && typeConfig[e.type]) || {
                      label: "Event",
                      icon: CalendarDays,
                      color: "bg-slate-100 text-slate-600",
                    };
                    const Icon = config.icon;
                    return (
                      <div
                        key={e.id}
                        className="p-3 rounded-xl border border-slate-100 hover:shadow-sm transition-shadow cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onClick={() => e.url && router.push(e.url)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === " ") {
                            ev.preventDefault();
                            if (e.url) router.push(e.url);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`size-7 rounded-lg ${config.color} flex items-center justify-center`}
                            >
                              <Icon size={14} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-700">{e.title}</div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                {new Date(e.start).toLocaleTimeString("default", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                          <ArrowUpRight size={14} className="text-slate-300" />
                        </div>
                        {e.status && (
                          <div className="mt-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {e.status}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <CalendarDays size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">Select a day to view events</p>
            </div>
          )}
        </div>
      </div>

      {showHolidayModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="button"
          tabIndex={0}
          onClick={() => {
            setHolidayType("Public");
            setShowHolidayModal(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setHolidayType("Public");
              setShowHolidayModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sun size={18} className="text-red-500" />
                Manage Holidays
              </h2>
              <button
                type="button"
                onClick={() => {
                  setHolidayType("Public");
                  setShowHolidayModal(false);
                }}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="p-5 border-b border-slate-100">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!holidayName.trim() || !holidayDate) {
                    toast.error("Please fill in all fields");
                    return;
                  }
                  setHolidaySubmitting(true);
                  try {
                    const res = await fetch("/api/holidays", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: holidayName.trim(),
                        date: holidayDate,
                        type: holidayType,
                      }),
                    });
                    if (res.ok) {
                      toast.success("Holiday added");
                      setHolidayName("");
                      setHolidayDate("");
                      const [evts, hols] = await Promise.all([
                        fetch(
                          `/api/calendar?start=${new Date(currentYear, currentMonth - 1, 1).toISOString()}&end=${new Date(currentYear, currentMonth + 2, 0).toISOString()}`
                        ).then(safeJson),
                        fetch("/api/holidays").then(safeJson),
                      ]);
                      setEvents(Array.isArray(evts) ? evts : []);
                      setHolidays(Array.isArray(hols) ? hols : []);
                    } else {
                      const err = await res.json();
                      toast.error(err.error || "Failed to add holiday");
                    }
                  } catch {
                    toast.error("Failed to add holiday");
                  } finally {
                    setHolidaySubmitting(false);
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Holiday Name
                  </label>
                  <input
                    type="text"
                    value={holidayName}
                    onChange={(e) => setHolidayName(e.target.value)}
                    placeholder="e.g. Dashain"
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={holidayDate}
                      onChange={(e) => setHolidayDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                    />
                  </div>
                  <div className="w-36">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                    <select
                      value={holidayType}
                      onChange={(e) => setHolidayType(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={holidaySubmitting || !holidayName.trim() || !holidayDate}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {holidaySubmitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    Add
                  </button>
                </div>
              </form>
            </div>

            <div className="p-5">
              {holidays.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No holidays added yet</p>
              ) : (
                <div className="space-y-2">
                  {holidays.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100"
                    >
                      <div className="flex items-center gap-3">
                        <Sun size={16} className="text-red-500" />
                        <div>
                          <p className="text-base font-extrabold text-slate-800 truncate">
                            {h.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(h.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-red-100 text-red-700">
                              {h.type}
                            </span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch(`/api/holidays?id=${h.id}`, { method: "DELETE" });
                          const [evts, hols] = await Promise.all([
                            fetch(
                              `/api/calendar?start=${new Date(currentYear, currentMonth - 1, 1).toISOString()}&end=${new Date(currentYear, currentMonth + 2, 0).toISOString()}`
                            ).then(safeJson),
                            fetch("/api/holidays").then(safeJson),
                          ]);
                          setEvents(Array.isArray(evts) ? evts : []);
                          setHolidays(Array.isArray(hols) ? hols : []);
                          toast.success("Holiday removed");
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

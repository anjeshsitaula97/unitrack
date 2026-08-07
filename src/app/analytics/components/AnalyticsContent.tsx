"use client";

import React from "react";
import { BarChart3, TrendingUp, Users, BookOpen } from "lucide-react";

export default function AnalyticsContent() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Analytics Dashboard</h1>
        <p className="text-sm text-slate-400">Platform-wide statistics and enrollment trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users size={20} />
            </div>
            <h3 className="text-sm font-semibold text-slate-600">Total Students</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">12,450</p>
          <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> +12% this month
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
              <BookOpen size={20} />
            </div>
            <h3 className="text-sm font-semibold text-slate-600">Active Courses</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">1,894</p>
          <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> +4% this month
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-sm font-semibold text-slate-600">Platform Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">$1.2M</p>
          <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> +22% this month
          </p>
        </div>
      </div>

      <div className="card p-5 h-[300px] flex items-center justify-center">
        <p className="text-slate-400 text-sm flex flex-col items-center gap-2">
          <BarChart3 size={40} className="text-slate-200" />
          Interactive charts will render here connected to live database
        </p>
      </div>
    </div>
  );
}

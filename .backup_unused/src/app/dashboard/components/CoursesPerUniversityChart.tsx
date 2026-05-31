'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { MoreHorizontal, Loader2, BookOpen } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs font-semibold text-slate-700 mb-1">{label}</p>
        <p className="text-sm font-bold text-indigo-600">{payload[0].value.toLocaleString()} courses</p>
      </div>
    );
  }
  return null;
};

export default function CoursesPerUniversityChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    fetch('/api/dashboard/charts', { signal: ac.signal })
      .then(res => res.json())
      .then(result => {
        setData(result.coursesPerUniversity || []);
        setLoading(false);
      })
      .catch(err => {
        if (err?.name !== 'AbortError') {
          console.error('Chart Data Error:', err);
          setLoading(false);
        }
      });
    return () => ac.abort();
  }, []);

  return (
    <div className="card p-5 h-[320px] relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <Loader2 className="animate-spin text-indigo-500" size={24} />
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Courses per University</h3>
          <p className="text-xs text-slate-400 mt-0.5">Top 8 universities by course count</p>
        </div>
        <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-150" aria-label="MoreHorizontal"> <MoreHorizontal size={16} />
        </button>
      </div>
      <div className="h-[220px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={24} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="university"
                tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Plus Jakarta Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Plus Jakarta Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="courses" radius={[6, 6, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={`cell-${entry.id}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : !loading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
            <BookOpen size={32} strokeWidth={1.5} className="mb-2" />
            <p className="text-xs">No course data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Star, Building2, BookOpen, MapPin, Award, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FeaturedUniversity {
  id: string;
  name: string;
  logo?: string | null;
  city?: string | null;
  country: string;
  ranking?: string | number | null;
  founded?: string | number | null;
}

interface FeaturedCourse {
  id: string;
  name: string;
  level: string;
  university: { name: string };
  duration: string;
  enrolled: number;
  capacity: number;
  color?: string;
  initials?: string;
}

export default function FeaturedContent() {
  const [data, setData] = useState<{
    universities: FeaturedUniversity[];
    courses: FeaturedCourse[];
  }>({
    universities: [],
    courses: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/featured", { signal: ac.signal })
      .then((res) => res.json())
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          toast.error("Failed to load featured content");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
    return () => ac.abort();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
        <p className="text-slate-500 font-medium tracking-tight">
          Curating your featured highlights…
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Star className="text-amber-400 fill-amber-400" size={24} />
          Featured Highlights
        </h1>
        <p className="text-slate-500 mt-1">
          {data.universities.length} universities and {data.courses.length} courses hand-picked for
          excellence
        </p>
      </div>

      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="size-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Building2 size={18} />
          </div>
          <h2 className="text-xl font-bold text-slate-700">Top Universities</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.universities.length === 0 ? (
            <p className="text-slate-400 text-sm italic col-span-full">
              No featured universities at the moment.
            </p>
          ) : (
            data.universities.map((u) => (
              <div
                key={u.id}
                className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="h-32 bg-gradient-to-br from-indigo-500 to-violet-600 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)] animate-pulse"></div>
                  <Star className="absolute top-4 right-4 text-white/40" size={48} />
                </div>
                <div className="p-6 pt-0 -mt-10 relative">
                  <div className="size-20 bg-white rounded-2xl shadow-lg flex items-center justify-center p-2 mb-4 border border-slate-50 overflow-hidden relative">
                    {u.logo ? (
                      <Image
                        src={u.logo}
                        alt={u.name}
                        fill
                        className="object-contain"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-slate-50 flex items-center justify-center font-bold text-indigo-600 text-lg border border-slate-100">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                    {u.name}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mt-2 font-medium">
                    <MapPin size={12} />
                    {u.city}, {u.country}
                  </div>
                  <div className="mt-4 flex items-center gap-4 border-t border-slate-50 pt-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Ranking
                      </p>
                      <p className="text-indigo-600 font-bold">#{u.ranking}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Founded
                      </p>
                      <p className="text-slate-700 font-bold">{u.founded}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="size-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <BookOpen size={18} />
          </div>
          <h2 className="text-xl font-bold text-slate-700">Flagship Courses</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.courses.length === 0 ? (
            <p className="text-slate-400 text-sm italic col-span-full">
              No featured courses at the moment.
            </p>
          ) : (
            data.courses.map((c) => (
              <div
                key={c.id}
                className="group flex flex-col sm:flex-row bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="w-full sm:w-48 h-40 sm:h-auto bg-slate-50 flex items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-slate-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 to-emerald-50/50 opacity-100 group-hover:scale-110 transition-transform duration-500"></div>
                  <div
                    className="size-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg relative z-10"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.initials}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-100">
                        Featured
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{c.level}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">
                      {c.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">at {c.university.name}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Award size={12} className="text-amber-400" /> {c.duration}
                    </span>
                    <span className="text-indigo-600 font-bold">
                      {c.enrolled}/{c.capacity} Enrolled
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

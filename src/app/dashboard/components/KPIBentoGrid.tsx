import React, { useEffect, useState } from 'react';
import { Building2, BookOpen, PlusCircle, Users, Zap, TrendingUp, TrendingDown, AlertTriangle, Loader2 } from 'lucide-react';

interface KPICardProps {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'warning' | 'neutral';
  icon: React.ReactNode;
  gradient: string;
  span?: string;
  subtitle?: string;
}

function KPICard({ card }: { card: KPICardProps }) {
  return (
    <div className={`card relative overflow-hidden p-5 hover:shadow-md transition-all duration-200 cursor-pointer group ${card.span}`}>
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`} />

      {/* Decorative stars like Taskk */}
      <div className="absolute top-3 right-12 text-slate-200 text-lg select-none pointer-events-none">✦</div>
      <div className="absolute top-7 right-7 text-slate-100 text-sm select-none pointer-events-none">✦</div>

      {/* View details button */}
      <button type="button" className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 px-2.5 py-1 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-white transition-all duration-150">
        View details
      </button>

      {/* Icon */}
      <div className={`size-9 rounded-xl flex items-center justify-center mb-4 ${
        card.changeType === 'warning' ?'bg-amber-100 text-amber-600'
          : card.changeType === 'negative' ?'bg-red-100 text-red-600' :'bg-indigo-100 text-indigo-600'
      }`}>
        {card.icon}
      </div>

      {/* Value */}
      <div className="font-tabular text-3xl font-bold text-slate-800 mb-1">{card.value}</div>

      {/* Title */}
      <div className="text-sm font-medium text-slate-500 mb-3">{card.title}</div>

      {/* Change */}
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${
        card.changeType === 'positive' ? 'text-emerald-600' :
        card.changeType === 'negative' ? 'text-red-600' :
        card.changeType === 'warning'? 'text-amber-600' : 'text-slate-500'
      }`}>
        {card.changeType === 'positive' && <TrendingUp size={13} />}
        {card.changeType === 'negative' && <TrendingDown size={13} />}
        {card.changeType === 'warning' && <AlertTriangle size={13} />}
        {card.change}
      </div>

      {card.subtitle && (
        <div className="text-[11px] text-slate-400 mt-0.5">{card.subtitle}</div>
      )}
    </div>
  );
}

export default function KPIBentoGrid() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    fetch('/api/dashboard/stats', { signal: ac.signal })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        if (err?.name !== 'AbortError') {
          console.error('Failed to fetch stats:', err);
          setLoading(false);
        }
      });
    return () => ac.abort();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={`skeleton-${i}`} className="card h-40 flex items-center justify-center bg-slate-50 animate-pulse">
            <Loader2 className="animate-spin text-slate-200" size={24} />
          </div>
        ))}
      </div>
    );
  }

  const kpis: KPICardProps[] = [
    {
      id: 'kpi-total-universities',
      title: 'Total Universities',
      value: stats?.totalUniversities?.toLocaleString() || '0',
      change: `+${stats?.universitiesLastMonth || 0} this month`,
      changeType: 'positive',
      icon: <Building2 size={20} />,
      gradient: 'from-indigo-400/20 via-violet-300/10 to-transparent',
      subtitle: `Across ${stats?.countriesCount || 0} countries`,
    },
    {
      id: 'kpi-total-courses',
      title: 'Total Courses',
      value: stats?.totalCourses?.toLocaleString() || '0',
      change: `+${stats?.coursesLastMonth || 0} this month`,
      changeType: 'positive',
      icon: <BookOpen size={20} />,
      gradient: 'from-sky-400/20 via-blue-300/10 to-transparent',
      subtitle: 'Active catalog',
    },
    {
      id: 'kpi-enrolled-students',
      title: 'Enrolled Students',
      value: stats?.totalEnrolled >= 1000000 
        ? `${(stats.totalEnrolled / 1000000).toFixed(2)}M` 
        : stats?.totalEnrolled?.toLocaleString() || '0',
      change: 'Lifetime enrollment',
      changeType: 'positive',
      icon: <Users size={20} />,
      gradient: 'from-amber-400/20 via-orange-300/10 to-transparent',
      subtitle: 'Global reach',
    },
    {
      id: 'kpi-active-courses',
      title: 'Active Courses',
      value: stats?.activeCourses?.toLocaleString() || '0',
      change: stats?.totalCourses > 0 
        ? `${((stats.activeCourses / stats.totalCourses) * 100).toFixed(1)}% of catalog`
        : '0% of catalog',
      changeType: 'neutral',
      icon: <Zap size={20} />,
      gradient: 'from-pink-400/20 via-rose-300/10 to-transparent',
      subtitle: `${(stats?.totalCourses - stats?.activeCourses) || 0} non-active`,
    },
    {
      id: 'kpi-growth',
      title: 'Growth (30d)',
      value: stats?.totalUniversities > 0 
        ? `+${((stats.universitiesLastMonth / (stats.totalUniversities || 1)) * 100).toFixed(1)}%`
        : '0%',
      change: 'New university listings',
      changeType: 'positive',
      icon: <TrendingUp size={20} />,
      gradient: 'from-emerald-400/20 via-teal-300/10 to-transparent',
      subtitle: 'Expansion rate',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-4 mb-6">
      {kpis.map((kpi) => (
        <KPICard key={kpi.id} card={kpi} />
      ))}
    </div>
  );
}
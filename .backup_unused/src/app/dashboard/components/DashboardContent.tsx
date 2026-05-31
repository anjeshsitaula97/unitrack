'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import KPIBentoGrid from './KPIBentoGrid';
import RecentActivityFeed from './RecentActivityFeed';
import RecentUniversitiesTable from './RecentUniversitiesTable';

const CoursesPerUniversityChart = dynamic(() => import('./CoursesPerUniversityChart'), { ssr: false });
const EnrollmentTrendChart = dynamic(() => import('./EnrollmentTrendChart'), { ssr: false });
const FacultyDistributionChart = dynamic(() => import('./FacultyDistributionChart'), { ssr: false });

export default function DashboardContent() {
  const [userName, setUserName] = React.useState('Admin');
  const date = new Date();
  const [currentDate, setCurrentDate] = React.useState(() => date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }));

  React.useEffect(() => {
    const ac = new AbortController();
    fetch('/api/auth/me', { signal: ac.signal })
      .then(res => res.json())
      .then(data => {
        if (data.name) setUserName(data.name.split(' ')[0]);
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-0.5">Good morning, {userName}!</h1>
        <p className="text-sm text-slate-400">Here&apos;s what&apos;s happening across the platform today: {currentDate}</p>
      </div>

      {/* KPI Bento Grid */}
      <KPIBentoGrid />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 mb-4">
        <div className="xl:col-span-1">
          <CoursesPerUniversityChart />
        </div>
        <div className="xl:col-span-1">
          <EnrollmentTrendChart />
        </div>
        <div className="xl:col-span-1">
          <FacultyDistributionChart />
        </div>
      </div>

      {/* Activity feed + Charts second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-1">
          <RecentActivityFeed />
        </div>
        <div className="lg:col-span-2">
          <RecentUniversitiesTable />
        </div>
      </div>
    </div>
  );
}
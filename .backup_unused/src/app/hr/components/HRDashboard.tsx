'use client';

import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, CalendarClock, Clock, DollarSign, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HRDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/hr/dashboard');
        const d = await res.json();
        if (res.ok) setData(d);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { label: 'Total Employees', value: data?.totalEmployees, icon: <Users size={20} />, color: 'text-blue-600', bg: 'bg-blue-50', link: '/hr/employees' },
    { label: 'Departments', value: data?.departments, icon: <Building2 size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/hr/departments' },
    { label: 'Designations', value: data?.designations, icon: <Briefcase size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/hr/designations' },
    { label: 'Pending Leaves', value: data?.pendingLeaves, icon: <CalendarClock size={20} />, color: 'text-amber-600', bg: 'bg-amber-50', link: '/hr/leave' },
    { label: 'Present Today', value: data?.todayPresent, icon: <Clock size={20} />, color: 'text-green-600', bg: 'bg-green-50', link: '/hr/attendance' },
    { label: 'Payrolls This Month', value: data?.totalPayrolls, icon: <DollarSign size={20} />, color: 'text-rose-600', bg: 'bg-rose-50', link: '/hr/payroll' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">HR & Payroll</h1>
          <p className="text-sm text-slate-400">Manage staff, attendance, leave, and payroll</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {cards.map((card, i) => (
              <Link key={card.label} href={card.link} className="card p-4 flex flex-col gap-2 hover:shadow-md transition-shadow group">
                <div className={`size-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                  {card.icon}
                </div>
                <div className="text-2xl font-bold text-slate-800">{card.value ?? '-'}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">{card.label}</span>
                  <ArrowRight size={12} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-bold text-slate-800 mb-3">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { label: 'Employee Directory', href: '/hr/employees', desc: 'View and manage all employees' },
                  { label: 'Departments', href: '/hr/departments', desc: 'Organize your teams' },
                  { label: 'Designations', href: '/hr/designations', desc: 'Manage job titles' },
                  { label: 'Attendance', href: '/hr/attendance', desc: 'Track daily attendance' },
                  { label: 'Leave Management', href: '/hr/leave', desc: 'Handle leave requests' },
                  { label: 'Payroll', href: '/hr/payroll', desc: 'Process monthly salaries' },
                ].map((link, i) => (
                  <Link key={link.href} href={link.href} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600">{link.label}</p>
                      <p className="text-xs text-slate-400">{link.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-slate-800 mb-3">Recent Attendance</h3>
              {data?.recentAttendance?.length > 0 ? (
                <div className="space-y-2">
                  {data.recentAttendance.map((a: any) => (
                    <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                      <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                        {a.user.name.substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700">{a.user.name}</p>
                        <p className="text-xs text-slate-400">{a.user.employeeId || 'No ID'}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        a.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                        a.status === 'Late' ? 'bg-amber-50 text-amber-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 py-8 text-center">No attendance records today</p>
              )}
              <Link href="/hr/attendance" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                View All <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Building2, 
  BookOpen, 
  GraduationCap,
  Calendar,
  Clock,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';

interface Application {
  id: string;
  studentId: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
  };
  university: {
    name: string;
    country: string;
  };
  course: {
    name: string;
    level: string;
  };
  status: string;
  appliedDate: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  'Submitted': 'bg-blue-50 text-blue-700 border-blue-100',
  'Processing': 'bg-amber-50 text-amber-700 border-amber-100',
  'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Rejected': 'bg-red-50 text-red-700 border-red-100',
  'Pending': 'bg-slate-50 text-slate-700 border-slate-100',
};

const statusIcons: Record<string, any> = {
  'Submitted': <FileText size={14} />,
  'Processing': <Timer size={14} />,
  'Approved': <CheckCircle2 size={14} />,
  'Rejected': <AlertCircle size={14} />,
  'Pending': <Clock size={14} />,
};

export default function ApplicationsContent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return applications.filter(app => {
      const name = `${app.student.firstName} ${app.student.lastName}`.toLowerCase();
      const univ = app.university.name.toLowerCase();
      const course = app.course.name.toLowerCase();
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = name.includes(query) || univ.includes(query) || course.includes(query);
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-indigo-600" />
            Applications
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {filtered.length.toLocaleString()} applications matching your current filters
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: applications.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Processing', value: applications.filter(a => a.status === 'Processing').length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Approved', value: applications.filter(a => a.status === 'Approved').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, idx) => (
          <div key={stat.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by student, university or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Processing">Processing</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm font-medium">Loading applications…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <FileText className="text-slate-200" size={32} />
            </div>
            <p className="text-slate-500 font-medium">No applications found</p>
            <p className="text-slate-400 text-sm">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Application ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Student</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">University & Course</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Date Applied</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-slate-400">#{app.id.substring(app.id.length - 8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {app.student.firstName[0]}{app.student.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{app.student.firstName} {app.student.lastName}</p>
                          <p className="text-xs text-slate-400">{app.student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={12} className="text-slate-400" />
                          <p className="text-sm font-semibold text-slate-700">{app.university.name}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={12} className="text-slate-400" />
                          <p className="text-xs text-slate-500">{app.course.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[app.status] || statusColors['Pending']}`}>
                        {statusIcons[app.status] || statusIcons['Pending']}
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar size={12} />
                        <span className="text-xs font-medium">
                          {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button type="button" className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">
              Showing <span className="text-slate-700 font-bold">{(page - 1) * perPage + 1}</span> to <span className="text-slate-700 font-bold">{Math.min(page * perPage, filtered.length)}</span> of <span className="text-slate-700 font-bold">{filtered.length}</span> applications
            </p>
            <div className="flex items-center gap-1">
              <button type="button" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               aria-label="Previous page"><ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button type="button"
                    key={`page-${i}`}
                    onClick={() => setPage(i + 1)}
                    className={`size-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button type="button" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               aria-label="Next page"><ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

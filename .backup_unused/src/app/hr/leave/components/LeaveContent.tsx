'use client';

import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, CalendarClock, Loader2, X, ArrowLeft, Search, Clock, Users, Filter } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LeaveContent() {
  const [requests, setRequests] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
  const [activeTab, setActiveTab] = useState<'requests' | 'types'>('requests');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, typeRes] = await Promise.all([
        fetch(`/api/hr/leave/requests${statusFilter ? `?status=${statusFilter}` : ''}`),
        fetch('/api/hr/leave/types'),
      ]);
      if (reqRes.ok) setRequests(await reqRes.json());
      if (typeRes.ok) setTypes(await typeRes.json());
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/hr/leave/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Leave request submitted');
        setShowModal(false);
        setForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
        fetchData();
      } else { const d = await res.json(); toast.error(d.error || 'Failed to submit'); }
    } catch { toast.error('Error connecting to server'); }
    finally { setSubmitting(false); }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/hr/leave/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { toast.success(`Leave ${status.toLowerCase()}`); fetchData(); }
      else { const d = await res.json(); toast.error(d.error || 'Failed to update'); }
    } catch { toast.error('Error connecting to server'); }
  };

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/hr" className="text-slate-400 hover:text-slate-600"><ArrowLeft size={16} /></Link>
            <h1 className="text-2xl font-bold text-slate-800">Leave Management</h1>
          </div>
          <p className="text-sm text-slate-400">{requests.length} total requests</p>
        </div>
        <button type="button" onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={15} /> Apply Leave</button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card px-4 py-3 flex items-center gap-3">
          <div className="size-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Clock size={14} /></div>
          <div><div className="text-xs text-slate-400 font-medium">Pending</div><div className="text-lg font-bold text-amber-700">{pendingCount}</div></div>
        </div>
        <div className="card px-4 py-3 flex items-center gap-3">
          <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle size={14} /></div>
          <div><div className="text-xs text-slate-400 font-medium">Approved</div><div className="text-lg font-bold text-emerald-700">{approvedCount}</div></div>
        </div>
        <div className="card px-4 py-3 flex items-center gap-3">
          <div className="size-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><XCircle size={14} /></div>
          <div><div className="text-xs text-slate-400 font-medium">Rejected</div><div className="text-lg font-bold text-rose-700">{rejectedCount}</div></div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
          {['', 'Pending', 'Approved', 'Rejected'].map(s => (
            <button type="button" key={s} onClick={() => setStatusFilter(s)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${statusFilter === s ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/60 border-b border-slate-100">
              <tr>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Leave Type</th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">From</th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">To</th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Reason</th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="animate-spin text-indigo-500 mx-auto" size={24} /></td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400 text-sm">No leave requests</td></tr>
              ) : requests.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">{r.user.name.substring(0, 2)}</div>
                      <div><p className="text-sm font-semibold text-slate-700">{r.user.name}</p></div>
                    </div>
                  </td>
                  <td className="py-4 px-3"><span className="text-xs text-slate-600">{r.leaveType.name}</span></td>
                  <td className="py-4 px-3"><span className="text-xs text-slate-600">{new Date(r.startDate).toLocaleDateString()}</span></td>
                  <td className="py-4 px-3"><span className="text-xs text-slate-600">{new Date(r.endDate).toLocaleDateString()}</span></td>
                  <td className="py-4 px-3"><span className="text-xs text-slate-600 max-w-[150px] truncate block">{r.reason}</span></td>
                  <td className="py-4 px-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      r.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                      r.status === 'Rejected' ? 'bg-rose-50 text-rose-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>{r.status}</span>
                  </td>
                  <td className="py-4 px-3 text-right pr-5">
                    {r.status === 'Pending' && (
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => handleStatus(r.id, 'Approved')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Approve"><CheckCircle size={14} /></button>
                        <button type="button" onClick={() => handleStatus(r.id, 'Rejected')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Reject"><XCircle size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Apply for Leave</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Leave Type</label>
                <select required value={form.leaveTypeId} onChange={e => setForm({...form, leaveTypeId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none">
                  <option value="">Select type…</option>
                  {types.map((t: any) => <option key={t.id} value={t.id}>{t.name} ({t.daysPerYear} days/yr)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Start Date</label>
                  <input type="date" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">End Date</label>
                  <input type="date" required value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Reason</label>
                <textarea required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Reason for leave" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary px-8 disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Plus, MoreHorizontal,
  Edit2, Trash2, ChevronLeft, ChevronRight, Users,
  Mail, Shield, CheckCircle2, XCircle, Loader2, X,
  UserPlus, ShieldCheck, Clock
} from 'lucide-react';
import { toast } from 'sonner';

const roleConfig: Record<string, { label: string; className: string; icon: any }> = {
  'Admin': { label: 'Administrator', className: 'bg-rose-50 text-rose-700', icon: <ShieldCheck size={12} /> },
  'Moderator': { label: 'Moderator', className: 'bg-indigo-50 text-indigo-700', icon: <Shield size={12} /> },
  'Editor': { label: 'Editor', className: 'bg-emerald-50 text-emerald-700', icon: <Edit2 size={12} /> },
  'Viewer': { label: 'Viewer', className: 'bg-slate-50 text-slate-700', icon: <Users size={12} /> },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  'Active': { label: 'Active', className: 'bg-emerald-50 text-emerald-700' },
  'Pending': { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  'Suspended': { label: 'Suspended', className: 'bg-rose-50 text-rose-700' },
};

export default function StaffContent() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const editingStaffId = useRef<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Viewer',
  });

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (res.ok) {
        setAvailableRoles(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (res.ok) {
        setStaff(Array.isArray(data) ? data : []);
      } else {
        toast.error(data.error || 'Failed to load staff');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchRoles();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Staff member added successfully');
        setShowAddModal(false);
        setFormData({ name: '', email: '', password: '', role: 'Viewer' });
        fetchData();
      } else {
        toast.error(data.error || 'Failed to add staff');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffId.current) return;
    setIsSubmitting(true);
    
    // Only include password if it's not empty
    const submissionData = { ...formData };
    if (!submissionData.password) {
      delete (submissionData as any).password;
    }

    try {
      const res = await fetch(`/api/staff/${editingStaffId.current}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Staff member updated successfully');
        setShowEditModal(false);
        editingStaffId.current = null;
        setFormData({ name: '', email: '', password: '', role: 'Viewer' });
        fetchData();
      } else {
        toast.error(data.error || 'Failed to update staff');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: any) => {
    editingStaffId.current = user.id;
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Leave empty to keep existing password
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success('Staff member removed');
        fetchData();
      } else {
        toast.error(data.error || 'Failed to remove staff');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    }
  };

  const filtered = useMemo(() => {
    return staff.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                           user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [staff, search, roleFilter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="animate-fade-in relative block">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Staff Management</h1>
          <p className="text-sm text-slate-400">
            {filtered.length.toLocaleString()} staff members matching your current filters
          </p>
        </div>
        <button type="button"
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={15} />
          Add New Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Staff', value: staff.length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <Users size={14} /> },
          { label: 'Admins', value: staff.filter(s => s.role === 'Admin').length, color: 'text-rose-600', bg: 'bg-rose-50', icon: <ShieldCheck size={14} /> },
          { label: 'Moderators', value: staff.filter(s => s.role === 'Moderator').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 size={14} /> },
          { label: 'New This Month', value: staff.filter(s => new Date(s.createdAt).getMonth() === new Date().getMonth()).length, color: 'text-blue-600', bg: 'bg-blue-50', icon: <Plus size={14} /> },
        ].map((s, i) => (
          <div key={s.label} className="card px-4 py-3 flex items-center gap-3">
            <div className={`size-8 rounded-lg ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">{s.label}</div>
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="all">All Roles</option>
            {availableRoles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/60 border-b border-slate-100">
              <tr>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400 text-sm">No team members found.</td>
                </tr>
              )}
              {paginated.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase shadow-sm border-2 border-white">
                        {user.name.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-[10px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${roleConfig[user.role]?.className || ''}`}>
                      {roleConfig[user.role]?.icon}
                      {roleConfig[user.role]?.label || user.role}
                    </div>
                  </td>
                  <td className="py-4 px-3 text-right pr-5">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" 
                        onClick={() => openEditModal(user)}
                        className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button type="button" 
                        onClick={() => handleDeleteStaff(user.id)}
                        className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing {(page-1)*perPage + 1} to {Math.min(page*perPage, filtered.length)} of {filtered.length} members</p>
          <div className="flex items-center gap-1">
            <button type="button" 
              onClick={() => setPage(p => Math.max(1, p-1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-slate-200 disabled:opacity-50"
              aria-label="Previous page"><ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold px-3">Page {page} of {totalPages || 1}</span>
            <button type="button" 
              onClick={() => setPage(p => Math.min(totalPages, p+1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 rounded border border-slate-200 disabled:opacity-50"
              aria-label="Next page"><ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Invite New Staff</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="name@unitrack.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Initial Password</label>
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Role</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none"
                  >
                    {availableRoles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary px-8 disabled:opacity-50">
                  {isSubmitting ? 'Inviting...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Edit Staff Member</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditStaff} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="name@unitrack.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Password (Leave blank to keep current)</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Role</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none"
                  >
                    {availableRoles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                  <select 
                    value={formData.status || 'Active'}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none"
                  >
                    {Object.keys(statusConfig).map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary px-8 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

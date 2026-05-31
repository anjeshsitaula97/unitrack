'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Search, Plus, Filter, MoreHorizontal,
  Edit2, Trash2, ChevronLeft, ChevronRight,
  Mail, Phone, Calendar, User, Info, Loader2, X,
  UserCheck, MessageSquare, ClipboardList, Clock, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { COUNTRIES } from '@/lib/data/countries';

const formatDate = (dateString: string) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const isOverdue = (dateString: string) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

const statusConfig: Record<string, { label: string; className: string }> = {
  'New': { label: 'New Lead', className: 'bg-blue-50 text-blue-700' },
  'Contacted': { label: 'Contacted', className: 'bg-amber-50 text-amber-700' },
  'Qualified': { label: 'Qualified', className: 'bg-emerald-50 text-emerald-700' },
  'Converted': { label: 'Converted', className: 'bg-indigo-50 text-indigo-700 border border-indigo-100' },
  'Lost': { label: 'Lost', className: 'bg-rose-50 text-rose-700' },
};

export default function LeadsContent() {
  const [leads, setLeads] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website',
    status: 'New',
    notes: '',
    uploadedBy: '',
    uploaderNotes: '',
    counselor: '',
    counselorNotes: '',
    assignedDate: '',
    nextFollowUp: '',
    interestedCountry: '',
    maritalStatus: 'Single',
    childrenCount: 0,
    referenceName: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [leadsRes, userRes, usersRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/auth/me'),
        fetch('/api/users')
      ]);
      
      const [leadsData, userData, usersData] = await Promise.all([
        leadsRes.json(),
        userRes.json(),
        usersRes.json()
      ]);
      
      if (leadsRes.ok) {
        setLeads(Array.isArray(leadsData) ? leadsData : []);
      }
      if (userRes.ok) {
        setCurrentUser(userData);
        if (!editingLead) {
          setFormData(prev => ({ ...prev, uploadedBy: userData.name }));
        }
      }
      if (usersRes.ok) {
        setAllUsers(usersData);
      }
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  }, [editingLead]);

  const fetchDataRef = useRef(fetchData);
  fetchDataRef.current = fetchData;
  useEffect(() => {
    fetchDataRef.current();
  }, [editingLead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingLead ? `/api/leads/${editingLead.id}` : '/api/leads';
      const method = editingLead ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (res.ok) {
        if (formData.status === 'Converted' && editingLead?.status !== 'Converted') {
          toast.success('Lead converted and migrated to Students tab!');
        } else {
          toast.success(editingLead ? 'Lead updated' : 'Lead added successfully');
        }
        setShowAddModal(false);
        setEditingLead(null);
        setFormData({ 
          name: '', email: '', phone: '', source: 'Website', status: 'New', notes: '',
          uploadedBy: currentUser?.name || '', uploaderNotes: '', counselor: '', counselorNotes: '',
          assignedDate: '', nextFollowUp: '', interestedCountry: '', maritalStatus: 'Single', childrenCount: 0, referenceName: ''
        });
        fetchData();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success('Lead deleted');
        fetchData();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    }
  };

  const handleEdit = (lead: any) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      source: lead.source || 'Website',
      status: lead.status || 'New',
      notes: lead.notes || '',
      uploadedBy: lead.uploadedBy || '',
      uploaderNotes: lead.uploaderNotes || '',
      counselor: lead.counselor || '',
      counselorNotes: lead.counselorNotes || '',
      assignedDate: lead.assignedDate ? new Date(lead.assignedDate).toISOString().split('T')[0] : '',
      nextFollowUp: lead.nextFollowUp ? new Date(lead.nextFollowUp).toISOString().split('T')[0] : '',
      interestedCountry: lead.interestedCountry || '',
      maritalStatus: lead.maritalStatus || 'Single',
      childrenCount: lead.childrenCount || 0,
      referenceName: lead.referenceName || '',
    });
    setShowAddModal(true);
  };

  const filtered = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || 
                           lead.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesStaff = staffFilter === 'all' || lead.counselor === staffFilter;
      return matchesSearch && matchesStatus && matchesStaff;
    });
  }, [leads, search, statusFilter, staffFilter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const isAdmin = currentUser?.role === 'Admin';

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
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Lead Management</h1>
          <p className="text-sm text-slate-400">
            {filtered.length.toLocaleString()} leads matching your current filters
          </p>
        </div>
        <button type="button"
          onClick={() => {
            setEditingLead(null);
            setFormData({ 
              name: '', email: '', phone: '', source: 'Website', status: 'New', notes: '',
              uploadedBy: currentUser?.name || '', uploaderNotes: '', counselor: '', counselorNotes: '',
              assignedDate: '', nextFollowUp: '', interestedCountry: '', maritalStatus: 'Single', childrenCount: 0, referenceName: ''
            });
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={15} />
          Add New Lead
        </button>
      </div>

      {/* Filters */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="all">All Status</option>
            {Object.keys(statusConfig).map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
          </select>
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="all">All Staff</option>
            {allUsers.map(u => (
              <option key={u.id} value={u.name}>{u.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/60 border-b border-slate-100">
              <tr>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lead Info</th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Counselor / Assigned</th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Next Follow-up</th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">No leads found.</td>
                </tr>
              )}
              {paginated.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-5">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{lead.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-slate-400"><Mail size={10} /> {lead.email}</span>
                        {lead.phone && <span className="flex items-center gap-1 text-[10px] text-slate-400"><Phone size={10} /> {lead.phone}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <UserCheck size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{lead.counselor || 'Unassigned'}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> {lead.assignedDate ? formatDate(lead.assignedDate) : 'Not assigned'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${statusConfig[lead.status]?.className || ''}`}>
                      {statusConfig[lead.status]?.label || lead.status}
                    </span>
                  </td>
                  <td className="py-4 px-3">
                    <div className={`flex items-center gap-2 ${isOverdue(lead.nextFollowUp) ? 'text-rose-600' : 'text-slate-600'}`}>
                      <Calendar size={14} className={isOverdue(lead.nextFollowUp) ? 'text-rose-500' : 'text-slate-400'} />
                      <div className="text-xs font-medium">
                        {formatDate(lead.nextFollowUp)}
                        {isOverdue(lead.nextFollowUp) && (
                          <span className="ml-2 px-1.5 py-0.5 bg-rose-50 text-[9px] font-bold uppercase tracking-tighter rounded border border-rose-100 animate-pulse">Overdue</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-right pr-5">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" 
                        onClick={() => handleEdit(lead)}
                        className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      {isAdmin && (
                        <button type="button" 
                          onClick={() => handleDelete(lead.id)}
                          className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing {(page-1)*perPage + 1} to {Math.min(page*perPage, filtered.length)} of {filtered.length} leads</p>
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

      {/* Add/Edit Lead Modal */}
      {showAddModal && <LeadFormModal showAddModal={showAddModal} setShowAddModal={setShowAddModal} editingLead={editingLead} formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} isSubmitting={isSubmitting} isAdmin={isAdmin} />}
    </div>
  );
}

function LeadFormModal({ showAddModal, setShowAddModal, editingLead, formData, setFormData, handleSubmit, isSubmitting, isAdmin }: {
  showAddModal: boolean;
  setShowAddModal: (v: boolean) => void;
  editingLead: any;
  formData: any;
  setFormData: (v: any) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  isAdmin: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-in my-8">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800">{editingLead ? 'Edit Lead' : 'Add New Lead'}</h3>
          <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100">
                <User size={16} className="text-indigo-500" />
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Basic Information</h4>
              </div>
              <div>
                <label htmlFor="lead-name" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                <input id="lead-name"
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. David Smith"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label htmlFor="lead-email" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                <input id="lead-email"
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="david@example.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lead-phone" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Phone</label>
                  <input id="lead-phone"
                    type="text" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 234..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label htmlFor="lead-status" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Lead Status</label>
                  <select id="lead-status"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none font-medium"
                  >
                    {Object.keys(statusConfig).map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="lead-next-followup" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 text-indigo-600 flex items-center gap-1">
                  <Calendar size={12} /> Next Follow-up Reminder
                </label>
                <input id="lead-next-followup"
                  type="date" 
                  value={formData.nextFollowUp}
                  onChange={e => setFormData({...formData, nextFollowUp: e.target.value})}
                  className="w-full px-4 py-2.5 bg-indigo-50/30 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold text-indigo-700"
                />
              </div>

              {/* Preferences Section */}
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100 pt-2">
                <Info size={16} className="text-indigo-500" />
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Preferences & Status</h4>
              </div>
              <div>
                <label htmlFor="lead-interested-country" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Interested Country</label>
                <select id="lead-interested-country"
                  value={formData.interestedCountry}
                  onChange={e => setFormData({...formData, interestedCountry: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                >
                  <option value="">Select a country</option>
                  {COUNTRIES.map(country => (
                    <option key={country.name} value={country.name}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lead-marital-status" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Marital Status</label>
                  <select id="lead-marital-status"
                    value={formData.maritalStatus}
                    onChange={e => setFormData({...formData, maritalStatus: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none font-medium"
                  >
                    <option value="Single">Single</option>
                    <option value="Dependent">Dependent</option>
                  </select>
                </div>
                {formData.maritalStatus === 'Dependent' && (
                  <div>
                    <label htmlFor="lead-children-count" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">No. of Children</label>
                    <input id="lead-children-count"
                      type="number" 
                      min="0"
                      value={formData.childrenCount}
                      onChange={e => setFormData({...formData, childrenCount: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Uploader & Counselor */}
            <div className="space-y-4">
              {/* Counselor Section */}
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100">
                <UserCheck size={16} className="text-indigo-500" />
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Counselor Assignment</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="lead-counselor" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Assigned Counselor</label>
                  <input id="lead-counselor"
                    type="text" 
                    value={formData.counselor}
                    onChange={e => setFormData({...formData, counselor: e.target.value})}
                    placeholder="Search for counselor..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="lead-assigned-date" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Date Assigned</label>
                  <input id="lead-assigned-date"
                    type="date" 
                    value={formData.assignedDate}
                    onChange={e => setFormData({...formData, assignedDate: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lead-counselor-notes" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Counselor Remarks</label>
                <textarea id="lead-counselor-notes"
                  value={formData.counselorNotes}
                  onChange={e => setFormData({...formData, counselorNotes: e.target.value})}
                  placeholder="Counselor's feedback and follow-up notes..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm resize-none font-medium"
                />
              </div>

              {/* Uploader Section */}
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100 pt-2">
                <ClipboardList size={16} className="text-slate-400" />
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Origin Details</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lead-uploaded-by" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Uploaded By</label>
                  <input id="lead-uploaded-by"
                    type="text" 
                    value={formData.uploadedBy}
                    readOnly={!isAdmin}
                    className={`w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none text-sm font-medium ${isAdmin ? 'focus:ring-2 focus:ring-indigo-500' : 'cursor-not-allowed text-slate-400'}`}
                    onChange={e => isAdmin && setFormData({...formData, uploadedBy: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="lead-source" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Source</label>
                  <select id="lead-source"
                    value={formData.source}
                    onChange={e => setFormData({...formData, source: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none font-medium"
                  >
                    <option value="Website">Website</option>
                    <option value="Tiktok">Tiktok</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Whatsapp">Whatsapp</option>
                    <option value="Email">Email</option>
                    <option value="Promotions">Promotions</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Reference">Reference</option>
                  </select>
                </div>
              </div>
              {formData.source === 'Reference' && (
                <div className="pt-2">
                  <label htmlFor="lead-reference-name" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Reference Name</label>
                  <input id="lead-reference-name"
                    type="text" 
                    value={formData.referenceName}
                    onChange={e => setFormData({...formData, referenceName: e.target.value})}
                    placeholder="Who referred this lead?"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              )}
              <div>
                <label htmlFor="lead-uploader-notes" className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Uploader Notes</label>
                <textarea id="lead-uploader-notes"
                  value={formData.uploaderNotes}
                  onChange={e => setFormData({...formData, uploaderNotes: e.target.value})}
                  placeholder="Notes from the uploader..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm resize-none font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-8 border-t border-slate-100 mt-6">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary px-8 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : (editingLead ? 'Update Lead' : 'Add Lead')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

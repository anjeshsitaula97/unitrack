'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Ticket as TicketIcon, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  X,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Bug,
  Sparkles,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  screenshot: string | null;
  creatorId: string;
  creator: {
    name: string;
    avatar: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

const TICKET_TYPES = ['Technical', 'Feature Request'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

export default function TicketsContent() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Technical',
    priority: 'Medium',
    screenshot: ''
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) setTickets(await res.json());
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, screenshot: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success('Ticket submitted successfully');
        setShowModal(false);
        fetchTickets();
        setFormData({
          title: '',
          description: '',
          type: 'Technical',
          priority: 'Medium',
          screenshot: ''
        });
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to submit ticket');
      }
    } catch (err) {
      toast.error('Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });

      if (res.ok) {
        toast.success('Ticket status updated');
        fetchTickets();
      }
    } catch (err) {
      toast.error('Failed to update ticket');
    }
  };

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      const title = t.title.toLowerCase();
      const desc = t.description.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = title.includes(query) || desc.includes(query);
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [tickets, searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    return {
      open: tickets.filter(t => t.status === 'Open').length,
      inProgress: tickets.filter(t => t.status === 'In Progress').length,
      resolved: tickets.filter(t => t.status === 'Resolved').length
    };
  }, [tickets]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TicketIcon className="text-indigo-600" />
            Support Tickets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length.toLocaleString()} tickets matching your current filters
          </p>
        </div>
        <button type="button" 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus size={18} />
          New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Tickets</p>
            <p className="text-2xl font-black text-slate-800">{stats.open}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Progress</p>
            <p className="text-2xl font-black text-slate-800">{stats.inProgress}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolved</p>
            <p className="text-2xl font-black text-slate-800">{stats.resolved}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Types</option>
              {TICKET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm font-medium">Loading tickets…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <TicketIcon size={32} />
            </div>
            <p className="text-slate-500 font-medium">No tickets found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${
                      ticket.type === 'Technical' ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {ticket.type === 'Technical' ? <Bug size={24} /> : <Sparkles size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-800">{ticket.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                          ticket.status === 'Open' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          ticket.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {ticket.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                          ticket.priority === 'Urgent' ? 'bg-red-600 text-white border-red-600' :
                          ticket.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' :
                          ticket.priority === 'Medium' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 max-w-2xl line-clamp-2 mb-3">{ticket.description}</p>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="size-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                              {ticket.creator.name.charAt(0)}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">By {ticket.creator.name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">•</span>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                        {ticket.screenshot && (
                          <a 
                            href={ticket.screenshot} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <ImageIcon size={12} /> View Screenshot
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                      <button type="button" 
                        onClick={() => handleUpdateStatus(ticket.id, 'Resolved')}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button type="button" className="p-2 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" aria-label="Next"> <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-slide-up overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800">New Ticket</h2>
                <p className="text-sm text-slate-500">Report a bug or suggest a feature.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ticket Title</label>
                <input 
                  type="text"
                  required
                  placeholder="Summarize the issue or feature..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                  >
                    <option value="Technical">Technical (Bug)</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Detailed Description</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Provide steps to reproduce (for bugs) or a clear objective (for features)..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Screenshot (Optional)</label>
                <div className="relative">
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label 
                    htmlFor="screenshot-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                  >
                    {formData.screenshot ? (
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg overflow-hidden border border-slate-200 relative flex-shrink-0">
                          <Image src={formData.screenshot} alt="Preview" fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800">Screenshot Attached</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-indigo-500 transition-colors">
                          <Upload size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800">Upload screenshot</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">PNG, JPG up to 5MB</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button type="button" 
                  disabled={isSubmitting}
                  className="flex-[2] px-6 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

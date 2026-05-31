'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Wallet,
  Building2,
  Banknote
} from 'lucide-react';
import { toast } from 'sonner';

interface Payment {
  id: string;
  studentId: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  currency: string;
  status: string;
  method: string;
  date: string;
  description: string;
  proofUrl: string | null;
}

const statusColors: Record<string, string> = {
  'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Pending': 'bg-amber-50 text-amber-700 border-amber-100',
  'Partially Paid': 'bg-blue-50 text-blue-700 border-blue-100',
  'Refunded': 'bg-red-50 text-red-700 border-red-100',
};

export default function PaymentsContent() {
  const [payments, setPayments] = useState<Payment[] | undefined>(undefined);
  const [students, setStudents] = useState<any[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    currency: 'NPR',
    status: 'Paid',
    method: 'Bank Transfer',
    date: new Date().toISOString().split('T')[0],
    description: '',
    proofUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/students')
      ]);
      if (pRes.ok) setPayments(await pRes.json());
      if (sRes.ok) setStudents(await sRes.json());
    } catch (err) {
      toast.error('Failed to load payments data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success('Payment recorded successfully');
        setShowModal(false);
        fetchData();
        setFormData({
          studentId: '',
          amount: '',
          currency: 'NPR',
          status: 'Paid',
          method: 'Bank Transfer',
          date: new Date().toISOString().split('T')[0],
          description: '',
          proofUrl: ''
        });
      }
    } catch (err) {
      toast.error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return (payments ?? []).filter(p => {
      const name = `${p.student.firstName} ${p.student.lastName}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = name.includes(query) || p.description?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="text-indigo-600" />
            Payments
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {filtered.length.toLocaleString()} payments matching your current filters
          </p>
        </div>
        <button type="button" 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus size={18} />
          Add Payment
        </button>
      </div>

      <PaymentStats payments={payments ?? []} />

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by student or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm font-medium">Loading payments…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <Banknote size={32} />
            </div>
            <p className="text-slate-500 font-medium">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Student</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Method</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 text-center">Proof</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {payment.student.firstName[0]}{payment.student.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{payment.student.firstName} {payment.student.lastName}</p>
                          <p className="text-[10px] text-slate-400">{payment.student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{payment.description || 'No description'}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-800">{payment.currency} {payment.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{payment.method}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${statusColors[payment.status]}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {payment.proofUrl ? (
                        <a 
                          href={payment.proofUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center size-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          title="View Proof"
                        >
                          <ArrowUpRight size={16} />
                        </a>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button type="button" className="p-2 text-slate-400 hover:text-slate-600" aria-label="MoreVertical"> <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PaymentFormModal showModal={showModal} setShowModal={setShowModal} formData={formData} setFormData={setFormData} students={students} handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}

function PaymentStats({ payments }: { payments: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4" suppressHydrationWarning>
      {[
        { label: 'Total Received', value: `NPR ${payments.filter(p => p.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`, color: 'text-emerald-600', icon: <ArrowDownLeft size={16} /> },
        { label: 'Pending Collections', value: `NPR ${payments.filter(p => p.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`, color: 'text-amber-600', icon: <Clock size={16} /> },
        { label: 'This Month', value: `NPR ${payments.filter(p => new Date(p.date).getMonth() === new Date().getMonth()).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`, color: 'text-indigo-600', icon: <Calendar size={16} /> },
        { label: 'Transactions', value: payments.length, color: 'text-slate-600', icon: <Wallet size={16} /> },
      ].map((stat) => (
        <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <div className={`p-1.5 rounded-lg bg-slate-50 ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
          <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function PaymentFormModal({ showModal, setShowModal, formData, setFormData, students, handleSubmit, isSubmitting }: {
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  formData: any;
  setFormData: (v: any) => void;
  students: any[] | undefined;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setShowModal(false)} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-slide-up overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800">Record Payment</h2>
            <p className="text-sm text-slate-400">Add a new financial transaction for a student.</p>
          </div>
          <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="payment-student" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Student</label>
            <select id="payment-student"
              required
              value={formData.studentId}
              onChange={(e) => setFormData({...formData, studentId: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            >
              <option value="">Choose a student…</option>
              {(students ?? []).map(s => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.email})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="payment-amount" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Amount</label>
              <input id="payment-amount"
                type="number"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
            <div>
              <label htmlFor="payment-currency" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Currency</label>
              <select id="payment-currency"
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                <option value="NPR">NPR</option>
                <option value="USD">USD</option>
                <option value="AUD">AUD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="payment-status" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
              <select id="payment-status"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-indigo-600"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </div>
            <div>
              <label htmlFor="payment-method" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Payment Method</label>
              <select id="payment-method"
                value={formData.method}
                onChange={(e) => setFormData({...formData, method: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="E-Sewa / Khalti">E-Sewa / Khalti</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="payment-date" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Transaction Date</label>
            <input id="payment-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="payment-description" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description / Notes</label>
            <textarea id="payment-description"
              rows={2}
              placeholder="e.g. Enrollment Fee, Service Charge..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
            />
          </div>

          <div>
            <label htmlFor="payment-proof-url" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Transaction Proof (Link/URL)</label>
            <div className="relative">
              <input id="payment-proof-url"
                type="text"
                placeholder="https://receipt-link.com/..."
                value={formData.proofUrl}
                onChange={(e) => setFormData({...formData, proofUrl: e.target.value})}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <ArrowUpRight size={18} />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" 
              onClick={() => setShowModal(false)}
              className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button type="button" 
              disabled={isSubmitting}
              className="flex-[2] px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

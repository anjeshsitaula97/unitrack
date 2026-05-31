'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  X,
  CreditCard,
  Building2,
  DollarSign,
  Tag,
  Trash2,
  FileText,
  Hash,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface Expense {
  id: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  description: string | null;
  paidTo: string | null;
  method: string | null;
  billNo: string | null;
  transactionNo: string | null;
  screenshot: string | null;
}

const categories = [
  'Office Supplies',
  'Marketing',
  'Rent',
  'Salaries',
  'Utilities',
  'Travel',
  'Legal & Professional',
  'Miscellaneous'
];

export default function ExpensesContent() {
  const [expenses, setExpenses] = useState<Expense[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    category: 'Office Supplies',
    amount: '',
    currency: 'NPR',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paidTo: '',
    method: 'Bank Transfer',
    billNo: '',
    transactionNo: '',
    screenshot: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) setExpenses(await res.json());
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success('Expense recorded successfully');
        setShowModal(false);
        fetchExpenses();
        setFormData({
          category: 'Office Supplies',
          amount: '',
          currency: 'NPR',
          date: new Date().toISOString().split('T')[0],
          description: '',
          paidTo: '',
          method: 'Bank Transfer',
          billNo: '',
          transactionNo: '',
          screenshot: ''
        });
      }
    } catch (err) {
      toast.error('Failed to record expense');
    } finally {
      setIsSubmitting(false);
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

  const filtered = useMemo(() => {
    return (expenses ?? []).filter(e => {
      const desc = e.description?.toLowerCase() || '';
      const paidTo = e.paidTo?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      const matchesSearch = desc.includes(query) || paidTo.includes(query);
      const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, categoryFilter]);

  const stats = useMemo(() => {
    const list = expenses ?? [];
    const total = list.reduce((acc, curr) => acc + curr.amount, 0);
    const thisMonth = list.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).reduce((acc, curr) => acc + curr.amount, 0);
    const lastMonth = list.filter(e => new Date(e.date).getMonth() === new Date().getMonth() - 1).reduce((acc, curr) => acc + curr.amount, 0);
    const diff = lastMonth === 0 ? 100 : ((thisMonth - lastMonth) / lastMonth) * 100;
    
    return { total, thisMonth, diff };
  }, [expenses]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="text-red-600" />
            Business Expenses
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length.toLocaleString()} expenses matching your current filters
          </p>
        </div>
        <button type="button" 
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-100"
        >
          <Plus size={18} />
          Record Expense
        </button>
      </div>

      <ExpenseStatsCards stats={stats} expenses={expenses} />

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <ExpenseFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />

        <ExpenseTable isLoading={isLoading} filtered={filtered} />
      </div>

      {showModal && (
        <ExpenseFormModal
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          setShowModal={setShowModal}
          handleFileUpload={handleFileUpload}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

function ExpenseStatsCards({ stats, expenses }: { stats: { total: number; thisMonth: number; diff: number }; expenses: Expense[] | undefined }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Expenditures</p>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-black text-slate-800">NPR {stats.total.toLocaleString()}</p>
          <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
            <DollarSign size={18} />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Spending This Month</p>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-black text-slate-800">NPR {stats.thisMonth.toLocaleString()}</p>
          <div className={`flex items-center gap-1 text-xs font-bold ${stats.diff > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            {stats.diff > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(stats.diff).toFixed(1)}% vs last month
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categories Logged</p>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-black text-slate-800">{new Set((expenses ?? []).map(e => e.category)).size}</p>
          <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
            <Tag size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpenseFilterBar({ searchQuery, setSearchQuery, categoryFilter, setCategoryFilter }: { searchQuery: string; setSearchQuery: (v: string) => void; categoryFilter: string; setCategoryFilter: (v: string) => void }) {
  return (
    <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative flex-1 w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search expenses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm"
        />
      </div>
      <select 
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-red-500"
      >
        <option value="all">All Categories</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );
}

function ExpenseTable({ isLoading, filtered }: { isLoading: boolean; filtered: Expense[] }) {
  return (
    <>
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm font-medium">Loading expenses…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
            <Receipt size={32} />
          </div>
          <p className="text-slate-500 font-medium">No expenses found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Paid To</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded-full uppercase tracking-tighter">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{expense.description || '-'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{expense.paidTo || '-'}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-red-600">-{expense.currency} {expense.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 text-right space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{expense.method}</span>
                    {(expense.billNo || expense.transactionNo) && (
                      <div className="flex flex-col items-end gap-1">
                        {expense.billNo && <span className="text-[9px] text-slate-400 flex items-center gap-1"><FileText size={10} /> Bill: {expense.billNo}</span>}
                        {expense.transactionNo && <span className="text-[9px] text-slate-400 flex items-center gap-1"><Hash size={10} /> Txn: {expense.transactionNo}</span>}
                      </div>
                    )}
                    {expense.screenshot && (
                      <a 
                        href={expense.screenshot} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-red-600 hover:underline flex items-center justify-end gap-1 mt-1"
                      >
                        <ImageIcon size={12} /> View Screenshot
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function ExpenseFormModal({ formData, setFormData, handleSubmit, setShowModal, handleFileUpload, isSubmitting }: { formData: { category: string; amount: string; currency: string; date: string; description: string; paidTo: string; method: string; billNo: string; transactionNo: string; screenshot: string }; setFormData: React.Dispatch<React.SetStateAction<{ category: string; amount: string; currency: string; date: string; description: string; paidTo: string; method: string; billNo: string; transactionNo: string; screenshot: string }>>; handleSubmit: (e: React.FormEvent) => Promise<void>; setShowModal: (v: boolean) => void; handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; isSubmitting: boolean }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setShowModal(false)} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-slide-up overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800">Record Expense</h2>
            <p className="text-sm text-slate-500">Log a new business expenditure.</p>
          </div>
          <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expense-category" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
              <select id="expense-category"
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="expense-amount" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Amount</label>
              <input id="expense-amount"
                type="number"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold text-red-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expense-bill-no" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bill Number</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input id="expense-bill-no"
                  type="text"
                  placeholder="Optional"
                  value={formData.billNo}
                  onChange={(e) => setFormData({...formData, billNo: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium"
                />
              </div>
            </div>
            <div>
              <label htmlFor="expense-transaction-id" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Transaction ID</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input id="expense-transaction-id"
                  type="text"
                  placeholder="Optional"
                  value={formData.transactionNo}
                  onChange={(e) => setFormData({...formData, transactionNo: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expense-date" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Transaction Date</label>
              <input id="expense-date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium"
              />
            </div>
            <div>
              <label htmlFor="expense-method" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payment Method</label>
              <select id="expense-method"
                value={formData.method}
                onChange={(e) => setFormData({...formData, method: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Corporate Card">Corporate Card</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="screenshot-upload" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payment Screenshot</label>
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
                className="flex items-center justify-center gap-2 w-full px-4 py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-red-50 hover:border-red-200 transition-all group"
              >
                {formData.screenshot ? (
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-lg overflow-hidden border border-slate-200 relative flex-shrink-0">
                      <Image src={formData.screenshot} alt="Preview" fill className="object-cover" sizes="48px" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Screenshot Attached</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">Click to change</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-red-500 transition-colors">
                      <Upload size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800">Upload payment proof</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest text-center">PNG, JPG up to 5MB</p>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="expense-paid-to" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Paid To (Vendor/Entity)</label>
            <input id="expense-paid-to"
              type="text"
              placeholder="e.g. Nepal Electricity Authority, Landlord..."
              value={formData.paidTo}
              onChange={(e) => setFormData({...formData, paidTo: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold"
            />
          </div>

          <div>
            <label htmlFor="expense-description" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
            <textarea id="expense-description"
              rows={2}
              placeholder="Additional notes about this expenditure..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none font-medium"
            />
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
              className="flex-[2] px-6 py-3 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-100 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

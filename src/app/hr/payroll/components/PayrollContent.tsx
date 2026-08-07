"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Loader2,
  X,
  ArrowLeft,
  CheckCircle,
  FileText,
  CreditCard,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface PayrollUser {
  id: number;
  name: string;
  email: string;
  employeeId: string | null;
  basicSalary: number | null;
  department: { name: string } | null;
}

interface PayrollItem {
  id: number;
  payrollId: number;
  label: string;
  type: string;
  amount: number;
  createdAt: string;
}

interface PayrollRecord {
  id: number;
  userId: number;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  netSalary: number;
  status: string;
  paidAt: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: PayrollUser;
  items: PayrollItem[];
}

interface EmployeeOption {
  id: number | string;
  name: string;
  email: string;
  employeeId: string | null;
  basicSalary: number | null;
}

interface PayrollFormItem {
  label: string;
  type: string;
  amount: string;
}

interface PayrollForm {
  userId: string;
  basicSalary: string;
  allowances: string;
  deductions: string;
  bonus: string;
  items: PayrollFormItem[];
}

const calcNet = (p: PayrollRecord) =>
  (p.basicSalary || 0) + (p.allowances || 0) + (p.bonus || 0) - (p.deductions || 0);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function PayrollContent() {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);
  const [form, setForm] = useState<PayrollForm>({
    userId: "",
    basicSalary: "",
    allowances: "0",
    deductions: "0",
    bonus: "0",
    items: [],
  });
  const [page, setPage] = useState(1);
  const perPage = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [payRes, empRes] = await Promise.all([
        fetch(`/api/hr/payroll?month=${month}&year=${year}`),
        fetch("/api/hr/employees"),
      ]);
      if (payRes.ok) setPayrolls(await payRes.json());
      if (empRes.ok) setEmployees(await empRes.json());
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);
  useEffect(() => {
    fetchDataRef.current();
  }, [month, year]);

  const openAdd = () => {
    setForm({
      userId: "",
      basicSalary: "",
      allowances: "0",
      deductions: "0",
      bonus: "0",
      items: [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/hr/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, month, year }),
      });
      if (res.ok) {
        toast.success("Payroll created");
        setShowModal(false);
        fetchData();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to create");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (id: number, status: string, paymentMethod?: string) => {
    try {
      const res = await fetch(`/api/hr/payroll/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentMethod }),
      });
      if (res.ok) {
        toast.success(`Payroll ${status.toLowerCase()}`);
        fetchData();
        setSelectedPayroll(null);
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to update");
      }
    } catch {
      toast.error("Error connecting to server");
    }
  };

  const handleEmployeeSelect = (userId: string) => {
    const emp = employees.find((e) => e.id === userId);
    setForm({ ...form, userId, basicSalary: emp?.basicSalary?.toString() || "0" });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { label: "", type: "Earnings", amount: "0" }] });
  };

  const updateItem = (index: number, field: keyof PayrollFormItem, value: string) => {
    const items = [...form.items];
    items[index][field] = value;
    setForm({ ...form, items });
  };

  const removeItem = (index: number) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const filtered = payrolls;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);
  const totalNet = payrolls.reduce((sum, p) => sum + calcNet(p), 0);
  const paidCount = payrolls.filter((p) => p.status === "Paid").length;

  const currentYear = new Date().getFullYear();

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/hr" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Payroll</h1>
          </div>
          <p className="text-sm text-slate-400">
            {months[month - 1]} {year}
          </p>
        </div>
        <button type="button" onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Add Payroll
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <select
          value={month}
          onChange={(e) => {
            setMonth(parseInt(e.target.value));
            setPage(1);
          }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
        >
          {months.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => {
            setYear(parseInt(e.target.value));
            setPage(1);
          }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
        >
          {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <PayrollStats payrolls={payrolls} totalNet={totalNet} paidCount={paidCount} />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/60 border-b border-slate-100">
              <tr>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Employee
                </th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Basic
                </th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Allowances
                </th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Deductions
                </th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Net
                </th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right pr-5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto" size={24} />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No payroll records for this period
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {p.user.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{p.user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-xs font-semibold text-slate-700">
                        ${p.basicSalary.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-xs text-emerald-600 font-semibold">
                        +${p.allowances.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-xs text-rose-600 font-semibold">
                        -${p.deductions.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-sm font-bold text-slate-800">
                        ${calcNet(p).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          p.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : p.status === "Approved"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right pr-5">
                      <button
                        type="button"
                        onClick={() => setSelectedPayroll(p)}
                        className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <FileText size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-slate-200 disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold px-3">
              Page {page} of {totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 rounded border border-slate-200 disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <PayrollFormModal
        showModal={showModal}
        setShowModal={setShowModal}
        form={form}
        setForm={setForm}
        employees={employees}
        handleEmployeeSelect={handleEmployeeSelect}
        addItem={addItem}
        updateItem={updateItem}
        removeItem={removeItem}
        handleSubmit={handleSubmit}
        submitting={submitting}
      />

      <PayslipDetailModal
        selectedPayroll={selectedPayroll}
        setSelectedPayroll={setSelectedPayroll}
        handleStatus={handleStatus}
        submitting={submitting}
      />
    </div>
  );
}

function PayrollStats({
  payrolls,
  totalNet,
  paidCount,
}: {
  payrolls: PayrollRecord[];
  totalNet: number;
  paidCount: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      <div className="card px-4 py-3 flex items-center gap-3">
        <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Users size={14} />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Employees</div>
          <div className="text-lg font-bold text-indigo-700">{payrolls.length}</div>
        </div>
      </div>
      <div className="card px-4 py-3 flex items-center gap-3">
        <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <DollarSign size={14} />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Total Payroll</div>
          <div className="text-lg font-bold text-emerald-700">${totalNet.toLocaleString()}</div>
        </div>
      </div>
      <div className="card px-4 py-3 flex items-center gap-3">
        <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <CheckCircle size={14} />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Paid</div>
          <div className="text-lg font-bold text-blue-700">
            {paidCount}/{payrolls.length}
          </div>
        </div>
      </div>
    </div>
  );
}

function PayrollFormModal({
  showModal,
  setShowModal,
  form,
  setForm,
  employees,
  handleEmployeeSelect,
  addItem,
  updateItem,
  removeItem,
  handleSubmit,
  submitting,
}: {
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  form: PayrollForm;
  setForm: (v: PayrollForm) => void;
  employees: EmployeeOption[];
  handleEmployeeSelect: (userId: string) => void;
  addItem: () => void;
  updateItem: (index: number, field: keyof PayrollFormItem, value: string) => void;
  removeItem: (index: number) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
}) {
  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in overflow-y-auto max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0">
              <h3 className="font-bold text-slate-800">Create Payroll</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="payroll-employee"
                  className="block text-xs font-bold text-slate-500 uppercase mb-1.5"
                >
                  Employee
                </label>
                <select
                  id="payroll-employee"
                  required
                  value={form.userId}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none"
                >
                  <option value="">Select employee…</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.employeeId || e.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="payroll-basicSalary"
                    className="block text-xs font-bold text-slate-500 uppercase mb-1.5"
                  >
                    Basic Salary ($)
                  </label>
                  <input
                    id="payroll-basicSalary"
                    type="number"
                    required
                    value={form.basicSalary}
                    onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="payroll-allowances"
                    className="block text-xs font-bold text-slate-500 uppercase mb-1.5"
                  >
                    Allowances ($)
                  </label>
                  <input
                    id="payroll-allowances"
                    type="number"
                    value={form.allowances}
                    onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="payroll-deductions"
                    className="block text-xs font-bold text-slate-500 uppercase mb-1.5"
                  >
                    Deductions ($)
                  </label>
                  <input
                    id="payroll-deductions"
                    type="number"
                    value={form.deductions}
                    onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="payroll-bonus"
                    className="block text-xs font-bold text-slate-500 uppercase mb-1.5"
                  >
                    Bonus ($)
                  </label>
                  <input
                    id="payroll-bonus"
                    type="number"
                    value={form.bonus}
                    onChange={(e) => setForm({ ...form, bonus: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Custom Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    + Add Item
                  </button>
                </div>
                {form.items.map((item: PayrollFormItem, i: number) => (
                  <div
                    key={`${item.label}-${item.type}-${item.amount}-${i}`}
                    className="flex items-center gap-2 mb-2"
                  >
                    <input
                      type="text"
                      placeholder="Label"
                      value={item.label}
                      onChange={(e) => updateItem(i, "label", e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <select
                      value={item.type}
                      onChange={(e) => updateItem(i, "type", e.target.value)}
                      className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="Earnings">Earnings</option>
                      <option value="Deductions">Deductions</option>
                    </select>
                    <input
                      type="number"
                      placeholder="0"
                      value={item.amount}
                      onChange={(e) => updateItem(i, "amount", e.target.value)}
                      className="w-20 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Net Salary:</span>
                  <span className="font-bold text-slate-800">
                    $
                    {(
                      (parseFloat(form.basicSalary) || 0) +
                      (parseFloat(form.allowances) || 0) +
                      (parseFloat(form.bonus) || 0) -
                      (parseFloat(form.deductions) || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-8 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Payroll"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function PayslipDetailModal({
  selectedPayroll,
  setSelectedPayroll,
  handleStatus,
  submitting,
}: {
  selectedPayroll: PayrollRecord | null;
  setSelectedPayroll: (v: PayrollRecord | null) => void;
  handleStatus: (id: number, status: string, paymentMethod?: string) => Promise<void>;
  submitting: boolean;
}) {
  return (
    <>
      {selectedPayroll && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in overflow-y-auto max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0">
              <h3 className="font-bold text-slate-800">Payslip Details</h3>
              <button
                type="button"
                onClick={() => setSelectedPayroll(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="size-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {selectedPayroll.user.name.substring(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{selectedPayroll.user.name}</p>
                  <p className="text-xs text-slate-400">
                    {selectedPayroll.user.employeeId || selectedPayroll.user.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm py-1">
                  <span className="text-slate-500">Basic Salary</span>
                  <span className="font-semibold text-slate-700">
                    ${selectedPayroll.basicSalary.toLocaleString()}
                  </span>
                </div>
                {selectedPayroll.allowances > 0 && (
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-slate-500">Allowances</span>
                    <span className="font-semibold text-emerald-600">
                      +${selectedPayroll.allowances.toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedPayroll.bonus > 0 && (
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-slate-500">Bonus</span>
                    <span className="font-semibold text-emerald-600">
                      +${selectedPayroll.bonus.toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedPayroll.deductions > 0 && (
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-slate-500">Deductions</span>
                    <span className="font-semibold text-rose-600">
                      -${selectedPayroll.deductions.toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedPayroll.items
                  ? (() => {
                      const result = [];
                      for (const item of selectedPayroll.items) {
                        if (item.type === "Earnings") {
                          result.push(
                            <div key={item.id} className="flex justify-between text-sm py-1">
                              <span className="text-slate-500">{item.label}</span>
                              <span className="font-semibold text-emerald-600">
                                +${item.amount.toLocaleString()}
                              </span>
                            </div>
                          );
                        }
                      }
                      return result;
                    })()
                  : null}
                {selectedPayroll.items
                  ? (() => {
                      const result = [];
                      for (const item of selectedPayroll.items) {
                        if (item.type === "Deductions") {
                          result.push(
                            <div key={item.id} className="flex justify-between text-sm py-1">
                              <span className="text-slate-500">{item.label}</span>
                              <span className="font-semibold text-rose-600">
                                -${item.amount.toLocaleString()}
                              </span>
                            </div>
                          );
                        }
                      }
                      return result;
                    })()
                  : null}
                <div className="flex justify-between text-sm py-3 border-t border-slate-100 mt-2">
                  <span className="font-bold text-slate-800">Net Salary</span>
                  <span className="font-bold text-lg text-slate-800">
                    ${calcNet(selectedPayroll).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span
                  className={`font-bold px-2.5 py-1 rounded-lg ${
                    selectedPayroll.status === "Paid"
                      ? "bg-emerald-50 text-emerald-700"
                      : selectedPayroll.status === "Approved"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {selectedPayroll.status}
                </span>
                {selectedPayroll.paidAt && (
                  <span>Paid on {new Date(selectedPayroll.paidAt).toLocaleDateString()}</span>
                )}
              </div>

              {selectedPayroll.status === "Draft" && (
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => handleStatus(selectedPayroll.id, "Approved")}
                    disabled={submitting}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatus(selectedPayroll.id, "Paid")}
                    disabled={submitting}
                    className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <CreditCard size={15} /> Mark Paid
                  </button>
                </div>
              )}
              {selectedPayroll.status === "Approved" && (
                <button
                  type="button"
                  onClick={() => handleStatus(selectedPayroll.id, "Paid", "Bank Transfer")}
                  disabled={submitting}
                  className="w-full bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <CreditCard size={15} /> {submitting ? "Processing..." : "Mark as Paid"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

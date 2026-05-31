'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Users, Mail, Briefcase, Building2, Loader2, X, ArrowLeft, Phone, DollarSign, CreditCard, Calendar, Camera } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function EmployeesContent() {
  const [employees, setEmployees] = useState<any[] | undefined>(undefined);
  const [departments, setDepartments] = useState<any[] | undefined>(undefined);
  const [designations, setDesignations] = useState<any[] | undefined>(undefined);
  const [branches, setBranches] = useState<any[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<any>({});

  const fetchData = async () => {
    try {
      const [empRes, deptRes, desigRes, branchRes] = await Promise.all([
        fetch('/api/hr/employees'),
        fetch('/api/hr/departments'),
        fetch('/api/hr/designations'),
        fetch('/api/branches'),
      ]);
      if (empRes.ok) setEmployees(await empRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (desigRes.ok) setDesignations(await desigRes.json());
      if (branchRes.ok) setBranches(await branchRes.json());
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ userId: '', employeeId: '', phone: '', gender: '', hireDate: '', employmentType: 'Full-Time', basicSalary: '', departmentId: '', designationId: '', branchId: '', bankName: '', bankAccount: '', panNumber: '', emergencyContact: '', address: '', city: '', state: '' });
    setShowModal(true);
  };

  const openEdit = (emp: any) => {
    setEditing(emp);
    setForm({
      employeeId: emp.employeeId || '', phone: emp.phone || '', gender: emp.gender || '',
      hireDate: emp.hireDate || '', employmentType: emp.employmentType || 'Full-Time',
      basicSalary: emp.basicSalary?.toString() || '',
      departmentId: emp.departmentId || '', designationId: emp.designationId || '',
      branchId: emp.branchId || '',
      bankName: emp.bankName || '', bankAccount: emp.bankAccount || '',
      panNumber: emp.panNumber || '', emergencyContact: emp.emergencyContact || '',
      address: emp.address || '', city: emp.city || '', state: emp.state || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? `/api/hr/employees/${editing.id}` : '/api/hr/employees';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? form : { ...form, userId: form.userId }),
      });
      if (res.ok) {
        toast.success(editing ? 'Employee updated' : 'Employee profile created');
        setShowModal(false); fetchData();
      } else { const d = await res.json(); toast.error(d.error || 'Failed to save'); }
    } catch { toast.error('Error connecting to server'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this employee?')) return;
    try {
      const res = await fetch(`/api/hr/employees/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Employee removed'); fetchData(); }
      else { const d = await res.json(); toast.error(d.error || 'Failed to delete'); }
    } catch { toast.error('Error connecting to server'); }
  };

  const filtered = (employees ?? []).filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.employeeId || '').toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const usersWoProfile = (employees?.length ?? 0) > 0 ? [] : null;

  return (
    <div className="animate-fade-in relative">
      {loading && <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>}

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/hr" className="text-slate-400 hover:text-slate-600"><ArrowLeft size={16} /></Link>
            <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
          </div>
          <p className="text-sm text-slate-400">{filtered.length} employees</p>
        </div>
        <button type="button" onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={15} /> Add Employee</button>
      </div>

      <EmployeeStatsCards employees={employees} departments={departments} designations={designations} />

      <EmployeeTableCard
        search={search}
        setSearch={setSearch}
        setPage={setPage}
        paginated={paginated}
        openEdit={openEdit}
        handleDelete={handleDelete}
        page={page}
        filtered={filtered}
        totalPages={totalPages}
        perPage={perPage}
      />

      {showModal && (
        <EmployeeFormModal
          editing={editing}
          submitting={submitting}
          form={form}
          handleSubmit={handleSubmit}
          setShowModal={setShowModal}
          setForm={setForm}
          employees={employees}
          departments={departments}
          designations={designations}
          branches={branches}
        />
      )}
    </div>
  );
}

function EmployeeStatsCards({ employees, departments, designations }: { employees: any[] | undefined; departments: any[] | undefined; designations: any[] | undefined }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {[
        { label: 'Total Employees', value: (employees?.length ?? 0), color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <Users size={14} /> },
        { label: 'Departments', value: (departments?.length ?? 0), color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <Building2 size={14} /> },
        { label: 'Designations', value: (designations?.length ?? 0), color: 'text-amber-600', bg: 'bg-amber-50', icon: <Briefcase size={14} /> },
        { label: 'Full-Time', value: (employees ?? []).filter(e => e.employmentType === 'Full-Time').length, color: 'text-blue-600', bg: 'bg-blue-50', icon: <Calendar size={14} /> },
      ].map((s, i) => (
        <div key={s.label} className="card px-4 py-3 flex items-center gap-3">
          <div className={`size-8 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>{s.icon}</div>
          <div><div className="text-xs text-slate-400 font-medium">{s.label}</div><div className={`text-lg font-bold ${s.color}`}>{s.value}</div></div>
        </div>
      ))}
    </div>
  );
}

function EmployeeTableCard({ search, setSearch, setPage, paginated, openEdit, handleDelete, page, filtered, totalPages, perPage }: { search: string; setSearch: (v: string) => void; setPage: React.Dispatch<React.SetStateAction<number>>; paginated: any[]; openEdit: (emp: any) => void; handleDelete: (id: string) => Promise<void>; page: number; filtered: any[]; totalPages: number; perPage: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name, ID, or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/60 border-b border-slate-100">
            <tr>
              <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
              <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
              <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Designation</th>
              <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
              <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Salary</th>
              <th className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right pr-5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-slate-400 text-sm">No employees found.</td></tr>
            )}
            {paginated.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase shadow-sm border-2 border-white">
                      {emp.name.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{emp.name}</p>
                      <p className="text-[10px] text-slate-400">{emp.employeeId ? `#${emp.employeeId}` : emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-3">
                  <span className="text-xs text-slate-600">{emp.department?.name || '-'}</span>
                </td>
                <td className="py-4 px-3">
                  <span className="text-xs text-slate-600">{emp.designation?.title || '-'}</span>
                </td>
                <td className="py-4 px-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${emp.employmentType === 'Full-Time' ? 'bg-emerald-50 text-emerald-700' : emp.employmentType === 'Part-Time' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                    {emp.employmentType || 'Full-Time'}
                  </span>
                </td>
                <td className="py-4 px-3">
                  <span className="text-xs font-semibold text-slate-700">{emp.basicSalary ? `$${emp.basicSalary.toLocaleString()}` : '-'}</span>
                </td>
                <td className="py-4 px-3 text-right pr-5">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" aria-label="Edit" onClick={() => openEdit(emp)} className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Edit"><Edit2 size={14} /></button>
                    <Link href={`/hr/employees/${emp.id}/face-enrollment`} className="p-1.5 text-emerald-800 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Face Enrollment"><Camera size={14} /></Link>
                    <button type="button" aria-label="Delete" onClick={() => handleDelete(emp.id)} className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500">Showing {(page-1)*perPage + 1} to {Math.min(page*perPage, filtered.length)} of {filtered.length}</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="p-1.5 rounded border border-slate-200 disabled:opacity-50" aria-label="Previous page"><ChevronLeft size={14} /></button>
          <span className="text-xs font-bold px-3">Page {page} of {totalPages || 1}</span>
          <button type="button" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages || totalPages === 0} className="p-1.5 rounded border border-slate-200 disabled:opacity-50" aria-label="Next page"><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function EmployeeFormModal({ editing, submitting, form, handleSubmit, setShowModal, setForm, employees, departments, designations, branches }: { editing: any; submitting: boolean; form: any; handleSubmit: (e: React.FormEvent) => Promise<void>; setShowModal: (v: boolean) => void; setForm: React.Dispatch<React.SetStateAction<any>>; employees: any[] | undefined; departments: any[] | undefined; designations: any[] | undefined; branches: any[] | undefined }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-in overflow-y-auto max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0">
          <h3 className="font-bold text-slate-800">{editing ? 'Edit Employee' : 'Add Employee Profile'}</h3>
          <button type="button" aria-label="Close" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!editing && (
            <div>
              <label htmlFor="emp-user" className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Select User</label>
              <select id="emp-user" required value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none">
                <option value="">Choose a user…</option>
                {(employees ?? []).map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="emp-employeeId" className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Employee ID</label>
              <input id="emp-employeeId" type="text" value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} placeholder="EMP-001" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label htmlFor="emp-phone" className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone</label>
              <input id="emp-phone" type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 555-0000" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label htmlFor="emp-gender" className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Gender</label>
              <select id="emp-gender" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none">
                <option value="">Select…</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="emp-hireDate" className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Hire Date</label>
              <input id="emp-hireDate" type="date" value={form.hireDate} onChange={e => setForm({...form, hireDate: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label htmlFor="emp-employmentType" className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Employment Type</label>
              <select id="emp-employmentType" value={form.employmentType} onChange={e => setForm({...form, employmentType: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none">
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
            <div>
              <label htmlFor="emp-basicSalary" className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Basic Salary ($)</label>
              <input id="emp-basicSalary" type="number" value={form.basicSalary} onChange={e => setForm({...form, basicSalary: e.target.value})} placeholder="50000" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="emp-departmentId" className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Department</label>
              <select id="emp-departmentId" value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none">
                <option value="">None</option>
                {(departments ?? []).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="emp-designationId" className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Designation</label>
              <select id="emp-designationId" value={form.designationId} onChange={e => setForm({...form, designationId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none">
                <option value="">None</option>
                {(designations ?? []).map((d: any) => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="emp-branchId" className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Branch</label>
              <select id="emp-branchId" value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none">
                <option value="">None (Main Office)</option>
                {(() => {
                  const result = [];
                  for (const b of (branches ?? [])) {
                    if (b.status === 'Active') result.push(<option key={b.id} value={b.id}>{b.name}</option>);
                  }
                  return result;
                })()}
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Bank & Financial Info</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="emp-bankName" className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Bank Name</label>
                <input id="emp-bankName" type="text" value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} placeholder="Bank of America" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label htmlFor="emp-bankAccount" className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Account No.</label>
                <input id="emp-bankAccount" type="text" value={form.bankAccount} onChange={e => setForm({...form, bankAccount: e.target.value})} placeholder="XXXX-XXXX-XXXX" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label htmlFor="emp-panNumber" className="block text-xs font-bold text-slate-500 uppercase mb-1.5">PAN / Tax ID</label>
                <input id="emp-panNumber" type="text" value={form.panNumber} onChange={e => setForm({...form, panNumber: e.target.value})} placeholder="ABCDE1234F" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
              </div>
              <div>
                <label htmlFor="emp-emergencyContact" className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Emergency Contact</label>
                <input id="emp-emergencyContact" type="text" value={form.emergencyContact} onChange={e => setForm({...form, emergencyContact: e.target.value})} placeholder="Jane Doe" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary px-8 disabled:opacity-50">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

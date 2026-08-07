"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Building2, Loader2, X, Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface DepartmentUser {
  id: number;
  name: string;
  email: string;
}

interface Department {
  id: number;
  name: string;
  description: string | null;
  headId: number | null;
  head: DepartmentUser | null;
  _count: { members: number };
  createdAt: string;
  updatedAt: string;
}

interface UserOption {
  id: number;
  name: string;
  email: string;
}

export default function DepartmentsContent() {
  const [departments, setDepartments] = useState<Department[] | undefined>(undefined);
  const [users, setUsers] = useState<UserOption[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", headId: "" });

  const fetchData = async () => {
    try {
      const [deptRes, userRes] = await Promise.all([
        fetch("/api/hr/departments"),
        fetch("/api/users"),
      ]);
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (userRes.ok) setUsers(await userRes.json());
    } catch (_err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchData();
    });
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", description: "", headId: "" });
    setShowModal(true);
  };

  const openEdit = (dept: Department) => {
    setEditing(dept);
    setForm({
      name: dept.name,
      description: dept.description || "",
      headId: String(dept.headId || ""),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? `/api/hr/departments/${editing.id}` : "/api/hr/departments";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(editing ? "Department updated" : "Department created");
        setShowModal(false);
        fetchData();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to save");
      }
    } catch (_err) {
      toast.error("Error connecting to server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this department?")) return;
    try {
      const res = await fetch(`/api/hr/departments/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Department deleted");
        fetchData();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to delete");
      }
    } catch (_err) {
      toast.error("Error connecting to server");
    }
  };

  return (
    <div className="animate-fade-in">
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      )}

      {!loading && (
        <>
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/hr" className="text-slate-400 hover:text-slate-600">
                  <ArrowLeft size={16} />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
              </div>
              <p className="text-sm text-slate-400">{departments?.length ?? 0} departments</p>
            </div>
            <button
              type="button"
              onClick={openAdd}
              className="btn-primary flex items-center gap-2"
              aria-label="Add"
            >
              {" "}
              <Plus size={15} /> Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(departments ?? []).map((dept) => (
              <div key={dept.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(dept)}
                      className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(dept.id)}
                      className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 mb-1">{dept.name}</h3>
                {dept.description && (
                  <p className="text-xs text-slate-400 mb-3">{dept.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {dept._count?.members || 0} members
                  </span>
                  {dept.head && (
                    <span>
                      Head: <span className="font-semibold text-slate-700">{dept.head.name}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
            {(departments?.length ?? 0) === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400">
                No departments yet
              </div>
            )}
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">
                {editing ? "Edit Department" : "Add Department"}
              </h3>
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
                  htmlFor="dept-name"
                  className="block text-xs font-bold text-slate-500 uppercase mb-1.5"
                >
                  Name
                </label>
                <input
                  id="dept-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Engineering"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="dept-description"
                  className="block text-xs font-bold text-slate-500 uppercase mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="dept-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Department description"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label
                  htmlFor="dept-head"
                  className="block text-xs font-bold text-slate-500 uppercase mb-1.5"
                >
                  Department Head
                </label>
                <select
                  id="dept-head"
                  value={form.headId}
                  onChange={(e) => setForm({ ...form, headId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none"
                >
                  <option value="">No head</option>
                  {(users ?? []).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
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
                  {submitting ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

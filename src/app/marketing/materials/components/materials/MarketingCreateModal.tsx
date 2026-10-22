"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Loader2, XCircle } from "lucide-react";
import { PRIORITY_OPTIONS, TYPE_OPTIONS } from "./constants";
import type { CreateFormState, MarketingUser } from "./types";

export default function MarketingCreateModal({
  createForm,
  setCreateForm,
  users,
  isCreating,
  onSubmit,
  onClose,
}: {
  createForm: CreateFormState;
  setCreateForm: Dispatch<SetStateAction<CreateFormState>>;
  users: MarketingUser[];
  isCreating: boolean;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Create Marketing Request</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="marketing-title"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Title *
            </label>
            <input
              id="marketing-title"
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              placeholder="e.g., Summer Campaign Banner Design"
            />
          </div>
          <div>
            <label
              htmlFor="marketing-description"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Description *
            </label>
            <textarea
              id="marketing-description"
              required
              rows={4}
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              placeholder="Describe what you need..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="marketing-type"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Type
              </label>
              <select
                id="marketing-type"
                value={createForm.type}
                onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              >
                {TYPE_OPTIONS.filter((t) => t !== "All").map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="marketing-priority"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Priority
              </label>
              <select
                id="marketing-priority"
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              >
                {PRIORITY_OPTIONS.filter((p) => p !== "All").map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="marketing-due-date"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Due Date
              </label>
              <input
                id="marketing-due-date"
                type="date"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="marketing-assignee"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Assign To (Optional)
              </label>
              <select
                id="marketing-assignee"
                value={createForm.assignedTo}
                onChange={(e) => setCreateForm({ ...createForm, assignedTo: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="animate-spin mr-2 inline" size={16} />
                  Creating...
                </>
              ) : (
                "Create Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

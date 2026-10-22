import TaskPriorityStatusFields from "@/components/TaskPriorityStatusFields";
import type { TaskUser } from "./task-types";
import { statuses } from "./task-types";

export interface TaskFormState {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assigneeId: string;
  country: string;
  visaType: string;
}

export default function TaskFormModal({
  form,
  setForm,
  users,
  isSubmitting,
  onSubmit,
  onClose,
}: {
  form: TaskFormState;
  setForm: (form: TaskFormState) => void;
  users: TaskUser[] | undefined;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        aria-label="Close task dialog"
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-100 bg-indigo-50/30">
          <h2 className="text-xl font-black text-slate-800">
            {form.id ? "Edit Task" : "New Task"}
          </h2>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <input
            aria-label="Task Title"
            required
            placeholder="Task Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-indigo-500"
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              aria-label="Assignee"
              value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-600"
            >
              <option value="">Unassigned</option>
              {(users ?? []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <input
              aria-label="Due date"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-600"
            />
          </div>

          <TaskPriorityStatusFields
            priority={form.priority}
            status={form.status}
            statuses={statuses}
            onPriorityChange={(priority) => setForm({ ...form, priority })}
            onStatusChange={(status) => setForm({ ...form, status })}
          />

          <textarea
            aria-label="Description"
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500 resize-none"
          />
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

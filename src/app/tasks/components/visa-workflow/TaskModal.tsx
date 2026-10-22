"use client";

import TaskPriorityStatusFields from "@/components/TaskPriorityStatusFields";
import type { VisaWorkflowController } from "./useVisaWorkflow";
import { statuses } from "./types";

export default function TaskModal({ workflow }: { workflow: VisaWorkflowController }) {
  const { setShowTaskModal, handleTaskSubmit, isSubmitting, taskForm, setTaskForm } = workflow;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        aria-label="Close task dialog"
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={() => setShowTaskModal(false)}
      />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-100 bg-indigo-50/30">
          <h2 className="text-xl font-black text-slate-800">New Task</h2>
        </div>
        <form onSubmit={handleTaskSubmit} className="p-6 space-y-4">
          <input
            aria-label="Task Title"
            required
            placeholder="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-indigo-500"
          />
          <TaskPriorityStatusFields
            priority={taskForm.priority}
            status={taskForm.status}
            statuses={statuses}
            onPriorityChange={(priority) => setTaskForm({ ...taskForm, priority })}
            onStatusChange={(status) => setTaskForm({ ...taskForm, status })}
          />
          <textarea
            aria-label="Description"
            rows={3}
            placeholder="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm focus:border-indigo-500 resize-none"
          />
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowTaskModal(false)}
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

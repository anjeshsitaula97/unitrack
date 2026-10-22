"use client";

import { FileText, User, Trash2, ChevronRight } from "lucide-react";
import type { VisaWorkflowController } from "./useVisaWorkflow";
import { statuses } from "./types";
import { deleteItem } from "./utils";

export default function TaskListTable({ workflow }: { workflow: VisaWorkflowController }) {
  const { tasks, fetchTasks, updateTaskStatus } = workflow;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Task Detail
            </th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Priority
            </th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Status
            </th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Assignee
            </th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-24 text-center">
                <div className="size-16 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <FileText size={24} className="text-indigo-400" />
                </div>
                <p className="text-sm text-slate-500">No tasks found for this workflow.</p>
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                      {task.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-1">
                      {task.description || "No description"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                      task.priority === "Urgent"
                        ? "bg-red-50 text-red-600"
                        : task.priority === "High"
                          ? "bg-amber-50 text-amber-600"
                          : task.priority === "Medium"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="relative w-fit">
                    <select
                      aria-label="Task status"
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="appearance-none text-[9px] font-black uppercase tracking-widest bg-slate-100 text-white hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-[color,background-color,border-color,box-shadow,transform,opacity] outline-none cursor-pointer pr-6"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronRight
                      size={10}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-slate-300 pointer-events-none"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="size-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      <User size={12} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {task.assignee || "Unassigned"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    aria-label="Delete task"
                    type="button"
                    onClick={() => deleteItem("/api/tasks", task.id, fetchTasks)}
                    className="p-2 text-red-800 hover:text-red-500 hover:bg-red-50 rounded-lg transition-[color,background-color,border-color,box-shadow,transform,opacity]"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

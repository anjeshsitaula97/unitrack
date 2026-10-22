"use client";

import { Trash2, User, ChevronRight } from "lucide-react";
import type { VisaWorkflowController } from "./useVisaWorkflow";
import type { Task } from "./types";
import { statuses } from "./types";
import { deleteItem } from "./utils";

export default function TaskBoard({ workflow }: { workflow: VisaWorkflowController }) {
  const { tasks, fetchTasks, updateTaskStatus } = workflow;

  return (
    <div className="flex gap-6 min-h-[600px] overflow-x-auto pb-6 custom-scrollbar">
      {statuses.map((status) => {
        const statusTasks: Task[] = [];
        for (const t of tasks) {
          if (t.status === status) statusTasks.push(t);
        }
        return (
          <div key={status} className="flex flex-col gap-4 min-w-[300px] w-full max-w-[350px]">
            <div className="flex items-center justify-between px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`size-2 rounded-full ${
                    status === "Done"
                      ? "bg-green-500"
                      : status === "In Progress"
                        ? "bg-blue-500"
                        : status === "Review"
                          ? "bg-amber-500"
                          : "bg-slate-300"
                  }`}
                />
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-600">
                  {status}
                </h3>
              </div>
              <span className="bg-slate-50 text-slate-400 text-[10px] font-black px-2.5 py-0.5 rounded-lg border border-slate-100">
                {statusTasks.length}
              </span>
            </div>

            <div className="flex-1 bg-slate-50/30 rounded-[2.5rem] p-4 space-y-4 border border-slate-100/50">
              {statusTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-6 rounded-[1.75rem] shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-[color,background-color,border-color,box-shadow,transform,opacity] group relative"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
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
                    </div>
                    <button
                      aria-label="Delete task"
                      type="button"
                      onClick={() => deleteItem("/api/tasks", task.id, fetchTasks)}
                      className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-[color,background-color,border-color,box-shadow,transform,opacity]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h4 className="text-sm font-black text-slate-800 mb-2 leading-snug group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                    {task.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-6 line-clamp-2">
                    {task.description || "No additional context provided for this objective."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="size-6 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-400">
                        <User size={12} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {task.assignee || "Unassigned"}
                      </span>
                    </div>
                    <div className="relative group/select">
                      <select
                        aria-label="Task status"
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="appearance-none text-[9px] font-black uppercase tracking-widest bg-slate-50 text-white hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-[color,background-color,border-color,box-shadow,transform,opacity] outline-none cursor-pointer pr-6"
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
                  </div>
                </div>
              ))}
              {statusTasks.length === 0 && (
                <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300 italic">
                  Empty column
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

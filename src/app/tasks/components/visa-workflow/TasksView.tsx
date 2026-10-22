"use client";

import { Plus, LayoutGrid, List } from "lucide-react";
import TaskBoard from "./TaskBoard";
import TaskListTable from "./TaskListTable";
import type { VisaWorkflowController } from "./useVisaWorkflow";

export default function TasksView({ workflow }: { workflow: VisaWorkflowController }) {
  const { country, visaType, taskView, setTaskView, setShowTaskModal } = workflow;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mission Control</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage operational tasks for {country} {visaType}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
            <button
              type="button"
              onClick={() => setTaskView("grid")}
              className={`p-2 rounded-lg transition-[color,background-color,border-color,box-shadow,transform,opacity] ${taskView === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="Kanban Board"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setTaskView("list")}
              className={`p-2 rounded-lg transition-[color,background-color,border-color,box-shadow,transform,opacity] ${taskView === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowTaskModal(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-[color,background-color,border-color,box-shadow,transform,opacity] flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Plus size={16} /> New Objective
          </button>
        </div>
      </div>

      {taskView === "grid" ? (
        <TaskBoard workflow={workflow} />
      ) : (
        <TaskListTable workflow={workflow} />
      )}
    </div>
  );
}

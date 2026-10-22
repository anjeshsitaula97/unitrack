"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, Plus, CheckSquare, Search, Filter, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import TaskCard from "./TaskCard";
import TaskFormModal from "./TaskFormModal";
import TaskTable from "./TaskTable";
import { statuses, type Task, type TaskUser } from "./task-types";

export default function TasksContent() {
  const [tasks, setTasks] = useState<Task[] | undefined>(undefined);
  const [users, setUsers] = useState<TaskUser[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [taskView, setTaskView] = useState<"grid" | "list">("grid");

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUser, setFilterUser] = useState<string>("all");

  const [taskForm, setTaskForm] = useState({
    id: "",
    title: "",
    description: "",
    status: "Todo",
    priority: "Medium",
    dueDate: "",
    assigneeId: "",
    country: "",
    visaType: "",
  });

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks"); // Fetch all tasks
      if (res.ok) setTasks(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([fetchTasks(), fetchUsers()]);
    setIsLoading(false);
  };

  const fetchAllDataRef = useRef(fetchAllData);
  useEffect(() => {
    fetchAllDataRef.current();
  }, []);

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const isEdit = !!taskForm.id;
      const method = isEdit ? "PATCH" : "POST";

      const payload = { ...taskForm, id: isEdit ? taskForm.id : undefined };

      const res = await fetch("/api/tasks", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(isEdit ? "Task updated" : "Task created");
        setShowTaskModal(false);
        setTaskForm({
          id: "",
          title: "",
          description: "",
          status: "Todo",
          priority: "Medium",
          dueDate: "",
          assigneeId: "",
          country: "",
          visaType: "",
        });
        fetchTasks();
      }
    } catch (_err) {
      toast.error("Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchTasks();
    } catch (_err) {
      toast.error("Failed to update task status");
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Task deleted");
        fetchTasks();
      }
    } catch (_err) {
      toast.error("Failed to delete task");
    }
  };

  const openEditModal = (task: Task) => {
    setTaskForm({
      id: task.id,
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      assigneeId: task.assigneeId || "",
      country: task.country || "",
      visaType: task.visaType || "",
    });
    setShowTaskModal(true);
  };

  const filteredTasks = (tasks ?? []).filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUser = filterUser === "all" || t.assigneeId === filterUser;
    return matchesSearch && matchesUser;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CheckSquare className="text-indigo-600" />
            Team Tasks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage global tasks and assignments for staff members.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
            <button
              type="button"
              onClick={() => setTaskView("grid")}
              className={`p-2 rounded-lg transition ${taskView === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="Kanban Board"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setTaskView("list")}
              className={`p-2 rounded-lg transition ${taskView === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setTaskForm({
                id: "",
                title: "",
                description: "",
                status: "Todo",
                priority: "Medium",
                dueDate: "",
                assigneeId: "",
                country: "",
                visaType: "",
              });
              setShowTaskModal(true);
            }}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Plus size={18} />
            New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            aria-label="Search tasks..."
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-medium transition"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
            <Filter size={16} className="text-slate-400" />
            <select
              aria-label="Filter tasks by staff member"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="bg-transparent outline-none text-sm font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">All Staff</option>
              {(users ?? []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm font-medium">Loading tasksâ€¦</p>
        </div>
      ) : taskView === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[600px] overflow-x-auto">
          {statuses.map((status) => {
            const statusTasks = [];
            for (const t of filteredTasks) {
              if (t.status === status) statusTasks.push(t);
            }
            return (
              <div key={status} className="flex flex-col gap-4 min-w-[300px]">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      {status}
                    </h3>
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {statusTasks.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 bg-slate-50/50 rounded-[2rem] p-3 space-y-3 border border-slate-200/50 backdrop-blur-sm">
                  {statusTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEditModal}
                      onDelete={deleteTask}
                      onStatusChange={updateTaskStatus}
                    />
                  ))}
                  {statusTasks.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-widest gap-2">
                      <CheckSquare size={16} />
                      No Tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <TaskTable
          tasks={filteredTasks}
          onEdit={openEditModal}
          onDelete={deleteTask}
          onStatusChange={updateTaskStatus}
        />
      )}

      {showTaskModal && (
        <TaskFormModal
          form={taskForm}
          setForm={setTaskForm}
          users={users}
          isSubmitting={isSubmitting}
          onSubmit={handleTaskSubmit}
          onClose={() => setShowTaskModal(false)}
        />
      )}
    </div>
  );
}

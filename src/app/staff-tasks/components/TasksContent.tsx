"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  User as UserIcon,
  CheckSquare,
  Search,
  Filter,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  avatar: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: User | null;
  assigneeId: string | null;
  country: string | null;
  visaType: string | null;
}

const priorityColors: Record<string, string> = {
  Low: "text-slate-400",
  Medium: "text-blue-500",
  High: "text-amber-500",
  Urgent: "text-red-500",
};

const statuses = ["Todo", "In Progress", "Review", "Done"];

export default function TasksContent() {
  const [tasks, setTasks] = useState<Task[] | undefined>(undefined);
  const [users, setUsers] = useState<User[] | undefined>(undefined);
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
              className={`p-2 rounded-lg transition-all ${taskView === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="Kanban Board"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setTaskView("list")}
              className={`p-2 rounded-lg transition-all ${taskView === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
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
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
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
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-medium transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
            <Filter size={16} className="text-slate-400" />
            <select
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
                    <div
                      key={task.id}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex items-start justify-between mb-3">
                        <span
                          className={`text-[9px] font-black uppercase tracking-tighter ${priorityColors[task.priority]}`}
                        >
                          - {task.priority} Priority
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            type="button"
                            onClick={() => openEditModal(task)}
                            className="p-1 text-indigo-800 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-red-800 hover:text-red-500 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-black text-slate-800 mb-2 leading-tight">
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed font-medium">
                        {task.description}
                      </p>

                      {(task.country || task.visaType) && (
                        <div className="mb-4 inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded text-[9px] font-black uppercase tracking-wider">
                          {task.country} {task.visaType ? `- ${task.visaType}` : ""}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-slate-500">
                          {task.assignee ? (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                              {task.assignee.avatar ? (
                                <div className="size-3.5 rounded-full overflow-hidden relative flex-shrink-0">
                                  <Image
                                    src={task.assignee.avatar}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="14px"
                                  />
                                </div>
                              ) : (
                                <UserIcon size={10} />
                              )}
                              <span className="text-[9px] font-black uppercase tracking-tighter">
                                {task.assignee.name}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-400 rounded-lg">
                              <UserIcon size={10} />
                              <span className="text-[9px] font-black uppercase tracking-tighter">
                                Unassigned
                              </span>
                            </div>
                          )}
                        </div>

                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          className="text-[9px] font-black uppercase tracking-widest bg-white border border-slate-100 text-indigo-600 cursor-pointer hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all outline-none"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
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
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <CheckSquare size={40} className="mx-auto mb-4 text-slate-200" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      No tasks found matching your criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-400 font-medium line-clamp-1">
                            {task.description || "No description"}
                          </span>
                          {(task.country || task.visaType) && (
                            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[8px] font-black uppercase">
                              {task.country} {task.visaType ? `| ${task.visaType}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[9px] font-black uppercase tracking-tighter ${priorityColors[task.priority]}`}
                      >
                        - {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="text-[9px] font-black uppercase tracking-widest bg-slate-100 border border-transparent text-indigo-600 cursor-pointer hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all outline-none"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          {task.assignee.avatar ? (
                            <div className="size-6 rounded-lg overflow-hidden relative flex-shrink-0">
                              <Image
                                src={task.assignee.avatar}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="24px"
                              />
                            </div>
                          ) : (
                            <div className="size-6 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-400">
                              <UserIcon size={12} />
                            </div>
                          )}
                          <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600">
                            {task.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          type="button"
                          onClick={() => openEditModal(task)}
                          className="p-2 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-red-800 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setShowTaskModal(false)}
          />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-slate-100 bg-indigo-50/30">
              <h2 className="text-xl font-black text-slate-800">
                {taskForm.id ? "Edit Task" : "New Task"}
              </h2>
            </div>
            <form onSubmit={handleTaskSubmit} className="p-6 space-y-4">
              <input
                required
                placeholder="Task Title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-indigo-500"
              />

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={taskForm.assigneeId}
                  onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
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
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-600"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Priority</option>
                </select>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-600"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
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
      )}
    </div>
  );
}

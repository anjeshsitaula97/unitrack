import Image from "next/image";
import { CheckSquare, Edit2, Trash2, User as UserIcon } from "lucide-react";
import { priorityColors, statuses, type Task } from "./task-types";

export default function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-200">
            {["Task Detail", "Priority", "Status", "Assignee", "Actions"].map((label, index) => (
              <th
                key={label}
                className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${index === 4 ? "text-right" : ""}`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-24 text-center">
                <CheckSquare size={40} className="mx-auto mb-4 text-slate-200" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  No tasks found matching your criteria.
                </p>
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
                    aria-label="Task status"
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value)}
                    className="text-[9px] font-black uppercase tracking-widest bg-slate-100 border border-transparent text-indigo-600 cursor-pointer hover:bg-indigo-50 px-2 py-1 rounded-lg transition outline-none"
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
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      aria-label="Edit task"
                      type="button"
                      onClick={() => onEdit(task)}
                      className="p-2 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      aria-label="Delete task"
                      type="button"
                      onClick={() => onDelete(task.id)}
                      className="p-2 text-red-800 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
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
  );
}

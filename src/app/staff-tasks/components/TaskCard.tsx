import Image from "next/image";
import { Edit2, Trash2, User as UserIcon } from "lucide-react";
import { priorityColors, statuses, type Task } from "./task-types";

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-3">
        <span
          className={`text-[9px] font-black uppercase tracking-tighter ${priorityColors[task.priority]}`}
        >
          - {task.priority} Priority
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            aria-label="Edit task"
            type="button"
            onClick={() => onEdit(task)}
            className="p-1 text-indigo-800 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
          >
            <Edit2 size={12} />
          </button>
          <button
            aria-label="Delete task"
            type="button"
            onClick={() => onDelete(task.id)}
            className="p-1 text-red-800 hover:text-red-500 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <h4 className="text-sm font-black text-slate-800 mb-2 leading-tight">{task.title}</h4>
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
              <span className="text-[9px] font-black uppercase tracking-tighter">Unassigned</span>
            </div>
          )}
        </div>

        <select
          aria-label="Task status"
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="text-[9px] font-black uppercase tracking-widest bg-white border border-slate-100 text-indigo-600 cursor-pointer hover:bg-indigo-50 px-2 py-1 rounded-lg transition outline-none"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

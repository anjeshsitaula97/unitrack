"use client";

export default function TaskPriorityStatusFields({
  priority,
  status,
  statuses,
  onPriorityChange,
  onStatusChange,
}: {
  priority: string;
  status: string;
  statuses: string[];
  onPriorityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <select
        aria-label="Priority"
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-600"
      >
        <option value="Low">Low Priority</option>
        <option value="Medium">Medium Priority</option>
        <option value="High">High Priority</option>
        <option value="Urgent">Urgent Priority</option>
      </select>
      <select
        aria-label="Status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-600"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

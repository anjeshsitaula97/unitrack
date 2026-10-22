"use client";

import { ListChecks, Edit2, Trash2 } from "lucide-react";
import type { VisaWorkflowController } from "./useVisaWorkflow";
import type { VisaChecklist } from "./types";
import { deleteItem, parseDescriptions } from "./utils";

export default function ChecklistRow({
  item,
  workflow,
}: {
  item: VisaChecklist;
  workflow: VisaWorkflowController;
}) {
  const {
    setEditingChecklist,
    setChecklistForm,
    setDescriptionInput,
    setShowChecklistModal,
    fetchChecklists,
  } = workflow;

  const descs = parseDescriptions(item.description);

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`size-8 rounded-lg flex items-center justify-center ${item.isRequired ? "bg-red-50" : "bg-green-50"}`}
          >
            <ListChecks size={16} className={item.isRequired ? "text-red-500" : "text-green-500"} />
          </div>
          <span className="text-sm font-bold text-slate-800">{item.title}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        {descs.length > 0 ? (
          <ul className="space-y-1">
            {descs.map((d: string) => (
              <li key={d} className="text-sm text-slate-500 flex items-start gap-2">
                <span className="mt-1.5 size-1.5 rounded-full bg-slate-300 shrink-0" />
                {d}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </td>
      <td className="px-5 py-4 text-center">
        <span
          className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${item.isRequired ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"}`}
        >
          {item.isRequired ? "Mandatory" : "Optional"}
        </span>
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => {
              setEditingChecklist(item);
              const editDescs = parseDescriptions(item.description);
              setChecklistForm({
                title: item.title,
                descriptions: editDescs,
                isRequired: item.isRequired,
              });
              setDescriptionInput("");
              setShowChecklistModal(true);
            }}
            className="p-2 text-indigo-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-[color,background-color,border-color,box-shadow,transform,opacity]"
            title="Edit requirement"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => deleteItem("/api/visa-checklists", item.id, fetchChecklists)}
            className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-[color,background-color,border-color,box-shadow,transform,opacity]"
            title="Delete requirement"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

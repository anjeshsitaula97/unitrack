"use client";

import { Check, Edit2, Plus, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";
import { type AcademicItem, type AcademicTheme } from "./settings-shared";

export default function AcademicSection({
  title,
  description,
  icon,
  theme,
  items,
  newName,
  setNewName,
  editing,
  setEditing,
  onAdd,
  onUpdate,
  onDelete,
  loading,
  emptyText,
  placeholder,
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  theme: AcademicTheme;
  items: AcademicItem[] | undefined;
  newName: string;
  setNewName: (value: string) => void;
  editing: AcademicItem | null;
  setEditing: (value: AcademicItem | null) => void;
  onAdd: () => void;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  loading: boolean;
  emptyText: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`size-8 rounded-lg flex items-center justify-center ${theme.iconWrap}`}>
          {icon}
        </div>
        <h3 className="font-bold text-slate-700">{title}</h3>
        {description && <p className="text-xs text-slate-400 ml-2">{description}</p>}
      </div>

      <div className="card p-5">
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className={`flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ${theme.focus} outline-none text-sm`}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
          />
          <button
            type="button"
            onClick={onAdd}
            aria-label="Add"
            className={`p-2.5 text-white rounded-xl transition ${theme.addButton}`}
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
          {(items ?? []).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group transition hover:bg-white hover:shadow-sm"
            >
              {editing?.id === item.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    aria-label={`${title} name`}
                    className={`flex-1 px-2 py-1 bg-white border ${theme.editBorder} rounded-lg outline-none text-sm`}
                    onKeyDown={(e) => e.key === "Enter" && onUpdate()}
                  />
                  <button
                    type="button"
                    onClick={onUpdate}
                    aria-label="Check"
                    className="text-emerald-500 p-1 hover:bg-emerald-50 rounded"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    aria-label="Cancel"
                    className="text-slate-400 p-1 hover:bg-slate-100 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-semibold text-slate-600">{item.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setEditing(item)}
                      aria-label={`Edit ${item.name}`}
                      className={`p-1.5 rounded-lg ${theme.editButton}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      aria-label={`Delete ${item.name}`}
                      className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {(items?.length ?? 0) === 0 && !loading && (
            <div className="py-8 text-center text-slate-400 text-xs italic">{emptyText}</div>
          )}
        </div>
      </div>
    </div>
  );
}

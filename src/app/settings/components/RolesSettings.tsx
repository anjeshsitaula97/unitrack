"use client";

import { useEffect, useRef, useState } from "react";
import { Edit2, Loader2, Plus, Shield, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { loadRoles, parsePermissionList, type Role } from "./settings-shared";
import SettingsHeader from "./SettingsHeader";

const EMPTY_ROLE = {
  name: "",
  description: "",
  color: "text-slate-600 bg-slate-50 border-slate-200",
};

const ROLE_COLORS = [
  { value: "text-rose-600 bg-rose-50 border-rose-200", label: "Rose" },
  { value: "text-indigo-600 bg-indigo-50 border-indigo-200", label: "Indigo" },
  { value: "text-emerald-600 bg-emerald-50 border-emerald-200", label: "Emerald" },
  { value: "text-slate-600 bg-slate-50 border-slate-200", label: "Slate" },
  { value: "text-amber-600 bg-amber-50 border-amber-200", label: "Amber" },
  { value: "text-violet-600 bg-violet-50 border-violet-200", label: "Violet" },
  { value: "text-cyan-600 bg-cyan-50 border-cyan-200", label: "Cyan" },
  { value: "text-orange-600 bg-orange-50 border-orange-200", label: "Orange" },
  { value: "text-pink-600 bg-pink-50 border-pink-200", label: "Pink" },
  { value: "text-teal-600 bg-teal-50 border-teal-200", label: "Teal" },
];

const addInputClass =
  "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition";
const editInputClass =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300";
const addLabelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";
const editLabelClass = "block text-xs font-semibold text-slate-600 mb-1.5";

export default function RolesSettings({
  onManagePermissions,
}: {
  onManagePermissions: () => void;
}) {
  const [roles, setRoles] = useState<Role[]>([]);
  const rolePermissionsRef = useRef<Record<string, string[]>>({});
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState(EMPTY_ROLE);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const busyRef = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    loadRoles(ac.signal)
      .then(({ roles: loaded, permissions }) => {
        setRoles(loaded);
        rolePermissionsRef.current = permissions;
        setIsLoadingRoles(false);
      })
      .catch(() => {
        setIsLoadingRoles(false);
      });
    return () => ac.abort();
  }, []);

  const handleAddRole = async () => {
    if (busyRef.current) return;
    if (!newRole.name) {
      toast.error("Role name is required");
      return;
    }
    busyRef.current = true;
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newRole, permissions: [] }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to create role");
        return;
      }
      const data = await res.json();
      const newRoleData: Role = {
        ...data,
        id: Number(data.id),
        userCount: 0,
        permissions: parsePermissionList(data.permissions),
      };
      setRoles([...roles, newRoleData]);
      rolePermissionsRef.current = { ...rolePermissionsRef.current, [String(data.id)]: [] };
      setNewRole(EMPTY_ROLE);
      setShowAddRole(false);
      toast.success("New role created");
    } catch (_err) {
      toast.error("Error creating role");
    } finally {
      busyRef.current = false;
    }
  };

  const handleUpdateRole = async () => {
    if (busyRef.current) return;
    if (!editingRole || !editingRole.name) return;
    busyRef.current = true;
    try {
      const res = await fetch(`/api/roles/${editingRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingRole.name,
          description: editingRole.description,
          color: editingRole.color,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to update role");
        return;
      }
      const data = await res.json();
      const updatedRole: Role = {
        ...data,
        id: Number(data.id),
        userCount: data.userCount || 0,
        permissions: parsePermissionList(data.permissions),
      };
      setRoles(roles.map((r) => (r.id === editingRole.id ? updatedRole : r)));
      setEditingRole(null);
      toast.success("Role updated");
    } catch (_err) {
      toast.error("Error updating role");
    } finally {
      busyRef.current = false;
    }
  };

  const handleDeleteRole = async (id: number | string) => {
    if (busyRef.current) return;
    if (!confirm("Are you sure you want to delete this role?")) return;
    busyRef.current = true;
    try {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRoles(roles.filter((r) => r.id !== id));
        toast.success("Role deleted");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to delete role");
      }
    } catch (_err) {
      toast.error("Error deleting role");
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <SettingsHeader
          icon={<Shield size={18} />}
          title="Platform Roles"
          description="Manage user roles and their general descriptions."
        />
        <button
          type="button"
          onClick={() => setShowAddRole(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add New Role
        </button>
      </div>

      {showAddRole && (
        <AddRoleForm
          newRole={newRole}
          setNewRole={setNewRole}
          onAdd={handleAddRole}
          onClose={() => setShowAddRole(false)}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {isLoadingRoles ? (
          <div className="xl:col-span-2 flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-indigo-600" size={24} />
          </div>
        ) : roles.length === 0 ? (
          <div className="xl:col-span-2 text-center py-8 text-sm text-slate-400">
            No roles found. Create a role to get started.
          </div>
        ) : (
          roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={() => setEditingRole(role)}
              onDelete={() => handleDeleteRole(role.id)}
              onManagePermissions={onManagePermissions}
            />
          ))
        )}
      </div>

      {editingRole && (
        <EditRoleDialog
          role={editingRole}
          setRole={setEditingRole}
          onSave={handleUpdateRole}
          onClose={() => setEditingRole(null)}
        />
      )}
    </div>
  );
}

function AddRoleForm({
  newRole,
  setNewRole,
  onAdd,
  onClose,
}: {
  newRole: typeof EMPTY_ROLE;
  setNewRole: (value: typeof EMPTY_ROLE) => void;
  onAdd: () => void;
  onClose: () => void;
}) {
  return (
    <div className="card p-6 border-2 border-indigo-100 animate-slide-down">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">Construct New Role</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="settings-addRole-name" className={addLabelClass}>
            Role Name
          </label>
          <input
            id="settings-addRole-name"
            type="text"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            placeholder="e.g. Content Manager"
            className={addInputClass}
          />
        </div>
        <div>
          <label htmlFor="settings-addRole-description" className={addLabelClass}>
            Description
          </label>
          <input
            id="settings-addRole-description"
            type="text"
            value={newRole.description}
            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
            placeholder="What can this role do?"
            className={addInputClass}
          />
        </div>
        <div>
          <label htmlFor="settings-addRole-color" className={addLabelClass}>
            Color Theme
          </label>
          <select
            id="settings-addRole-color"
            value={newRole.color}
            onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
            className={addInputClass}
          >
            {ROLE_COLORS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="button" onClick={onAdd} className="btn-primary">
          Create Role
        </button>
      </div>
    </div>
  );
}

function RoleCard({
  role,
  onEdit,
  onDelete,
  onManagePermissions,
}: {
  role: Role;
  onEdit: () => void;
  onDelete: () => void;
  onManagePermissions: () => void;
}) {
  return (
    <div className="card p-5 group hover:shadow-md transition duration-300">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${role.color}`}
        >
          {role.name}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${role.name}`}
            className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${role.name}`}
            className="p-1.5 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-700 mb-1">{role.name}</p>
      <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">
        {role.description || "No description"}
      </p>
      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Users size={14} />
          <span>{role.userCount} Active Users</span>
        </div>
        <button
          type="button"
          onClick={onManagePermissions}
          className="text-xs font-bold text-indigo-600 hover:underline"
        >
          Manage Permissions
        </button>
      </div>
    </div>
  );
}

function EditRoleDialog({
  role,
  setRole,
  onSave,
  onClose,
}: {
  role: Role;
  setRole: (value: Role | null) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">Edit Platform Role</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="settings-editRole-name" className={editLabelClass}>
              Role Name
            </label>
            <input
              id="settings-editRole-name"
              type="text"
              value={role.name}
              onChange={(e) => setRole({ ...role, name: e.target.value })}
              className={editInputClass}
            />
          </div>
          <div>
            <label htmlFor="settings-editRole-description" className={editLabelClass}>
              Description
            </label>
            <textarea
              id="settings-editRole-description"
              value={role.description || ""}
              onChange={(e) => setRole({ ...role, description: e.target.value })}
              rows={3}
              className={`${editInputClass} resize-none`}
            />
          </div>
          <div>
            <label htmlFor="settings-editRole-color" className={editLabelClass}>
              Color Theme
            </label>
            <select
              id="settings-editRole-color"
              value={role.color}
              onChange={(e) => setRole({ ...role, color: e.target.value })}
              className={editInputClass}
            >
              {ROLE_COLORS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={onSave} className="btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

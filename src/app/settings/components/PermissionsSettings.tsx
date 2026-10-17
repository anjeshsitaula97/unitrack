"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { resolvePermissions } from "@/lib/permissions";
import { loadRoles, PERMISSIONS, type Role } from "./settings-shared";
import SettingsHeader from "./SettingsHeader";

export default function PermissionsSettings() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const busyRef = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    loadRoles(ac.signal)
      .then(({ roles: loaded, permissions }) => {
        setRoles(loaded);
        setRolePermissions(permissions);
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const togglePermission = async (roleId: string, permissionId: string) => {
    if (busyRef.current) return;
    const role = roles.find((r) => String(r.id) === roleId);
    const current = rolePermissions[roleId] || [];
    let updated: string[];

    if (current.includes(permissionId)) {
      updated = current.filter((id) => id !== permissionId);
    } else {
      updated = [...current, permissionId];
    }

    busyRef.current = true;
    // Optimistic update
    setRolePermissions((prev) => ({ ...prev, [roleId]: updated }));

    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: updated }),
      });
      if (res.ok) {
        // Re-resolve so the displayed state always matches enforcement (an
        // empty persisted list deliberately falls back to the defaults).
        setRolePermissions((prev) => ({
          ...prev,
          [roleId]: [...resolvePermissions(role?.name || "", updated)],
        }));
        toast.success("Permission updated");
      } else {
        throw new Error();
      }
    } catch (_err) {
      // Revert on error
      setRolePermissions((prev) => ({ ...prev, [roleId]: current }));
      toast.error("Failed to update permission");
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsHeader
        icon={<ShieldCheck size={18} />}
        title="Role Permissions"
        description="Configure granular access levels for each platform role."
      />

      <div className="card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[240px]">
                  Permission
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap"
                  >
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupPermissions(PERMISSIONS).map((group) => (
                <Fragment key={group.module}>
                  <tr className="bg-indigo-50/40">
                    <td
                      colSpan={1 + roles.length}
                      className="px-4 py-2 text-[10px] font-black text-indigo-700 uppercase tracking-widest"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 rounded-full bg-indigo-400" />
                        {group.module}
                      </div>
                    </td>
                  </tr>
                  {group.perms.map((perm) => (
                    <tr
                      key={perm.id}
                      className="hover:bg-slate-50/50 transition-colors border-b border-slate-100/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] font-bold text-slate-700">
                            {perm.name
                              .split(":")[1]
                              ?.replace(/_/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                          {perm.description}
                        </p>
                      </td>
                      {roles.map((role) => {
                        const roleIdStr = String(role.id);
                        const hasPerm = rolePermissions[roleIdStr]?.includes(perm.id);
                        return (
                          <td key={`${role.id}-${perm.id}`} className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => togglePermission(roleIdStr, perm.id)}
                              aria-label={`${hasPerm ? "Revoke" : "Grant"} ${perm.name} for ${role.name}`}
                              className={`size-8 rounded-xl flex items-center justify-center mx-auto transition ${
                                hasPerm
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  : "bg-slate-50 text-slate-300 border border-slate-100 hover:border-slate-200"
                              }`}
                            >
                              {hasPerm ? <Check size={14} strokeWidth={3} /> : <Lock size={12} />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function groupPermissions(permissions: typeof PERMISSIONS) {
  return permissions.reduce<{ module: string; perms: typeof PERMISSIONS }[]>((groups, perm) => {
    const last = groups[groups.length - 1];
    if (last && last.module === perm.module) last.perms.push(perm);
    else groups.push({ module: perm.module, perms: [perm] });
    return groups;
  }, []);
}

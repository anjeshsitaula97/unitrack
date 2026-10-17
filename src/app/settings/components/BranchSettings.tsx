"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Edit2, Mail, MapPin, Phone, Plus, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { loadBranches, loadLocalization, type Branch } from "./settings-shared";

interface NewBranchState {
  name: string;
  location: string;
  manager: string;
  phone: string;
  email: string;
  status: string;
  latitude: string;
  longitude: string;
  logo: string;
}

const EMPTY_BRANCH: NewBranchState = {
  name: "",
  location: "",
  manager: "",
  phone: "",
  email: "",
  status: "Active",
  latitude: "",
  longitude: "",
  logo: "",
};

const baseFieldClass =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition";
const editFieldClass =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300";
const addLabelClass =
  "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1";
const editLabelClass = "block text-xs font-semibold text-slate-600 mb-1.5";

export default function BranchSettings({ onGoToLocalization }: { onGoToLocalization: () => void }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [enableBranches, setEnableBranches] = useState(false);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [newBranch, setNewBranch] = useState<NewBranchState>(EMPTY_BRANCH);
  const busyRef = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    loadBranches(ac.signal)
      .then((data) => setBranches(data))
      .catch(() => {});
    loadLocalization(ac.signal)
      .then((result) => {
        if (result) setEnableBranches(result.settings.enableBranches);
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const handleBranchLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (isEdit) {
        setEditingBranch((prev) => (prev ? { ...prev, logo: data.url } : prev));
      } else {
        setNewBranch((prev) => ({ ...prev, logo: data.url }));
      }
    } catch {
      toast.error("Failed to upload logo");
    }
  };

  const handleAddBranch = async () => {
    if (busyRef.current) return;
    if (!newBranch.name) {
      toast.error("Branch name is required");
      return;
    }
    busyRef.current = true;
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBranch),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to add branch");
        return;
      }
      const data = await res.json();
      setBranches([data, ...branches]);
      setNewBranch(EMPTY_BRANCH);
      setShowAddBranch(false);
      toast.success("Branch added successfully");
    } catch (_err) {
      toast.error("Error adding branch");
    } finally {
      busyRef.current = false;
    }
  };

  const handleUpdateBranch = async () => {
    if (busyRef.current) return;
    if (!editingBranch || !editingBranch.name) return;
    busyRef.current = true;
    try {
      const res = await fetch(`/api/branches/${editingBranch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBranch),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to update branch");
        return;
      }
      const data = await res.json();
      setBranches(branches.map((b) => (b.id === editingBranch.id ? data : b)));
      setEditingBranch(null);
      toast.success("Branch updated successfully");
    } catch (_err) {
      toast.error("Error updating branch");
    } finally {
      busyRef.current = false;
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (busyRef.current) return;
    if (!confirm("Are you sure you want to delete this branch?")) return;
    busyRef.current = true;
    try {
      const res = await fetch(`/api/branches/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBranches(branches.filter((b) => b.id !== id));
        toast.success("Branch deleted");
      } else {
        toast.error("Failed to delete branch");
      }
    } catch (_err) {
      toast.error("Error deleting branch");
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <MapPin size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Branch Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your consultancy office locations and branches.
            </p>
          </div>
        </div>
        {enableBranches ? (
          <button
            type="button"
            onClick={() => setShowAddBranch(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Branch
          </button>
        ) : (
          <div className="px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-100">
            Branches Disabled in Localization
          </div>
        )}
      </div>

      {!enableBranches && (
        <div className="card p-12 text-center bg-slate-50/50 border-dashed border-2 border-slate-200">
          <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <MapPin size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Branches Feature is Disabled</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 mb-6">
            To manage multiple branches, you first need to enable the &quot;Multi-branch
            Management&quot; toggle in the Localization settings.
          </p>
          <button
            type="button"
            onClick={onGoToLocalization}
            className="btn-secondary text-indigo-600 border-indigo-100 hover:bg-indigo-50"
          >
            Go to Localization Settings
          </button>
        </div>
      )}

      {enableBranches && (
        <>
          {showAddBranch && (
            <AddBranchForm
              newBranch={newBranch}
              setNewBranch={setNewBranch}
              onUpload={handleBranchLogoUpload}
              onSubmit={handleAddBranch}
              onClose={() => setShowAddBranch(false)}
            />
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {branches.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400">
                No branches found. Add your first branch location.
              </div>
            ) : (
              branches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  onEdit={() => setEditingBranch(branch)}
                  onDelete={() => handleDeleteBranch(branch.id)}
                />
              ))
            )}
          </div>
        </>
      )}

      {editingBranch && (
        <EditBranchDialog
          branch={editingBranch}
          setBranch={setEditingBranch}
          onUpload={handleBranchLogoUpload}
          onSubmit={handleUpdateBranch}
          onClose={() => setEditingBranch(null)}
        />
      )}
    </div>
  );
}

function BranchCard({
  branch,
  onEdit,
  onDelete,
}: {
  branch: Branch;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="card p-6 group hover:shadow-lg transition duration-300 shadow-[inset_0_0_0_1px_theme(colors.indigo.200)]">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {branch.logo ? (
            <div className="size-10 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 relative">
              <Image
                src={branch.logo}
                alt={`${branch.name} logo`}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm flex-shrink-0">
              {branch.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{branch.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin size={12} className="text-slate-400" />
              {branch.location || "No address provided"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${branch.name}`}
            className="p-2 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
          >
            <Edit2 size={18} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${branch.name}`}
            className="p-2 text-red-800 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-3 mt-4 pt-4 border-t border-slate-50">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manager</p>
          <p className="text-xs font-semibold text-slate-700">{branch.manager || "N/A"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              branch.status === "Active"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {branch.status}
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Mail size={12} className="text-slate-400" />
            {branch.email || "N/A"}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Phone size={12} className="text-slate-400" />
            {branch.phone || "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddBranchForm({
  newBranch,
  setNewBranch,
  onUpload,
  onSubmit,
  onClose,
}: {
  newBranch: NewBranchState;
  setNewBranch: React.Dispatch<React.SetStateAction<NewBranchState>>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, isEdit?: boolean) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="card p-6 border-2 border-indigo-100 animate-slide-down">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800">Add New Branch</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="settings-addBranch-name" className={addLabelClass}>
            Branch Name
          </label>
          <input
            id="settings-addBranch-name"
            type="text"
            value={newBranch.name}
            onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
            placeholder="e.g. London Head Office"
            className={baseFieldClass}
          />
        </div>
        <div>
          <label htmlFor="settings-addBranch-logo" className={addLabelClass}>
            Branch Logo
          </label>
          <div className="flex items-center gap-3">
            {newBranch.logo ? (
              <div className="relative size-12 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                <Image src={newBranch.logo} alt="Logo" fill sizes="48px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setNewBranch({ ...newBranch, logo: "" })}
                  aria-label="Remove logo"
                  className="absolute -top-1 -right-1 size-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X size={10} />
                </button>
              </div>
            ) : (
              <div className="size-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 flex-shrink-0">
                <Building2 size={20} />
              </div>
            )}
            <label
              htmlFor="settings-addBranch-logo"
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-pointer hover:bg-slate-100 transition"
            >
              <Upload size={14} />
              Upload Logo
              <input
                id="settings-addBranch-logo"
                type="file"
                aria-label="Upload branch logo"
                className="hidden"
                accept="image/*"
                onChange={(e) => onUpload(e, false)}
              />
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="settings-addBranch-location" className={addLabelClass}>
            Location / Address
          </label>
          <input
            id="settings-addBranch-location"
            type="text"
            value={newBranch.location}
            onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
            placeholder="e.g. 123 Baker St, London"
            className={baseFieldClass}
          />
        </div>
        <div>
          <label htmlFor="settings-addBranch-manager" className={addLabelClass}>
            Branch Manager
          </label>
          <input
            id="settings-addBranch-manager"
            type="text"
            value={newBranch.manager}
            onChange={(e) => setNewBranch({ ...newBranch, manager: e.target.value })}
            placeholder="Manager Name"
            className={baseFieldClass}
          />
        </div>
        <div>
          <label htmlFor="settings-addBranch-email" className={addLabelClass}>
            Contact Email
          </label>
          <input
            id="settings-addBranch-email"
            type="email"
            value={newBranch.email}
            onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
            placeholder="branch@example.com"
            className={baseFieldClass}
          />
        </div>
        <div>
          <label htmlFor="settings-addBranch-phone" className={addLabelClass}>
            Phone Number
          </label>
          <input
            id="settings-addBranch-phone"
            type="text"
            value={newBranch.phone}
            onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
            placeholder="+44 ..."
            className={baseFieldClass}
          />
        </div>
        <div>
          <label htmlFor="settings-addBranch-status" className={addLabelClass}>
            Status
          </label>
          <select
            id="settings-addBranch-status"
            value={newBranch.status}
            onChange={(e) => setNewBranch({ ...newBranch, status: e.target.value })}
            className={`${baseFieldClass} appearance-none`}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label htmlFor="settings-addBranch-latitude" className={addLabelClass}>
            Latitude (geofence)
          </label>
          <input
            id="settings-addBranch-latitude"
            type="number"
            step="any"
            value={newBranch.latitude}
            onChange={(e) => setNewBranch({ ...newBranch, latitude: e.target.value })}
            placeholder="e.g. 40.7128"
            className={`${baseFieldClass} text-sm`}
          />
        </div>
        <div>
          <label htmlFor="settings-addBranch-longitude" className={addLabelClass}>
            Longitude (geofence)
          </label>
          <input
            id="settings-addBranch-longitude"
            type="number"
            step="any"
            value={newBranch.longitude}
            onChange={(e) => setNewBranch({ ...newBranch, longitude: e.target.value })}
            placeholder="e.g. -74.0060"
            className={`${baseFieldClass} text-sm`}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="button" onClick={onSubmit} className="btn-primary">
          Add Branch
        </button>
      </div>
    </div>
  );
}

function EditBranchDialog({
  branch,
  setBranch,
  onUpload,
  onSubmit,
  onClose,
}: {
  branch: Branch;
  setBranch: (value: Branch | null) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, isEdit?: boolean) => void;
  onSubmit: () => void;
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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">Edit Branch Details</h3>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="settings-editBranch-name" className={editLabelClass}>
                Branch Name
              </label>
              <input
                id="settings-editBranch-name"
                type="text"
                value={branch.name}
                onChange={(e) => setBranch({ ...branch, name: e.target.value })}
                className={editFieldClass}
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="settings-editBranch-logo" className={editLabelClass}>
                Branch Logo
              </label>
              <div className="flex items-center gap-3">
                {branch.logo ? (
                  <div className="relative size-14 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                    <Image
                      src={branch.logo}
                      alt="Logo"
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setBranch({ ...branch, logo: "" })}
                      aria-label="Remove logo"
                      className="absolute -top-1.5 -right-1.5 size-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="size-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 flex-shrink-0">
                    <Building2 size={24} />
                  </div>
                )}
                <label
                  htmlFor="settings-editBranch-logo"
                  className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer hover:bg-slate-100 transition"
                >
                  <Upload size={14} />
                  Upload Logo
                  <input
                    id="settings-editBranch-logo"
                    type="file"
                    aria-label="Upload branch logo"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => onUpload(e, true)}
                  />
                </label>
              </div>
            </div>
            <div className="col-span-2">
              <label htmlFor="settings-editBranch-location" className={editLabelClass}>
                Location
              </label>
              <input
                id="settings-editBranch-location"
                type="text"
                value={branch.location}
                onChange={(e) => setBranch({ ...branch, location: e.target.value })}
                className={editFieldClass}
              />
            </div>
            <div>
              <label htmlFor="settings-editBranch-manager" className={editLabelClass}>
                Manager
              </label>
              <input
                id="settings-editBranch-manager"
                type="text"
                value={branch.manager}
                onChange={(e) => setBranch({ ...branch, manager: e.target.value })}
                className={editFieldClass}
              />
            </div>
            <div>
              <label htmlFor="settings-editBranch-status" className={editLabelClass}>
                Status
              </label>
              <select
                id="settings-editBranch-status"
                value={branch.status}
                onChange={(e) => setBranch({ ...branch, status: e.target.value })}
                className={editFieldClass}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label htmlFor="settings-editBranch-email" className={editLabelClass}>
                Email
              </label>
              <input
                id="settings-editBranch-email"
                type="email"
                value={branch.email}
                onChange={(e) => setBranch({ ...branch, email: e.target.value })}
                className={editFieldClass}
              />
            </div>
            <div>
              <label htmlFor="settings-editBranch-phone" className={editLabelClass}>
                Phone
              </label>
              <input
                id="settings-editBranch-phone"
                type="text"
                value={branch.phone}
                onChange={(e) => setBranch({ ...branch, phone: e.target.value })}
                className={editFieldClass}
              />
            </div>
            <div>
              <label htmlFor="settings-editBranch-latitude" className={editLabelClass}>
                Latitude (geofence)
              </label>
              <input
                id="settings-editBranch-latitude"
                type="number"
                step="any"
                value={branch.latitude ?? ""}
                onChange={(e) =>
                  setBranch({
                    ...branch,
                    latitude: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                className={editFieldClass}
              />
            </div>
            <div>
              <label htmlFor="settings-editBranch-longitude" className={editLabelClass}>
                Longitude (geofence)
              </label>
              <input
                id="settings-editBranch-longitude"
                type="number"
                step="any"
                value={branch.longitude ?? ""}
                onChange={(e) =>
                  setBranch({
                    ...branch,
                    longitude: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                className={editFieldClass}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={onSubmit} className="btn-primary">
              Update Branch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

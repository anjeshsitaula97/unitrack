"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { EMPTY_FORM, type Consultancy, type FormState } from "./types";
import { emptySubscribe, readActiveCookie, toDateInput } from "./utils";

export function useConsultancies() {
  const [consultancies, setConsultancies] = useState<Consultancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const activeId = useSyncExternalStore(emptySubscribe, readActiveCookie, () => "all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Consultancy | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/consultancies", { cache: "no-store" });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setConsultancies(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load consultancies");
      setConsultancies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (c: Consultancy) => {
    setEditing(c);
    setForm({
      name: c.name || "",
      status: c.status || "Active",
      email: c.email || "",
      phone: c.phone || "",
      website: c.website || "",
      address: c.address || "",
      logoUrl: c.logoUrl || "",
      packageName: c.packageName || "",
      packageStartDate: toDateInput(c.packageStartDate),
      packageExpiryDate: toDateInput(c.packageExpiryDate),
      maxUsers: c.maxUsers != null ? String(c.maxUsers) : "",
    });
    setModalOpen(true);
  };

  const handleLogoUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to upload logo");
        return;
      }
      const data = await res.json().catch(() => null);
      setForm((f) => ({ ...f, logoUrl: data.url }));
      toast.success("Logo uploaded");
    } catch {
      toast.error("Error uploading logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) {
      toast.error("Consultancy name is required");
      return;
    }

    setIsSaving(true);
    const payload = {
      name,
      status: form.status,
      email: form.email.trim(),
      phone: form.phone.trim(),
      website: form.website.trim(),
      address: form.address.trim(),
      logoUrl: form.logoUrl.trim(),
      packageName: form.packageName.trim(),
      packageStartDate: form.packageStartDate || "",
      packageExpiryDate: form.packageExpiryDate || "",
      maxUsers: form.maxUsers.trim(),
    };

    try {
      const res = await fetch(editing ? `/api/consultancies/${editing.id}` : "/api/consultancies", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to save consultancy");
        return;
      }
      toast.success(editing ? "Consultancy updated" : "Consultancy created");
      setModalOpen(false);
      await load();
    } catch {
      toast.error("Error connecting to backend");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (c: Consultancy) => {
    if (
      !confirm(
        `Delete "${c.name}" (${c.code})? This permanently removes the consultancy and its default roles and settings.`
      )
    )
      return;

    setBusyId(c.id);
    try {
      const res = await fetch(`/api/consultancies/${c.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to delete consultancy");
        return;
      }
      toast.success("Consultancy deleted");
      if (activeId === String(c.id)) {
        document.cookie = "active_consultancy=all; path=/; max-age=0";
        window.location.reload();
        return;
      }
      await load();
    } catch {
      toast.error("Error connecting to backend");
    } finally {
      setBusyId(null);
    }
  };

  const switchTo = (value: string) => {
    document.cookie = `active_consultancy=${encodeURIComponent(value)}; path=/; max-age=${
      60 * 60 * 24 * 365
    }`;
    toast.success(value === "all" ? "Viewing all consultancies" : "Switched consultancy");
    // Reload so every server-rendered surface re-scopes to the selection.
    window.location.reload();
  };

  const isActive = (c: Consultancy) => activeId === String(c.id);

  return {
    consultancies,
    isLoading,
    activeId,
    modalOpen,
    setModalOpen,
    editing,
    form,
    setForm,
    isSaving,
    isUploading,
    busyId,
    fileInputRef,
    openCreate,
    openEdit,
    handleLogoUpload,
    handleSave,
    handleDelete,
    switchTo,
    isActive,
  };
}

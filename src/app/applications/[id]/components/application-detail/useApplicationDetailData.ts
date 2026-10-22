"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { api } from "@/lib/fetch-client";
import {
  DEFAULT_APPLICATION_STATUSES,
  getApplicationStatuses,
  type ApplicationStatus,
} from "@/lib/application-statuses";
import type { ApplicationDetail, StudentDoc } from "./types";

export function useApplicationDetailData(id: string) {
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [appStatuses, setAppStatuses] = useState<ApplicationStatus[]>(DEFAULT_APPLICATION_STATUSES);
  const [docs, setDocs] = useState<StudentDoc[]>([]);
  const [appCount, setAppCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [academicDocNames, setAcademicDocNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<string | null>(null);
  const docActionBusyRef = useRef(false);
  const [uploadingReq, setUploadingReq] = useState<string | null>(null);

  const handleUploadClick = (reqName: string) => {
    uploadTargetRef.current = reqName;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const reqName = uploadTargetRef.current;
    e.target.value = "";
    if (!file || !reqName) return;
    setUploadingReq(reqName);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!upRes.ok) {
        const err = await upRes.json();
        toast.error(err.error || "Upload failed");
        return;
      }
      const up = await upRes.json();
      const res = await fetch(`/api/students/${detail?.studentId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reqName,
          url: up.url,
          fileSize: file.size,
          fileType: file.type || "",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to save document");
        return;
      }
      const doc = await res.json();
      setDocs((prev) => [...prev, doc]);
      toast.success(`${reqName} uploaded`);
    } catch {
      toast.error("Error uploading document");
    } finally {
      setUploadingReq(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (!cancelled) setLoading(true);
        return api.get<ApplicationDetail>(`/api/applications/${id}`, { showError: false });
      })
      .then((app) => {
        if (cancelled) return;
        setDetail(app);
        return Promise.all([
          api
            .get<{ documents?: StudentDoc[] }>(`/api/students/${app.studentId}`, {
              showError: false,
            })
            .catch(() => null),
          api
            .get<{ total?: number; data?: unknown[] } | unknown[]>(
              `/api/applications?studentId=${app.studentId}`,
              { showError: false }
            )
            .catch(() => null),
          api
            .get<Array<{ name: string }>>("/api/academic-documents", { showError: false })
            .catch(() => null),
          api
            .get<{ statuses?: unknown }>("/api/settings/application-statuses", { showError: false })
            .catch(() => null),
        ]).then(([student, apps, acadDocs, statusData]) => {
          if (cancelled) return;
          if (student) setDocs(Array.isArray(student.documents) ? student.documents : []);
          if (apps) {
            if (!Array.isArray(apps) && typeof apps.total === "number") {
              setAppCount(apps.total || 1);
            } else {
              const list = Array.isArray(apps) ? apps : apps.data || [];
              setAppCount(list.length || 1);
            }
          }
          if (acadDocs) {
            setAcademicDocNames(Array.isArray(acadDocs) ? acadDocs.map((d) => d.name) : []);
          }
          if (statusData?.statuses) {
            setAppStatuses(getApplicationStatuses(JSON.stringify(statusData.statuses)));
          }
        });
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load application details");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const setDocStatus = async (docId: string, status: "Approved" | "Rejected") => {
    if (docActionBusyRef.current) return;
    docActionBusyRef.current = true;
    try {
      const res = await fetch(`/api/students/documents/${docId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, status: updated.status } : d)));
        toast.success(`Document ${status.toLowerCase()}`);
      } else {
        toast.error(`Failed to ${status === "Approved" ? "approve" : "reject"} document`);
      }
    } catch {
      toast.error(`Failed to ${status === "Approved" ? "approve" : "reject"} document`);
    } finally {
      docActionBusyRef.current = false;
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!detail || status === detail.status) {
      setManageOpen(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDetail((prev) =>
          prev ? { ...prev, status: updated.status, updatedAt: updated.updatedAt } : null
        );
        toast.success(`Status updated to ${updated.status}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
      setManageOpen(false);
    }
  };

  return {
    detail,
    appStatuses,
    docs,
    appCount,
    loading,
    saving,
    manageOpen,
    setManageOpen,
    academicDocNames,
    fileInputRef,
    uploadingReq,
    handleUploadClick,
    handleFileSelected,
    setDocStatus,
    handleStatusUpdate,
  };
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { BranchSummary, Student, UserSummary } from "./types";

export function useStudents() {
  const [students, setStudents] = useState<Student[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<BranchSummary[] | undefined>(undefined);
  const [allUsers, setAllUsers] = useState<UserSummary[] | undefined>(undefined);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<Student | null>(null);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load students: ${res.status}`);
      const data = await res.json();
      if (data && data.data && Array.isArray(data.data)) {
        setStudents(data.data);
      } else if (Array.isArray(data)) {
        setStudents(data);
      }
    } catch (_err) {
      toast.error("Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const [studentsRes, provincesRes, branchesRes, usersRes] = await Promise.all([
          fetch("/api/students", { cache: "no-store", signal: controller.signal }),
          fetch("/api/nepal/provinces", { signal: controller.signal }),
          fetch("/api/branches", { signal: controller.signal }),
          fetch("/api/users", { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        if (studentsRes.ok) {
          const data = await studentsRes.json();
          if (data && data.data && Array.isArray(data.data)) {
            setStudents(data.data);
          } else if (Array.isArray(data)) {
            setStudents(data);
          }
        }
        if (provincesRes.ok) setProvinces(await provincesRes.json());
        if (branchesRes.ok) setBranches(await branchesRes.json());
        if (usersRes.ok) setAllUsers(await usersRes.json());
      } catch (_err) {
        if (controller.signal.aborted) return;
        toast.error("Failed to fetch students");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  const handleDeleteStudent = async (student: Student) => {
    setDeleteConfirm(student);
  };

  const confirmDeleteStudent = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/students/${deleteConfirm.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`"${deleteConfirm.name}" deleted`);
        fetchStudents();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return {
    students,
    isLoading,
    branches,
    allUsers,
    provinces,
    deleteConfirm,
    setDeleteConfirm,
    handleDeleteStudent,
    confirmDeleteStudent,
  };
}

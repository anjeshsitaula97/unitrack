"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/fetch-client";
import { sortQualifications } from "./utils";
import type { PartnerSummary, Qualification, UserSummary } from "./types";

export function useStudentFormOptions() {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [allPartners, setAllPartners] = useState<PartnerSummary[]>([]);
  const staffUsers = useMemo(
    () => (allUsers || []).filter((u) => u.role !== "Student"),
    [allUsers]
  );

  useEffect(() => {
    queueMicrotask(() => {
      fetchQualifications();
      fetchUsers();
      fetchPartners();
    });
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.get<UserSummary[]>("/api/users", { showError: false });
      if (Array.isArray(data)) {
        setAllUsers(data);
      }
    } catch (_err) {}
  };

  const fetchPartners = async () => {
    try {
      const data = await api.get<PartnerSummary[]>("/api/partners", { showError: false });
      if (Array.isArray(data)) {
        setAllPartners(data);
      }
    } catch (_err) {}
  };

  const fetchQualifications = async () => {
    try {
      const data = await api.get<Qualification[]>("/api/qualifications", { showError: false });
      if (Array.isArray(data)) {
        setQualifications(sortQualifications(data));
      }
    } catch (_err) {}
  };

  return { qualifications, allPartners, staffUsers };
}

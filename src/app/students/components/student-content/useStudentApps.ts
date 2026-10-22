"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { parseList } from "./studentMeta";
import type { ApplicationGroup, ApplicationSummary } from "./types";

export function useStudentApps() {
  const [showAppsModal, setShowAppsModal] = useState(false);
  const [appsForSelectedStudent, setAppsForSelectedStudent] = useState<ApplicationSummary[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const _fetchStudentApps = async (studentId: string) => {
    try {
      setLoadingApps(true);
      const res = await fetch(`/api/applications?studentId=${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setAppsForSelectedStudent(data?.data || data || []);
      }
    } catch (_err) {
      toast.error("Failed to load applications");
    } finally {
      setLoadingApps(false);
    }
  };

  const appGroups = useMemo<ApplicationGroup[]>(() => {
    const map = new Map<string, { app: ApplicationSummary; req: string }[]>();
    appsForSelectedStudent.forEach((app) => {
      const reqs =
        parseList(app.course?.requirements).length > 0
          ? parseList(app.course?.requirements)
          : parseList(app.course?.prerequisites);
      const list = reqs.length > 0 ? reqs : ["View application"];
      list.forEach((req) => {
        const key = app.status || "Submitted";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ app, req });
      });
    });
    return [...map.entries()];
  }, [appsForSelectedStudent]);

  return {
    showAppsModal,
    setShowAppsModal,
    appsForSelectedStudent,
    loadingApps,
    appGroups,
  };
}

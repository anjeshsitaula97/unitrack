"use client";

import { useEffect, useMemo, useState } from "react";
import { safeJson } from "@/lib/fetch-client";
import { hasCommission } from "./commission";
import type { DashboardPartner, DashboardStudent, DashboardUniversity } from "./types";

export function usePartnerDashboardData() {
  const [userName, setUserName] = useState("Partner");
  const [_userRole, setUserRole] = useState("B2B Partner");
  const [partners, setPartners] = useState<DashboardPartner[]>([]);
  const [universities, setUniversities] = useState<DashboardUniversity[]>([]);
  const [students, setStudents] = useState<DashboardStudent[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const normalizeList = <T>(json: unknown): T[] => {
      if (Array.isArray(json)) return json as T[];
      const data = (json as { data?: unknown })?.data;
      return Array.isArray(data) ? (data as T[]) : [];
    };

    (async () => {
      setLoading(true);
      try {
        const [me, partnerList, univList, studentList, appList] = await Promise.all([
          fetch("/api/auth/me", { credentials: "include" })
            .then(safeJson)
            .catch(() => null),
          fetch("/api/partners")
            .then(safeJson)
            .catch(() => []),
          fetch("/api/universities?status=Active&perPage=500")
            .then(safeJson)
            .catch(() => []),
          fetch("/api/students?perPage=500")
            .then(safeJson)
            .catch(() => []),
          fetch("/api/applications?perPage=1")
            .then(safeJson)
            .catch(() => null),
        ]);
        if (cancelled) return;
        if (me?.name) setUserName(me.name.split(" ")[0]);
        if (me?.role) setUserRole(me.role);
        setPartners(Array.isArray(partnerList) ? partnerList : []);
        setUniversities(normalizeList<DashboardUniversity>(univList));
        setStudents(normalizeList<DashboardStudent>(studentList));
        setTotalApplications(
          typeof appList?.total === "number" ? appList.total : normalizeList(appList).length
        );
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const partnerUniversities = useMemo(
    () => universities.filter((u) => u.partnerId != null),
    [universities]
  );

  const partnerCommissions = useMemo(
    () => partnerUniversities.filter(hasCommission),
    [partnerUniversities]
  );

  const referredStudents = useMemo(
    () => students.filter((s) => s.partner != null || s.partnerId != null),
    [students]
  );

  const totalReferred = useMemo(() => {
    const counted = partners.reduce((sum, p) => sum + (p._count?.students || 0), 0);
    return Math.max(counted, referredStudents.length);
  }, [partners, referredStudents]);

  const topPartners = useMemo(
    () =>
      [...partners]
        .sort((a, b) => (b._count?.students || 0) - (a._count?.students || 0))
        .slice(0, 6),
    [partners]
  );

  const recentPartnerUniversities = useMemo(
    () => [...partnerUniversities].slice(0, 6),
    [partnerUniversities]
  );

  return {
    userName,
    loading,
    partnerCount: partners.length,
    partnerUniversities,
    partnerCommissions,
    referredStudents,
    totalReferred,
    topPartners,
    recentPartnerUniversities,
    totalApplications,
  };
}

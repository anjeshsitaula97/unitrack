"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { hasCommission, toNumber } from "./helpers";
import type { Course, CommissionRow, Univ } from "./types";

export function useCommissionData() {
  const [universities, setUniversities] = useState<Univ[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadAll = async <T>(baseUrl: string): Promise<T[]> => {
      const all: T[] = [];
      let page = 1;
      let total = Infinity;
      while (all.length < total) {
        const separator = baseUrl.includes("?") ? "&" : "?";
        const res = await fetch(`${baseUrl}${separator}page=${page}&perPage=100`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        const list = (Array.isArray(json) ? json : json.data || []) as T[];
        total = typeof json.total === "number" ? json.total : list.length;
        all.push(...list);
        if (list.length === 0 || all.length >= total) break;
        page++;
      }
      return all;
    };
    (async () => {
      setLoading(true);
      try {
        const [univList, courseList] = await Promise.all([
          loadAll<Univ>("/api/universities?status=Active"),
          loadAll<Course>("/api/courses?status=Active"),
        ]);
        if (controller.signal.aborted) return;
        setUniversities(univList);
        setCourses(courseList);
      } catch {
        if (controller.signal.aborted) return;
        toast.error("Failed to load commission data");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const commissioned = useMemo(() => universities.filter(hasCommission), [universities]);
  const commissionedCourses = useMemo(() => courses.filter(hasCommission), [courses]);
  const allCommissioned = useMemo(
    () => [
      ...universities.filter(hasCommission).map((u) => ({
        type: u.commissionType,
        value: u.commissionValue,
        currency: u.commissionCurrency,
      })),
      ...courses.filter(hasCommission).map((c) => ({
        type: c.commissionType,
        value: c.commissionValue,
        currency: c.commissionCurrency,
      })),
    ],
    [universities, courses]
  );

  const _percentageCount = useMemo(
    () => allCommissioned.filter((c) => c.type === "Percentage").length,
    [allCommissioned]
  );

  const totalFlatValue = useMemo(
    () =>
      allCommissioned
        .filter((c) => c.type === "Flat")
        .reduce((sum, c) => sum + toNumber(c.value), 0),
    [allCommissioned]
  );

  const rows: CommissionRow[] = useMemo(() => {
    const univRows: CommissionRow[] = commissioned.map((u) => ({
      key: `u-${u.id}`,
      kind: "university",
      univId: u.id,
      courseId: null,
      name: u.name,
      subtitle: u.partner?.name ? `Partner: ${u.partner.name}` : "Direct / No partner",
      color: u.color,
      logo: u.logo,
      commissionType: u.commissionType,
      commissionValue: u.commissionValue,
      commissionCurrency: u.commissionCurrency,
      partnershipAmount: u.partnershipAmount,
      country: u.country,
    }));
    const courseRows: CommissionRow[] = commissionedCourses.map((c) => ({
      key: `c-${c.id}`,
      kind: "course",
      univId: c.universityId,
      courseId: c.id,
      name: c.name,
      subtitle: c.courseCode
        ? `${c.university || "Unknown"} • ${c.courseCode}`
        : c.university || "Unknown",
      commissionType: c.commissionType,
      commissionValue: c.commissionValue,
      commissionCurrency: c.commissionCurrency,
      country: "",
    }));
    return [...univRows, ...courseRows];
  }, [commissioned, commissionedCourses]);

  async function handleSave(
    univId: string,
    courseId: string,
    commissionType: string,
    commissionValue: string,
    commissionCurrency: string,
    partnershipAmount: string
  ) {
    if (!univId) return;
    setSaving(true);
    try {
      const type = commissionType === "None" ? "Percentage" : commissionType;
      const value =
        commissionType === "None" || commissionValue.trim() === ""
          ? null
          : parseFloat(commissionValue);
      const currency =
        commissionType === "None" || value === null ? null : commissionCurrency.trim() || null;

      if (courseId) {
        const course = courses.find((c) => c.id === courseId);
        if (!course) throw new Error("Course not found");
        const body = {
          ...course,
          commissionType: type,
          commissionValue: value,
          commissionCurrency: currency,
        };
        const res = await fetch(`/api/courses/${courseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update course commission");
        const updated = await res.json();
        setCourses((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
        toast.success(`Commission saved for ${course.name}`);
      } else {
        const univ = universities.find((u) => u.id === univId);
        if (!univ) throw new Error("University not found");
        const res = await fetch(`/api/universities/${univId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: univ.name,
            country: univ.country,
            type: univ.type || "Public",
            status: univ.status || "Active",
            partnerId: univ.partnerId || null,
            establishedYear: univ.founded,
            partnershipAmount:
              partnershipAmount.trim() === "" ? null : parseFloat(partnershipAmount),
            commissionType: type,
            commissionValue: value,
            commissionCurrency: currency,
          }),
        });
        if (!res.ok) throw new Error("Failed to update university commission");
        const updated = await res.json();
        setUniversities((prev) =>
          prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
        );
        toast.success(`Commission saved for ${univ.name}`);
      }
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Failed to save commission");
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    universities,
    courses,
    loading,
    saving,
    commissioned,
    commissionedCourses,
    allCommissioned,
    _percentageCount,
    totalFlatValue,
    rows,
    handleSave,
  };
}

"use client";

import { useMemo, useState } from "react";
import { toNumber } from "./helpers";
import type { Course, ModalInitial, Univ } from "./types";

interface UseCommissionModalFormOptions {
  universities: Univ[];
  courses: Course[];
  initial: ModalInitial | null;
}

export function useCommissionModalForm({
  universities,
  courses,
  initial,
}: UseCommissionModalFormOptions) {
  const initialNone =
    !initial ||
    !toNumber(initial.commissionValue) ||
    !initial.commissionType ||
    initial.commissionValue === null;
  const [univId, setUnivId] = useState(initial?.univId || "");
  const [courseId, setCourseId] = useState(initial?.courseId || "");
  const [commissionType, setCommissionType] = useState<"Percentage" | "Flat" | "None">(
    initial && !initialNone ? (initial.commissionType === "Flat" ? "Flat" : "Percentage") : "None"
  );
  const [commissionValue, setCommissionValue] = useState(
    initial?.commissionValue ? String(initial.commissionValue) : ""
  );
  const [commissionCurrency, setCommissionCurrency] = useState(initial?.commissionCurrency || "");
  const [partnershipAmount, setPartnershipAmount] = useState(
    initial?.partnershipAmount ? String(initial.partnershipAmount) : ""
  );

  const _selectedUniv = universities.find((u) => u.id === univId);
  const univCourses = useMemo(
    () => courses.filter((c) => c.universityId === univId),
    [courses, univId]
  );
  const isCourseLevel = !!courseId;

  function handleUnivChange(id: string) {
    setUnivId(id);
    setCourseId("");
    if (id && !commissionCurrency) {
      const u = universities.find((x) => x.id === id);
      if (u?.commissionCurrency) setCommissionCurrency(u.commissionCurrency);
    }
  }

  function handleTypeChange(opt: "Percentage" | "Flat" | "None") {
    setCommissionType(opt);
    if (opt === "None") {
      setCommissionValue("");
      setCommissionCurrency("");
    }
  }

  const valueInvalid =
    !univId ||
    (commissionType !== "None" &&
      (commissionValue.trim() === "" || parseFloat(commissionValue) <= 0));

  return {
    univId,
    courseId,
    commissionType,
    commissionValue,
    commissionCurrency,
    partnershipAmount,
    setCourseId,
    setCommissionValue,
    setCommissionCurrency,
    setPartnershipAmount,
    univCourses,
    isCourseLevel,
    handleUnivChange,
    handleTypeChange,
    valueInvalid,
  };
}

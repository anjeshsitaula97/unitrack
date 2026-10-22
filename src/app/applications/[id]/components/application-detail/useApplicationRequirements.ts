"use client";

import { useMemo } from "react";
import { normalizeDocStatus } from "./utils";
import type { ApplicationDetail, GroupedDocs, ReqFilter, SectionKey, StudentDoc } from "./types";

export function useApplicationRequirements({
  detail,
  docs,
  academicDocNames,
  reqFilter,
}: {
  detail: ApplicationDetail | null;
  docs: StudentDoc[];
  academicDocNames: string[];
  reqFilter: ReqFilter;
}) {
  const coursePrereqs = useMemo(() => {
    if (!detail?.course?.prerequisites) return [];
    try {
      const parsed = JSON.parse(detail.course.prerequisites);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return typeof detail.course.prerequisites === "string" && detail.course.prerequisites.trim()
        ? [detail.course.prerequisites]
        : [];
    }
  }, [detail]);

  const courseReqs = useMemo(() => {
    if (!detail?.course?.requirements) return [];
    try {
      const parsed = JSON.parse(detail.course.requirements);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return typeof detail.course.requirements === "string" && detail.course.requirements.trim()
        ? [detail.course.requirements]
        : [];
    }
  }, [detail]);

  const academicDocNameSet = useMemo(() => new Set(academicDocNames), [academicDocNames]);

  const docReqs = useMemo(() => {
    return courseReqs.filter((r: string) => academicDocNameSet.has(r));
  }, [courseReqs, academicDocNameSet]);

  const generalReqs = useMemo(() => {
    return courseReqs.filter((r: string) => !academicDocNameSet.has(r));
  }, [courseReqs, academicDocNameSet]);

  const matchedDocReqs = useMemo(() => {
    return docReqs.map((req: string) => {
      const matched = docs.find(
        (d) =>
          d.name?.toLowerCase().includes(req.toLowerCase()) ||
          d.academicDocument?.name?.toLowerCase().includes(req.toLowerCase())
      );
      const normStatus = matched ? normalizeDocStatus(matched.status) : null;
      const isUploaded = !!matched;
      const isApproved = normStatus === "Approved";
      return { name: req, doc: matched || null, isUploaded, isApproved };
    });
  }, [docReqs, docs]);

  const requirementRows = useMemo(() => {
    const rows = matchedDocReqs.map((r) => ({
      name: r.name,
      status: !r.doc ? "Missing" : r.isApproved ? "Approved" : normalizeDocStatus(r.doc.status),
    }));
    generalReqs.forEach((req: string) => {
      rows.push({ name: req, status: "Missing" });
    });
    return rows;
  }, [matchedDocReqs, generalReqs]);

  const _allDocsComplete = docReqs.length > 0 && matchedDocReqs.every((d) => d.isApproved);
  const _missingDocsCount = matchedDocReqs.filter((d) => !d.isApproved).length;

  const matchedPrereqs = useMemo(() => {
    return coursePrereqs.map((req) => {
      const matched = docs.find(
        (d) =>
          d.name?.toLowerCase().includes(req.toLowerCase()) ||
          d.academicDocument?.name?.toLowerCase().includes(req.toLowerCase())
      );
      return { name: req, doc: matched || null };
    });
  }, [coursePrereqs, docs]);

  const grouped = useMemo(() => {
    const groups: GroupedDocs = {
      Pending: [],
      Approved: [],
      Rejected: [],
      "In Review": [],
    };
    docs.forEach((doc) => {
      groups[normalizeDocStatus(doc.status) as SectionKey].push(doc);
    });
    return groups;
  }, [docs]);

  const visibleSections = useMemo(() => {
    const order: SectionKey[] = ["Pending", "Approved", "In Review", "Rejected"];
    return order.filter((key) => {
      if (reqFilter !== "All" && reqFilter !== key) return false;
      // Always show Pending + Approved in the default All view (design)
      if (reqFilter === "All" && (key === "Pending" || key === "Approved")) return true;
      return grouped[key].length > 0 || reqFilter === key;
    });
  }, [grouped, reqFilter]);

  return {
    coursePrereqs,
    courseReqs,
    docReqs,
    generalReqs,
    matchedDocReqs,
    requirementRows,
    _allDocsComplete,
    _missingDocsCount,
    matchedPrereqs,
    grouped,
    visibleSections,
  };
}

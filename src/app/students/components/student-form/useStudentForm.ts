"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { ADToBS, BSToAD } from "bikram-sambat-js";
import { buildFormDataFromStudent, createInitialFormData } from "./utils";
import type { Student, StudentFormData } from "./types";

export function useStudentForm(initialStudent?: Student | null) {
  const [formData, setFormData] = useState<StudentFormData>(createInitialFormData);
  const isEditing = !!initialStudent;

  useEffect(() => {
    if (initialStudent) {
      const nextFormData = buildFormDataFromStudent(initialStudent);
      queueMicrotask(() => {
        setFormData(nextFormData);
      });
    }
  }, [initialStudent]);

  const handleAdDobChange = (e: ChangeEvent<HTMLInputElement>) => {
    const ad = e.target.value;
    setFormData((prev: StudentFormData) => ({ ...prev, dobAd: ad }));
    try {
      if (ad) {
        let bs = ADToBS(ad);
        if (bs && bs.includes("/")) {
          bs = bs.replace(/\//g, "-");
        }
        setFormData((prev: StudentFormData) => ({ ...prev, dobBs: bs }));
      }
    } catch (_err) {}
  };

  const handleBsDobChange = (e: ChangeEvent<HTMLInputElement>) => {
    let bs = e.target.value;
    bs = bs.replace(/\//g, "-");
    bs = bs.replace(/[^0-9-]/g, "");
    if (bs.length > 10) bs = bs.substring(0, 10);
    if (bs.length > (formData.dobBs?.length || 0)) {
      if (bs.length === 4) {
        bs = bs + "-";
      } else if (bs.length === 7) {
        bs = bs + "-";
      }
    }
    setFormData((prev: StudentFormData) => ({ ...prev, dobBs: bs }));
    try {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (bs && dateRegex.test(bs)) {
        const ad = BSToAD(bs);
        setFormData((prev: StudentFormData) => ({ ...prev, dobAd: ad }));
      }
    } catch (_err) {}
  };

  return { formData, setFormData, isEditing, handleAdDobChange, handleBsDobChange };
}

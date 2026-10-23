"use client";

import type { SetStateAction, Dispatch } from "react";
import NEB_INSTITUTES from "@/lib/data/neb_grade12_institutes.json";
import type { StudentFormData } from "./types";

export function useStudentCollections(setFormData: Dispatch<SetStateAction<StudentFormData>>) {
  const addChild = () => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      childrenDetails: [...prev.childrenDetails, { id: Date.now(), name: "", gender: "Male" }],
    }));
  };

  const removeChild = (id: number) => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      childrenDetails: prev.childrenDetails.filter((c) => c.id !== id),
    }));
  };

  const updateChild = (id: number, field: string, value: string) => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      childrenDetails: prev.childrenDetails.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  };

  const addOtherGuardian = () => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      otherGuardians: [
        ...prev.otherGuardians,
        { id: Date.now(), name: "", relation: "", phone: "", email: "", address: "" },
      ],
    }));
  };

  const removeOtherGuardian = (id: number) => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      otherGuardians: prev.otherGuardians.filter((g) => g.id !== id),
    }));
  };

  const updateOtherGuardian = (id: number, field: string, value: string) => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      otherGuardians: prev.otherGuardians.map((g) => (g.id === id ? { ...g, [field]: value } : g)),
    }));
  };

  const addEducation = () => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now(),
          qualification: "",
          institution: "",
          institutionAddress: "",
          year: "",
          score: "",
          country: "",
        },
      ],
    }));
  };

  const removeEducation = (id: number) => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  const updateEducation = (id: number, field: string, value: string) => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      education: prev.education.map((e) => {
        if (e.id === id) {
          const updated = { ...e, [field]: value };
          if (field === "institution") {
            const found = NEB_INSTITUTES.find((inst) => inst.name === value);
            if (found) {
              updated.institutionAddress = found.address;
            }
          }
          return updated;
        }
        return e;
      }),
    }));
  };

  const addWork = () => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        {
          id: Date.now(),
          jobTitle: "",
          company: "",
          companyAddress: "",
          startDate: "",
          endDate: "",
          currentlyWorking: false,
        },
      ],
    }));
  };

  const updateWork = (id: number, field: string, value: string | boolean) => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      workExperience: prev.workExperience.map((w) => (w.id === id ? { ...w, [field]: value } : w)),
    }));
  };

  return {
    addChild,
    removeChild,
    updateChild,
    addOtherGuardian,
    removeOtherGuardian,
    updateOtherGuardian,
    addEducation,
    removeEducation,
    updateEducation,
    addWork,
    updateWork,
  };
}

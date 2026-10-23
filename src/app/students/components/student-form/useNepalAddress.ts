"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/fetch-client";
import { fetchDistricts, fetchMunicipalities, fetchWards } from "./utils";
import type { Province, Student, StudentFormData } from "./types";

export function useNepalAddress(
  initialStudent: Student | null | undefined,
  formData: StudentFormData
) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [permanentDistricts, setPermanentDistricts] = useState<string[]>([]);
  const [permanentMunicipalities, setPermanentMunicipalities] = useState<string[]>([]);
  const [permanentWards, setPermanentWards] = useState<string[]>([]);
  const temporaryDistricts = useRef<string[]>([]);
  const temporaryMunicipalities = useRef<string[]>([]);
  const temporaryWards = useRef<string[]>([]);

  const fetchProvinces = async () => {
    try {
      const data = await api.get<Province[]>("/api/nepal/provinces", {
        showError: false,
      });
      if (Array.isArray(data)) setProvinces(data);
    } catch (_err) {}
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchProvinces();
    });
  }, []);

  useEffect(() => {
    if (initialStudent) {
      const s = initialStudent;
      if (s.permanentProvince) fetchDistricts(s.permanentProvince, setPermanentDistricts);
      if (s.permanentDistrict) fetchMunicipalities(s.permanentDistrict, setPermanentMunicipalities);
      if (s.permanentDistrict && s.permanentMunicipality)
        fetchWards(s.permanentDistrict, s.permanentMunicipality, setPermanentWards);
    }
  }, [initialStudent]);

  useEffect(() => {
    if (formData.temporaryProvince) {
      fetchDistricts(formData.temporaryProvince, (val: string[]) => {
        temporaryDistricts.current = val;
      });
    } else {
      temporaryDistricts.current = [];
    }
  }, [formData.temporaryProvince]);

  useEffect(() => {
    if (formData.temporaryDistrict) {
      fetchMunicipalities(formData.temporaryDistrict, (val: string[]) => {
        temporaryMunicipalities.current = val;
      });
    } else {
      temporaryMunicipalities.current = [];
    }
  }, [formData.temporaryDistrict]);

  useEffect(() => {
    if (formData.temporaryDistrict && formData.temporaryMunicipality) {
      fetchWards(formData.temporaryDistrict, formData.temporaryMunicipality, (val: string[]) => {
        temporaryWards.current = val;
      });
    } else {
      temporaryWards.current = [];
    }
  }, [formData.temporaryDistrict, formData.temporaryMunicipality]);

  return {
    provinces,
    permanentDistricts,
    permanentMunicipalities,
    permanentWards,
    setPermanentDistricts,
    setPermanentMunicipalities,
    setPermanentWards,
  };
}

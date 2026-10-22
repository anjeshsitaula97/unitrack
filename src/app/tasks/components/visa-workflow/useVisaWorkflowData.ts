"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  EmbassyDetail,
  EmbassyForm,
  StageForm,
  Task,
  VisaChecklist,
  WorkflowStage,
} from "./types";

export function useVisaWorkflowData(country: string, visaType: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [embassyDetail, setEmbassyDetail] = useState<EmbassyDetail | null>(null);
  const [checklists, setChecklists] = useState<VisaChecklist[]>([]);
  const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [embassyForm, setEmbassyForm] = useState<EmbassyForm>({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    workingHours: "",
  });

  const [stageForm, setStageForm] = useState<StageForm>({ name: "", description: "", order: 0 });

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/tasks?country=${encodeURIComponent(country)}&visaType=${encodeURIComponent(visaType)}`
      );
      if (res.ok) setTasks(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, [country, visaType]);

  const fetchEmbassy = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/embassy?country=${encodeURIComponent(country)}&visaType=${encodeURIComponent(visaType)}`
      );
      if (res.ok) {
        const data = await res.json();
        setEmbassyDetail(data);
        if (data) {
          setEmbassyForm({
            name: data.name,
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
            website: data.website || "",
            workingHours: data.workingHours || "",
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [country, visaType]);

  const fetchChecklists = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/visa-checklists?country=${encodeURIComponent(country)}&visaType=${encodeURIComponent(visaType)}`
      );
      if (res.ok) setChecklists(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, [country, visaType]);

  const fetchStages = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/workflow-stages?country=${encodeURIComponent(country)}&visaType=${encodeURIComponent(visaType)}`
      );
      if (res.ok) {
        const data = await res.json();
        setWorkflowStages(data);
        setStageForm((prev) => ({ ...prev, order: data.length + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  }, [country, visaType]);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchTasks(), fetchEmbassy(), fetchChecklists(), fetchStages()]);
    setIsLoading(false);
  }, [fetchTasks, fetchEmbassy, fetchChecklists, fetchStages]);

  const fetchAllDataRef = useRef(fetchAllData);
  useEffect(() => {
    fetchAllDataRef.current = fetchAllData;
    fetchAllDataRef.current();
  }, [fetchAllData]);

  return {
    tasks,
    setTasks,
    embassyDetail,
    checklists,
    workflowStages,
    isLoading,
    embassyForm,
    setEmbassyForm,
    stageForm,
    setStageForm,
    fetchTasks,
    fetchEmbassy,
    fetchChecklists,
    fetchStages,
    fetchAllData,
  };
}

"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

export type TimelineView = "countries" | "visas" | "timeline";

export function useTimelineNav(initial: {
  view: TimelineView;
  country: string | null;
  visa: string | null;
}) {
  const router = useRouter();
  const [view, setView] = useState<TimelineView>(initial.view);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(initial.country);
  const [selectedVisa, setSelectedVisa] = useState<string | null>(initial.visa);
  const [timelineStageCount, setTimelineStageCount] = useState(0);

  const syncUrl = useCallback(
    (v: string, country: string | null, visa: string | null) => {
      const params = new URLSearchParams();
      if (v !== "countries") params.set("view", v);
      if (country) params.set("country", country);
      if (visa) params.set("visa", visa);
      const qs = params.toString();
      router.replace(qs ? `/visa-timeline?${qs}` : "/visa-timeline", { scroll: false });
    },
    [router]
  );

  const setViewAndUrl = useCallback(
    (v: TimelineView) => {
      setView(v);
      if (v === "countries") {
        setSelectedCountry(null);
        setSelectedVisa(null);
        setTimelineStageCount(0);
        syncUrl(v, null, null);
      } else {
        syncUrl(v, selectedCountry, selectedVisa);
      }
    },
    [selectedCountry, selectedVisa, syncUrl]
  );

  const setCountryAndUrl = useCallback(
    (country: string | null) => {
      setSelectedCountry(country);
      setSelectedVisa(null);
      setTimelineStageCount(0);
      syncUrl(country ? "visas" : "countries", country, null);
      setView(country ? "visas" : "countries");
    },
    [syncUrl]
  );

  const setVisaAndUrl = useCallback(
    (visa: string | null) => {
      setSelectedVisa(visa);
      setTimelineStageCount(0);
      if (visa) {
        setView("timeline");
        syncUrl("timeline", selectedCountry, visa);
      } else {
        syncUrl("visas", selectedCountry, null);
      }
    },
    [selectedCountry, syncUrl]
  );

  return {
    view,
    selectedCountry,
    selectedVisa,
    timelineStageCount,
    setTimelineStageCount,
    setViewAndUrl,
    setCountryAndUrl,
    setVisaAndUrl,
  };
}

import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import CalendarContent from "./CalendarContent";

export const metadata = { title: "Calendar | UniTrack" };

export default function CalendarPage() {
  return (
    <AppLayoutWrapper>
      <CalendarContent />
    </AppLayoutWrapper>
  );
}

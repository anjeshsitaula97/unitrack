import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import AttendanceContent from "./components/AttendanceContent";

export const metadata = {
  title: "Attendance | UniTrack",
  description: "UniTrack administration - Attendance",
};

export default function AttendancePage() {
  return (
    <AppLayoutWrapper>
      <AttendanceContent />
    </AppLayoutWrapper>
  );
}

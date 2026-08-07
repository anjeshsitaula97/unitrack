import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import DepartmentsContent from "./components/DepartmentsContent";

export const metadata = {
  title: "Departments | UniTrack",
  description: "UniTrack administration - Departments",
};

export default function DepartmentsPage() {
  return (
    <AppLayoutWrapper>
      <DepartmentsContent />
    </AppLayoutWrapper>
  );
}

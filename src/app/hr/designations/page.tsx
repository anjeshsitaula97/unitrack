import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import DesignationsContent from "./components/DesignationsContent";

export const metadata = {
  title: "Designations | UniTrack",
  description: "UniTrack administration - Designations",
};

export default function DesignationsPage() {
  return (
    <AppLayoutWrapper>
      <DesignationsContent />
    </AppLayoutWrapper>
  );
}

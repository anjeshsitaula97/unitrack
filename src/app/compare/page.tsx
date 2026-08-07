import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import CompareContent from "./CompareContent";

export const metadata = { title: "Compare | UniTrack" };

export default function ComparePage() {
  return (
    <AppLayoutWrapper>
      <CompareContent />
    </AppLayoutWrapper>
  );
}

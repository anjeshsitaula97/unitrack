import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import CommissionContent from "./components/CommissionContent";

export const metadata = {
  title: "Commission | UniTrack",
  description: "UniTrack administration - Commission structures",
};

export default function CommissionPage() {
  return (
    <AppLayoutWrapper>
      <CommissionContent />
    </AppLayoutWrapper>
  );
}

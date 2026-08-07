import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import SupportContent from "./components/SupportContent";

export const metadata = {
  title: "Support | UniTrack",
  description: "UniTrack administration - Support",
};

export default function SupportPage() {
  return (
    <AppLayoutWrapper>
      <SupportContent />
    </AppLayoutWrapper>
  );
}

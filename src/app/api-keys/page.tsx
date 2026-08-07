import React from "react";
import type { Metadata } from "next";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import ApiKeysContent from "./components/ApiKeysContent";

export const metadata: Metadata = {
  title: "API Keys | UniTrack",
  description: "Manage API keys and integrations",
};

export default function ApiKeysPage() {
  return (
    <AppLayoutWrapper>
      <ApiKeysContent />
    </AppLayoutWrapper>
  );
}

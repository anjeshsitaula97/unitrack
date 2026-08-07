import React from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import EmailContent from "./EmailContent";

export const metadata = { title: "Email | UniTrack" };

export default function EmailPage() {
  return (
    <AppLayoutWrapper>
      <EmailContent />
    </AppLayoutWrapper>
  );
}

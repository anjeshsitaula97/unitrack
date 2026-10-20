import React, { Suspense } from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import NewsContent from "./components/NewsContent";

export const metadata = {
  title: "News | UniTrack",
  description: "UniTrack administration - News and announcements",
};

export default function NewsPage() {
  return (
    <AppLayoutWrapper>
      <Suspense fallback={<div className="p-8 text-center">Loading news…</div>}>
        <NewsContent />
      </Suspense>
    </AppLayoutWrapper>
  );
}

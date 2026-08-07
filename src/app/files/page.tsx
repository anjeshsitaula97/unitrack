import React, { Suspense } from "react";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import FileManager from "./components/FileManager";

export const metadata = {
  title: "Files | UniTrack",
  description: "Manage files and folders",
};

export default function FilesPage() {
  return (
    <AppLayoutWrapper>
      <Suspense fallback={null}>
        <FileManager />
      </Suspense>
    </AppLayoutWrapper>
  );
}

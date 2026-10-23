import type { Metadata } from "next";
import ConsultanciesContent from "@/app/consultancies/components/ConsultanciesContent";

export const metadata: Metadata = {
  title: "Consultancies | Super Admin Console",
  description: "Create and manage consultancy workspaces across the platform.",
};

export default function AppConsoleConsultanciesPage() {
  return <ConsultanciesContent />;
}

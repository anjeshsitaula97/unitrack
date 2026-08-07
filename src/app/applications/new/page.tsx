import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import ApplicationForm from "@/app/applications/components/ApplicationForm";

export const metadata = {
  title: "New Application | UniTrack",
};

export default function NewApplicationPage() {
  return (
    <AppLayoutWrapper>
      <ApplicationForm />
    </AppLayoutWrapper>
  );
}

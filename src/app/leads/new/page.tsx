import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import LeadForm from "@/app/leads/components/LeadForm";

export const metadata = {
  title: "New Lead | UniTrack",
};

export default function NewLeadPage() {
  return (
    <AppLayoutWrapper>
      <LeadForm />
    </AppLayoutWrapper>
  );
}

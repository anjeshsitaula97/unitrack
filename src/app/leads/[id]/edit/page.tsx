import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import LeadForm from "@/app/leads/components/LeadForm";

export const metadata = {
  title: "Edit Lead | UniTrack",
};

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppLayoutWrapper>
      <LeadForm leadId={id} />
    </AppLayoutWrapper>
  );
}

import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import TicketsContent from "./components/TicketsContent";

export const metadata = {
  title: "Tickets | UniTrack",
  description: "UniTrack administration - Tickets",
};

export default function TicketsPage() {
  return (
    <AppLayoutWrapper>
      <TicketsContent />
    </AppLayoutWrapper>
  );
}

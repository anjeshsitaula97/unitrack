import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import ExpensesContent from "./components/ExpensesContent";

export const metadata = {
  title: "Expenses | UniTrack",
  description: "UniTrack administration - Expenses",
};

export default function ExpensesPage() {
  return (
    <AppLayoutWrapper>
      <ExpensesContent />
    </AppLayoutWrapper>
  );
}

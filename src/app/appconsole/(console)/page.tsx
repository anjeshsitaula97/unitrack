import DashboardContent from "@/app/dashboard/components/DashboardContent";
import AppConsoleDashboard from "../components/AppConsoleDashboard";

export const metadata = {
  title: "Dashboard | Super Admin Console",
  description: "Platform-wide dashboard for Super Administrators.",
};

export default function AppConsoleOverviewPage() {
  return (
    <div className="space-y-8">
      <DashboardContent />
      <AppConsoleDashboard />
    </div>
  );
}

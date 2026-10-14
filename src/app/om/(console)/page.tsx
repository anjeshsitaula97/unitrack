import DashboardContent from "@/app/dashboard/components/DashboardContent";
import OmDashboard from "../components/OmDashboard";

export const metadata = {
  title: "Dashboard | Super Admin Console",
  description: "Platform-wide dashboard for Super Administrators.",
};

export default function OmOverviewPage() {
  return (
    <div className="space-y-8">
      <DashboardContent />
      <OmDashboard />
    </div>
  );
}

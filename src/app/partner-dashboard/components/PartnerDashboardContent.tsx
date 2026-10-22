"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import PartnerDashboardHeader from "./partner-dashboard/PartnerDashboardHeader";
import PartnerDashboardKpis from "./partner-dashboard/PartnerDashboardKpis";
import RecentPartnerUniversitiesCard from "./partner-dashboard/RecentPartnerUniversitiesCard";
import ReferredStudentsTable from "./partner-dashboard/ReferredStudentsTable";
import TopPartnersCard from "./partner-dashboard/TopPartnersCard";
import { usePartnerDashboardData } from "./partner-dashboard/usePartnerDashboardData";

const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const clockFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: browserTimeZone,
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: browserTimeZone,
});

export default function PartnerDashboardContent() {
  const [now, setNow] = useState<Date | null>(null);
  const {
    userName,
    loading,
    partnerCount,
    partnerUniversities,
    partnerCommissions,
    referredStudents,
    totalReferred,
    topPartners,
    recentPartnerUniversities,
    totalApplications,
  } = usePartnerDashboardData();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now ? clockFormatter.format(now) : "--:--:--";
  const adDateStr = now ? longDateFormatter.format(now) : "";

  return (
    <div className="animate-fade-in">
      <PartnerDashboardHeader userName={userName} timeStr={timeStr} adDateStr={adDateStr} />

      {loading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin size-8 text-cyan-600" />
        </div>
      ) : (
        <>
          <PartnerDashboardKpis
            partnerCount={partnerCount}
            partnerUniversityCount={partnerUniversities.length}
            totalReferred={totalReferred}
            totalApplications={totalApplications}
            commissionCount={partnerCommissions.length}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <RecentPartnerUniversitiesCard universities={recentPartnerUniversities} />
            <TopPartnersCard partners={topPartners} />
          </div>

          <ReferredStudentsTable students={referredStudents} />
        </>
      )}
    </div>
  );
}

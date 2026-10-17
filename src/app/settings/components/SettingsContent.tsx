"use client";

import { Suspense, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Building2,
  Globe,
  GraduationCap,
  Layers,
  Lock,
  Mail,
  MailPlus,
  MapPin,
  Puzzle,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import CompanyProfileSettings from "./CompanyProfileSettings";
import RolesSettings from "./RolesSettings";
import PermissionsSettings from "./PermissionsSettings";
import LocalizationSettings from "./LocalizationSettings";
import ModulesSettings from "./ModulesSettings";
import EmailSettings from "./EmailSettings";
import EmailTemplatesSettings from "./EmailTemplatesSettings";
import ProfileSettings from "./ProfileSettings";
import AcademicsSettings from "./AcademicsSettings";
import QualificationsSettings from "./QualificationsSettings";
import ApplicationStatusesSettings from "./ApplicationStatusesSettings";
import NotificationSettings from "./NotificationSettings";
import BranchSettings from "./BranchSettings";
import SecuritySettings from "./SecuritySettings";
import type { SettingsTab } from "./settings-shared";

function SettingsTiles({ onSelect }: { onSelect: (tab: SettingsTab) => void }) {
  const groups: Record<
    string,
    { id: SettingsTab; label: string; icon: ReactNode; desc: string }[]
  > = {
    "Account & Access": [
      {
        id: "profile",
        label: "Profile",
        icon: <User size={26} />,
        desc: "Edit your name, email and contact details",
      },
      {
        id: "company",
        label: "Company Profile",
        icon: <Building2 size={26} />,
        desc: "Branding, logo and contact details",
      },
      {
        id: "roles",
        label: "Roles",
        icon: <Shield size={26} />,
        desc: "Create and manage admin & staff roles",
      },
      {
        id: "permissions",
        label: "Role Permissions",
        icon: <ShieldCheck size={26} />,
        desc: "Granular capability controls per role",
      },
      {
        id: "email",
        label: "Email Settings",
        icon: <Mail size={26} />,
        desc: "SMTP, sender identity and template",
      },
      {
        id: "email-templates",
        label: "Email Templates",
        icon: <MailPlus size={26} />,
        desc: "Automated student email messages",
      },
      {
        id: "security",
        label: "Security",
        icon: <Lock size={26} />,
        desc: "Password policy and 2FA",
      },
    ],
    "Platform & Content": [
      {
        id: "localization",
        label: "Localization",
        icon: <Globe size={26} />,
        desc: "Region, language and currency",
      },
      {
        id: "branches",
        label: "Branches",
        icon: <MapPin size={26} />,
        desc: "Campus locations & branches",
      },
      {
        id: "qualifications",
        label: "Qualifications",
        icon: <GraduationCap size={26} />,
        desc: "Degree types and levels",
      },
      {
        id: "academics",
        label: "Academics",
        icon: <BookOpen size={26} />,
        desc: "Programs, courses and grading",
      },
    ],
    Application: [
      {
        id: "modules",
        label: "Modules",
        icon: <Puzzle size={26} />,
        desc: "Toggle platform feature modules",
      },
      {
        id: "statuses",
        label: "Application Statuses",
        icon: <Layers size={26} />,
        desc: "Review pipeline & status labels",
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: <Bell size={26} />,
        desc: "Alert channels & delivery",
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Object.entries(groups).map(([group, tabs]) => (
        <div key={group} className="space-y-4">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {group}
          </div>
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className="w-full flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition duration-200"
            >
              <span className="flex items-center gap-3">
                <span className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">{tab.icon}</span>
                <span className="text-sm font-bold text-slate-700">{tab.label}</span>
              </span>
              <span className="text-xs text-slate-400 leading-snug">{tab.desc}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function SettingsContentInternal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get("tab") as SettingsTab;

  const [activeTab, setActiveTab] = useState<SettingsTab>(tabFromUrl || "roles");
  const [showTiles, setShowTiles] = useState(true);
  const [prevTabFromUrl, setPrevTabFromUrl] = useState(tabFromUrl);

  if (tabFromUrl && prevTabFromUrl !== tabFromUrl) {
    setPrevTabFromUrl(tabFromUrl);
    setActiveTab(tabFromUrl);
  }

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    setShowTiles(false);
    router.push(`/settings?tab=${tab}`, { scroll: false });
  };

  const handleBack = () => {
    setShowTiles(true);
    router.replace("/settings", { scroll: false });
  };

  const tabContent: Record<SettingsTab, ReactNode> = {
    company: <CompanyProfileSettings />,
    localization: <LocalizationSettings />,
    roles: <RolesSettings onManagePermissions={() => handleTabChange("permissions")} />,
    permissions: <PermissionsSettings />,
    email: <EmailSettings />,
    "email-templates": <EmailTemplatesSettings />,
    profile: <ProfileSettings />,
    academics: <AcademicsSettings />,
    qualifications: <QualificationsSettings />,
    security: <SecuritySettings />,
    modules: <ModulesSettings />,
    statuses: <ApplicationStatusesSettings />,
    notifications: <NotificationSettings />,
    branches: <BranchSettings onGoToLocalization={() => handleTabChange("localization")} />,
  };

  return (
    <div className="animate-fade-in py-6">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account preferences, platform roles, and application security.
          </p>
        </div>
        {!showTiles && (
          <button
            type="button"
            onClick={handleBack}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            Back to All Settings
          </button>
        )}
      </header>
      {showTiles ? (
        <SettingsTiles onSelect={handleTabChange} />
      ) : (
        <div className="space-y-6 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            <ArrowLeft size={16} />
            Back to All Settings
          </button>

          <div className="space-y-6 max-w-5xl">{tabContent[activeTab]}</div>
        </div>
      )}
    </div>
  );
}

export default function SettingsContent() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading settingsâ€¦</div>}>
      <SettingsContentInternal />
    </Suspense>
  );
}

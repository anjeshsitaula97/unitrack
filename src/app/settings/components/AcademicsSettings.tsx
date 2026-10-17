"use client";

import { GraduationCap } from "lucide-react";
import SettingsHeader from "./SettingsHeader";
import FacultyManager from "./FacultyManager";
import DegreeTypeManager from "./DegreeTypeManager";
import AcademicDocManager from "./AcademicDocManager";

export default function AcademicsSettings() {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl pb-12">
      <SettingsHeader
        icon={<GraduationCap size={18} />}
        title="Academic Settings"
        description="Manage faculties and degree types used across the platform."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FacultyManager />
        <DegreeTypeManager />
      </div>

      <AcademicDocManager />
    </div>
  );
}

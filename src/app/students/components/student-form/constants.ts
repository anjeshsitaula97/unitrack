import {
  GraduationCap,
  User,
  Users,
  Map,
  ShieldCheck,
  Briefcase,
  Zap,
  FileText,
} from "lucide-react";

export const STEPS = [
  { id: 1, name: "Personal", icon: User },
  { id: 2, name: "Family", icon: Users },
  { id: 3, name: "Address", icon: Map },
  { id: 4, name: "Passport", icon: ShieldCheck },
  { id: 5, name: "Academic", icon: GraduationCap },
  { id: 6, name: "Experience", icon: Briefcase },
  { id: 7, name: "Preferences", icon: Zap },
  { id: 8, name: "Documents", icon: FileText },
];

export const docTypes = [
  "Passport",
  "SLC/SEE Transcript",
  "SLC/SEE Character",
  "+2/PCL Transcript",
  "+2/PCL Character",
  "Bachelor Transcript",
  "Bachelor Character",
  "Master Transcript",
  "Master Character",
  "IELTS/PTE/TOEFL Scorecard",
  "Statement of Purpose (SOP)",
  "CV/Resume",
  "Citizenship",
  "Experience Letter",
  "Other",
];

export const qualificationDocMap: Record<number, string[]> = {
  1: ["SLC/SEE Transcript", "SLC/SEE Character"],
  2: ["+2/PCL Transcript", "+2/PCL Character"],
  3: ["Bachelor Transcript", "Bachelor Character"],
  4: ["Master Transcript", "Master Character"],
  5: ["Master Transcript", "Master Character"],
};

export const commonDocs = [
  "Passport",
  "IELTS/PTE/TOEFL Scorecard",
  "Statement of Purpose (SOP)",
  "CV/Resume",
  "Citizenship",
  "Experience Letter",
  "Other",
];

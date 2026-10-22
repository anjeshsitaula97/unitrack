import {
  Award,
  BookOpen,
  Briefcase,
  FileText,
  GraduationCap,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

const ICON_RULES = [
  { matches: ["passport"], Icon: ShieldCheck },
  { matches: ["transcript"], Icon: FileText },
  { matches: ["certificate", "degree"], Icon: Award },
  { matches: ["cv", "resume"], Icon: User },
  { matches: ["english", "ielts", "language"], Icon: BookOpen },
  { matches: ["grade", "marksheet", "academic"], Icon: GraduationCap },
  { matches: ["sop", "statement"], Icon: FileText },
  { matches: ["lor", "recommendation"], Icon: Mail },
  { matches: ["work", "experience"], Icon: Briefcase },
];

export default function RequirementIcon({ req, size = 18 }: { req: string; size?: number }) {
  const value = req.toLowerCase();
  const Icon =
    ICON_RULES.find(({ matches }) => matches.some((m) => value.includes(m)))?.Icon ?? FileText;
  return <Icon size={size} />;
}

import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckSquare,
  ClipboardList,
  CreditCard,
  Database,
  Folder,
  GitCompare,
  GraduationCap,
  LayoutGrid,
  Library,
  Mail,
  MessageSquare,
  Route,
  ShieldCheck,
  Ticket,
  Trash2,
  Upload,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

const MODULE_ICONS: Record<string, LucideIcon> = {
  Building2,
  BookOpen,
  Users,
  GraduationCap,
  CreditCard,
  Folder,
  Calendar,
  Route,
  GitCompare,
  ClipboardList,
  Briefcase,
  ShieldCheck,
  CheckSquare,
  BarChart3,
  Upload,
  Activity,
  Trash2,
  Database,
  MessageSquare,
  Mail,
  Bell,
  Ticket,
  Library,
  Zap,
};

export default function ModuleIcon({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = MODULE_ICONS[name] || LayoutGrid;
  return <Icon size={size} className={className} />;
}

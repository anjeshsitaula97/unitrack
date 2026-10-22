import type { ReactNode } from "react";
import { FileText, Image as ImageIcon, Megaphone, Video } from "lucide-react";

export const STATUS_OPTIONS = ["All", "Pending", "In Progress", "Completed", "Cancelled"];
export const TYPE_OPTIONS = ["All", "Graphic Design", "Social Media Post", "Video", "Other"];
export const PRIORITY_OPTIONS = ["All", "Low", "Medium", "High", "Urgent"];

export const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};

export const TYPE_ICONS: Record<string, ReactNode> = {
  "Graphic Design": <ImageIcon size={14} className="text-indigo-500" />,
  "Social Media Post": <Megaphone size={14} className="text-emerald-500" />,
  Video: <Video size={14} className="text-purple-500" />,
  Other: <FileText size={14} className="text-slate-500" />,
};

export const REQUEST_TYPE_COLORS: Record<string, string> = {
  "Graphic Design": "bg-indigo-100 text-indigo-600",
  "Social Media Post": "bg-emerald-100 text-emerald-600",
  Video: "bg-purple-100 text-purple-600",
  Other: "bg-slate-100 text-slate-600",
};

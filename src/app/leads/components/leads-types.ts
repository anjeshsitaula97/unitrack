export interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  counselor?: string;
  assignedDate?: string;
  phone?: string;
  nextFollowUp: string;
  interestedCountry?: string;
  source?: string;
  createdAt: string;
}

export interface LeadUser {
  role?: string;
}

export interface LeadStaff {
  id: string;
  name: string;
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const formatDate = (dateString: string) => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

export const isOverdue = (dateString: string) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

export const statusConfig: Record<string, { label: string; className: string }> = {
  New: { label: "New Lead", className: "bg-blue-50 text-blue-700" },
  Contacted: { label: "Contacted", className: "bg-amber-50 text-amber-700" },
  Qualified: { label: "Qualified", className: "bg-emerald-50 text-emerald-700" },
  Converted: {
    label: "Converted",
    className: "bg-indigo-50 text-indigo-700 border border-indigo-100",
  },
  Lost: { label: "Lost", className: "bg-rose-50 text-rose-700" },
};

export const rainbowGradients = [
  "from-red-400/20 via-rose-300/10 to-transparent",
  "from-orange-400/20 via-amber-300/10 to-transparent",
  "from-yellow-400/20 via-amber-200/10 to-transparent",
  "from-green-400/20 via-emerald-300/10 to-transparent",
  "from-teal-400/20 via-cyan-300/10 to-transparent",
  "from-blue-400/20 via-indigo-300/10 to-transparent",
  "from-indigo-400/20 via-violet-300/10 to-transparent",
  "from-purple-400/20 via-fuchsia-300/10 to-transparent",
  "from-pink-400/20 via-rose-300/10 to-transparent",
  "from-sky-400/20 via-blue-300/10 to-transparent",
  "from-emerald-400/20 via-teal-300/10 to-transparent",
  "from-violet-400/20 via-purple-300/10 to-transparent",
];

export const leadKanbanStatuses = [
  {
    key: "New",
    label: "New",
    dot: "bg-blue-500",
    gradient: "from-blue-400/20 via-indigo-300/10 to-transparent",
  },
  {
    key: "Contacted",
    label: "Contacted",
    dot: "bg-amber-500",
    gradient: "from-amber-400/20 via-orange-300/10 to-transparent",
  },
  {
    key: "Qualified",
    label: "Qualified",
    dot: "bg-emerald-500",
    gradient: "from-emerald-400/20 via-teal-300/10 to-transparent",
  },
  {
    key: "Converted",
    label: "Converted",
    dot: "bg-indigo-500",
    gradient: "from-indigo-400/20 via-violet-300/10 to-transparent",
  },
  {
    key: "Lost",
    label: "Lost",
    dot: "bg-rose-500",
    gradient: "from-rose-400/20 via-pink-300/10 to-transparent",
  },
];

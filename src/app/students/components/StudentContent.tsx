"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  FileText,
  Trash2,
  Edit2,
  X,
  Mail,
  Phone,
  User,
  ShieldCheck,
  Loader2,
  Users,
  LayoutGrid,
  Table,
  Columns3,
  KeyRound,
  Copy,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  MoreVertical,
  ExternalLink,
  Award,
  BookOpen,
  Briefcase,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  LazyMotion,
  m as motion,
  domAnimation,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import ConfirmDialog from "@/components/ConfirmDialog";
import { SkeletonCard, SkeletonTable } from "@/components/Skeleton";
import { toast } from "sonner";
import Image from "next/image";
import { getCountryFlag } from "@/lib/country-flags";

// Types
interface Student {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string | null;
  status: string;
  university: string | null;
  country: string | null;
  createdAt: string;

  admissionEmail?: string;
  studentPassword?: string;
  dobAd?: string;
  dobBs?: string;
  nationality?: string;
  gender?: string;
  photoUrl?: string;
  spouseName?: string;
  childrenDetails?: unknown;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelation?: string;
  guardianAddress?: string;

  permanentProvince?: string;
  permanentDistrict?: string;
  permanentMunicipality?: string;
  permanentWardNo?: string;
  permanentAddress?: string;

  temporaryProvince?: string;
  temporaryDistrict?: string;
  temporaryMunicipality?: string;
  temporaryWardNo?: string;
  temporaryAddress?: string;

  passportNumber?: string;
  passportNationality?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  passportIssuePlace?: string;

  education?: EducationEntry[] | string;
  workExperience?: unknown;
  training?: unknown;

  testType?: string;
  overallScore?: string;
  readingScore?: string;
  writingScore?: string;
  listeningScore?: string;
  speakingScore?: string;
  moi?: string;
  testDate?: string;
  testRegNumber?: string;

  studyLevel?: string;
  intakeTerm?: string;
  major?: string;
  interestedCountry?: string;
  partnerId?: string;
  partner?: { id: string; name: string; countries?: string };
  targetUniversities?: string;
  counselor?: string;
  branchId?: string;

  _count?: {
    documents: number;
  };
  documents?: DocumentEntry[];
}

interface EducationEntry {
  qualification: string;
  institution?: string;
  institutionAddress?: string;
  year?: string;
  score: string;
  country?: string;
}

interface DocumentEntry {
  id: string;
  type: string;
  name: string;
  url: string;
  status?: string;
}

interface UserSummary {
  id: number;
  name: string;
  role?: string;
}

interface BranchSummary {
  id: number;
  name: string;
}

interface ApplicationSummary {
  id: string;
  status: string;
  course?: {
    name?: string;
    requirements?: unknown;
    prerequisites?: unknown;
  };
}

const capitalize = (str: string) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const parseList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed.map(String) : [String(value)];
  } catch {
    return [String(value)];
  }
};

const STATUS_META: Record<string, { icon: LucideIcon; color: string; headerBg: string }> = {
  Approved: {
    icon: CheckCircle2,
    color: "text-[#006e2c]",
    headerBg: "bg-[#006e2c]/5 hover:bg-[#006e2c]/10",
  },
  "In Review": {
    icon: Clock,
    color: "text-[#005bbf]",
    headerBg: "bg-[#005bbf]/5 hover:bg-[#005bbf]/10",
  },
  Submitted: {
    icon: FileText,
    color: "text-[#005bbf]",
    headerBg: "bg-[#005bbf]/5 hover:bg-[#005bbf]/10",
  },
  Pending: {
    icon: Clock,
    color: "text-[#727785]",
    headerBg: "bg-[#727785]/5 hover:bg-[#727785]/10",
  },
  Rejected: {
    icon: XCircle,
    color: "text-[#ba1a1a]",
    headerBg: "bg-[#ba1a1a]/5 hover:bg-[#ba1a1a]/10",
  },
};

const requirementIcon = (req: string) => {
  const r = req.toLowerCase();
  if (r.includes("passport")) return ShieldCheck;
  if (r.includes("transcript")) return FileText;
  if (r.includes("certificate") || r.includes("degree")) return Award;
  if (r.includes("cv") || r.includes("resume")) return User;
  if (r.includes("english") || r.includes("ielts") || r.includes("language")) return BookOpen;
  if (r.includes("grade") || r.includes("marksheet") || r.includes("academic"))
    return GraduationCap;
  if (r.includes("sop") || r.includes("statement")) return FileText;
  if (r.includes("lor") || r.includes("recommendation")) return Mail;
  if (r.includes("work") || r.includes("experience")) return Briefcase;
  return FileText;
};

const rainbowGradients = [
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

const kanbanStatuses = [
  {
    key: "New Leads",
    label: "New Leads",
    dot: "bg-slate-400",
    gradient: "from-slate-400/20 via-gray-300/10 to-transparent",
  },
  {
    key: "In Review",
    label: "In Review",
    dot: "bg-blue-500",
    gradient: "from-blue-400/20 via-indigo-300/10 to-transparent",
  },
  {
    key: "Verified",
    label: "Verified",
    dot: "bg-emerald-500",
    gradient: "from-emerald-400/20 via-teal-300/10 to-transparent",
  },
  {
    key: "Processing",
    label: "Processing",
    dot: "bg-amber-500",
    gradient: "from-amber-400/20 via-orange-300/10 to-transparent",
  },
  {
    key: "Applied",
    label: "Applied",
    dot: "bg-purple-500",
    gradient: "from-purple-400/20 via-violet-300/10 to-transparent",
  },
  {
    key: "Enrolled",
    label: "Enrolled",
    dot: "bg-teal-500",
    gradient: "from-teal-400/20 via-cyan-300/10 to-transparent",
  },
  {
    key: "Visa Approved",
    label: "Visa Approved",
    dot: "bg-green-500",
    gradient: "from-green-400/20 via-emerald-300/10 to-transparent",
  },
  {
    key: "Visa Rejected",
    label: "Visa Rejected",
    dot: "bg-red-500",
    gradient: "from-red-400/20 via-rose-300/10 to-transparent",
  },
];

export default function StudentContent() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [students, setStudents] = useState<Student[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [academicFilter, setAcademicFilter] = useState("all");
  const [englishFilter, setEnglishFilter] = useState("all");
  const [branches, setBranches] = useState<BranchSummary[] | undefined>(undefined);
  const [branchFilter, setBranchFilter] = useState("all");
  const [allUsers, setAllUsers] = useState<UserSummary[] | undefined>(undefined);
  const [staffFilter, setStaffFilter] = useState("all");
  const [provinces, setProvinces] = useState<string[]>([]);
  const [showAppsModal, setShowAppsModal] = useState(false);
  const [appsForSelectedStudent, setAppsForSelectedStudent] = useState<ApplicationSummary[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table" | "kanban">("grid");
  const [deleteConfirm, setDeleteConfirm] = useState<Student | null>(null);
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [credsData] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (_err) {}
  };

  const fetchProvinces = async () => {
    try {
      const res = await fetch("/api/nepal/provinces");
      const data = await res.json();
      setProvinces(data);
    } catch (_err) {}
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/branches");
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
      }
    } catch (_err) {}
  };

  const _fetchStudentApps = async (studentId: string) => {
    try {
      setLoadingApps(true);
      const res = await fetch(`/api/applications?studentId=${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setAppsForSelectedStudent(data?.data || data || []);
      }
    } catch (_err) {
      toast.error("Failed to load applications");
    } finally {
      setLoadingApps(false);
    }
  };

  const appGroups = useMemo(() => {
    const map = new Map<string, { app: ApplicationSummary; req: string }[]>();
    appsForSelectedStudent.forEach((app) => {
      const reqs =
        parseList(app.course?.requirements).length > 0
          ? parseList(app.course?.requirements)
          : parseList(app.course?.prerequisites);
      const list = reqs.length > 0 ? reqs : ["View application"];
      list.forEach((req) => {
        const key = app.status || "Submitted";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ app, req });
      });
    });
    return [...map.entries()];
  }, [appsForSelectedStudent]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setProvinceFilter("all");
    setGenderFilter("all");
    setAcademicFilter("all");
    setEnglishFilter("all");
    setBranchFilter("all");
    setStaffFilter("all");
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      const data = await res.json();
      if (data && data.data && Array.isArray(data.data)) {
        setStudents(data.data);
      } else if (Array.isArray(data)) {
        setStudents(data);
      }
    } catch (_err) {
      toast.error("Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchStudents();
      fetchProvinces();
      fetchBranches();
      fetchUsers();
    });
  }, []);

  const handleDeleteStudent = async (student: Student) => {
    setDeleteConfirm(student);
  };

  const confirmDeleteStudent = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/students/${deleteConfirm.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`"${deleteConfirm.name}" deleted`);
        fetchStudents();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filteredStudents = useMemo(() => {
    return (students ?? []).filter((s) => {
      const matchesSearch =
        (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesProvince = provinceFilter === "all" || s.permanentProvince === provinceFilter;
      const matchesGender = genderFilter === "all" || s.gender === genderFilter;

      const matchesAcademic =
        academicFilter === "all" ||
        (() => {
          const edu =
            typeof s.education === "string"
              ? (JSON.parse(s.education) as EducationEntry[])
              : s.education || [];
          return edu.some((e) => {
            const score = parseFloat(e.score);
            return !isNaN(score) && score >= 3.5;
          });
        })();

      const matchesEnglish =
        englishFilter === "all" ||
        (() => {
          const score = parseFloat(s.overallScore || "0");
          if (s.testType === "IELTS") return score >= 7.0;
          if (s.testType === "PTE") return score >= 65;
          return false;
        })();

      const matchesBranch = branchFilter === "all" || s.branchId === branchFilter;
      const matchesStaff = staffFilter === "all" || s.counselor === staffFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesProvince &&
        matchesGender &&
        matchesAcademic &&
        matchesEnglish &&
        matchesBranch &&
        matchesStaff
      );
    });
  }, [
    students,
    searchQuery,
    statusFilter,
    provinceFilter,
    genderFilter,
    academicFilter,
    englishFilter,
    branchFilter,
    staffFilter,
  ]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="text-indigo-600" />
              Students
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {filteredStudents.length.toLocaleString()} students matching your current filters
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/students/new")}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Plus size={18} />
            Add Student
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full min-w-[200px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer h-9"
              >
                <option value="all">All Status</option>
                <option value="In Review">In Review</option>
                <option value="Verified">Verified</option>
                <option value="New Leads">New Leads</option>
                <option value="Processing">Processing</option>
                <option value="Applied">Applied</option>
                <option value="Enrolled">Enrolled</option>
                <option value="Visa Approved">Visa Approved</option>
                <option value="Visa Rejected">Visa Rejected</option>
              </select>

              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer h-9"
              >
                <option value="all">All Branches</option>
                {(branches ?? []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 h-9 ${showMoreFilters ? "bg-indigo-600 text-white shadow-md" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
              >
                <Filter size={14} />
                {showMoreFilters ? "Hide Filters" : "More Filters"}
              </button>

              {(searchQuery ||
                statusFilter !== "all" ||
                provinceFilter !== "all" ||
                genderFilter !== "all" ||
                academicFilter !== "all" ||
                englishFilter !== "all" ||
                branchFilter !== "all" ||
                staffFilter !== "all") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center gap-1 h-9"
                  aria-label="Close"
                >
                  {" "}
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                title="Table view"
              >
                <Table size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`p-2 rounded-lg transition-all ${viewMode === "kanban" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                title="Kanban view"
              >
                <Columns3 size={16} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showMoreFilters && (
              <motion.div
                initial={prefersReducedMotion ? false : { gridTemplateRows: "0fr", opacity: 0 }}
                animate={prefersReducedMotion ? {} : { gridTemplateRows: "1fr", opacity: 1 }}
                exit={{ gridTemplateRows: "0fr", opacity: 0 }}
                className="grid overflow-hidden"
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="pt-4 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="filter-province"
                      className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1"
                    >
                      Province
                    </label>
                    <select
                      id="filter-province"
                      value={provinceFilter}
                      onChange={(e) => setProvinceFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">All Provinces</option>
                      {(provinces ?? []).map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="filter-gender"
                      className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1"
                    >
                      Gender
                    </label>
                    <select
                      id="filter-gender"
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">All Genders</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="filter-academic"
                      className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1"
                    >
                      Academic
                    </label>
                    <select
                      id="filter-academic"
                      value={academicFilter}
                      onChange={(e) => setAcademicFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                    >
                      <option value="all">Any GPA</option>
                      <option value="high_grades">High Grades (3.5+)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="filter-english"
                      className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1"
                    >
                      English
                    </label>
                    <select
                      id="filter-english"
                      value={englishFilter}
                      onChange={(e) => setEnglishFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                    >
                      <option value="all">Any English Score</option>
                      <option value="high_english">IELTS 7+ / PTE 65+</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="filter-staff"
                      className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1"
                    >
                      Staff Member
                    </label>
                    <select
                      id="filter-staff"
                      value={staffFilter}
                      onChange={(e) => setStaffFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">All Staff</option>
                      {(allUsers ?? []).map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : viewMode === "kanban" ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card p-4 min-w-[280px] flex-shrink-0">
                  <div className="h-6 w-24 bg-slate-100 rounded animate-pulse mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-24 bg-slate-50 rounded-xl animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <SkeletonTable rows={8} />
          )
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredStudents.map((student, idx) => (
              <div
                key={student.id}
                className="card p-5 hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${rainbowGradients[idx % rainbowGradients.length]} pointer-events-none`}
                />
                <div className="flex justify-between items-start mb-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <button
                        type="button"
                        className="font-bold text-slate-800 hover:text-indigo-600 cursor-pointer transition-colors text-left"
                        onClick={() => router.push(`/students/${student.id}`)}
                      >
                        {capitalize(student.name)}
                      </button>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {student.email}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                            student.status === "In Review"
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : student.status === "Verified"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : student.status === "New Leads"
                                  ? "bg-slate-100 text-slate-600 border-slate-200"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-100"
                          }`}
                        >
                          {student.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => router.push(`/students/${student.id}/edit`)}
                      className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStudent(student)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={13} className="text-slate-400" />
                    {student.email}
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone size={13} className="text-slate-400" />
                      {student.phone}
                    </div>
                  )}
                  {student.interestedCountry && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {getCountryFlag(student.interestedCountry) && (
                        <Image
                          src={getCountryFlag(student.interestedCountry)}
                          alt=""
                          width={24}
                          height={24}
                          className="w-5 h-3.5 rounded-sm object-cover"
                        />
                      )}
                      {student.interestedCountry}
                    </div>
                  )}
                  {student.counselor && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User size={13} className="text-slate-400" />
                      <span className="font-bold text-indigo-600">
                        Counselor: {student.counselor}
                      </span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => router.push(`/files?studentId=${student.id}`)}
                    className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    <FileText size={13} />
                    {student._count?.documents || 0} Documents
                  </button>
                  <div className="text-[10px] text-slate-400">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === "kanban" ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {kanbanStatuses.map((col) => {
              const studentsInCol = filteredStudents.filter((s) => s.status === col.key);
              return (
                <div key={col.key} className="min-w-[280px] max-w-[280px] flex-shrink-0">
                  <div className="card p-3 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`size-2.5 rounded-full ${col.dot}`} />
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {col.label}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {studentsInCol.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {studentsInCol.map((student) => (
                      <div
                        key={student.id}
                        className="card p-4 hover:shadow-md transition-all group relative cursor-pointer overflow-hidden"
                        role="button"
                        tabIndex={0}
                        onClick={() => router.push(`/students/${student.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            router.push(`/students/${student.id}`);
                          }
                        }}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${col.gradient} pointer-events-none`}
                        />
                        <div className="flex items-start justify-between mb-3 relative">
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-tight">
                                {capitalize(student.name)}
                              </p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{student.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/students/${student.id}/edit`);
                              }}
                              className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStudent(student);
                              }}
                              className="p-1 text-red-300 hover:text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {student.phone && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <Phone size={10} className="text-slate-300" />
                              {student.phone}
                            </div>
                          )}
                          {student.counselor && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <User size={10} className="text-slate-300" />
                              <span className="font-semibold text-indigo-500">
                                {student.counselor}
                              </span>
                            </div>
                          )}
                          {student.interestedCountry && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              {getCountryFlag(student.interestedCountry) && (
                                <Image
                                  src={getCountryFlag(student.interestedCountry)}
                                  alt=""
                                  width={24}
                                  height={24}
                                  className="w-5 h-3.5 rounded-sm object-cover"
                                />
                              )}
                              {student.interestedCountry}
                            </div>
                          )}
                          {student.partner && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <Users size={10} className="text-slate-300" />
                              <span className="font-semibold text-indigo-500">
                                {student.partner.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/files?studentId=${student.id}`);
                            }}
                            className="flex items-center gap-1 text-[9px] font-semibold text-indigo-500 hover:text-indigo-700"
                          >
                            <FileText size={10} />
                            {student._count?.documents || 0} docs
                          </button>
                          <span className="text-[9px] text-slate-400">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {studentsInCol.length === 0 && (
                      <div className="card p-4">
                        <p className="text-[10px] text-slate-300 text-center">No students</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Counselor
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="font-bold text-slate-800 hover:text-indigo-600 transition-colors text-left"
                        onClick={() => router.push(`/students/${student.id}`)}
                      >
                        {capitalize(student.name)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{student.email}</td>
                    <td className="px-4 py-3 text-slate-500">{student.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                          student.status === "In Review"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : student.status === "Verified"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : student.status === "New Leads"
                                ? "bg-slate-100 text-slate-600 border-slate-200"
                                : "bg-indigo-50 text-indigo-700 border-indigo-100"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{student.counselor || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {getCountryFlag(student.interestedCountry || "") && (
                          <Image
                            src={getCountryFlag(student.interestedCountry || "")}
                            alt=""
                            width={24}
                            height={24}
                            className="w-5 h-3.5 rounded-sm object-cover"
                          />
                        )}
                        <span className="text-slate-500">{student.interestedCountry || "-"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{student.partner?.name || "-"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => router.push(`/files?studentId=${student.id}`)}
                        className="text-indigo-600 hover:underline text-xs font-bold"
                      >
                        {student._count?.documents || 0}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => router.push(`/students/${student.id}/edit`)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(student)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">
                No students match your filters.
              </div>
            )}
          </div>
        )}

        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/10"
              onClick={() => setSelectedStudent(null)}
            />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">
                  Documents: {capitalize(selectedStudent.name)}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                {/* Credentials Section */}
                {(selectedStudent.admissionEmail || selectedStudent.studentPassword) && (
                  <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <ShieldCheck size={12} /> Application Credentials
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">
                          Admission Email
                        </p>
                        <p className="text-sm text-slate-800 break-all">
                          {selectedStudent.admissionEmail || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Password
                        </p>
                        <p className="text-sm text-slate-800">
                          {selectedStudent.studentPassword || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {selectedStudent.documents && selectedStudent.documents.length > 0 ? (
                    selectedStudent.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="text-indigo-600" size={20} />
                          <div>
                            <p className="text-sm font-bold text-slate-700">{doc.type}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{doc.name}</p>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
                        >
                          View File
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <FileText size={40} className="mx-auto text-slate-200 mb-2" />
                      <p className="text-sm text-slate-400">
                        No documents uploaded for this student.
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Applications Modal */}
        {showAppsModal && selectedStudent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm"
              onClick={() => setShowAppsModal(false)}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl animate-slide-up overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-800">Applications</h2>
                  <p className="text-sm text-slate-400">
                    Viewing all applications for {selectedStudent.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAppsModal(false)}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {loadingApps ? (
                  <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-sm font-bold">Fetching applications…</p>
                  </div>
                ) : appsForSelectedStudent.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="text-slate-200" size={32} />
                    </div>
                    <p className="text-slate-500 font-bold">No applications found</p>
                    <p className="text-slate-400 text-sm">
                      This student hasn&apos;t applied to any courses yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appGroups.map(([status, items]) => {
                      const meta = STATUS_META[status] || {
                        icon: FileText,
                        color: "text-[#005bbf]",
                        headerBg: "bg-[#005bbf]/5 hover:bg-[#005bbf]/10",
                      };
                      const Icon = meta.icon;
                      return (
                        <div
                          key={status}
                          className="bg-white border border-[#c1c6d6] rounded-xl overflow-hidden shadow-sm"
                        >
                          <button
                            type="button"
                            className={`w-full flex items-center justify-between p-4 border-b border-[#c1c6d6] transition-colors ${meta.headerBg}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={meta.color}>
                                <Icon size={22} />
                              </span>
                              <span className="font-bold text-[#181c20]">
                                {status} ({items.length})
                              </span>
                            </div>
                            <span className="text-[#727785]">
                              <ChevronDown size={20} />
                            </span>
                          </button>
                          <div className="divide-y divide-[#c1c6d6]">
                            {items.map(({ app, req }, i) => {
                              const ReqIcon = requirementIcon(req);
                              return (
                                <div
                                  key={`${app.id}-${i}`}
                                  className="flex items-center justify-between p-4 hover:bg-[#f1f4fa] transition-colors group"
                                >
                                  <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-[#ebeef4] flex items-center justify-center text-[#005bbf] group-hover:bg-[#d8e2ff] shrink-0">
                                      <ReqIcon size={18} />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="font-semibold text-[#181c20] block truncate">
                                        {req}
                                      </span>
                                      <span className="text-xs text-[#727785] block truncate">
                                        #{String(app.id).substring(String(app.id).length - 6)} •{" "}
                                        {app.course?.name}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      type="button"
                                      className="flex items-center gap-2 px-3 py-1.5 border border-[#005bbf] text-[#005bbf] rounded-lg text-sm font-semibold hover:bg-[#005bbf]/5"
                                    >
                                      <ExternalLink size={16} />
                                      Details
                                    </button>
                                    <button
                                      type="button"
                                      className="p-1.5 text-[#727785] hover:text-[#005bbf]"
                                    >
                                      <MoreVertical size={16} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAppsModal(false)}
                  className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Detail Modal */}
        {/* Credentials Success Modal */}
        <AnimatePresence>
          {showCredsModal && credsData && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => {
                  setShowCredsModal(false);
                  setCopied(false);
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        <KeyRound size={28} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black">Credentials Generated</h3>
                        <p className="text-sm text-white/80">Share these with the student</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCredsModal(false);
                        setCopied(false);
                      }}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Student Name
                    </p>
                    <p className="text-sm font-bold text-slate-800">{credsData.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Login Email
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-800 break-all">
                        {credsData.email}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(credsData.email);
                          toast.success("Email copied");
                        }}
                        className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 transition-all"
                        title="Copy email"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Password
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 bg-amber-50 rounded-xl border border-amber-200 text-sm font-mono font-bold text-slate-800">
                        {credsData.password}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(credsData.password);
                          setCopied(true);
                          toast.success("Password copied");
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 transition-all"
                        title="Copy password"
                      >
                        {copied ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                      Portal URL
                    </p>
                    <p className="text-sm font-mono font-bold text-indigo-800 select-all">
                      {typeof window !== "undefined"
                        ? `${window.location.origin}/student-portal`
                        : "/student-portal"}
                    </p>
                  </div>
                </div>
                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCredsModal(false);
                      setCopied(false);
                    }}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ConfirmDialog
          open={deleteConfirm !== null}
          title="Delete Student"
          message={deleteConfirm ? `Are you sure you want to delete "${deleteConfirm.name}"?` : ""}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={confirmDeleteStudent}
          onCancel={() => setDeleteConfirm(null)}
        />
      </div>
    </LazyMotion>
  );
}

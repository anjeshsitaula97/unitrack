"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/data/countries";
import {
  GraduationCap,
  Plus,
  Trash2,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  Users,
  Map,
  ShieldCheck,
  Briefcase,
  Zap,
  FileText,
} from "lucide-react";
import {
  LazyMotion,
  m as motion,
  domAnimation,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { toast } from "sonner";
import { ADToBS, BSToAD } from "bikram-sambat-js";
import NEB_INSTITUTES from "@/lib/data/neb_grade12_institutes.json";

interface ChildEntry {
  id: number;
  name: string;
  gender: string;
}

interface EducationEntry {
  id: number;
  qualification: string;
  institution: string;
  institutionAddress: string;
  year: string;
  score: string;
  country: string;
}

interface WorkExperienceEntry {
  id: number;
  jobTitle: string;
  company: string;
  companyAddress: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
}

interface TrainingEntry {
  id: number;
  name: string;
  provider: string;
  date: string;
}

interface DocumentEntry {
  id: string;
  type: string;
  name: string;
  url: string;
  status: string;
}

interface UserSummary {
  id: number;
  name: string;
  role?: string;
}

interface PartnerSummary {
  id: number;
  name: string;
  countries?: string;
}

interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  admissionEmail: string;
  studentPassword: string;
  phone: string;
  phonePrefix: string;
  whatsappNumber: string;
  gender: string;
  dobAd: string;
  dobBs: string;
  nationality: string;
  maritalStatus: string;
  spouseName: string;
  childrenDetails: ChildEntry[];
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelation: string;
  guardianAddress: string;
  status: string;
  permanentProvince: string;
  permanentDistrict: string;
  permanentMunicipality: string;
  permanentWardNo: string;
  permanentAddress: string;
  temporaryProvince: string;
  temporaryDistrict: string;
  temporaryMunicipality: string;
  temporaryWardNo: string;
  temporaryAddress: string;
  passportNumber: string;
  passportNationality: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  passportIssuePlace: string;
  education: EducationEntry[];
  workExperience: WorkExperienceEntry[];
  training: TrainingEntry[];
  testType: string;
  overallScore: string;
  readingScore: string;
  writingScore: string;
  listeningScore: string;
  speakingScore: string;
  moi: string;
  testDate: string;
  testRegNumber: string;
  studyLevel: string;
  intakeTerm: string;
  major: string;
  interestedCountry: string;
  partnerId: string;
  targetUniversities: string;
  counselor: string;
  documents: DocumentEntry[];
}

export interface Student {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string | null;
  status: string;
  admissionEmail?: string;
  studentPassword?: string;
  dobAd?: string;
  dobBs?: string;
  nationality?: string;
  gender?: string;
  maritalStatus?: string;
  spouseName?: string;
  childrenDetails?: ChildEntry[] | string;
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
  workExperience?: WorkExperienceEntry[] | string;
  training?: TrainingEntry[] | string;
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
  whatsappNumber?: string;
  documents?: DocumentEntry[];
}

const STEPS = [
  { id: 1, name: "Personal", icon: User },
  { id: 2, name: "Family", icon: Users },
  { id: 3, name: "Address", icon: Map },
  { id: 4, name: "Passport", icon: ShieldCheck },
  { id: 5, name: "Academic", icon: GraduationCap },
  { id: 6, name: "Experience", icon: Briefcase },
  { id: 7, name: "Preferences", icon: Zap },
  { id: 8, name: "Documents", icon: FileText },
];

const docTypes = [
  "Passport",
  "SLC/SEE Transcript",
  "SLC/SEE Character",
  "+2/PCL Transcript",
  "+2/PCL Character",
  "Bachelor Transcript",
  "Bachelor Character",
  "Master Transcript",
  "IELTS/PTE/TOEFL Scorecard",
  "Statement of Purpose (SOP)",
  "CV/Resume",
  "Citizenship",
  "Experience Letter",
  "Other",
];

const capitalize = (str: string) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const fetchDistricts = async (province: string, setter: (val: string[]) => void) => {
  try {
    const res = await fetch(`/api/nepal/districts?province=${encodeURIComponent(province)}`);
    const data = await res.json();
    setter(data);
  } catch (_err) {}
};

const fetchMunicipalities = async (district: string, setter: (val: string[]) => void) => {
  try {
    const res = await fetch(`/api/nepal/municipalities?district=${encodeURIComponent(district)}`);
    const data = await res.json();
    setter(data);
  } catch (_err) {}
};

const fetchWards = async (
  district: string,
  municipality: string,
  setter: (val: string[]) => void
) => {
  try {
    const res = await fetch(
      `/api/nepal/wards?district=${encodeURIComponent(district)}&municipality=${encodeURIComponent(municipality)}`
    );
    const data = await res.json();
    setter(data);
  } catch (_err) {}
};

export default function StudentForm({
  initialStudent,
  onSuccess,
}: {
  initialStudent?: Student | null;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const totalSteps = 8;
  const [qualifications, setQualifications] = useState<{ id: string; name: string }[]>([]);
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [allPartners, setAllPartners] = useState<PartnerSummary[]>([]);
  const staffUsers = useMemo(
    () => (allUsers || []).filter((u) => u.role !== "Student"),
    [allUsers]
  );
  const [provinces, setProvinces] = useState<string[]>([]);
  const [permanentDistricts, setPermanentDistricts] = useState<string[]>([]);
  const [permanentMunicipalities, setPermanentMunicipalities] = useState<string[]>([]);
  const [permanentWards, setPermanentWards] = useState<string[]>([]);
  const temporaryDistricts = useRef<string[]>([]);
  const temporaryMunicipalities = useRef<string[]>([]);
  const temporaryWards = useRef<string[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const isEditing = !!initialStudent;

  const [formData, setFormData] = useState<StudentFormData>(() => ({
    firstName: "",
    lastName: "",
    email: "",
    admissionEmail: "",
    studentPassword: "",
    phone: "",
    phonePrefix: "+977",
    whatsappNumber: "",
    gender: "",
    dobAd: "",
    dobBs: "",
    nationality: "Nepal",
    maritalStatus: "Single",
    spouseName: "",
    childrenDetails: [],
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelation: "",
    guardianAddress: "",
    status: "In Review",
    permanentProvince: "",
    permanentDistrict: "",
    permanentMunicipality: "",
    permanentWardNo: "",
    permanentAddress: "",
    temporaryProvince: "",
    temporaryDistrict: "",
    temporaryMunicipality: "",
    temporaryWardNo: "",
    temporaryAddress: "",
    passportNumber: "",
    passportNationality: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    passportIssuePlace: "",
    education: [
      {
        id: Date.now(),
        qualification: "",
        institution: "",
        institutionAddress: "",
        year: "",
        score: "",
        country: "",
      },
    ],
    workExperience: [
      {
        id: Date.now(),
        jobTitle: "",
        company: "",
        companyAddress: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
      },
    ],
    training: [{ id: Date.now(), name: "", provider: "", date: "" }],
    testType: "Select Test",
    overallScore: "",
    readingScore: "",
    writingScore: "",
    listeningScore: "",
    speakingScore: "",
    moi: "",
    testDate: "",
    testRegNumber: "",
    studyLevel: "",
    intakeTerm: "",
    major: "",
    interestedCountry: "",
    partnerId: "",
    targetUniversities: "",
    counselor: "",
    documents: [],
  }));

  useEffect(() => {
    if (initialStudent) {
      let phonePrefix = "+977";
      let phoneMain = initialStudent.phone || "";
      if (initialStudent.phone && initialStudent.phone.startsWith("+")) {
        const parts = initialStudent.phone.split(" ");
        if (parts.length > 1) {
          phonePrefix = parts[0];
          phoneMain = parts.slice(1).join(" ");
        }
      }
      const s = initialStudent;
      const nextFormData = {
        firstName: s.firstName || "",
        lastName: s.lastName || "",
        email: s.email || "",
        admissionEmail: s.admissionEmail || "",
        studentPassword: s.studentPassword || "",
        phone: phoneMain,
        phonePrefix,
        whatsappNumber: s.whatsappNumber || "",
        gender: s.gender || "",
        dobAd: s.dobAd || "",
        dobBs: s.dobBs || "",
        nationality: s.nationality || "Nepal",
        maritalStatus: s.maritalStatus || "Single",
        spouseName: s.spouseName || "",
        childrenDetails: s.childrenDetails
          ? typeof s.childrenDetails === "string"
            ? JSON.parse(s.childrenDetails)
            : s.childrenDetails
          : [],
        guardianName: s.guardianName || "",
        guardianPhone: s.guardianPhone || "",
        guardianEmail: s.guardianEmail || "",
        guardianRelation: s.guardianRelation || "",
        guardianAddress: s.guardianAddress || "",
        status: s.status || "In Review",
        permanentProvince: s.permanentProvince || "",
        permanentDistrict: s.permanentDistrict || "",
        permanentMunicipality: s.permanentMunicipality || "",
        permanentWardNo: s.permanentWardNo || "",
        permanentAddress: s.permanentAddress || "",
        temporaryProvince: s.temporaryProvince || "",
        temporaryDistrict: s.temporaryDistrict || "",
        temporaryMunicipality: s.temporaryMunicipality || "",
        temporaryWardNo: s.temporaryWardNo || "",
        temporaryAddress: s.temporaryAddress || "",
        passportNumber: s.passportNumber || "",
        passportNationality: s.passportNationality || "",
        passportIssueDate: s.passportIssueDate || "",
        passportExpiryDate: s.passportExpiryDate || "",
        passportIssuePlace: s.passportIssuePlace || "",
        education: s.education
          ? typeof s.education === "string"
            ? JSON.parse(s.education)
            : s.education
          : [
              {
                id: Date.now(),
                qualification: "",
                institution: "",
                institutionAddress: "",
                year: "",
                score: "",
                country: "",
              },
            ],
        workExperience: s.workExperience
          ? typeof s.workExperience === "string"
            ? JSON.parse(s.workExperience)
            : s.workExperience
          : [
              {
                id: Date.now(),
                jobTitle: "",
                company: "",
                companyAddress: "",
                startDate: "",
                endDate: "",
                currentlyWorking: false,
              },
            ],
        training: s.training
          ? typeof s.training === "string"
            ? JSON.parse(s.training)
            : s.training
          : [{ id: Date.now(), name: "", provider: "", date: "" }],
        testType: s.testType || "Select Test",
        overallScore: s.overallScore || "",
        readingScore: s.readingScore || "",
        writingScore: s.writingScore || "",
        listeningScore: s.listeningScore || "",
        speakingScore: s.speakingScore || "",
        moi: s.moi || "",
        testDate: s.testDate || "",
        testRegNumber: s.testRegNumber || "",
        studyLevel: s.studyLevel || "",
        intakeTerm: s.intakeTerm || "",
        major: s.major || "",
        interestedCountry: s.interestedCountry || "",
        partnerId: s.partnerId || "",
        targetUniversities: s.targetUniversities || "",
        counselor: s.counselor || "",
        documents: s.documents || [],
      };
      queueMicrotask(() => {
        setFormData(nextFormData);
      });
      if (s.permanentProvince) fetchDistricts(s.permanentProvince, setPermanentDistricts);
      if (s.permanentDistrict) fetchMunicipalities(s.permanentDistrict, setPermanentMunicipalities);
      if (s.permanentDistrict && s.permanentMunicipality)
        fetchWards(s.permanentDistrict, s.permanentMunicipality, setPermanentWards);
    }
  }, [initialStudent]);

  useEffect(() => {
    if (formData.temporaryProvince) {
      fetchDistricts(formData.temporaryProvince, (val: string[]) => {
        temporaryDistricts.current = val;
      });
    } else {
      temporaryDistricts.current = [];
    }
  }, [formData.temporaryProvince]);

  useEffect(() => {
    if (formData.temporaryDistrict) {
      fetchMunicipalities(formData.temporaryDistrict, (val: string[]) => {
        temporaryMunicipalities.current = val;
      });
    } else {
      temporaryMunicipalities.current = [];
    }
  }, [formData.temporaryDistrict]);

  useEffect(() => {
    if (formData.temporaryDistrict && formData.temporaryMunicipality) {
      fetchWards(formData.temporaryDistrict, formData.temporaryMunicipality, (val: string[]) => {
        temporaryWards.current = val;
      });
    } else {
      temporaryWards.current = [];
    }
  }, [formData.temporaryDistrict, formData.temporaryMunicipality]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (_err) {}
  };

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/partners");
      if (res.ok) {
        const data = await res.json();
        setAllPartners(data);
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

  const fetchQualifications = async () => {
    try {
      const res = await fetch("/api/qualifications");
      const data = (await res.json()) as { id: string; name: string }[];
      if (Array.isArray(data)) {
        const order: Record<string, number> = {
          SEE: 1,
          SLC: 1,
          "GRADE 10": 1,
          "+2": 2,
          "PLUS 2": 2,
          "GRADE 12": 2,
          "GRADE XII": 2,
          PCL: 2,
          BACHELOR: 3,
          UNDERGRADUATE: 3,
          MASTER: 4,
          POSTGRADUATE: 4,
          PHD: 5,
          DOCTORATE: 5,
        };
        const sorted = data.toSorted((a, b) => {
          const getScore = (name: string) => {
            const n = name.toUpperCase();
            const entry = Object.entries(order).find(([key]) => n.includes(key));
            return entry ? entry[1] : 99;
          };
          return getScore(a.name) - getScore(b.name);
        });
        setQualifications(sorted);
      }
    } catch (_err) {}
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchQualifications();
      fetchUsers();
      fetchPartners();
      fetchProvinces();
    });
  }, []);

  const handleSubmit = async () => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `/api/students/${initialStudent!.id}` : "/api/students";
    const submissionData = {
      ...formData,
      phone: `${formData.phonePrefix} ${formData.phone}`.trim(),
    };
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      if (res.ok) {
        const responseData = await res.json();
        if (!isEditing && responseData.generatedPassword) {
          toast.success(`Student added. Portal password: ${responseData.generatedPassword}`, {
            duration: 10000,
          });
        } else {
          toast.success(isEditing ? "Student updated" : "Student added");
        }
        onSuccess();
      } else {
        const error = await res.json();
        toast.error(error.error || "Operation failed");
      }
    } catch (_err) {
      toast.error("Error connecting to server");
    }
  };

  const handleFileUpload = async (type: string, file: File) => {
    setUploadingDoc(type);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const newDoc = {
        id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9),
        type,
        name: file.name,
        url: data.url,
        status: "Uploaded",
      };
      setFormData((prev: StudentFormData) => ({
        ...prev,
        documents: [...prev.documents.filter((d) => d.type !== type), newDoc],
      }));
      toast.success(`${type} uploaded successfully`);
    } catch {
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleAdDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ad = e.target.value;
    setFormData((prev: StudentFormData) => ({ ...prev, dobAd: ad }));
    try {
      if (ad) {
        let bs = ADToBS(ad);
        if (bs && bs.includes("/")) {
          bs = bs.replace(/\//g, "-");
        }
        setFormData((prev: StudentFormData) => ({ ...prev, dobBs: bs }));
      }
    } catch (_err) {}
  };

  const handleBsDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let bs = e.target.value;
    bs = bs.replace(/\//g, "-");
    bs = bs.replace(/[^0-9-]/g, "");
    if (bs.length > 10) bs = bs.substring(0, 10);
    if (bs.length > (formData.dobBs?.length || 0)) {
      if (bs.length === 4) {
        bs = bs + "-";
      } else if (bs.length === 7) {
        bs = bs + "-";
      }
    }
    setFormData((prev: StudentFormData) => ({ ...prev, dobBs: bs }));
    try {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (bs && dateRegex.test(bs)) {
        const ad = BSToAD(bs);
        setFormData((prev: StudentFormData) => ({ ...prev, dobAd: ad }));
      }
    } catch (_err) {}
  };

  const addChild = () => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      childrenDetails: [...prev.childrenDetails, { id: Date.now(), name: "", gender: "Male" }],
    }));
  };

  const removeChild = (id: number) => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      childrenDetails: prev.childrenDetails.filter((c) => c.id !== id),
    }));
  };

  const updateChild = (id: number, field: string, value: string) => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      childrenDetails: prev.childrenDetails.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  };

  const addEducation = () => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now(),
          qualification: "",
          institution: "",
          institutionAddress: "",
          year: "",
          score: "",
          country: "",
        },
      ],
    }));
  };

  const removeEducation = (id: number) => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  const updateEducation = (id: number, field: string, value: string) => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      education: prev.education.map((e) => {
        if (e.id === id) {
          const updated = { ...e, [field]: value };
          if (field === "institution") {
            const found = NEB_INSTITUTES.find((inst) => inst.name === value);
            if (found) {
              updated.institutionAddress = found.address;
            }
          }
          return updated;
        }
        return e;
      }),
    }));
  };

  const addWork = () => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        {
          id: Date.now(),
          jobTitle: "",
          company: "",
          companyAddress: "",
          startDate: "",
          endDate: "",
          currentlyWorking: false,
        },
      ],
    }));
  };

  const updateWork = (id: number, field: string, value: string | boolean) => {
    setFormData((prev: StudentFormData) => ({
      ...prev,
      workExperience: prev.workExperience.map((w) => (w.id === id ? { ...w, [field]: value } : w)),
    }));
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-slate-50/50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                <Plus size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800">
                  {isEditing ? "Edit Student" : "Add New Student"}
                </h1>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                  Step {step} of {totalSteps}: {STEPS[step - 1].name}
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ minHeight: "calc(100vh - 200px)" }}
          >
            <div className="flex flex-1 min-h-0">
              <div className="w-[220px] shrink-0 border-r border-slate-100 p-3 pt-5 space-y-1">
                {STEPS.map((s) => {
                  const isCompleted = step > s.id;
                  const isActive = step === s.id;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setStep(s.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 shadow-sm"
                          : isCompleted
                            ? "text-emerald-600"
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`size-6 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : isCompleted
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isCompleted ? <Check size={12} /> : s.id}
                      </span>
                      <span>{s.name}</span>
                    </button>
                  );
                })}
              </div>

              <form className="flex-1 overflow-y-auto p-6 no-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {step === 1 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 md:col-span-2">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3">
                            Basic Information
                          </h3>
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="first-name"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            First Name
                          </label>
                          <input
                            id="first-name"
                            required
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({ ...formData, firstName: e.target.value })
                            }
                            onBlur={(e) =>
                              setFormData({ ...formData, firstName: capitalize(e.target.value) })
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all text-sm"
                            placeholder="e.g. John"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="last-name"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Last Name
                          </label>
                          <input
                            id="last-name"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            onBlur={(e) =>
                              setFormData({ ...formData, lastName: capitalize(e.target.value) })
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all text-sm"
                            placeholder="e.g. Doe"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="primary-email"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Primary Email
                          </label>
                          <input
                            id="primary-email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all text-sm"
                            placeholder="personal@example.com"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="student-status"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Student Status
                          </label>
                          <select
                            id="student-status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all text-sm appearance-none"
                          >
                            <option value="In Review">In Review</option>
                            <option value="Verified">Verified</option>
                            <option value="New Leads">New Leads</option>
                            <option value="Processing">Processing</option>
                            <option value="Applied">Applied</option>
                            <option value="Enrolled">Enrolled</option>
                            <option value="Visa Approved">Visa Approved</option>
                            <option value="Visa Rejected">Visa Rejected</option>
                          </select>
                        </div>

                        <div className="space-y-4 md:col-span-2 pt-4">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.amber.200)] pl-3">
                            Application Credentials
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 ml-4 italic">
                            Email created specifically for university applications
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="admission-email"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Admission Email
                          </label>
                          <input
                            id="admission-email"
                            type="email"
                            value={formData.admissionEmail}
                            onChange={(e) =>
                              setFormData({ ...formData, admissionEmail: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-amber-50/30 border border-amber-100 rounded-xl outline-none transition-all text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5"
                            placeholder="application.id@gmail.com"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="email-password"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Email Password
                          </label>
                          <input
                            id="email-password"
                            type="text"
                            value={formData.studentPassword}
                            onChange={(e) =>
                              setFormData({ ...formData, studentPassword: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-amber-50/30 border border-amber-100 rounded-xl outline-none transition-all text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5"
                            placeholder="Password for admission email"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="phone-number"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Phone Number
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={formData.phonePrefix}
                              onChange={(e) =>
                                setFormData({ ...formData, phonePrefix: e.target.value })
                              }
                              className="w-24 p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold appearance-none text-center"
                            >
                              {COUNTRIES.map((c) => (
                                <option key={c.name} value={c.phoneCode}>
                                  {c.phoneCode}
                                </option>
                              ))}
                            </select>
                            <input
                              id="phone-number"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all text-sm"
                              placeholder="9800000000"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="assigned-counselor"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Assigned Counselor (Staff)
                          </label>
                          <select
                            id="assigned-counselor"
                            value={formData.counselor}
                            onChange={(e) =>
                              setFormData({ ...formData, counselor: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl outline-none transition-all text-sm font-bold text-indigo-700"
                          >
                            <option value="">Select Counselor</option>
                            {staffUsers.map((u) => (
                              <option key={u.id} value={u.name}>
                                {u.name}
                                {u.role && u.role !== "Super Admin" ? ` (${u.role})` : ""}
                              </option>
                            ))}
                            {staffUsers.length === 0 && (
                              <option value="" disabled>
                                No staff available. Add staff in the Staff module.
                              </option>
                            )}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="nationality"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Nationality
                          </label>
                          <select
                            id="nationality"
                            value={formData.nationality}
                            onChange={(e) => {
                              const nationality = e.target.value;
                              const c = COUNTRIES.find((n) => n.name === nationality);
                              setFormData({
                                ...formData,
                                nationality,
                                phonePrefix: c ? c.phoneCode : "+977",
                              });
                            }}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all text-sm appearance-none"
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="dob-ad"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            DOB (AD)
                          </label>
                          <input
                            id="dob-ad"
                            type="date"
                            value={formData.dobAd}
                            onChange={handleAdDobChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="dob-bs"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            DOB (BS)
                          </label>
                          <input
                            id="dob-bs"
                            value={formData.dobBs}
                            onChange={handleBsDobChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all text-sm"
                            placeholder="YYYY-MM-DD"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="gender"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Gender
                          </label>
                          <select
                            id="gender"
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all text-sm appearance-none"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3 mb-6">
                            Guardian Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label
                                htmlFor="guardian-name"
                                className="text-[11px] font-semibold text-slate-500 ml-1"
                              >
                                Guardian Name
                              </label>
                              <input
                                id="guardian-name"
                                value={formData.guardianName}
                                onChange={(e) =>
                                  setFormData({ ...formData, guardianName: e.target.value })
                                }
                                onBlur={(e) =>
                                  setFormData({
                                    ...formData,
                                    guardianName: capitalize(e.target.value),
                                  })
                                }
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                                placeholder="Full Name"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label
                                htmlFor="guardian-relation"
                                className="text-[11px] font-semibold text-slate-500 ml-1"
                              >
                                Relation
                              </label>
                              <select
                                id="guardian-relation"
                                value={formData.guardianRelation}
                                onChange={(e) =>
                                  setFormData({ ...formData, guardianRelation: e.target.value })
                                }
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm appearance-none"
                              >
                                <option value="">Select Relation</option>
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Brother">Brother</option>
                                <option value="Sister">Sister</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label
                                htmlFor="guardian-phone"
                                className="text-[11px] font-semibold text-slate-500 ml-1"
                              >
                                Phone Number
                              </label>
                              <input
                                id="guardian-phone"
                                value={formData.guardianPhone}
                                onChange={(e) =>
                                  setFormData({ ...formData, guardianPhone: e.target.value })
                                }
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                                placeholder="9800000000"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label
                                htmlFor="guardian-email"
                                className="text-[11px] font-semibold text-slate-500 ml-1"
                              >
                                Email Address
                              </label>
                              <input
                                id="guardian-email"
                                value={formData.guardianEmail}
                                onChange={(e) =>
                                  setFormData({ ...formData, guardianEmail: e.target.value })
                                }
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                                placeholder="guardian@example.com"
                              />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                              <label
                                htmlFor="guardian-address"
                                className="text-[11px] font-semibold text-slate-500 ml-1"
                              >
                                Guardian Address
                              </label>
                              <input
                                id="guardian-address"
                                value={formData.guardianAddress}
                                onChange={(e) =>
                                  setFormData({ ...formData, guardianAddress: e.target.value })
                                }
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                                placeholder="Full Address"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.amber.200)] pl-3 mb-6">
                            Marital & Dependent Status
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label
                                htmlFor="marital-status"
                                className="text-[11px] font-semibold text-slate-500 ml-1"
                              >
                                Marital Status
                              </label>
                              <select
                                id="marital-status"
                                value={formData.maritalStatus}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    maritalStatus: e.target.value,
                                    childrenDetails:
                                      e.target.value === "Single" ? [] : formData.childrenDetails,
                                  })
                                }
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all text-sm appearance-none"
                              >
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                              </select>
                            </div>

                            {formData.maritalStatus === "Married" && (
                              <div className="space-y-1.5">
                                <label
                                  htmlFor="spouse-name"
                                  className="text-[11px] font-semibold text-slate-500 ml-1"
                                >
                                  Spouse Name
                                </label>
                                <input
                                  id="spouse-name"
                                  value={formData.spouseName}
                                  onChange={(e) =>
                                    setFormData({ ...formData, spouseName: e.target.value })
                                  }
                                  onBlur={(e) =>
                                    setFormData({
                                      ...formData,
                                      spouseName: capitalize(e.target.value),
                                    })
                                  }
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all text-sm"
                                  placeholder="Spouse Full Name"
                                />
                              </div>
                            )}

                            {formData.maritalStatus === "Married" && (
                              <div className="md:col-span-2 space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    Children Details ({formData.childrenDetails.length})
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={addChild}
                                    className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                                    aria-label="Add"
                                  >
                                    {" "}
                                    <Plus size={12} /> Add Child
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                  {formData.childrenDetails.map((child) => (
                                    <div
                                      key={child.id}
                                      className="flex gap-3 items-end bg-white p-3 rounded-2xl border border-slate-100 shadow-sm"
                                    >
                                      <div className="flex-1 space-y-1.5">
                                        <label
                                          htmlFor={`child-name-${child.id}`}
                                          className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
                                        >
                                          Child Name
                                        </label>
                                        <input
                                          id={`child-name-${child.id}`}
                                          value={child.name}
                                          onChange={(e) =>
                                            updateChild(child.id, "name", e.target.value)
                                          }
                                          onBlur={(e) =>
                                            updateChild(
                                              child.id,
                                              "name",
                                              capitalize(e.target.value)
                                            )
                                          }
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-medium"
                                          placeholder="Child Name"
                                        />
                                      </div>
                                      <div className="w-32 space-y-1.5">
                                        <label
                                          htmlFor={`child-gender-${child.id}`}
                                          className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
                                        >
                                          Gender
                                        </label>
                                        <select
                                          id={`child-gender-${child.id}`}
                                          value={child.gender}
                                          onChange={(e) =>
                                            updateChild(child.id, "gender", e.target.value)
                                          }
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-medium appearance-none"
                                        >
                                          <option value="Male">Male</option>
                                          <option value="Female">Female</option>
                                          <option value="Other">Other</option>
                                        </select>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeChild(child.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 mb-0.5"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3 mb-6">
                            Permanent Address
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label
                                htmlFor="permanent-province"
                                className="text-[11px] font-semibold text-slate-500 ml-1"
                              >
                                Province
                              </label>
                              <select
                                id="permanent-province"
                                value={formData.permanentProvince}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setFormData({
                                    ...formData,
                                    permanentProvince: v,
                                    permanentDistrict: "",
                                    permanentMunicipality: "",
                                    permanentWardNo: "",
                                  });
                                  if (v) {
                                    fetchDistricts(v, setPermanentDistricts);
                                  } else {
                                    setPermanentDistricts([]);
                                  }
                                  setPermanentMunicipalities([]);
                                  setPermanentWards([]);
                                }}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                              >
                                <option value="">Select Province</option>
                                {provinces.map((p) => (
                                  <option key={p} value={p}>
                                    {capitalize(p)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label
                                htmlFor="permanent-district"
                                className="text-[11px] font-semibold text-slate-500 ml-1"
                              >
                                District
                              </label>
                              <select
                                id="permanent-district"
                                value={formData.permanentDistrict}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setFormData({
                                    ...formData,
                                    permanentDistrict: v,
                                    permanentMunicipality: "",
                                    permanentWardNo: "",
                                  });
                                  if (v) {
                                    fetchMunicipalities(v, setPermanentMunicipalities);
                                  } else {
                                    setPermanentMunicipalities([]);
                                  }
                                  setPermanentWards([]);
                                }}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                              >
                                <option value="">Select District</option>
                                {permanentDistricts.map((d) => (
                                  <option key={d} value={d}>
                                    {capitalize(d)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label
                                htmlFor="permanent-municipality"
                                className="text-[11px] font-semibold text-slate-500 ml-1"
                              >
                                Municipality / VDC
                              </label>
                              <select
                                id="permanent-municipality"
                                value={formData.permanentMunicipality}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setFormData({
                                    ...formData,
                                    permanentMunicipality: v,
                                    permanentWardNo: "",
                                  });
                                  if (v && formData.permanentDistrict) {
                                    fetchWards(formData.permanentDistrict, v, setPermanentWards);
                                  } else {
                                    setPermanentWards([]);
                                  }
                                }}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                              >
                                <option value="">Select Municipality</option>
                                {permanentMunicipalities.map((m) => (
                                  <option key={m} value={m}>
                                    {capitalize(m)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label
                                htmlFor="permanent-ward"
                                className="text-[11px] font-semibold text-slate-500 ml-1"
                              >
                                Ward No
                              </label>
                              <select
                                id="permanent-ward"
                                value={formData.permanentWardNo}
                                onChange={(e) =>
                                  setFormData({ ...formData, permanentWardNo: e.target.value })
                                }
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                              >
                                <option value="">Select Ward</option>
                                {permanentWards.map((w) => (
                                  <option key={w} value={w}>
                                    {w}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                              <label
                                htmlFor="permanent-address"
                                className="text-[11px] font-semibold text-slate-500 ml-1"
                              >
                                Full Address
                              </label>
                              <textarea
                                id="permanent-address"
                                value={formData.permanentAddress}
                                onChange={(e) =>
                                  setFormData({ ...formData, permanentAddress: e.target.value })
                                }
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm min-h-[80px]"
                                placeholder="Street, Area, Landmark"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 md:col-span-2">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3">
                            Passport Details
                          </h3>
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="passport-number"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Passport Number
                          </label>
                          <input
                            id="passport-number"
                            value={formData.passportNumber}
                            onChange={(e) =>
                              setFormData({ ...formData, passportNumber: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="passport-issue-place"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Issue Place
                          </label>
                          <input
                            id="passport-issue-place"
                            value={formData.passportIssuePlace}
                            onChange={(e) =>
                              setFormData({ ...formData, passportIssuePlace: e.target.value })
                            }
                            onBlur={(e) =>
                              setFormData({
                                ...formData,
                                passportIssuePlace: capitalize(e.target.value),
                              })
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="passport-issue-date"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Issue Date
                          </label>
                          <input
                            id="passport-issue-date"
                            type="date"
                            value={formData.passportIssueDate}
                            onChange={(e) =>
                              setFormData({ ...formData, passportIssueDate: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="passport-expiry-date"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Expiry Date
                          </label>
                          <input
                            id="passport-expiry-date"
                            type="date"
                            value={formData.passportExpiryDate}
                            onChange={(e) =>
                              setFormData({ ...formData, passportExpiryDate: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {step === 5 && (
                      <div className="space-y-8">
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3">
                              Education History
                            </h3>
                            <button
                              type="button"
                              onClick={addEducation}
                              className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                              aria-label="Add"
                            >
                              {" "}
                              <Plus size={14} /> Add Education
                            </button>
                          </div>
                          <div className="space-y-4">
                            {formData.education.map((edu) => (
                              <div
                                key={edu.id}
                                className="p-6 rounded-3xl bg-slate-50 border border-slate-100 relative group"
                              >
                                <button
                                  type="button"
                                  onClick={() => removeEducation(edu.id)}
                                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <select
                                    value={edu.qualification}
                                    onChange={(e) =>
                                      updateEducation(edu.id, "qualification", e.target.value)
                                    }
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm appearance-none"
                                  >
                                    <option value="">Select Qualification</option>
                                    {qualifications.map((q) => (
                                      <option key={q.id} value={q.name}>
                                        {q.name}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="relative group/inst">
                                    <input
                                      value={edu.institution}
                                      onChange={(e) =>
                                        updateEducation(edu.id, "institution", e.target.value)
                                      }
                                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                                      placeholder="Institution"
                                      list={`colleges-${edu.id}`}
                                    />
                                    {(edu.qualification.toLowerCase().includes("+2") ||
                                      edu.qualification.toLowerCase().includes("grade xii") ||
                                      edu.qualification.toLowerCase().includes("grade 12")) && (
                                      <datalist id={`colleges-${edu.id}`}>
                                        {NEB_INSTITUTES.map((inst) => (
                                          <option key={inst.name} value={inst.name}>
                                            {inst.address}
                                          </option>
                                        ))}
                                      </datalist>
                                    )}
                                  </div>
                                  <div className="md:col-span-2">
                                    <input
                                      value={edu.institutionAddress}
                                      onChange={(e) =>
                                        updateEducation(
                                          edu.id,
                                          "institutionAddress",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                                      placeholder="Institution Address"
                                    />
                                  </div>
                                  <input
                                    value={edu.year}
                                    onChange={(e) =>
                                      updateEducation(edu.id, "year", e.target.value)
                                    }
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                                    placeholder="Year"
                                  />
                                  <input
                                    value={edu.score}
                                    onChange={(e) =>
                                      updateEducation(edu.id, "score", e.target.value)
                                    }
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                                    placeholder="Score/GPA"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 6 && (
                      <div className="space-y-8">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3">
                            Work Experience
                          </h3>
                          <button
                            type="button"
                            onClick={addWork}
                            className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                            aria-label="Add"
                          >
                            {" "}
                            <Plus size={14} /> Add Work
                          </button>
                        </div>
                        <div className="space-y-4">
                          {formData.workExperience.map((work) => (
                            <div
                              key={work.id}
                              className="p-6 rounded-3xl bg-slate-50 border border-slate-100 relative group"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                  value={work.jobTitle}
                                  onChange={(e) => updateWork(work.id, "jobTitle", e.target.value)}
                                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                                  placeholder="Job Title"
                                />
                                <input
                                  value={work.company}
                                  onChange={(e) => updateWork(work.id, "company", e.target.value)}
                                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                                  placeholder="Company"
                                />
                                <input
                                  value={work.companyAddress}
                                  onChange={(e) =>
                                    updateWork(work.id, "companyAddress", e.target.value)
                                  }
                                  className="w-full md:col-span-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                                  placeholder="Company Address"
                                />
                                <div className="space-y-1">
                                  <label
                                    htmlFor={`worked-from-${work.id}`}
                                    className="text-[11px] font-semibold text-slate-500 ml-1"
                                  >
                                    Worked From
                                  </label>
                                  <input
                                    id={`worked-from-${work.id}`}
                                    type="date"
                                    value={work.startDate}
                                    onChange={(e) =>
                                      updateWork(work.id, "startDate", e.target.value)
                                    }
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label
                                    htmlFor={`worked-till-${work.id}`}
                                    className="text-[11px] font-semibold text-slate-500 ml-1"
                                  >
                                    Worked Till
                                  </label>
                                  <input
                                    id={`worked-till-${work.id}`}
                                    type="date"
                                    disabled={work.currentlyWorking}
                                    value={work.currentlyWorking ? "" : work.endDate}
                                    onChange={(e) => updateWork(work.id, "endDate", e.target.value)}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm disabled:bg-slate-50 disabled:text-slate-400"
                                  />
                                </div>
                                <div className="md:col-span-2 flex items-center gap-2 px-1">
                                  <input
                                    type="checkbox"
                                    id={`current-${work.id}`}
                                    checked={work.currentlyWorking}
                                    onChange={(e) =>
                                      updateWork(work.id, "currentlyWorking", e.target.checked)
                                    }
                                    className="size-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                  />
                                  <label
                                    htmlFor={`current-${work.id}`}
                                    className="text-xs font-bold text-slate-600 cursor-pointer"
                                  >
                                    I am currently working here
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {step === 7 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 md:col-span-2">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3">
                            Study Preferences
                          </h3>
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="intended-country"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Intended Country
                          </label>
                          <select
                            id="intended-country"
                            value={formData.interestedCountry}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                interestedCountry: e.target.value,
                                partnerId: "",
                              })
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                          >
                            <option value="">Select a country</option>
                            {COUNTRIES.map((country) => (
                              <option key={country.name} value={country.name}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="partner-select"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Partner
                          </label>
                          <select
                            id="partner-select"
                            value={formData.partnerId || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, partnerId: e.target.value || "" })
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                          >
                            <option value="">No partner (Direct)</option>
                            {allPartners
                              .filter((p) => {
                                if (!formData.interestedCountry) return true;
                                try {
                                  const countries = JSON.parse(p.countries || "[]");
                                  return countries.includes(formData.interestedCountry);
                                } catch {
                                  return false;
                                }
                              })
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="major-course"
                            className="text-[11px] font-semibold text-slate-500 ml-1"
                          >
                            Major / Course
                          </label>
                          <input
                            id="major-course"
                            value={formData.major}
                            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {step === 8 && (
                      <div className="space-y-8">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3 mb-6">
                          Student Documents
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {docTypes.map((type) => {
                            const existingDoc = formData.documents.find((d) => d.type === type);
                            return (
                              <div
                                key={type}
                                className={`p-4 rounded-3xl border-2 transition-all ${existingDoc ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className={`size-10 rounded-2xl flex items-center justify-center shrink-0 ${existingDoc ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}
                                    >
                                      <FileText size={18} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-black text-slate-800 truncate uppercase tracking-wider">
                                        {type}
                                      </p>
                                      <p className="text-[10px] font-bold text-slate-400 truncate">
                                        {existingDoc ? existingDoc.name : "Not uploaded yet"}
                                      </p>
                                    </div>
                                  </div>
                                  <label
                                    htmlFor={`doc-upload-${type}`}
                                    className="cursor-pointer px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700"
                                  >
                                    {uploadingDoc === type
                                      ? "Uploading..."
                                      : existingDoc
                                        ? "Replace"
                                        : "Upload"}
                                    <input
                                      id={`doc-upload-${type}`}
                                      type="file"
                                      className="hidden"
                                      disabled={uploadingDoc === type}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(type, file);
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </form>
            </div>

            <div className="p-6 bg-slate-50 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${step === 1 ? "invisible" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
              >
                <ChevronLeft size={18} /> Back
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (step < totalSteps) setStep((s) => s + 1);
                    else handleSubmit();
                  }}
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  {step === totalSteps ? (isEditing ? "Update Student" : "Create Student") : "Next"}
                  {step < totalSteps && <ChevronRight size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}

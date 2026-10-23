import { api } from "@/lib/fetch-client";
import { commonDocs, qualificationDocMap } from "./constants";
import type {
  ChildEntry,
  EducationEntry,
  OtherGuardianEntry,
  Qualification,
  Student,
  StudentFormData,
  TrainingEntry,
  WorkExperienceEntry,
} from "./types";

export const capitalize = (str: string) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const fetchDistricts = async (provinceId: number, setter: (val: string[]) => void) => {
  try {
    const data = await api.get<string[]>(`/api/nepal/districts?province=${provinceId}`, {
      showError: false,
    });
    setter(Array.isArray(data) ? data : []);
  } catch (_err) {}
};

export const fetchMunicipalities = async (district: string, setter: (val: string[]) => void) => {
  try {
    const data = await api.get<string[]>(
      `/api/nepal/municipalities?district=${encodeURIComponent(district)}`,
      { showError: false }
    );
    setter(Array.isArray(data) ? data : []);
  } catch (_err) {}
};

export const fetchWards = async (
  district: string,
  municipality: string,
  setter: (val: string[]) => void
) => {
  try {
    const data = await api.get<string[]>(
      `/api/nepal/wards?district=${encodeURIComponent(district)}&municipality=${encodeURIComponent(municipality)}`,
      { showError: false }
    );
    setter(Array.isArray(data) ? data : []);
  } catch (_err) {}
};

/**
 * Read a stored JSON list without ever throwing.
 *
 * These columns were VARCHAR(191) and MySQL truncated longer values mid-string,
 * so a record could hold unparseable text. A bare JSON.parse here propagated to
 * the error boundary and the edit page became unusable ("JSON Parse error:
 * Expected '}'"), which also blocked the very save that would have repaired the
 * row. Degrade to an empty list and let the user re-enter the data.
 */
export const parseStoredList = <T>(value: unknown): T[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value as T[];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

export const getRequiredDocsForQualifications = (
  education: EducationEntry[],
  qualifications: Qualification[]
): string[] => {
  const required = new Set<string>(commonDocs);
  education.forEach((edu) => {
    const qual = qualifications.find((q) => q.name === edu.qualification);
    if (qual?.level && qualificationDocMap[qual.level]) {
      qualificationDocMap[qual.level].forEach((d) => required.add(d));
    }
  });
  return Array.from(required);
};

export const createInitialFormData = (): StudentFormData => ({
  firstName: "",
  lastName: "",
  email: "",
  admissionEmail: "",
  applicationEmailPassword: "",
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
  photoUrl: "",
  childrenDetails: [],
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianRelation: "",
  guardianAddress: "",
  otherGuardians: [],
  status: "In Review",
  permanentProvince: 0,
  permanentDistrict: "",
  permanentMunicipality: "",
  permanentWardNo: "",
  permanentAddress: "",
  temporaryProvince: 0,
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
});

export const buildFormDataFromStudent = (s: Student): StudentFormData => {
  let phonePrefix = "+977";
  let phoneMain = s.phone || "";
  if (s.phone && s.phone.startsWith("+")) {
    const parts = s.phone.split(" ");
    if (parts.length > 1) {
      phonePrefix = parts[0];
      phoneMain = parts.slice(1).join(" ");
    }
  }
  // A stored bcrypt hash is never a usable/editable password. Keeping the
  // server-side GET strip as the real guard, but never let a cached hash
  // round-trip into the form where an unrelated save would re-hash it.
  const storedPassword = s.studentPassword;
  return {
    firstName: s.firstName || "",
    lastName: s.lastName || "",
    email: s.email || "",
    admissionEmail: s.admissionEmail || "",
    applicationEmailPassword: s.applicationEmailPassword || "",
    studentPassword: storedPassword && !storedPassword.startsWith("$2") ? storedPassword : "",
    phone: phoneMain,
    phonePrefix,
    whatsappNumber: s.whatsappNumber || "",
    gender: s.gender || "",
    dobAd: s.dobAd || "",
    dobBs: s.dobBs || "",
    nationality: s.nationality || "Nepal",
    maritalStatus: s.maritalStatus || "Single",
    spouseName: s.spouseName || "",
    photoUrl: s.photoUrl || "",
    childrenDetails: parseStoredList<ChildEntry>(s.childrenDetails),
    guardianName: s.guardianName || "",
    guardianPhone: s.guardianPhone || "",
    guardianEmail: s.guardianEmail || "",
    guardianRelation: s.guardianRelation || "",
    guardianAddress: s.guardianAddress || "",
    otherGuardians: parseStoredList<OtherGuardianEntry>(s.otherGuardians),
    status: s.status || "In Review",
    permanentProvince: Number(s.permanentProvince) || 0,
    permanentDistrict: s.permanentDistrict || "",
    permanentMunicipality: s.permanentMunicipality || "",
    permanentWardNo: s.permanentWardNo || "",
    permanentAddress: s.permanentAddress || "",
    temporaryProvince: Number(s.temporaryProvince) || 0,
    temporaryDistrict: s.temporaryDistrict || "",
    temporaryMunicipality: s.temporaryMunicipality || "",
    temporaryWardNo: s.temporaryWardNo || "",
    temporaryAddress: s.temporaryAddress || "",
    passportNumber: s.passportNumber || "",
    passportNationality: s.passportNationality || "",
    passportIssueDate: s.passportIssueDate || "",
    passportExpiryDate: s.passportExpiryDate || "",
    passportIssuePlace: s.passportIssuePlace || "",
    education: parseStoredList<EducationEntry>(s.education).length
      ? parseStoredList<EducationEntry>(s.education)
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
    workExperience: parseStoredList<WorkExperienceEntry>(s.workExperience).length
      ? parseStoredList<WorkExperienceEntry>(s.workExperience)
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
    training: parseStoredList<TrainingEntry>(s.training).length
      ? parseStoredList<TrainingEntry>(s.training)
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
};

const qualificationOrder: Record<string, number> = {
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

export const sortQualifications = (data: Qualification[]): Qualification[] =>
  data.toSorted((a, b) => {
    const getScore = (name: string) => {
      const n = name.toUpperCase();
      const entry = Object.entries(qualificationOrder).find(([key]) => n.includes(key));
      return entry ? entry[1] : 99;
    };
    return getScore(a.name) - getScore(b.name);
  });

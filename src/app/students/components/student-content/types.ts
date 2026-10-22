export interface Student {
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
  applicationEmailPassword?: string;
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

export interface EducationEntry {
  qualification: string;
  institution?: string;
  institutionAddress?: string;
  year?: string;
  score: string;
  country?: string;
}

export interface DocumentEntry {
  id: string;
  type: string;
  name: string;
  url: string;
  status?: string;
}

export interface UserSummary {
  id: number;
  name: string;
  role?: string;
}

export interface BranchSummary {
  id: number;
  name: string;
}

export interface ApplicationSummary {
  id: string;
  status: string;
  course?: {
    name?: string;
    requirements?: unknown;
    prerequisites?: unknown;
  };
}

export interface ApplicationGroupItem {
  app: ApplicationSummary;
  req: string;
}

export type ApplicationGroup = [string, ApplicationGroupItem[]];

export interface Credentials {
  email: string;
  password: string;
  name: string;
}

export type ViewMode = "grid" | "table" | "kanban";

export interface KanbanStatus {
  key: string;
  label: string;
  dot: string;
  gradient: string;
}

export interface StudentFilterCriteria {
  searchQuery: string;
  statusFilter: string;
  provinceFilter: string;
  genderFilter: string;
  academicFilter: string;
  englishFilter: string;
  branchFilter: string;
  staffFilter: string;
}

export interface StudentFilterControls extends StudentFilterCriteria {
  setSearchQuery: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setProvinceFilter: (value: string) => void;
  setGenderFilter: (value: string) => void;
  setAcademicFilter: (value: string) => void;
  setEnglishFilter: (value: string) => void;
  setBranchFilter: (value: string) => void;
  setStaffFilter: (value: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export interface StudentFilterState extends StudentFilterControls {
  filteredStudents: Student[];
}

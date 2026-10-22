import type { ChangeEvent, Dispatch, SetStateAction } from "react";

export interface ChildEntry {
  id: number;
  name: string;
  gender: string;
}

export interface OtherGuardianEntry {
  id: number;
  name: string;
  relation: string;
  phone: string;
  email: string;
  address: string;
}

export interface EducationEntry {
  id: number;
  qualification: string;
  institution: string;
  institutionAddress: string;
  year: string;
  score: string;
  country: string;
}

export interface WorkExperienceEntry {
  id: number;
  jobTitle: string;
  company: string;
  companyAddress: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
}

export interface TrainingEntry {
  id: number;
  name: string;
  provider: string;
  date: string;
}

export interface DocumentEntry {
  id: string;
  type: string;
  name: string;
  url: string;
  status: string;
}

export interface UserSummary {
  id: number;
  name: string;
  role?: string;
}

export interface PartnerSummary {
  id: number;
  name: string;
  countries?: string;
}

export interface Qualification {
  id: string;
  name: string;
  level: number;
}

export interface Province {
  id: number;
  name: string;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  admissionEmail: string;
  applicationEmailPassword: string;
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
  photoUrl: string;
  childrenDetails: ChildEntry[];
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelation: string;
  guardianAddress: string;
  otherGuardians: OtherGuardianEntry[];
  status: string;
  permanentProvince: number;
  permanentDistrict: string;
  permanentMunicipality: string;
  permanentWardNo: string;
  permanentAddress: string;
  temporaryProvince: number;
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
  applicationEmailPassword?: string;
  studentPassword?: string;
  dobAd?: string;
  dobBs?: string;
  nationality?: string;
  gender?: string;
  maritalStatus?: string;
  spouseName?: string;
  photoUrl?: string;
  childrenDetails?: ChildEntry[] | string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelation?: string;
  guardianAddress?: string;
  otherGuardians?: OtherGuardianEntry[] | string;
  permanentProvince?: number;
  permanentDistrict?: string;
  permanentMunicipality?: string;
  permanentWardNo?: string;
  permanentAddress?: string;
  temporaryProvince?: number;
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

export interface StudentFormController {
  formData: StudentFormData;
  setFormData: Dispatch<SetStateAction<StudentFormData>>;
  isEditing: boolean;
  uploadingDoc: string | null;
  uploadingPhoto: boolean;
  handlePhotoUpload: (file: File) => void;
  handleFileUpload: (type: string, file: File) => void;
  handleAdDobChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBsDobChange: (e: ChangeEvent<HTMLInputElement>) => void;
  addChild: () => void;
  removeChild: (id: number) => void;
  updateChild: (id: number, field: string, value: string) => void;
  addOtherGuardian: () => void;
  removeOtherGuardian: (id: number) => void;
  updateOtherGuardian: (id: number, field: string, value: string) => void;
  addEducation: () => void;
  removeEducation: (id: number) => void;
  updateEducation: (id: number, field: string, value: string) => void;
  addWork: () => void;
  updateWork: (id: number, field: string, value: string | boolean) => void;
}

export interface StudentFormOptions {
  qualifications: Qualification[];
  allPartners: PartnerSummary[];
  staffUsers: UserSummary[];
}

export interface NepalAddressState {
  provinces: Province[];
  permanentDistricts: string[];
  permanentMunicipalities: string[];
  permanentWards: string[];
  setPermanentDistricts: Dispatch<SetStateAction<string[]>>;
  setPermanentMunicipalities: Dispatch<SetStateAction<string[]>>;
  setPermanentWards: Dispatch<SetStateAction<string[]>>;
}

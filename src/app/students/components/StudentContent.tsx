'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { COUNTRIES } from '@/lib/data/countries';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Upload, 
  Trash2, 
  Edit2, 
  X, 
  Check, 
  Mail,
  Phone,
  Calendar,
  Building2,
  BookOpen,
  Map,
  User,
  ShieldCheck,
  Briefcase,
  Zap,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ExternalLink,
  Users
} from 'lucide-react';
import { LazyMotion, m as motion, domAnimation, AnimatePresence, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { ADToBS, BSToAD } from 'bikram-sambat-js';
import NEB_INSTITUTES from '@/lib/data/neb_grade12_institutes.json';

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
  childrenDetails?: any;
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

  education?: any;
  workExperience?: any;
  training?: any;

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
  targetUniversities?: string;
  counselor?: string;
  branchId?: string;

  _count?: {
    documents: number;
  };
  documents?: any[];
}

const STEPS = [
  { id: 1, name: 'Personal', icon: User },
  { id: 2, name: 'Family', icon: Users },
  { id: 3, name: 'Address', icon: Map },
  { id: 4, name: 'Passport', icon: ShieldCheck },
  { id: 5, name: 'Academic', icon: GraduationCap },
  { id: 6, name: 'Experience', icon: Briefcase },
  { id: 7, name: 'Preferences', icon: Zap },
  { id: 8, name: 'Documents', icon: FileText },
];

const docTypes = [
  'Passport',
  'SLC/SEE Transcript',
  'SLC/SEE Character',
  '+2/PCL Transcript',
  '+2/PCL Character',
  'Bachelor Transcript',
  'Bachelor Character',
  'Master Transcript',
  'IELTS/PTE/TOEFL Scorecard',
  'Statement of Purpose (SOP)',
  'CV/Resume',
  'Citizenship',
  'Experience Letter',
  'Other'
];

const capitalize = (str: string) => {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const fetchDistricts = async (province: string, setter: (val: string[]) => void) => {
  try {
    const res = await fetch(`/api/nepal/districts?province=${encodeURIComponent(province)}`);
    const data = await res.json();
    setter(data);
  } catch (err) {}
};

const fetchMunicipalities = async (district: string, setter: (val: string[]) => void) => {
  try {
    const res = await fetch(`/api/nepal/municipalities?district=${encodeURIComponent(district)}`);
    const data = await res.json();
    setter(data);
  } catch (err) {}
};

const fetchWards = async (district: string, municipality: string, setter: (val: string[]) => void) => {
  try {
    const res = await fetch(`/api/nepal/wards?district=${encodeURIComponent(district)}&municipality=${encodeURIComponent(municipality)}`);
    const data = await res.json();
    setter(data);
  } catch (err) {}
};

export default function StudentContent() {
  const prefersReducedMotion = useReducedMotion();
  const [students, setStudents] = useState<Student[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [qualifications, setQualifications] = useState<{id: string, name: string}[] | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [academicFilter, setAcademicFilter] = useState('all');
  const [englishFilter, setEnglishFilter] = useState('all');
  const [branches, setBranches] = useState<any[] | undefined>(undefined);
  const [branchFilter, setBranchFilter] = useState('all');
  const [allUsers, setAllUsers] = useState<any[] | undefined>(undefined);
  const [staffFilter, setStaffFilter] = useState('all');
  const [step, setStep] = useState(1);
  const [showAppsModal, setShowAppsModal] = useState(false);
  const [appsForSelectedStudent, setAppsForSelectedStudent] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const totalSteps = 8;
  
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    admissionEmail: '',
    studentPassword: '',
    phone: '',
    phonePrefix: '+977',
    whatsappNumber: '',
    gender: '',
    dobAd: '',
    dobBs: '',
    nationality: 'Nepal',
    maritalStatus: 'Single',
    spouseName: '',
    childrenDetails: [],
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianRelation: '',
    guardianAddress: '',
    status: 'In Review',
    
    permanentProvince: '',
    permanentDistrict: '',
    permanentMunicipality: '',
    permanentWardNo: '',
    permanentAddress: '',
    
    temporaryProvince: '',
    temporaryDistrict: '',
    temporaryMunicipality: '',
    temporaryWardNo: '',
    temporaryAddress: '',

    passportNumber: '',
    passportNationality: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    passportIssuePlace: '',

    education: [{ id: Date.now(), qualification: '', institution: '', institutionAddress: '', year: '', score: '', country: '' }],
    workExperience: [{ id: Date.now(), jobTitle: '', company: '', companyAddress: '', startDate: '', endDate: '', currentlyWorking: false }],
    training: [{ id: Date.now(), name: '', provider: '', date: '' }],

    testType: 'Select Test',
    overallScore: '',
    readingScore: '',
    writingScore: '',
    listeningScore: '',
    speakingScore: '',
    moi: '',
    testDate: '',
    testRegNumber: '',

    studyLevel: '',
    intakeTerm: '',
    major: '',
    interestedCountry: '',
    targetUniversities: '',
    counselor: '',
    documents: [],
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  
  // Address lists
  const [provinces, setProvinces] = useState<string[] | undefined>(undefined);
  const [permanentDistricts, setPermanentDistricts] = useState<string[]>([]);
  const [permanentMunicipalities, setPermanentMunicipalities] = useState<string[]>([]);
  const [permanentWards, setPermanentWards] = useState<string[]>([]);
  const temporaryDistricts = useRef<string[]>([]);
  const temporaryMunicipalities = useRef<string[]>([]);
  const temporaryWards = useRef<string[]>([]);

  useEffect(() => {
    fetchStudents();
    fetchProvinces();
    fetchQualifications();
    fetchBranches();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (err) {}
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches');
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
      }
    } catch (err) {}
  };

  const fetchStudentApps = async (studentId: string) => {
    try {
      setLoadingApps(true);
      const res = await fetch(`/api/applications?studentId=${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setAppsForSelectedStudent(data);
      }
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchQualifications = async () => {
    try {
      const res = await fetch('/api/qualifications');
      const data = await res.json();
      if (Array.isArray(data)) {
        const order: Record<string, number> = {
          'SEE': 1, 'SLC': 1, 'GRADE 10': 1,
          '+2': 2, 'PLUS 2': 2, 'GRADE 12': 2, 'GRADE XII': 2, 'PCL': 2,
          'BACHELOR': 3, 'UNDERGRADUATE': 3,
          'MASTER': 4, 'POSTGRADUATE': 4,
          'PHD': 5, 'DOCTORATE': 5
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
    } catch (err) {}
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setProvinceFilter('all');
    setGenderFilter('all');
    setAcademicFilter('all');
    setEnglishFilter('all');
    setBranchFilter('all');
    setStaffFilter('all');
  };

  const fetchProvinces = async () => {
    try {
      const res = await fetch('/api/nepal/provinces');
      const data = await res.json();
      setProvinces(data);
    } catch (err) {}
  };

  useEffect(() => {
    if (formData.temporaryProvince) {
      fetchDistricts(formData.temporaryProvince, (val: string[]) => { temporaryDistricts.current = val; });
    } else {
      temporaryDistricts.current = [];
    }
  }, [formData.temporaryProvince]);

  useEffect(() => {
    if (formData.temporaryDistrict) {
      fetchMunicipalities(formData.temporaryDistrict, (val: string[]) => { temporaryMunicipalities.current = val; });
    } else {
      temporaryMunicipalities.current = [];
    }
  }, [formData.temporaryDistrict]);

  useEffect(() => {
    if (formData.temporaryDistrict && formData.temporaryMunicipality) {
      fetchWards(formData.temporaryDistrict, formData.temporaryMunicipality, (val: string[]) => { temporaryWards.current = val; });
    } else {
      temporaryWards.current = [];
    }
  }, [formData.temporaryDistrict, formData.temporaryMunicipality]);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (Array.isArray(data)) {
        setStudents(data);
      }
    } catch (err) {
      toast.error('Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (student: Student | null = null) => {
    if (student) {
      setEditingStudent(student);
      let phonePrefix = '+977';
      let phoneMain = student.phone || '';
      
      if (student.phone && student.phone.startsWith('+')) {
        const parts = student.phone.split(' ');
        if (parts.length > 1) {
          phonePrefix = parts[0];
          phoneMain = parts.slice(1).join(' ');
        }
      }

      setFormData({
        ...formData,
        ...student,
        phone: phoneMain,
        phonePrefix,
        maritalStatus: student.maritalStatus || 'Single',
        spouseName: student.spouseName || '',
        childrenDetails: student.childrenDetails ? (typeof student.childrenDetails === 'string' ? JSON.parse(student.childrenDetails) : student.childrenDetails) : [],
        guardianName: student.guardianName || '',
        guardianPhone: student.guardianPhone || '',
        guardianEmail: student.guardianEmail || '',
        guardianRelation: student.guardianRelation || '',
        guardianAddress: student.guardianAddress || '',
        education: student.education ? (typeof student.education === 'string' ? JSON.parse(student.education) : student.education) : [{ id: Date.now(), qualification: '', institution: '', institutionAddress: '', year: '', score: '', country: '' }],
        workExperience: student.workExperience ? (typeof student.workExperience === 'string' ? JSON.parse(student.workExperience) : student.workExperience) : [{ id: Date.now(), jobTitle: '', company: '', companyAddress: '', startDate: '', endDate: '', currentlyWorking: false }],
        training: student.training ? (typeof student.training === 'string' ? JSON.parse(student.training) : student.training) : [{ id: Date.now(), name: '', provider: '', date: '' }],
        documents: student.documents || [],
      });
      setPermanentDistricts([]);
      setPermanentMunicipalities([]);
      setPermanentWards([]);
      if (student.permanentProvince) fetchDistricts(student.permanentProvince, setPermanentDistricts);
      if (student.permanentDistrict) fetchMunicipalities(student.permanentDistrict, setPermanentMunicipalities);
      if (student.permanentDistrict && student.permanentMunicipality) fetchWards(student.permanentDistrict, student.permanentMunicipality, setPermanentWards);
    } else {
      setEditingStudent(null);
      setFormData({
        firstName: '', lastName: '', email: '', admissionEmail: '', studentPassword: '', phone: '', phonePrefix: '+977', whatsappNumber: '', gender: '', dobAd: '', dobBs: '', nationality: 'Nepal', status: 'New Leads',
        maritalStatus: 'Single', spouseName: '', childrenDetails: [],
        guardianName: '', guardianPhone: '', guardianEmail: '', guardianRelation: '', guardianAddress: '',
        permanentProvince: '', permanentDistrict: '', permanentMunicipality: '', permanentWardNo: '', permanentAddress: '',
        temporaryProvince: '', temporaryDistrict: '', temporaryMunicipality: '', temporaryWardNo: '', temporaryAddress: '',
        passportNumber: '', passportNationality: '', passportIssueDate: '', passportExpiryDate: '', passportIssuePlace: '',
        education: [{ id: Date.now(), qualification: '', institution: '', institutionAddress: '', year: '', score: '', country: '' }],
        workExperience: [{ id: Date.now(), jobTitle: '', company: '', companyAddress: '', startDate: '', endDate: '', currentlyWorking: false }],
        training: [{ id: Date.now(), name: '', provider: '', date: '' }],
        testType: 'Select Test', overallScore: '', readingScore: '', writingScore: '', listeningScore: '', speakingScore: '', moi: '', testDate: '', testRegNumber: '',
        studyLevel: '', intakeTerm: '', major: '', interestedCountry: '', targetUniversities: '', documents: [],
      });
    }
    setStep(1);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const method = editingStudent ? 'PUT' : 'POST';
    const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';

    const submissionData = {
      ...formData,
      phone: `${formData.phonePrefix} ${formData.phone}`.trim()
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      if (res.ok) {
        toast.success(editingStudent ? 'Student updated' : 'Student added');
        setShowModal(false);
        fetchStudents();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    }
  };

  const handleFileUpload = async (type: string, file: File) => {
    setUploadingDoc(type);
    // Simulate upload
    setTimeout(() => {
      const newDoc = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        name: file.name,
        url: URL.createObjectURL(file), // Temporary local URL
        status: 'Uploaded'
      };
      setFormData((prev: any) => ({
        ...prev,
        documents: [...prev.documents.filter((d: any) => d.type !== type), newDoc]
      }));
      setUploadingDoc(null);
      toast.success(`${type} uploaded successfully`);
    }, 1000);
  };

  const handleAdDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ad = e.target.value;
    setFormData((prev: any) => ({ ...prev, dobAd: ad }));
    try {
      if (ad) {
        let bs = ADToBS(ad);
        // Ensure format is YYYY-MM-DD even if library returns something else
        if (bs && bs.includes('/')) {
          bs = bs.replace(/\//g, '-');
        }
        setFormData((prev: any) => ({ ...prev, dobBs: bs }));
      }
    } catch (err) {}
  };

  const handleBsDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let bs = e.target.value;
    
    // Auto-replace slashes with hyphens
    bs = bs.replace(/\//g, '-');
    
    // Only allow digits and hyphens
    bs = bs.replace(/[^0-9-]/g, '');

    // Auto-place hyphens at appropriate places: YYYY-MM-DD
    if (bs.length > 10) bs = bs.substring(0, 10);
    
    // If user is not deleting (length increasing)
    if (bs.length > (formData.dobBs?.length || 0)) {
      if (bs.length === 4) {
        bs = bs + '-';
      } else if (bs.length === 7) {
        bs = bs + '-';
      }
    }
    
    setFormData((prev: any) => ({ ...prev, dobBs: bs }));
    
    try {
      // Only trigger AD conversion if format is strictly YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (bs && dateRegex.test(bs)) {
        const ad = BSToAD(bs);
        setFormData((prev: any) => ({ ...prev, dobAd: ad }));
      }
    } catch (err) {}
  };

  const addChild = () => {
    setFormData((prev: any) => ({
      ...prev,
      childrenDetails: [...prev.childrenDetails, { id: Date.now(), name: '', gender: 'Male' }]
    }));
  };

  const removeChild = (id: number) => {
    setFormData((prev: any) => ({
      ...prev,
      childrenDetails: prev.childrenDetails.filter((c: any) => c.id !== id)
    }));
  };

  const updateChild = (id: number, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      childrenDetails: prev.childrenDetails.map((c: any) => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const addEducation = () => {
    setFormData((prev: any) => ({
      ...prev,
      education: [...prev.education, { id: Date.now(), qualification: '', institution: '', institutionAddress: '', year: '', score: '', country: '' }]
    }));
  };

  const removeEducation = (id: number) => {
    setFormData((prev: any) => ({
      ...prev,
      education: prev.education.filter((e: any) => e.id !== id)
    }));
  };

  const updateEducation = (id: number, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      education: prev.education.map((e: any) => {
        if (e.id === id) {
          let updated = { ...e, [field]: value };
          // Auto-populate address if institution is selected from suggestions
          if (field === 'institution') {
            const found = NEB_INSTITUTES.find((inst: any) => inst.name === value);
            if (found) {
              updated.institutionAddress = found.address;
            }
          }
          return updated;
        }
        return e;
      })
    }));
  };

  const addWork = () => {
    setFormData((prev: any) => ({
      ...prev,
      workExperience: [...prev.workExperience, { id: Date.now(), jobTitle: '', company: '', companyAddress: '', startDate: '', endDate: '', currentlyWorking: false }]
    }));
  };

  const updateWork = (id: number, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      workExperience: prev.workExperience.map((w: any) => w.id === id ? { ...w, [field]: value } : w)
    }));
  };

  const filteredStudents = useMemo(() => {
    return (students ?? []).filter(s => {
      const matchesSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesProvince = provinceFilter === 'all' || s.permanentProvince === provinceFilter;
      const matchesGender = genderFilter === 'all' || s.gender === genderFilter;
      
      const matchesAcademic = academicFilter === 'all' || (() => {
        const edu = typeof s.education === 'string' ? JSON.parse(s.education) : (s.education || []);
        return edu.some((e: any) => {
          const score = parseFloat(e.score);
          return !isNaN(score) && score >= 3.5;
        });
      })();
      
      const matchesEnglish = englishFilter === 'all' || (() => {
        const score = parseFloat(s.overallScore || '0');
        if (s.testType === 'IELTS') return score >= 7.0;
        if (s.testType === 'PTE') return score >= 65;
        return false;
      })();

      const matchesBranch = branchFilter === 'all' || s.branchId === branchFilter;
      const matchesStaff = staffFilter === 'all' || s.counselor === staffFilter;

      return matchesSearch && matchesStatus && matchesProvince && matchesGender && matchesAcademic && matchesEnglish && matchesBranch && matchesStaff;
    });
  }, [students, searchQuery, statusFilter, provinceFilter, genderFilter, academicFilter, englishFilter, branchFilter, staffFilter]);

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
        <button type="button" 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus size={18} />
          Add Student
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
              onChange={e => setStatusFilter(e.target.value)}
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
              onChange={e => setBranchFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer h-9"
            >
              <option value="all">All Branches</option>
              {(branches ?? []).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <button type="button" 
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 h-9 ${showMoreFilters ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
            >
              <Filter size={14} />
              {showMoreFilters ? 'Hide Filters' : 'More Filters'}
            </button>

            {(searchQuery || statusFilter !== 'all' || provinceFilter !== 'all' || genderFilter !== 'all' || academicFilter !== 'all' || englishFilter !== 'all' || branchFilter !== 'all' || staffFilter !== 'all') && (
              <button type="button" 
                onClick={clearFilters}
                className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center gap-1 h-9"
               aria-label="Close"> <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showMoreFilters && (
            <motion.div 
              initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
              animate={prefersReducedMotion ? {} : { height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="filter-province" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Province</label>
                  <select id="filter-province"
                    value={provinceFilter} 
                    onChange={e => setProvinceFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">All Provinces</option>
                    {(provinces ?? []).map(p => (
                      <option key={p} value={p}>{p}</option>)
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="filter-gender" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Gender</label>
                  <select id="filter-gender"
                    value={genderFilter} 
                    onChange={e => setGenderFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="filter-academic" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Academic</label>
                  <select id="filter-academic"
                    value={academicFilter} 
                    onChange={e => setAcademicFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                  >
                    <option value="all">Any GPA</option>
                    <option value="high_grades">High Grades (3.5+)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="filter-english" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">English</label>
                  <select id="filter-english"
                    value={englishFilter} 
                    onChange={e => setEnglishFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                  >
                    <option value="all">Any English Score</option>
                    <option value="high_english">IELTS 7+ / PTE 65+</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="filter-staff" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Staff Member</label>
                  <select id="filter-staff"
                    value={staffFilter} 
                    onChange={e => setStaffFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">All Staff</option>
                    {(allUsers ?? []).map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
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
        <div className="py-20 text-center text-slate-400">Loading students…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div key={student.id} className="card p-5 hover:shadow-md transition-all group relative">
               <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <button type="button" 
                      className="font-bold text-slate-800 hover:text-indigo-600 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowAppsModal(true);
                        fetchStudentApps(student.id);
                      }}
                    >
                      {capitalize(student.name)}
                    </button>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{student.email}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                        student.status === 'In Review' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        student.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        student.status === 'New Leads' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                        'bg-indigo-50 text-indigo-700 border-indigo-100'
                      }`}>
                        {student.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button type="button" 
                  onClick={() => handleOpenModal(student)}
                  className="p-1.5 text-indigo-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  <Edit2 size={15} />
                </button>
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
                {student.counselor && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User size={13} className="text-slate-400" />
                    <span className="font-bold text-indigo-600">Counselor: {student.counselor}</span>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <button type="button" 
                  onClick={() => setSelectedStudent(student)}
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
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={prefersReducedMotion ? false : { opacity: 0 }} animate={prefersReducedMotion ? {} : { opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/10" onClick={() => setShowModal(false)} />
            <motion.div initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95, y: 20 }} animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
              {/* Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Step {step} of {totalSteps}: {STEPS[step-1].name}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowModal(false)} className="size-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Step Navigation */}
              <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-center gap-1 overflow-x-auto no-scrollbar">
                {STEPS.map((s) => (
                  <button type="button"
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                      step === s.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' :
                      step > s.id ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <s.icon size={13} />
                    <span className="text-[11px] font-bold">{s.name}</span>
                  </button>
                ))}
              </div>

              <form className="flex-1 overflow-y-auto p-8 no-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 md:col-span-2">
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3">Basic Information</h3>
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="first-name" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                          <input id="first-name"
                            required
                            value={formData.firstName}
                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            onBlur={e => setFormData({ ...formData, firstName: capitalize(e.target.value) })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all text-sm font-medium"
                            placeholder="e.g. John"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="last-name" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                          <input id="last-name"
                            required
                            value={formData.lastName}
                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            onBlur={e => setFormData({ ...formData, lastName: capitalize(e.target.value) })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all text-sm font-medium"
                            placeholder="e.g. Doe"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="primary-email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Email</label>
                          <input id="primary-email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all text-sm font-medium"
                            placeholder="personal@example.com"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="student-status" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Student Status</label>
                          <select id="student-status"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all text-sm font-medium appearance-none"
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
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.amber.200)] pl-3">Application Credentials</h3>
                          <p className="text-[10px] font-bold text-slate-400 ml-4 italic">Email created specifically for university applications</p>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="admission-email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admission Email</label>
                          <input id="admission-email"
                            type="email"
                            value={formData.admissionEmail}
                            onChange={e => setFormData({ ...formData, admissionEmail: e.target.value })}
                            className="w-full px-4 py-3 bg-amber-50/30 border border-amber-100 rounded-2xl outline-none transition-all text-sm font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5"
                            placeholder="application.id@gmail.com"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="email-password" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Password</label>
                          <input id="email-password"
                            type="text"
                            value={formData.studentPassword}
                            onChange={e => setFormData({ ...formData, studentPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-amber-50/30 border border-amber-100 rounded-2xl outline-none transition-all text-sm font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5"
                            placeholder="Password for admission email"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="phone-number" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                          <div className="flex gap-2">
                            <select 
                              value={formData.phonePrefix}
                              onChange={e => setFormData({ ...formData, phonePrefix: e.target.value })}
                              className="w-24 p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold appearance-none text-center"
                            >
                              {COUNTRIES.map(c => (
                                <option key={c.name} value={c.phoneCode}>{c.phoneCode}</option>
                              ))}
                            </select>
                            <input id="phone-number"
                              value={formData.phone}
                              onChange={e => setFormData({ ...formData, phone: e.target.value })}
                              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all text-sm font-medium"
                              placeholder="9800000000"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="assigned-counselor" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Counselor (Staff)</label>
                          <select id="assigned-counselor"
                            value={formData.counselor}
                            onChange={e => setFormData({ ...formData, counselor: e.target.value })}
                            className="w-full px-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl outline-none transition-all text-sm font-bold text-indigo-700"
                          >
                            <option value="">Select Counselor</option>
                            {(allUsers ?? []).map(u => (
                              <option key={u.id} value={u.name}>{u.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="nationality" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nationality</label>
                          <select id="nationality"
                            value={formData.nationality}
                            onChange={e => {
                              const nationality = e.target.value;
                              const c = COUNTRIES.find(n => n.name === nationality);
                              setFormData({ ...formData, nationality, phonePrefix: c ? c.phoneCode : '+977' });
                            }}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all text-sm font-medium appearance-none"
                          >
                            {COUNTRIES.map(c => (
                              <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="dob-ad" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">DOB (AD)</label>
                          <input id="dob-ad" type="date" value={formData.dobAd} onChange={handleAdDobChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all text-sm font-medium" />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="dob-bs" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">DOB (BS)</label>
                          <input id="dob-bs" value={formData.dobBs} onChange={handleBsDobChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all text-sm font-medium" placeholder="YYYY-MM-DD" />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="gender" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                          <select id="gender" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all text-sm font-medium appearance-none">
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Family Info */}
                    {step === 2 && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3 mb-6">Guardian Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label htmlFor="guardian-name" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Guardian Name</label>
                              <input id="guardian-name"
                                value={formData.guardianName}
                                onChange={e => setFormData({ ...formData, guardianName: e.target.value })}
                                onBlur={e => setFormData({ ...formData, guardianName: capitalize(e.target.value) })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium"
                                placeholder="Full Name"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label htmlFor="guardian-relation" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Relation</label>
                              <select id="guardian-relation"
                                value={formData.guardianRelation}
                                onChange={e => setFormData({ ...formData, guardianRelation: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium appearance-none"
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
                              <label htmlFor="guardian-phone" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                              <input id="guardian-phone"
                                value={formData.guardianPhone}
                                onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium"
                                placeholder="9800000000"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label htmlFor="guardian-email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                              <input id="guardian-email"
                                value={formData.guardianEmail}
                                onChange={e => setFormData({ ...formData, guardianEmail: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium"
                                placeholder="guardian@example.com"
                              />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                              <label htmlFor="guardian-address" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Guardian Address</label>
                              <input id="guardian-address"
                                value={formData.guardianAddress}
                                onChange={e => setFormData({ ...formData, guardianAddress: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium"
                                placeholder="Full Address"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.amber.200)] pl-3 mb-6">Marital & Dependent Status</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label htmlFor="marital-status" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Marital Status</label>
                              <select id="marital-status"
                                value={formData.maritalStatus} 
                                onChange={e => setFormData({ ...formData, maritalStatus: e.target.value, childrenDetails: e.target.value === 'Single' ? [] : formData.childrenDetails })} 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all text-sm font-medium appearance-none"
                              >
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                              </select>
                            </div>

                            {formData.maritalStatus === 'Married' && (
                              <div className="space-y-1.5">
                                <label htmlFor="spouse-name" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Spouse Name</label>
                                <input id="spouse-name"
                                  value={formData.spouseName}
                                  onChange={e => setFormData({ ...formData, spouseName: e.target.value })}
                                  onBlur={e => setFormData({ ...formData, spouseName: capitalize(e.target.value) })}
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all text-sm font-medium"
                                  placeholder="Spouse Full Name"
                                />
                              </div>
                            )}

                            {formData.maritalStatus === 'Married' && (
                              <div className="md:col-span-2 space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Children Details ({formData.childrenDetails.length})</h4>
                                  <button type="button" onClick={addChild} className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline" aria-label="Add"> <Plus size={12} /> Add Child
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                  {formData.childrenDetails.map((child: any) => (
                                    <div key={child.id} className="flex gap-3 items-end bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                      <div className="flex-1 space-y-1.5">
                                        <label htmlFor={`child-name-${child.id}`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Child Name</label>
                                        <input id={`child-name-${child.id}`}
                                          value={child.name}
                                          onChange={e => updateChild(child.id, 'name', e.target.value)}
                                          onBlur={e => updateChild(child.id, 'name', capitalize(e.target.value))}
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-medium"
                                          placeholder="Child Name"
                                        />
                                      </div>
                                      <div className="w-32 space-y-1.5">
                                        <label htmlFor={`child-gender-${child.id}`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                                        <select id={`child-gender-${child.id}`}
                                          value={child.gender}
                                          onChange={e => updateChild(child.id, 'gender', e.target.value)}
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-medium appearance-none"
                                        >
                                          <option value="Male">Male</option>
                                          <option value="Female">Female</option>
                                          <option value="Other">Other</option>
                                        </select>
                                      </div>
                                      <button type="button" onClick={() => removeChild(child.id)} className="p-2 text-slate-300 hover:text-red-500 mb-0.5">
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

                    {/* Step 3: Address */}
                    {step === 3 && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3 mb-6">Permanent Address</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label htmlFor="permanent-province" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Province</label>
                              <select id="permanent-province" value={formData.permanentProvince} onChange={e => { const v = e.target.value; setFormData({ ...formData, permanentProvince: v, permanentDistrict: '', permanentMunicipality: '', permanentWardNo: '' }); if (v) { fetchDistricts(v, setPermanentDistricts); } else { setPermanentDistricts([]); } setPermanentMunicipalities([]); setPermanentWards([]); }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium">
                                <option value="">Select Province</option>
                                {(provinces ?? []).map(p => <option key={p} value={p}>{capitalize(p)}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label htmlFor="permanent-district" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">District</label>
                              <select id="permanent-district" value={formData.permanentDistrict} onChange={e => { const v = e.target.value; setFormData({ ...formData, permanentDistrict: v, permanentMunicipality: '', permanentWardNo: '' }); if (v) { fetchMunicipalities(v, setPermanentMunicipalities); } else { setPermanentMunicipalities([]); } setPermanentWards([]); }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium">
                                <option value="">Select District</option>
                                {permanentDistricts.map(d => <option key={d} value={d}>{capitalize(d)}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label htmlFor="permanent-municipality" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Municipality / VDC</label>
                              <select id="permanent-municipality" value={formData.permanentMunicipality} onChange={e => { const v = e.target.value; setFormData({ ...formData, permanentMunicipality: v, permanentWardNo: '' }); if (v && formData.permanentDistrict) { fetchWards(formData.permanentDistrict, v, setPermanentWards); } else { setPermanentWards([]); } }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium">
                                <option value="">Select Municipality</option>
                                {permanentMunicipalities.map(m => <option key={m} value={m}>{capitalize(m)}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label htmlFor="permanent-ward" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ward No</label>
                              <select id="permanent-ward" value={formData.permanentWardNo} onChange={e => setFormData({ ...formData, permanentWardNo: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium">
                                <option value="">Select Ward</option>
                                {permanentWards.map(w => <option key={w} value={w}>{w}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                              <label htmlFor="permanent-address" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Address</label>
                              <textarea id="permanent-address" value={formData.permanentAddress} onChange={e => setFormData({ ...formData, permanentAddress: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium min-h-[80px]" placeholder="Street, Area, Landmark" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Passport */}
                    {step === 4 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 md:col-span-2">
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3">Passport Details</h3>
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="passport-number" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Passport Number</label>
                          <input id="passport-number" value={formData.passportNumber} onChange={e => setFormData({ ...formData, passportNumber: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium" />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="passport-issue-place" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Issue Place</label>
                          <input id="passport-issue-place" value={formData.passportIssuePlace} onChange={e => setFormData({ ...formData, passportIssuePlace: e.target.value })} onBlur={e => setFormData({ ...formData, passportIssuePlace: capitalize(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium" />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="passport-issue-date" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Issue Date</label>
                          <input id="passport-issue-date" type="date" value={formData.passportIssueDate} onChange={e => setFormData({ ...formData, passportIssueDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium" />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="passport-expiry-date" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expiry Date</label>
                          <input id="passport-expiry-date" type="date" value={formData.passportExpiryDate} onChange={e => setFormData({ ...formData, passportExpiryDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium" />
                        </div>
                      </div>
                    )}

                    {/* Step 5: Academic */}
                    {step === 5 && (
                      <div className="space-y-8">
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3">Education History</h3>
                            <button type="button" onClick={addEducation} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline" aria-label="Add"> <Plus size={14} /> Add Education
                            </button>
                          </div>
                          <div className="space-y-4">
                            {formData.education.map((edu: any) => (
                              <div key={edu.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 relative group">
                                <button type="button" onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                  <Trash2 size={16} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <select 
                                    value={edu.qualification} 
                                    onChange={e => updateEducation(edu.id, 'qualification', e.target.value)} 
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm appearance-none"
                                  >
                                    <option value="">Select Qualification</option>
                                    {(qualifications ?? []).map(q => (
                                      <option key={q.id} value={q.name}>{q.name}</option>
                                    ))}
                                  </select>
                                  <div className="relative group/inst">
                                    <input 
                                      value={edu.institution} 
                                      onChange={e => updateEducation(edu.id, 'institution', e.target.value)} 
                                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm" 
                                      placeholder="Institution"
                                      list={`colleges-${edu.id}`}
                                    />
                                    {(edu.qualification.toLowerCase().includes('+2') || 
                                      edu.qualification.toLowerCase().includes('grade xii') || 
                                      edu.qualification.toLowerCase().includes('grade 12')) && (
                                      <datalist id={`colleges-${edu.id}`}>
                                        {NEB_INSTITUTES.map((inst: any, idx: number) => (
                                          <option key={inst.name} value={inst.name}>{inst.address}</option>
                                        ))}
                                      </datalist>
                                    )}
                                  </div>
                                  <div className="md:col-span-2">
                                    <input 
                                      value={edu.institutionAddress} 
                                      onChange={e => updateEducation(edu.id, 'institutionAddress', e.target.value)} 
                                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm" 
                                      placeholder="Institution Address" 
                                    />
                                  </div>
                                  <input value={edu.year} onChange={e => updateEducation(edu.id, 'year', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm" placeholder="Year" />
                                  <input value={edu.score} onChange={e => updateEducation(edu.id, 'score', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm" placeholder="Score/GPA" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 6: Experience */}
                    {step === 6 && (
                      <div className="space-y-8">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3">Work Experience</h3>
                          <button type="button" onClick={addWork} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline" aria-label="Add"> <Plus size={14} /> Add Work
                          </button>
                        </div>
                        <div className="space-y-4">
                          {formData.workExperience.map((work: any) => (
                            <div key={work.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 relative group">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={work.jobTitle} onChange={e => updateWork(work.id, 'jobTitle', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm" placeholder="Job Title" />
                                <input value={work.company} onChange={e => updateWork(work.id, 'company', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm" placeholder="Company" />
                                <input value={work.companyAddress} onChange={e => updateWork(work.id, 'companyAddress', e.target.value)} className="w-full md:col-span-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm" placeholder="Company Address" />
                                <div className="space-y-1">
                                  <label htmlFor={`worked-from-${work.id}`} className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Worked From</label>
                                  <input id={`worked-from-${work.id}`} type="date" value={work.startDate} onChange={e => updateWork(work.id, 'startDate', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm" />
                                </div>
                                <div className="space-y-1">
                                  <label htmlFor={`worked-till-${work.id}`} className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Worked Till</label>
                                  <input id={`worked-till-${work.id}`} type="date" disabled={work.currentlyWorking} value={work.currentlyWorking ? '' : work.endDate} onChange={e => updateWork(work.id, 'endDate', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm disabled:bg-slate-50 disabled:text-slate-400" />
                                </div>
                                <div className="md:col-span-2 flex items-center gap-2 px-1">
                                  <input type="checkbox" id={`current-${work.id}`} checked={work.currentlyWorking} onChange={e => updateWork(work.id, 'currentlyWorking', e.target.checked)} className="size-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                                  <label htmlFor={`current-${work.id}`} className="text-xs font-bold text-slate-600 cursor-pointer">I am currently working here</label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 7: Preferences */}
                    {step === 7 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 md:col-span-2">
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3">Study Preferences</h3>
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="intended-country" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Intended Country</label>
                          <select id="intended-country"
                            value={formData.interestedCountry} 
                            onChange={e => setFormData({ ...formData, interestedCountry: e.target.value })} 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium"
                          >
                            <option value="">Select a country</option>
                            {COUNTRIES.map(country => (
                              <option key={country.name} value={country.name}>{country.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="major-course" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Major / Course</label>
                          <input id="major-course" value={formData.major} onChange={e => setFormData({ ...formData, major: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium" />
                        </div>
                      </div>
                    )}

                    {/* Step 8: Documents */}
                    {step === 8 && (
                      <div className="space-y-8">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest shadow-[inset_0_0_0_1px_theme(colors.indigo.200)] pl-3 mb-6">Student Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {docTypes.map((type) => {
                            const existingDoc = formData.documents.find((d: any) => d.type === type);
                            return (
                              <div key={type} className={`p-4 rounded-3xl border-2 transition-all ${existingDoc ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 ${existingDoc ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                      <FileText size={18} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-black text-slate-800 truncate uppercase tracking-wider">{type}</p>
                                      <p className="text-[10px] font-bold text-slate-400 truncate">{existingDoc ? existingDoc.name : 'Not uploaded yet'}</p>
                                    </div>
                                  </div>
                                  <label htmlFor={`doc-upload-${type}`} className="cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700">
                                    {uploadingDoc === type ? 'Uploading...' : existingDoc ? 'Replace' : 'Upload'}
                                    <input id={`doc-upload-${type}`} type="file" className="hidden" disabled={uploadingDoc === type} onChange={e => { const file = e.target.files?.[0]; if (file) handleFileUpload(type, file); }} />
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

              <div className="p-8 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                <button type="button" onClick={() => setStep(s => Math.max(1, s - 1))} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${step === 1 ? 'invisible' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                  <ChevronLeft size={18} /> Back
                </button>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancel</button>
                  <button type="button" onClick={() => { if (step < totalSteps) setStep(s => s + 1); else handleSubmit(); }} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
                    {step === totalSteps ? (editingStudent ? 'Update Student' : 'Create Student') : 'Next'}
                    {step < totalSteps && <ChevronRight size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedStudent && !showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-slate-900/10" onClick={() => setSelectedStudent(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
             <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Documents: {capitalize(selectedStudent.name)}</h3>
              <button type="button" onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {/* Credentials Section */}
              {(selectedStudent.admissionEmail || selectedStudent.studentPassword) && (
                <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldCheck size={12} /> Application Credentials
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">Admission Email</p>
                      <p className="text-sm font-bold text-slate-800 break-all">{selectedStudent.admissionEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">Email Password</p>
                      <p className="text-sm font-bold text-slate-800">{selectedStudent.studentPassword || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {selectedStudent.documents && selectedStudent.documents.length > 0 ? (
                  selectedStudent.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <FileText className="text-indigo-600" size={20} />
                        <div>
                          <p className="text-sm font-bold text-slate-700">{doc.type}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{doc.name}</p>
                        </div>
                      </div>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">View File</a>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <FileText size={40} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-sm text-slate-400">No documents uploaded for this student.</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button type="button" onClick={() => setSelectedStudent(null)} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Applications Modal */}
      {showAppsModal && selectedStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setShowAppsModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-slide-up overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800">Applications</h2>
                <p className="text-sm text-slate-400">Viewing all applications for {selectedStudent.name}</p>
              </div>
              <button type="button" onClick={() => setShowAppsModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
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
                  <p className="text-slate-400 text-sm">This student hasn't applied to any courses yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appsForSelectedStudent.map((app) => (
                    <div key={app.id} className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                      <div className="flex items-start justify-start gap-4">
                        <div className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                           <Building2 size={24} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400 px-1.5 py-0.5 bg-slate-50 rounded border border-slate-100 uppercase tracking-tighter">
                              #{app.id.substring(app.id.length - 6)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              app.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                              'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                          <p className="text-sm font-black text-slate-800">{app.university.name}</p>
                          <p className="text-xs font-bold text-slate-500">{app.course.name}</p>
                          <div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Calendar size={12} />
                            Applied: {new Date(app.appliedDate).toLocaleDateString()}
                          </div>
                        </div>
                        <button type="button" className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600" aria-label="ExternalLink"> <ExternalLink size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button type="button" onClick={() => setShowAppsModal(false)} className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
      </LazyMotion>
  );
}

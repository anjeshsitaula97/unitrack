'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Users, Clock, GraduationCap, Tag, Filter, X, ChevronDown, ChevronUp, User, ListChecks, CheckCircle, Info, Loader2, Building2, Globe, MapPin, BookOpen, Zap, Calendar, Edit2, Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { REQUIREMENTS_LIST } from '@/lib/constants';
import { getLatestRates, convertToNPR, formatNPR } from '@/lib/forex';

const categoryColors: Record<string, string> = {
  'Computer Science': 'bg-indigo-50 text-indigo-700',
  'Business & MBA': 'bg-emerald-50 text-emerald-700',
  'Engineering': 'bg-orange-50 text-orange-700',
  'Medicine & Health': 'bg-pink-50 text-pink-700',
  'Arts & Humanities': 'bg-purple-50 text-purple-700',
};

const levelConfig: Record<string, string> = {
  'Undergraduate': 'bg-sky-50 text-sky-700',
  'Postgraduate': 'bg-violet-50 text-violet-700',
  'PhD': 'bg-amber-50 text-amber-700',
};

const statusConfig: Record<string, { label: string; className: string }> = {
  'Active': { label: 'Active', className: 'badge-active' },
  'Draft': { label: 'Draft', className: 'badge-draft' },
  'Archived': { label: 'Archived', className: 'badge-archived' },
};

interface Course {
  id: string;
  name: string;
  university: string;
  category: string;
  level: string;
  credits: number;
  duration: string;
  enrolled: number;
  capacity: number;
  status: string;
  startDate: string | null;
  color: string;
  initials: string;
  instructor: string;
  description: string;
  prerequisites: string[];
  quickFilters: string[];
  country: string;
  intake: string;
  tuitionFee: string;
  applicationFee?: string;
  currency?: string;
  requirements: string[];
  applicationDeadline: string | null;
}

interface EnrollModalProps {
  course: Course;
  onClose: () => void;
}

function GuestCheckModal({ onClose, onSave, initialDetails }: { onClose: () => void; onSave: (details: any) => void; initialDetails: any }) {
  const [details, setDetails] = useState(initialDetails);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden border border-white/20">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-800">Guest Student Details</h3>
            <button type="button" aria-label="Close" onClick={onClose}><X size={20} /></button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Highest Qualification</label>
              <select 
                value={details.qualification}
                onChange={e => setDetails({ ...details, qualification: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all cursor-pointer"
              >
                <option value="">Select Qualification…</option>
                <option value="+2/Grade XII">+2 / Grade XII</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">GPA / Percentage</label>
              <input 
                type="text" 
                value={details.score}
                onChange={e => setDetails({ ...details, score: e.target.value })}
                placeholder="e.g. 3.5 or 75%"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">English Test</label>
                <select 
                  value={details.testType}
                  onChange={e => setDetails({ ...details, testType: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all cursor-pointer"
                >
                  <option value="">Select Test…</option>
                  <option value="IELTS">IELTS</option>
                  <option value="PTE">PTE</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="DuoLingo">DuoLingo</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Overall Score</label>
                <input 
                  type="text" 
                  value={details.overallScore}
                  onChange={e => setDetails({ ...details, overallScore: e.target.value })}
                  placeholder="e.g. 7.0 or 65"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button type="button" onClick={onClose} className="flex-1 px-8 py-4 border border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest">
              Cancel
            </button>
            <button type="button" 
              onClick={() => {
                onSave(details);
                onClose();
              }}
              className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all text-xs uppercase tracking-widest"
            >
              Save & Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnrollModal({ course, onClose }: EnrollModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const isLoadingStudents = useRef(true);
  const [done, setDone] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students');
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (err) {
        console.error('Failed to fetch students', err);
      } finally {
        isLoadingStudents.current = false;
      }
    };
    fetchStudents();
  }, []);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    if (studentId === 'manual') {
      setName('');
      setEmail('');
      return;
    }
    const student = students.find(s => s.id === studentId);
    if (student) {
      setName(student.name);
      setEmail(student.email || '');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) { 
      toast.error('Please fill in all fields'); 
      return; 
    }
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden border border-white/20">
        <div className="h-2 w-full" style={{ backgroundColor: course.color }} />
        <div className="p-8">
          {!done ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg" style={{ backgroundColor: course.color }}>
                    {course.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 leading-tight">{course.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{course.university}</p>
                  </div>
                </div>
                <button type="button" aria-label="Close" onClick={onClose}><X size={20} /></button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Select Student from Database</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <select 
                      value={selectedStudentId}
                      onChange={e => handleStudentSelect(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Choose a student…</option>
                      <option value="manual">Enter details manually</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.email || 'No email'})</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">Or Provide Details</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Student full name" 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="student@example.com" 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm font-black text-slate-700 transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 border border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest">
                  Cancel
                </button>
                <button type="button" 
                  onClick={handleSubmit} 
                  className="flex-[1.5] px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all text-xs uppercase tracking-widest"
                >
                  Confirm Enrollment
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="size-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Enrolled!</h3>
              <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                <strong>{name}</strong> has been successfully enrolled in <strong>{course.name}</strong>.
              </p>
              <button type="button" 
                onClick={onClose} 
                className="w-full px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all text-xs uppercase tracking-widest"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchContent() {
  const [query, setQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [universitiesResults, setUniversitiesResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [intakeFilter, setIntakeFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [enrollingCourse, setEnrollingCourse] = useState<Course | null>(null);
  const isLoading = useRef(true);
  const [quickFilters, setQuickFilters] = useState<any[]>([]);
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [activeRequirements, setActiveRequirements] = useState<string[]>([]);
  const [onlyAvailableFilter, setOnlyAvailableFilter] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('all');
  const [guestDetails, setGuestDetails] = useState({
    qualification: '',
    score: '',
    testType: '',
    overallScore: ''
  });
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showInNPR, setShowInNPR] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({ 'NPR': 1 });

  useEffect(() => {
    if (showInNPR && Object.keys(rates).length <= 1) {
      getLatestRates().then(setRates);
    }
  }, [showInNPR, rates]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students');
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (err) {
        console.error('Failed to fetch students', err);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const [cRes, qRes] = await Promise.all([
        fetch(`/api/search?q=${encodeURIComponent(query)}`),
        fetch('/api/quick-filters')
      ]);
      const cData = await cRes.json();
      const qData = await qRes.json();
      
      setCourses(cData.courses || []);
      setUniversitiesResults(cData.universities || []);
      if (Array.isArray(qData)) setQuickFilters(qData);
      setLoading(false);
      isLoading.current = false;
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredCourses = useMemo(() => {
    let data = [...courses];

    // Eligibility Check
    if (selectedStudentId !== 'all') {
      const student = selectedStudentId === 'guest' ? {
        id: 'guest',
        name: 'Guest Student',
        education: JSON.stringify([{ qualification: guestDetails.qualification, score: guestDetails.score }]),
        testType: guestDetails.testType,
        overallScore: guestDetails.overallScore
      } : students.find(s => s.id === selectedStudentId);

      if (student) {
        data = data.filter(c => {
          // 1. Level Check
          const studentEdu = typeof student.education === 'string' ? JSON.parse(student.education) : (student.education || []);
          const hasPlus2 = studentEdu.some((e: any) => e.qualification.toLowerCase().includes('+2') || e.qualification.toLowerCase().includes('grade xii'));
          const hasBachelor = studentEdu.some((e: any) => e.qualification.toLowerCase().includes('bachelor'));
          
          if (c.level === 'Undergraduate' && !hasPlus2) return false;
          if (c.level === 'Postgraduate' && !hasBachelor) return false;
          
          // 2. GPA Check
          if (c.gpaRequired) {
            const reqGpa = parseFloat(c.gpaRequired);
            if (!isNaN(reqGpa)) {
              const relevantEdu = c.level === 'Undergraduate' ? 
                studentEdu.find((e: any) => e.qualification.toLowerCase().includes('+2') || e.qualification.toLowerCase().includes('grade xii')) :
                studentEdu.find((e: any) => e.qualification.toLowerCase().includes('bachelor'));
              
              const studentGpa = parseFloat(relevantEdu?.score || '0');
              if (isNaN(studentGpa) || studentGpa < reqGpa) return false;
            }
          }
          
          // 3. English Proficiency Check
          if (c.englishOverallScore) {
            const reqScore = parseFloat(c.englishOverallScore);
            if (!isNaN(reqScore)) {
              if (student.testType !== c.englishLanguageType) return false;
              const studentScore = parseFloat(student.overallScore || '0');
              if (isNaN(studentScore) || studentScore < reqScore) return false;
            }
          }
          
          return true;
        });
      }
    }

    if (categoryFilter !== 'all') data = data.filter(c => c.category === categoryFilter);
    if (levelFilter !== 'all') data = data.filter(c => c.level === levelFilter);
    if (universityFilter !== 'all') data = data.filter(c => c.university === universityFilter);
    if (countryFilter !== 'all') data = data.filter(c => c.country === countryFilter);
    if (intakeFilter !== 'all') data = data.filter(c => c.intake === intakeFilter);
    if (durationFilter !== 'all') data = data.filter(c => c.duration === durationFilter);
    
    // Price filtering
    data = data.filter(c => {
      const fee = parseFloat(c.tuitionFee?.replace(/[^0-9.]/g, '') || '0');
      return fee >= priceRange[0] && fee <= priceRange[1];
    });

    if (activeQuickFilters.length > 0) {
      data = data.filter(c => activeQuickFilters.every(f => c.quickFilters?.includes(f)));
    }

    if (activeRequirements.length > 0) {
      data = data.filter(c => activeRequirements.every(r => c.requirements?.includes(r)));
    }

    if (onlyAvailableFilter) {
      const now = new Date();
      data = data.filter(c => {
        if (!c.applicationDeadline) return true;
        return new Date(c.applicationDeadline) >= now;
      });
    }

    return data;
  }, [courses, categoryFilter, levelFilter, universityFilter, countryFilter, intakeFilter, durationFilter, priceRange, activeQuickFilters, activeRequirements, onlyAvailableFilter, selectedStudentId, guestDetails, students]);

  const availableCategories = useMemo(() => Array.from(new Set(courses.map(c => c.category))).sort(), [courses]);
  const availableUniversities = useMemo(() => Array.from(new Set(courses.map(c => c.university))).sort(), [courses]);
  const availableCountries = useMemo(() => Array.from(new Set(courses.map(c => c.country))).filter(Boolean).sort(), [courses]);
  const availableIntakes = useMemo(() => Array.from(new Set(courses.map(c => c.intake))).filter(Boolean).sort(), [courses]);
  const availableDurations = useMemo(() => Array.from(new Set(courses.map(c => c.duration))).filter(Boolean).sort(), [courses]);
  
  const maxPrice = useMemo(() => {
    const prices = courses.map(c => parseFloat(c.tuitionFee?.replace(/[^0-9.]/g, '') || '0'));
    return Math.max(100000, ...prices);
  }, [courses]);

  const hasSearch = query.trim() || categoryFilter !== 'all' || levelFilter !== 'all' || universityFilter !== 'all' || countryFilter !== 'all' || intakeFilter !== 'all' || durationFilter !== 'all' || activeQuickFilters.length > 0 || activeRequirements.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice;

  return (
    <div className="animate-fade-in relative min-h-[500px]">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Search Database</h1>
          <p className="text-sm text-slate-400">
            Searching {courses.length.toLocaleString()} courses and {universitiesResults.length.toLocaleString()} universities in database
          </p>
        </div>
        <button type="button"
          onClick={() => setShowInNPR(!showInNPR)}
          className={`btn-secondary mt-1 ${showInNPR ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700' : ''}`}
        >
          <Icons.DollarSign size={16} />
          {showInNPR ? 'Showing in NPR' : 'Show in NPR'}
        </button>
      </div>

      {/* Search hero */}
      <div className="card p-6 mb-5 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
          </div>
        )}
        <div className="relative mb-4">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, country, instructor, keyword..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-base border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
          />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-200 text-slate-400">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Filters - Top Bar style */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-purple-500 fill-purple-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Quick Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-100 hover:scrollbar-thumb-purple-200">
              {quickFilters.map((filter) => {
                const IconComponent = (Icons as any)[filter.icon] || Icons.Filter;
                const isActive = activeQuickFilters.includes(filter.label);
                
                return (
                  <button type="button"
                    key={filter.id}
                    onClick={() => {
                      if (isActive) {
                        setActiveQuickFilters(activeQuickFilters.filter(id => id !== filter.label));
                      } else {
                        setActiveQuickFilters([...activeQuickFilters, filter.label]);
                      }
                    }}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-bold transition-all whitespace-nowrap
                      ${isActive 
                        ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-100' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-600'}
                    `}
                  >
                    <IconComponent size={12} />
                    {filter.label}
                  </button>
                );
              })}
            </div>
            {activeQuickFilters.length > 0 && (
              <button type="button" 
                onClick={() => setActiveQuickFilters([])}
                className="text-[10px] font-bold text-red-500 hover:text-red-700 px-2 py-1.5"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Filter toggle */}
        <div className="flex items-center justify-between">
          <button type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            <Filter size={14} />
            {showFilters ? 'Hide filters' : 'Show filters'}
            {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {hasSearch && (
            <span className="text-xs text-slate-400">
              {filteredCourses.length + (query ? universitiesResults.length : 0)} result{(filteredCourses.length + (query ? universitiesResults.length : 0)) !== 1 ? 's' : ''} found
            </span>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <GraduationCap size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-400" />
                <select
                  value={selectedStudentId}
                  onChange={(e) => { 
                    setSelectedStudentId(e.target.value); 
                    if (e.target.value === 'guest') setShowGuestModal(true);
                  }}
                  className="text-xs font-bold pl-8 pr-3 py-2 border border-indigo-100 rounded-lg bg-indigo-50/50 text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer appearance-none min-w-[160px]"
                >
                  <option value="all">Check Eligibility For…</option>
                  <option value="guest" className="font-bold text-indigo-600">Guest Student (Manual Check)</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name || s.firstName + ' ' + s.lastName}</option>
                  ))}
                </select>
                {selectedStudentId === 'guest' && (
                  <button type="button" 
                    onClick={() => setShowGuestModal(true)}
                    className="absolute -top-1 -right-1 size-4 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm"
                    title="Edit Guest Details"
                  >
                    <Edit2 size={8} />
                  </button>
                )}
              </div>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                <option value="all">All Categories</option>
                {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                <option value="all">All Levels</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="PhD">PhD</option>
              </select>
              <select value={universityFilter} onChange={e => setUniversityFilter(e.target.value)} className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                <option value="all">All Universities</option>
                {availableUniversities.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                <option value="all">All Countries</option>
                {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={intakeFilter} onChange={e => setIntakeFilter(e.target.value)} className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                <option value="all">All Intakes</option>
                {availableIntakes.map(intake => <option key={intake} value={intake}>{intake}</option>)}
              </select>
              <select value={durationFilter} onChange={e => setDurationFilter(e.target.value)} className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                <option value="all">All Durations</option>
                {availableDurations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select 
                value={activeRequirements[0] || 'all'} 
                onChange={e => setActiveRequirements(e.target.value === 'all' ? [] : [e.target.value])} 
                className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
              >
                <option value="all">All Requirements</option>
                {REQUIREMENTS_LIST.map(req => <option key={req} value={req}>{req}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`
                  size-5 rounded-md border-2 flex items-center justify-center transition-all
                  ${onlyAvailableFilter ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-200 group-hover:border-indigo-400'}
                `}>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={onlyAvailableFilter}
                    onChange={() => setOnlyAvailableFilter(!onlyAvailableFilter)}
                  />
                  {onlyAvailableFilter && <Check size={14} strokeWidth={3} />}
                </div>
                <span className={`text-xs font-bold transition-colors ${onlyAvailableFilter ? 'text-indigo-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
                  Only show courses which can be Applied now
                </span>
              </label>
              <div className="w-px h-4 bg-indigo-200 mx-1" />
              <p className="text-[10px] font-medium text-indigo-400 italic">
                Hides courses whose application deadline has already passed.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Tag size={12} /> Tuition Fee Range
                </span>
                <span className="text-[11px] font-bold text-indigo-600">
                  ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                </span>
              </div>
              <div className="relative h-6 flex items-center">
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  step="500"
                  value={priceRange[0]}
                  onChange={e => setPriceRange([Math.min(parseInt(e.target.value), priceRange[1] - 500), priceRange[1]])}
                  className="absolute w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 z-10"
                />
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  step="500"
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value), priceRange[0] + 500)])}
                  className="absolute w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer accent-indigo-600 z-20 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-400">
                <span>$0</span>
                <span>${maxPrice.toLocaleString()}</span>
              </div>
            </div>

            {(categoryFilter !== 'all' || levelFilter !== 'all' || universityFilter !== 'all' || countryFilter !== 'all' || intakeFilter !== 'all' || durationFilter !== 'all' || activeRequirements.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <button type="button" 
                onClick={() => { 
                  setCategoryFilter('all'); 
                  setLevelFilter('all'); 
                  setUniversityFilter('all'); 
                  setCountryFilter('all');
                  setIntakeFilter('all');
                  setDurationFilter('all');
                  setActiveRequirements([]);
                  setPriceRange([0, maxPrice]);
                }} 
                className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {query && universitiesResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-indigo-500" />
            Universities ({universitiesResults.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {universitiesResults.map(uni => (
              <UniversityResultCard key={uni.id} university={uni} />
            ))}
          </div>
        </div>
      )}

      <div>
        {hasSearch && (
          <h2 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-500" />
            Courses ({filteredCourses.length})
          </h2>
        )}
        
        {!loading && filteredCourses.length === 0 && universitiesResults.length === 0 ? (
          <div className="card py-16 text-center">
            <Search size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-500 text-sm mb-1">No results found</p>
            <p className="text-xs text-slate-400">Try different keywords or adjust your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map(course => (
              <SearchResultCard
                key={course.id}
                course={course}
                expanded={expandedId === course.id}
                onToggle={() => setExpandedId(expandedId === course.id ? null : course.id)}
                onEnroll={() => setEnrollingCourse(course)}
                quickFilters={quickFilters}
                showInNPR={showInNPR}
                rates={rates}
              />
            ))}
          </div>
        )}
      </div>

      {enrollingCourse && (
        <EnrollModal course={enrollingCourse} onClose={() => setEnrollingCourse(null)} />
      )}

      {showGuestModal && (
        <GuestCheckModal 
          onClose={() => setShowGuestModal(false)}
          onSave={setGuestDetails}
          initialDetails={guestDetails}
        />
      )}
    </div>
  );
}

function UniversityResultCard({ university }: { university: any }) {
  return (
    <div className="card p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="size-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: university.color }}
        >
          {university.initials}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-800 truncate">{university.name}</h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <MapPin size={10} />
            <span className="truncate">{university.city}, {university.country}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        {university.website && (
          <a 
            href={university.website.startsWith('http') ? university.website : `https://${university.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <Globe size={12} />
            Visit Website
          </a>
        )}
        <Link 
          href={`/universities/${university.id}`}
          className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold transition-colors"
        >
          View Detailed Profile →
        </Link>
      </div>
    </div>
  );
}

function SearchResultCard({ course, expanded, onToggle, onEnroll, quickFilters, showInNPR, rates }: { course: Course; expanded: boolean; onToggle: () => void; onEnroll: () => void; quickFilters: any[]; showInNPR: boolean; rates: Record<string, number> }) {
  const status = statusConfig[course.status] || statusConfig['Draft'];
  const catStyle = categoryColors[course.category] || 'bg-slate-50 text-slate-600';
  const levelStyle = levelConfig[course.level] || 'bg-slate-50 text-slate-600';
  const enrollPct = course.capacity > 0 ? Math.round((course.enrolled / course.capacity) * 100) : 0;

  return (
    <div className="card overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="h-1 w-full" style={{ backgroundColor: course.color }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-9 rounded-xl flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: course.color }}>
              {course.initials}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate">{course.name}</h3>
              <p className="text-xs text-slate-500">{course.university}</p>
            </div>
          </div>
          <span className={`badge ${status.className} flex-shrink-0 ml-2`}>{status.label}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${levelStyle}`}>{course.level}</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${catStyle}`}><Tag size={8} />{course.category}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <User size={11} className="text-slate-400" />
          <span className="text-xs text-slate-500 truncate">{course.instructor}</span>
        </div>

        <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Clock size={11} />{course.duration}</span>
          <span className="flex items-center gap-1"><GraduationCap size={11} />{course.credits} cr.</span>
          <span className="flex items-center gap-1 min-w-0">
            <Globe size={11} className="flex-shrink-0" />
            <span className="truncate">{course.country}</span>
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            <Calendar size={11} className="text-indigo-400" />
            {course.intake || 'N/A'}
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold text-indigo-600">
              {showInNPR ? formatNPR(convertToNPR(course.tuitionFee || '0', course.currency || 'USD', rates)) : `${course.currency || 'USD'} ${course.tuitionFee?.toLocaleString()}`}
            </div>
            {course.applicationFee && (
              <div className="text-[9px] font-bold text-emerald-600 mt-0.5">
                App. Fee: {showInNPR ? formatNPR(convertToNPR(course.applicationFee, course.currency || 'USD', rates)) : `${course.currency || 'USD'} ${course.applicationFee}`}
              </div>
            )}
          </div>
        </div>

        <div className="mb-3">
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${enrollPct}%`, backgroundColor: enrollPct > 90 ? '#ef4444' : enrollPct > 70 ? '#f59e0b' : '#10b981' }} />
          </div>
        </div>

        {course.requirements && course.requirements.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {course.requirements.map(req => (
              <span key={req} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-md border border-blue-100">
                {req}
              </span>
            ))}
          </div>
        )}

        <button type="button" onClick={onToggle} className="w-full flex items-center justify-between text-xs text-indigo-600 hover:text-indigo-700 font-medium py-1 transition-colors">
          <span>{expanded ? 'Hide details' : 'View details'}</span>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 animate-fade-in">
            <div>
              <div className="flex items-center gap-1 mb-1"><Info size={11} className="text-slate-400" /><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Description</span></div>
              <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1"><ListChecks size={11} className="text-slate-400" /><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Prerequisites</span></div>
              <div className="flex flex-wrap gap-1">
                {course.prerequisites.map((p, i) => <span key={p} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">{p}</span>)}
              </div>
            </div>
            {course.quickFilters && course.quickFilters.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-1"><Zap size={11} className="text-purple-400" /><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Quick Filters</span></div>
                <div className="flex flex-wrap gap-1">
                  {course.quickFilters.map((f, i) => {
                    const filterInfo = quickFilters.find(q => q.label === f);
                    return (
                      <span key={`qf-${i}`} className="px-1.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded text-[10px] font-medium">
                        {filterInfo?.label || f}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {course.applicationDeadline && (
          <div className="flex items-center justify-between mt-3 mb-1 px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
              <Clock size={10} className="text-slate-400" /> Deadline
            </span>
            <span className={`text-[10px] font-black ${new Date(course.applicationDeadline) < new Date() ? 'text-red-500' : 'text-slate-600'}`}>
              {new Date(course.applicationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-slate-100">
          <button type="button"
            onClick={onEnroll}
            disabled={course.status !== 'Active' || (course.applicationDeadline && new Date(course.applicationDeadline) < new Date())}
            className="w-full btn-primary text-xs py-1.5 justify-center disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              {course.applicationDeadline && new Date(course.applicationDeadline) < new Date() ? (
                <>
                  <X size={14} className="text-white/70" />
                  Deadline Passed
                </>
              ) : (
                'Quick Enroll'
              )}
            </span>
            {(!course.applicationDeadline || new Date(course.applicationDeadline) >= new Date()) && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

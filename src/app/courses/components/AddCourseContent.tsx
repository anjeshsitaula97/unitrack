'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { ArrowLeft, BookOpen, Users, Clock, Tag, CheckCircle, AlertCircle, Plus, X, DollarSign, Filter, Info } from 'lucide-react';
import { QUICK_FILTERS, REQUIREMENTS_LIST } from '@/lib/constants';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { COUNTRIES } from '@/lib/data/countries';
import { safeParseArray } from '@/lib/json';



export default function AddCourseContent({ courseId }: { courseId?: string }) {
  const [universities, setUniversities] = React.useState<any[]>([]);
  const [faculties, setFaculties] = React.useState<any[]>([]);
  const [degreeTypes, setDegreeTypes] = React.useState<any[]>([]);
  const [intakes, setIntakes] = React.useState<any[]>([]);
  const [quickFilters, setQuickFilters] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [showAddDegreeType, setShowAddDegreeType] = useState(false);
  const [showAddIntake, setShowAddIntake] = useState(false);
  const [showAddQuickFilter, setShowAddQuickFilter] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [universitySearch, setUniversitySearch] = useState('');
  const [showUnivDropdown, setShowUnivDropdown] = useState(false);

  const loadInitialData = React.useCallback(async () => {
    try {
      const [uRes, fRes, dRes, iRes, qRes] = await Promise.all([
        fetch('/api/universities'),
        fetch('/api/faculties'),
        fetch('/api/degree-types'),
        fetch('/api/intakes'),
        fetch('/api/quick-filters'),
      ]);
      const [uData, fData, dData, iData, qData] = await Promise.all([uRes.json(), fRes.json(), dRes.json(), iRes.json(), qRes.json()]);
      setUniversities(Array.isArray(uData) ? uData : []);
      setFaculties(Array.isArray(fData) ? fData : []);
      setDegreeTypes(Array.isArray(dData) ? dData : []);
      setIntakes(Array.isArray(iData) ? iData : []);
      setQuickFilters(Array.isArray(qData) ? qData : []);

      if (courseId) {
        const res = await fetch(`/api/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setForm(prev => ({
            ...prev,
            id: data.id,
            name: data.name || '',
            university: data.university?.name || '',
            universityId: data.universityId || '',
            faculty: data.faculty || '',
            degreeType: data.degreeType || '',
            level: data.level || 'Undergraduate',
            credits: data.credits?.toString() || '0',
            duration: data.duration?.toString() || '',
            startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
            tuitionFee: data.tuitionFee || '',
            applicationFee: data.applicationFee || '',
            currency: data.currency || '',
            applicationFeeCurrency: data.applicationFeeCurrency || '',
            instructor: data.instructor || '',
            instructorEmail: data.instructorEmail || '',
            description: data.description || '',
            status: data.status || 'Active',
            language: data.language || 'English',
            mode: data.mode || 'Online',
            academicRequirement: data.academicRequirement || '',
            percentageRequired: data.percentageRequired || '',
            gpaRequired: data.gpaRequired || '',
            courseCode: data.courseCode || '',
            englishLanguageType: data.englishLanguageType || 'IELTS',
            englishOverallScore: data.englishOverallScore || '',
            englishReadingScore: data.englishReadingScore || '',
            englishWritingScore: data.englishWritingScore || '',
            englishListeningScore: data.englishListeningScore || '',
            englishSpeakingScore: data.englishSpeakingScore || '',
            prerequisites: safeParseArray(data.prerequisites),
            quickFilters: safeParseArray(data.quickFilters),
            requirements: safeParseArray(data.requirements),
            intakesData: safeParseArray(data.intake),
            englishTestsData: safeParseArray(data.englishTests),
          }));
        }
      }
    } catch (error) {
      toast.error('Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  const loadInitialDataRef = useRef(loadInitialData);
  loadInitialDataRef.current = loadInitialData;
  React.useEffect(() => {
    loadInitialDataRef.current();
  }, [courseId]);

  const handleAddNew = async (type: 'faculty' | 'degreeType' | 'intake' | 'quickFilter') => {
    if (!newItemName.trim()) return;
    const endpoint = type === 'faculty' ? '/api/faculties' : type === 'degreeType' ? '/api/degree-types' : type === 'intake' ? '/api/intakes' : '/api/quick-filters';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName }),
      });
      if (res.ok) {
        const added = await res.json();
        toast.success(`New ${type} added`);
        update(type, added.name);
        setNewItemName('');
        setShowAddFaculty(false);
        setShowAddDegreeType(false);
        setShowAddIntake(false);
        setShowAddQuickFilter(false);
        loadInitialData();
      } else {
        const err = await res.json();
        toast.error(err.error || `Failed to add ${type}`);
      }
    } catch (error) {
      toast.error('Error adding item');
    }
  };

  const [submitted, setSubmitted] = useState(false);
  const [prereqInput, setPrereqInput] = useState('');
  const [form, setForm] = useState({
    name: '',
    university: '',
    universityId: '',
    faculty: '',
    degreeType: '',
    level: 'Undergraduate',
    credits: '',
    duration: '',
    startDate: '',
    intake: '',
    tuitionFee: '',
    applicationFee: '',
    currency: '',
    applicationFeeCurrency: '',
    instructor: '',
    instructorEmail: '',
    description: '',
    prerequisites: [] as string[],
    status: 'Active',
    language: 'English',
    mode: 'Online',
    academicRequirement: '',
    percentageRequired: '',
    gpaRequired: '',
    englishLanguageType: 'IELTS',
    englishOverallScore: '',
    englishReadingScore: '',
    englishWritingScore: '',
    englishListeningScore: '',
    englishSpeakingScore: '',
    quickFilters: [] as string[],
    requirements: [] as string[],
    intakesData: [] as { name: string; startDate: string; openDate: string; deadline: string }[],
    courseCode: '',
    englishTestsData: [] as { type: string; overall: string; reading: string; writing: string; listening: string; speaking: string }[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const addPrereq = () => {
    if (!prereqInput.trim()) return;
    update('prerequisites', [...form.prerequisites, prereqInput.trim()]);
    setPrereqInput('');
  };

  const removePrereq = (i: number) => {
    update('prerequisites', form.prerequisites.filter((_, idx) => idx !== i));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Course name is required';
    if (!form.university) e.university = 'University is required';
    if (!form.faculty) e.faculty = 'Faculty is required';
    if (!form.degreeType) e.degreeType = 'Degree Type is required';
    if (!form.instructor.trim()) e.instructor = 'Instructor name is required';
    if (!form.description.trim()) e.description = 'Course description is required';
    if (!form.credits) e.credits = 'Credits are required';
    if (!form.duration.trim()) e.duration = 'Duration is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); toast.error('Please fix the errors below'); return; }
    
    try {
      const url = courseId ? `/api/courses/${courseId}` : '/api/courses';
      const method = courseId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        ...form,
        intake: JSON.stringify(form.intakesData),
        englishTests: JSON.stringify(form.englishTestsData),
      }),
      });
      
      if (res.ok) {
        setSubmitted(true);
        toast.success(`${form.name} ${courseId ? 'updated' : 'added'} successfully!`);
      } else {
        const err = await res.json();
        toast.error(err.details || err.error || `Failed to ${courseId ? 'update' : 'add'} course`);
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const filteredUniversities = useMemo(() => {
    if (!universitySearch) return universities;
    const q = universitySearch.toLowerCase();
    return universities.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.shortName?.toLowerCase().includes(q)
    );
  }, [universities, universitySearch]);

  if (submitted) {
    return (
      <div className="animate-fade-in max-w-lg mx-auto mt-16 text-center">
        <div className="size-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{courseId ? 'Course Updated!' : 'Course Added!'}</h2>
        <p className="text-slate-500 mb-2"><strong className="text-slate-700">{form.name}</strong> has been {courseId ? 'updated' : 'added to the catalog'}.</p>
        <p className="text-sm text-slate-400 mb-8">Students can now find and enroll in this course.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/courses" className="btn-secondary">View Courses</Link>
          <button type="button" onClick={() => { setSubmitted(false); setForm({ name: '', university: '', universityId: '', faculty: '', degreeType: '', level: 'Undergraduate', credits: '', duration: '', startDate: '', intake: '', tuitionFee: '', applicationFee: '', currency: '', applicationFeeCurrency: '', instructor: '', instructorEmail: '', description: '', prerequisites: [], status: 'Active', language: 'English', mode: 'Online', academicRequirement: '', percentageRequired: '', gpaRequired: '', englishLanguageType: 'IELTS', englishOverallScore: '', englishReadingScore: '', englishWritingScore: '', englishListeningScore: '', englishSpeakingScore: '', quickFilters: [], requirements: [], intakesData: [], courseCode: '', englishTestsData: [] }); }} className="btn-primary">
            Add Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/courses" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{courseId ? 'Edit Course' : 'Add Course'}</h1>
          <p className="text-sm text-slate-400">{courseId ? 'Update course information' : 'Add a new course to the platform catalog'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Course Info */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-indigo-600" />
            </div>
            <h2 className="text-base font-bold text-slate-700">Course Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="course-name" className="block text-xs font-semibold text-slate-600 mb-1.5">Course Name *</label>
              <input id="course-name"
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="e.g. Machine Learning Fundamentals"
                aria-label="Course name"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
            </div>

            <div className="md:col-span-1">
              <label htmlFor="course-code" className="block text-xs font-semibold text-slate-600 mb-1.5">Course Code</label>
              <input id="course-code"
                type="text"
                value={form.courseCode}
                onChange={e => update('courseCode', e.target.value)}
                placeholder="e.g. CS101"
                aria-label="Course code"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
              />
            </div>

            <div className="relative">
              <label htmlFor="university-select" className="block text-xs font-semibold text-slate-600 mb-1.5">University *</label>
              <button id="university-select" type="button"
                className={`relative group cursor-pointer ${errors.university ? 'ring-2 ring-red-100' : ''}`}
                onClick={() => setShowUnivDropdown(!showUnivDropdown)}
              >
                <div className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-slate-50 flex items-center justify-between transition-all ${errors.university ? 'border-red-300' : 'border-slate-200 group-hover:border-indigo-300'}`}>
                  <span className={form.university ? 'text-slate-700 font-medium' : 'text-slate-400'}>
                    {form.university || (isLoading ? 'Loading universities...' : 'Select university...')}
                  </span>
                  <Icons.ChevronDown size={16} className={`text-slate-400 transition-transform ${showUnivDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {showUnivDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <div className="relative">
                      <Icons.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search university..."
                        value={universitySearch}
                        onChange={e => setUniversitySearch(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        aria-label="Search university"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>
                  <div className="max-h-[240px] overflow-y-auto scrollbar-thin">
                    {filteredUniversities.length > 0 ? (
                      filteredUniversities.map(u => (
                        <button type="button"
                          key={u.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            const countryData = COUNTRIES.find(c => c.name === u.country);
                            setForm(prev => ({ 
                              ...prev, 
                              universityId: u.id, 
                              university: u.name,
                              currency: countryData?.currency || prev.currency 
                            }));
                            setShowUnivDropdown(false);
                            setUniversitySearch('');
                          }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); const countryData = COUNTRIES.find(c => c.name === u.country); setForm(prev => ({ ...prev, universityId: u.id, university: u.name, currency: countryData?.currency || prev.currency })); setShowUnivDropdown(false); setUniversitySearch(''); } }}
                          className={`px-4 py-2.5 text-sm hover:bg-indigo-50 cursor-pointer transition-colors flex items-center gap-2 ${form.universityId === u.id ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600'}`}
                        >
                          <div className="size-6 rounded bg-white border border-slate-100 flex items-center justify-center text-[8px] font-black uppercase text-slate-400 relative overflow-hidden">
                            {u.logo ? <Image src={u.logo} alt="" fill className="object-contain" sizes="24px" /> : u.name[0]}
                          </div>
                          <span className="truncate">{u.name}</span>
                          {form.universityId === u.id && <Icons.Check size={12} className="ml-auto" />}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Icons.AlertCircle size={20} className="text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No universities found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {errors.university && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.university}</p>}
              
              {/* Click-away backdrop */}
              {showUnivDropdown && <button type="button" className="fixed inset-0 z-40" onClick={() => setShowUnivDropdown(false)} />}
            </div>

            <div>
              <label htmlFor="faculty" className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
                Faculty *
                <button type="button" onClick={() => setShowAddFaculty(true)} className="text-indigo-600 hover:text-indigo-700" aria-label="Add faculty">
                  <Plus size={14} />
                </button>
              </label>
              <select id="faculty" value={form.faculty} onChange={e => update('faculty', e.target.value)} aria-label="Faculty" className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer ${errors.faculty ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                <option value="">{isLoading ? 'Loading...' : 'Select faculty...'}</option>
                {faculties.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
              </select>
              {errors.faculty && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.faculty}</p>}
            </div>

            <div>
              <label htmlFor="degree-type" className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
                Degree Type *
                <button type="button" onClick={() => setShowAddDegreeType(true)} className="text-indigo-600 hover:text-indigo-700" aria-label="Add degree type">
                  <Plus size={14} />
                </button>
              </label>
              <select id="degree-type" value={form.degreeType} onChange={e => update('degreeType', e.target.value)} aria-label="Degree type" className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer ${errors.degreeType ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                <option value="">{isLoading ? 'Loading...' : 'Select degree type...'}</option>
                {degreeTypes.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
              {errors.degreeType && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.degreeType}</p>}
            </div>

            <div>
              <label htmlFor="level" className="block text-xs font-semibold text-slate-600 mb-1.5">Level</label>
              <select id="level" value={form.level} onChange={e => update('level', e.target.value)} aria-label="Level" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="PhD">PhD</option>
                <option value="Certificate">Certificate</option>
              </select>
            </div>

            <div>
              <label htmlFor="course-status" className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
              <select id="course-status" value={form.status} onChange={e => update('status', e.target.value)} aria-label="Status" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="course-description" className="block text-xs font-semibold text-slate-600 mb-1.5">Description *</label>
              <textarea id="course-description"
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Describe what students will learn in this course..."
                rows={4}
                aria-label="Course description"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition-all ${errors.description ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* Schedule & Fees */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-8 bg-violet-50 rounded-lg flex items-center justify-center">
              <DollarSign size={16} className="text-violet-600" />
            </div>
            <h2 className="text-base font-bold text-slate-700">Schedule & Fees</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tuition-fee" className="block text-xs font-semibold text-slate-600 mb-1.5">Tuition Fees</label>
              <div className="flex gap-2">
                <div className="w-32">
                  <select
                    value={form.currency}
                    onChange={e => update('currency', e.target.value)}
                    aria-label="Tuition fee currency"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                  >
                    <option value="">Currency</option>
                    <optgroup label="Popular">
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="NZD">NZD - New Zealand Dollar</option>
                      <option value="NPR">NPR - Nepalese Rupee</option>
                    </optgroup>
                    <optgroup label="All Currencies">
                      {Array.from(new Set(COUNTRIES.map(c => c.currency))).sort().map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <input id="tuition-fee"
                  type="text"
                  value={form.tuitionFee}
                  onChange={e => update('tuitionFee', e.target.value)}
                  placeholder="e.g. 15,000"
                  aria-label="Tuition fee amount"
                  className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
            <div>
              <label htmlFor="application-fee" className="block text-xs font-semibold text-slate-600 mb-1.5">Application Fees</label>
              <div className="flex gap-2">
                <div className="w-32">
                  <select
                    value={form.applicationFeeCurrency}
                    onChange={e => update('applicationFeeCurrency', e.target.value)}
                    aria-label="Application fee currency"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                  >
                    <option value="">Currency</option>
                    <optgroup label="Popular">
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="NZD">NZD - New Zealand Dollar</option>
                      <option value="NPR">NPR - Nepalese Rupee</option>
                    </optgroup>
                    <optgroup label="All Currencies">
                      {Array.from(new Set(COUNTRIES.map(c => c.currency))).sort().map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <input id="application-fee"
                  type="text"
                  value={form.applicationFee}
                  onChange={e => update('applicationFee', e.target.value)}
                  placeholder="e.g. 250"
                  aria-label="Application fee amount"
                  className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
            <div>
              <label htmlFor="credits" className="block text-xs font-semibold text-slate-600 mb-1.5">Credits *</label>
              <input id="credits"
                type="number"
                value={form.credits}
                onChange={e => update('credits', e.target.value)}
                placeholder="e.g. 12"
                min="1"
                aria-label="Credits"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all ${errors.credits ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              />
              {errors.credits && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.credits}</p>}
            </div>

            <div>
              <label htmlFor="duration" className="block text-xs font-semibold text-slate-600 mb-1.5">Duration (Years) *</label>
              <input id="duration"
                type="number"
                step="0.5"
                value={form.duration}
                onChange={e => update('duration', e.target.value)}
                placeholder="e.g. 3"
                aria-label="Duration in years"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all ${errors.duration ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              />
              {errors.duration && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.duration}</p>}
            </div>



            <div>
              <label htmlFor="language" className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
                Language
              </label>
              <select id="language" value={form.language} onChange={e => update('language', e.target.value)} aria-label="Language" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                <option value="English">English</option>
                <option value="German">German</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
                <option value="Mandarin">Mandarin</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="delivery-mode" className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
                Delivery Mode
              </label>
              <select id="delivery-mode" value={form.mode} onChange={e => update('mode', e.target.value)} aria-label="Delivery mode" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                <option value="Online">Online</option>
                <option value="In-person">In-person</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Intakes & Deadlines */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <Icons.Calendar size={16} className="text-orange-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-700">Intakes & Deadlines</h2>
                <p className="text-[10px] text-slate-400">Add multiple intakes for this program</p>
              </div>
            </div>
            <button type="button" 
              onClick={() => {
                const newList = [...form.intakesData, { name: '', startDate: '', openDate: '', deadline: '' }];
                update('intakesData', newList as any);
              }} 
              className="btn-secondary py-1.5 text-[11px] font-bold"
            >
              <Plus size={14} />
              Add Intake
            </button>
          </div>

          {form.intakesData.length > 0 ? (
            <div className="space-y-4">
              {form.intakesData.map((intake, idx) => (
                <div key={`intake-${intake.name}-${idx}`} className="p-4 rounded-xl border border-slate-100 bg-slate-50 relative group">
                  <button type="button" aria-label="Remove intake"
                    onClick={() => {
                      const newList = form.intakesData.filter((_, i) => i !== idx);
                      update('intakesData', newList as any);
                    }}
                    className="absolute -top-2 -right-2 size-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <X size={12} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor={`intake-name-${idx}`} className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1.5 flex items-center justify-between">
                        Intake Name
                        <button type="button" aria-label="Add intake" onClick={() => setShowAddIntake(true)} className="inline-flex items-center p-0 bg-transparent border-none cursor-pointer text-indigo-600">
                          <Plus size={10} />
                        </button>
                      </label>
                      <select id={`intake-name-${idx}`}
                        value={intake.name} 
                        onChange={e => {
                          const newList = [...form.intakesData];
                          newList[idx].name = e.target.value;
                          update('intakesData', newList as any);
                        }}
                        aria-label="Intake name"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      >
                        <option value="">Select Intake…</option>
                        {intakes.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`intake-start-date-${idx}`} className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1.5">Start Date</label>
                      <input id={`intake-start-date-${idx}`}
                        type="date" 
                        value={intake.startDate}
                        onChange={e => {
                          const newList = [...form.intakesData];
                          newList[idx].startDate = e.target.value;
                          update('intakesData', newList as any);
                        }}
                        aria-label="Intake start date"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                    <div>
                      <label htmlFor={`intake-open-date-${idx}`} className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1.5">Open Date</label>
                      <input id={`intake-open-date-${idx}`}
                        type="date" 
                        value={intake.openDate}
                        onChange={e => {
                          const newList = [...form.intakesData];
                          newList[idx].openDate = e.target.value;
                          update('intakesData', newList as any);
                        }}
                        aria-label="Intake open date"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                    <div>
                      <label htmlFor={`intake-deadline-${idx}`} className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1.5">Deadline</label>
                      <input id={`intake-deadline-${idx}`}
                        type="date" 
                        value={intake.deadline}
                        onChange={e => {
                          const newList = [...form.intakesData];
                          newList[idx].deadline = e.target.value;
                          update('intakesData', newList as any);
                        }}
                        aria-label="Intake deadline"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl text-center">
              <Icons.Calendar size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-xs text-slate-400">No intakes added yet.</p>
              <button type="button" 
                onClick={() => {
                  const newList = [{ name: '', startDate: '', openDate: '', deadline: '' }];
                  update('intakesData', newList as any);
                }}
                className="text-indigo-600 text-xs font-bold mt-2 hover:underline"
              >
                + Add your first intake
              </button>
            </div>
          )}
        </div>

        {/* Instructor */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-slate-700">Instructor</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="instructor-name" className="block text-xs font-semibold text-slate-600 mb-1.5">Instructor Name *</label>
              <input id="instructor-name"
                type="text"
                value={form.instructor}
                onChange={e => update('instructor', e.target.value)}
                placeholder="e.g. Prof. Andrew Chen"
                aria-label="Instructor name"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all ${errors.instructor ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              />
              {errors.instructor && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.instructor}</p>}
            </div>
            <div>
              <label htmlFor="instructor-email" className="block text-xs font-semibold text-slate-600 mb-1.5">Instructor Email</label>
              <input id="instructor-email" type="email" value={form.instructorEmail} onChange={e => update('instructorEmail', e.target.value)} placeholder="instructor@university.edu" aria-label="Instructor email" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
        </div>

        {/* Prerequisites */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Tag size={16} className="text-amber-600" />
            </div>
            <h2 className="text-base font-bold text-slate-700">Prerequisites</h2>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={prereqInput}
              onChange={e => setPrereqInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPrereq(); } }}
              placeholder="Add a prerequisite (press Enter or click +)"
              aria-label="Add prerequisite"
              className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button type="button" onClick={addPrereq} className="btn-secondary px-3" aria-label="Add"> <Plus size={15} />
            </button>
          </div>

          {form.prerequisites.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.prerequisites.map((p, i) => (
                <span key={p} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                  {p}
                  <button type="button" onClick={() => removePrereq(i)} className="text-slate-400 hover:text-red-500 transition-colors" aria-label="Remove prerequisite">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No prerequisites added yet. Leave empty if none required.</p>
          )}
        </div>

        {/* Academic Requirements */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-slate-700">Academic & Language Requirements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="academic-requirement" className="block text-xs font-semibold text-slate-600 mb-1.5">Academic Requirement Description</label>
              <textarea id="academic-requirement"
                value={form.academicRequirement}
                onChange={e => update('academicRequirement', e.target.value)}
                placeholder="Brief description of the academic requirement..."
                rows={2}
                aria-label="Academic requirement description"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>
            <div>
              <label htmlFor="percentage-required" className="block text-xs font-semibold text-slate-600 mb-1.5">Percentage Required</label>
              <input id="percentage-required"
                type="text"
                value={form.percentageRequired}
                onChange={e => update('percentageRequired', e.target.value)}
                placeholder="e.g. 70%"
                aria-label="Percentage required"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label htmlFor="gpa-required" className="block text-xs font-semibold text-slate-600 mb-1.5">GPA Required</label>
              <input id="gpa-required"
                type="text"
                value={form.gpaRequired}
                onChange={e => update('gpaRequired', e.target.value)}
                placeholder="e.g. 3.0"
                aria-label="GPA required"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="md:col-span-2 mt-4">
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="add-english-test" className="block text-xs font-semibold text-slate-600">English Language Tests</label>
                <button id="add-english-test" type="button" 
                  onClick={() => {
                    const newList = [...form.englishTestsData, { type: 'IELTS', overall: '', reading: '', writing: '', listening: '', speaking: '' }];
                    update('englishTestsData', newList as any);
                  }}
                  className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add Test
                </button>
              </div>
              
              {form.englishTestsData.length > 0 ? (
                <div className="space-y-4">
              {form.englishTestsData.map((test, idx) => (
                <div key={`test-${test.type}-${idx}`} className="p-4 rounded-xl border border-slate-100 bg-slate-50 relative group">
                      <button type="button" aria-label="Remove test"
                        onClick={() => {
                          const newList = form.englishTestsData.filter((_, i) => i !== idx);
                          update('englishTestsData', newList as any);
                        }}
                        className="absolute -top-2 -right-2 size-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                      >
                        <X size={12} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label htmlFor={`test-type-${idx}`} className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1.5">Test Type</label>
                          <select id={`test-type-${idx}`}
                            value={test.type} 
                            onChange={e => {
                              const newList = [...form.englishTestsData];
                              newList[idx].type = e.target.value;
                              update('englishTestsData', newList as any);
                            }}
                            aria-label="English test type"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          >
                            <option value="IELTS">IELTS</option>
                            <option value="TOEFL">TOEFL</option>
                            <option value="PTE">PTE</option>
                            <option value="Duolingo">Duolingo</option>
                            <option value="DET">DET</option>
                            <option value="OET">OET</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`test-overall-${idx}`} className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1.5">Overall Score</label>
                          <input id={`test-overall-${idx}`}
                            type="text" 
                            value={test.overall}
                            onChange={e => {
                              const newList = [...form.englishTestsData];
                              newList[idx].overall = e.target.value;
                              update('englishTestsData', newList as any);
                            }}
                            placeholder="e.g. 6.5"
                            aria-label="Overall score"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label htmlFor={`test-reading-${idx}`} className="block text-[10px] font-semibold text-slate-500 mb-1">Reading</label>
                          <input id={`test-reading-${idx}`} type="text" value={test.reading} onChange={e => {
                            const newList = [...form.englishTestsData];
                            newList[idx].reading = e.target.value;
                            update('englishTestsData', newList as any);
                          }} placeholder="6.0" aria-label="Reading score" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                        </div>
                        <div>
                          <label htmlFor={`test-writing-${idx}`} className="block text-[10px] font-semibold text-slate-500 mb-1">Writing</label>
                          <input id={`test-writing-${idx}`} type="text" value={test.writing} onChange={e => {
                            const newList = [...form.englishTestsData];
                            newList[idx].writing = e.target.value;
                            update('englishTestsData', newList as any);
                          }} placeholder="6.0" aria-label="Writing score" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                        </div>
                        <div>
                          <label htmlFor={`test-listening-${idx}`} className="block text-[10px] font-semibold text-slate-500 mb-1">Listening</label>
                          <input id={`test-listening-${idx}`} type="text" value={test.listening} onChange={e => {
                            const newList = [...form.englishTestsData];
                            newList[idx].listening = e.target.value;
                            update('englishTestsData', newList as any);
                          }} placeholder="6.0" aria-label="Listening score" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                        </div>
                        <div>
                          <label htmlFor={`test-speaking-${idx}`} className="block text-[10px] font-semibold text-slate-500 mb-1">Speaking</label>
                          <input id={`test-speaking-${idx}`} type="text" value={test.speaking} onChange={e => {
                            const newList = [...form.englishTestsData];
                            newList[idx].speaking = e.target.value;
                            update('englishTestsData', newList as any);
                          }} placeholder="6.0" aria-label="Speaking score" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                  <p className="text-xs text-slate-400 mb-2">No specific language test scores added.</p>
                  <button type="button" 
                    onClick={() => {
                      const newList = [{ type: 'IELTS', overall: '', reading: '', writing: '', listening: '', speaking: '' }];
                      update('englishTestsData', newList as any);
                    }}
                    className="text-indigo-600 text-xs font-bold hover:underline"
                  >
                    + Add first test requirement
                  </button>
                </div>
              )}
              
              <div className="mt-4">
                <label htmlFor="moi-acceptable" className="flex items-center gap-2 cursor-pointer group">
                  <input id="moi-acceptable"
                    type="checkbox" 
                    checked={form.englishLanguageType === 'Medium of Instruction'} 
                    onChange={e => update('englishLanguageType', e.target.checked ? 'Medium of Instruction' : 'IELTS')}
                    aria-label="Medium of Instruction acceptable"
                    className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">Medium of Instruction (MOI) acceptable</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Filter size={16} className="text-purple-600" />
              </div>
              <h2 className="text-base font-bold text-slate-700">Quick Filters</h2>
            </div>
            <button type="button" 
              onClick={() => setShowAddQuickFilter(true)}
              className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
              aria-label="Add quick filter"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-100 hover:scrollbar-thumb-purple-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickFilters.map((filter) => {
                const IconComponent = (Icons as any)[filter.icon] || Icons.Filter;
                const isSelected = form.quickFilters.includes(filter.label);
                
                return (
                  <button type="button"
                    key={filter.id}
                    onClick={() => {
                      const next = isSelected 
                        ? form.quickFilters.filter(label => label !== filter.label)
                        : [...form.quickFilters, filter.label];
                      update('quickFilters', next as any);
                    }}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group
                      ${isSelected 
                        ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-200' 
                        : 'bg-slate-50 border-slate-200 hover:border-purple-300 hover:bg-white'}
                    `}
                  >
                    <div className={`
                      size-8 rounded-lg flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-purple-600 text-white' : 'bg-white text-slate-400 group-hover:text-purple-600'}
                    `}>
                      <IconComponent size={16} />
                    </div>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-purple-700' : 'text-slate-600'}`}>
                      {filter.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-slate-700">Requirements</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REQUIREMENTS_LIST.map((req) => {
              const isSelected = form.requirements.includes(req);
              return (
                <button type="button"
                  key={req}
                  onClick={() => {
                    const next = isSelected 
                      ? form.requirements.filter(r => r !== req)
                      : [...form.requirements, req];
                    update('requirements', next as any);
                  }}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
                    ${isSelected 
                      ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' 
                      : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-white'}
                  `}
                >
                  <div className={`
                    size-5 rounded border flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}
                  `}>
                    {isSelected && <CheckCircle size={12} />}
                  </div>
                  <span className={`text-xs font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                    {req}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex gap-2">
            <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-blue-700 leading-relaxed">
              Select all mandatory and optional requirements for this course. This information helps match the right students to this program.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pb-6">
          <Link href="/courses" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary px-8">
            {courseId ? 'Update Course' : 'Add Course'}
          </button>
        </div>
      </form>

      <AddItemModal 
        title="Faculty" 
        isOpen={showAddFaculty} 
        onClose={() => { setShowAddFaculty(false); setNewItemName(''); }} 
        onSave={() => handleAddNew('faculty')} 
        value={newItemName} 
        setValue={setNewItemName} 
      />
      <AddItemModal 
        title="Degree Type" 
        isOpen={showAddDegreeType} 
        onClose={() => { setShowAddDegreeType(false); setNewItemName(''); }} 
        onSave={() => handleAddNew('degreeType')} 
        value={newItemName} 
        setValue={setNewItemName} 
      />
      <AddItemModal 
        title="Intake" 
        isOpen={showAddIntake} 
        onClose={() => { setShowAddIntake(false); setNewItemName(''); }} 
        onSave={() => handleAddNew('intake')} 
        value={newItemName} 
        setValue={setNewItemName} 
      />
      <AddItemModal 
        title="Quick Filter" 
        isOpen={showAddQuickFilter} 
        onClose={() => { setShowAddQuickFilter(false); setNewItemName(''); }} 
        onSave={() => handleAddNew('quickFilter')} 
        value={newItemName} 
        setValue={setNewItemName} 
      />
    </div>
  );
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function AddItemModal({ title, isOpen, onClose, onSave, value, setValue }: { title: string, isOpen: boolean, onClose: () => void, onSave: () => void, value: string, setValue: (v: string) => void }) {
  const [month, setMonth] = useState('January');
  const [year, setYear] = useState(() => new Date().getFullYear().toString());
  const yearRef = useRef(year);

  useEffect(() => {
    yearRef.current = year;
  }, [year]);

  if (!isOpen) return null;

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString());
  const handleIntakeMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = e.target.value;
    setMonth(m);
    setValue(`${m} ${yearRef.current}`);
  };
  const handleIntakeYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const y = e.target.value;
    setYear(y);
    setValue(`${month} ${y}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Add New {title}</h3>
        
        {title === 'Intake' ? (
          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <label htmlFor="intake-month" className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Month</label>
              <select id="intake-month"
                value={month} 
                onChange={handleIntakeMonthChange}
                aria-label="Intake month"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="w-24">
              <label htmlFor="intake-year" className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Year</label>
              <select id="intake-year"
                value={year} 
                onChange={handleIntakeYearChange}
                aria-label="Intake year"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter ${title.toLowerCase()} name...`}
            aria-label={`New ${title} name`}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
          />
        )}

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="button" onClick={onSave} className="btn-primary flex-1">Add {title}</button>
        </div>
      </div>
    </div>
  );
}

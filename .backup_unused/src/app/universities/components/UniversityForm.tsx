'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowLeft, Building2, Globe, Award, CheckCircle, AlertCircle, Upload, Plus, X, Info, Loader2 } from 'lucide-react';
import { REQUIREMENTS_LIST } from '@/lib/constants';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { COUNTRIES } from '@/lib/data/countries';

const ACCREDITATION_BODIES = [
  'NECHE', 'WSCUC', 'HLC', 'SACSCOC', 'QAA', 'ASIIN', 'AAQ', 'CPE',
  'NIAD-QE', 'KCUE', 'NAAC', 'ANVUR', 'CHE', 'TEQSA', 'CACUSS',
];

interface UniversityFormProps {
  universityId?: string;
}

export default function UniversityForm({ universityId }: UniversityFormProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(!!universityId);
  const [accInput, setAccInput] = useState('');
  const [form, setForm] = useState({
    name: '',
    shortName: '',
    country: '',
    type: 'Public',
    accreditation: [] as string[],
    accredited: true,
    website: '',
    email: '',
    phone: '',
    address: '',
    ranking: '',
    foundedYear: '',
    description: '',
    status: 'Active',
    logo: null as string | null,
    banner: null as string | null,
    imagesList: [] as string[],
    requirements: [] as string[],
    partnerId: '',
    partnershipAmount: '',
    commissionType: 'Percentage',
    commissionValue: '',
    commissionCurrency: '',
    isPartnershipNA: false,
    cities: [] as string[],
  });
  const [partners, setPartners] = useState<any[]>([]);
  const isLoadingPartners = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    isLoadingPartners.current = true;
    fetch('/api/partners', { signal: ac.signal })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPartners(data);
        isLoadingPartners.current = false;
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          isLoadingPartners.current = false;
        }
      });

    if (universityId) {
      fetch(`/api/universities/${universityId}`, { signal: ac.signal })
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setForm({
              name: data.name || '',
              shortName: data.shortName || '',
              country: data.country || '',
              type: data.type || 'Public',
              accreditation: Array.isArray(data.accreditation) ? data.accreditation : (data.accreditation ? (data.accreditation.startsWith('[') ? JSON.parse(data.accreditation) : [data.accreditation]) : []),
              accredited: data.accreditation !== null,
              website: data.website || '',
              email: data.email || '',
              phone: data.phone || '',
              address: data.address || '',
              ranking: data.ranking?.toString() || '',
              foundedYear: data.founded?.toString() || '',
              description: data.description || '',
              status: data.status || 'Active',
              logo: data.logo || null,
              banner: data.banner || null,
              imagesList: Array.isArray(data.images) ? data.images : (data.images ? (typeof data.images === 'string' && data.images.startsWith('[') ? JSON.parse(data.images) : [data.images]) : []),
              requirements: data.requirements ? (typeof data.requirements === 'string' ? JSON.parse(data.requirements) : data.requirements) : [],
              partnerId: data.partnerId || '',
              partnershipAmount: data.partnershipAmount?.toString() || '',
              commissionType: data.commissionType || 'Percentage',
              commissionValue: data.commissionValue?.toString() || '',
              commissionCurrency: data.commissionCurrency || '',
              isPartnershipNA: !data.partnerId,
              cities: data.city ? (typeof data.city === 'string' && data.city.startsWith('[') ? JSON.parse(data.city) : [data.city]) : [],
            });
          }
          setIsLoading(false);
        })
        .catch(() => {
          toast.error('Failed to load university data');
          setIsLoading(false);
        });
    }
  }, [universityId]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'University name is required';
    if (!form.country) e.country = 'Country is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); toast.error('Please fix the errors below'); return; }
    
    try {
      const url = universityId ? `/api/universities/${universityId}` : '/api/universities';
      const method = universityId ? 'PATCH' : 'POST';

      const payload = {
        ...form,
        establishedYear: form.foundedYear,
        accreditationBody: JSON.stringify(form.accreditation),
        websiteUrl: form.website,
        images: JSON.stringify(form.imagesList),
        // Handle N/A Partnership
        ...(form.isPartnershipNA ? {
          partnerId: null,
          partnershipAmount: null,
          commissionType: null,
          commissionValue: null,
          commissionCurrency: null,
        } : {}),
        city: JSON.stringify(form.cities),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(universityId ? 'Failed to update university' : 'Failed to create university');
      
      setSubmitted(true);
      toast.success(`${form.name} ${universityId ? 'updated' : 'added'} successfully!`);
      if (universityId) {
        setTimeout(() => router.push(`/universities/${universityId}`), 1500);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${universityId ? 'update' : 'add'} university. Please try again.`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="font-bold text-sm uppercase tracking-widest">Fetching data…</p>
      </div>
    );
  }

  if (submitted && !universityId) {
    return (
      <div className="animate-fade-in max-w-lg mx-auto mt-16 text-center">
        <div className="size-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">University Added!</h2>
        <p className="text-slate-500 mb-2"><strong className="text-slate-700">{form.name}</strong> has been added to the platform.</p>
        <p className="text-sm text-slate-400 mb-8">It will appear in the Universities list after review.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/universities" className="btn-secondary">View Universities</Link>
          <button type="button" onClick={() => { setSubmitted(false); setForm({ name: '', shortName: '', country: '', type: 'Public', accreditation: [], accredited: true, website: '', email: '', phone: '', address: '', ranking: '', foundedYear: '', description: '', status: 'Active', logo: null, banner: null, imagesList: [], requirements: [], partnerId: '', partnershipAmount: '', commissionType: 'Percentage', commissionValue: '', commissionCurrency: '', isPartnershipNA: false, cities: [] }); }} className="btn-primary">
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
        <button type="button" onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{universityId ? 'Edit University' : 'Add University'}</h1>
          <p className="text-sm text-slate-400">{universityId ? `Modifying ${form.name}` : 'Register a new university on the platform'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-indigo-600" />
            </div>
            <h2 className="text-base font-bold text-slate-700">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">University Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="e.g. Massachusetts Institute of Technology"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Short Name / Abbreviation</label>
              <input
                type="text"
                value={form.shortName}
                onChange={e => update('shortName', e.target.value)}
                placeholder="e.g. MIT"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all ${errors.shortName ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              />
              {errors.shortName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.shortName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Institution Type</label>
              <select value={form.type} onChange={e => update('type', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                <option value="Public">Public</option>
                <option value="Private">Private</option>
                <option value="Non-profit">Non-profit</option>
                <option value="For-profit">For-profit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Country *</label>
              <select 
                value={form.country} 
                onChange={e => {
                  const countryName = e.target.value;
                  update('country', countryName);
                  const countryData = COUNTRIES.find(c => c.name === countryName);
                  if (countryData) {
                    update('commissionCurrency', countryData.currency);
                  }
                }} 
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer ${errors.country ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              >
                <option value="">Select country…</option>
                {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              {errors.country && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.country}</p>}
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
                Cities / Campus Locations
                <Info size={12} className="text-slate-400" title="Add all cities where this university has campuses" />
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.cities.map((city, idx) => (
                  <span key={city} className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold border border-indigo-100">
                    {city}
                    <button type="button" onClick={() => update('cities', form.cities.filter((_, i) => i !== idx))} className="hover:text-indigo-900">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add city..." 
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val && !form.cities.includes(val)) {
                        update('cities', [...form.cities, val]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Founded Year</label>
              <input type="number" value={form.foundedYear} onChange={e => update('foundedYear', e.target.value)} placeholder="e.g. 1861" min="1000" max="2026" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Global Ranking</label>
              <input type="number" value={form.ranking} onChange={e => update('ranking', e.target.value)} placeholder="e.g. 1" min="1" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Brief description of the university..." rows={3} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>
          </div>
        </div>

        {/* Accreditation */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-8 bg-violet-50 rounded-lg flex items-center justify-center">
              <Award size={16} className="text-violet-600" />
            </div>
            <h2 className="text-base font-bold text-slate-700">Accreditation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">Accreditation Bodies</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.accreditation.map((acc, idx) => (
                  <div key={acc} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg border border-violet-100 text-xs font-bold animate-fade-in">
                    {acc}
                    <button type="button" 
                      onClick={() => {
                        const newList = form.accreditation.filter((_, i) => i !== idx);
                        update('accreditation', newList);
                      }}
                      className="p-0.5 hover:bg-violet-200 rounded-full transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {form.accreditation.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-1.5">No accreditation bodies added yet.</p>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={accInput}
                    onChange={e => setAccInput(e.target.value)}
                    placeholder="Search or type accreditation body..."
                    list="accreditation-list"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = accInput.trim();
                        if (val && !form.accreditation.includes(val)) {
                          update('accreditation', [...form.accreditation, val]);
                          setAccInput('');
                        }
                      }
                    }}
                  />
                  <datalist id="accreditation-list">
                    {ACCREDITATION_BODIES.filter(a => !form.accreditation.includes(a)).map(a => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
                </div>
                <button type="button" 
                  onClick={() => {
                    const val = accInput.trim();
                    if (val && !form.accreditation.includes(val)) {
                      update('accreditation', [...form.accreditation, val]);
                      setAccInput('');
                    }
                  }}
                  className="btn-secondary py-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 italic">Select from common bodies or type a custom one and press Enter/Add.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Accreditation Status</label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.accredited === true} onChange={() => update('accredited', true)} className="text-indigo-600" />
                  <span className="text-sm text-slate-600">Accredited</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.accredited === false} onChange={() => update('accredited', false)} className="text-indigo-600" />
                  <span className="text-sm text-slate-600">Not Accredited</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Globe size={16} className="text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-slate-700">Contact & Web</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Website URL</label>
              <input type="url" value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://university.edu" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Email</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="admissions@university.edu" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 (617) 253-0000" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
              <select value={form.status} onChange={e => update('status', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address</label>
              <input type="text" value={form.address} onChange={e => update('address', e.target.value)} placeholder="77 Massachusetts Ave, Cambridge, MA 02139" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
        </div>

        {/* Media & Assets */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Upload size={16} className="text-amber-600" />
            </div>
            <h2 className="text-base font-bold text-slate-700">Media & Assets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">University Logo</label>
              <div className="flex items-center gap-4">
                <div className="size-20 rounded-2xl bg-transparent border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                  {form.logo ? (
                    <Image src={form.logo} alt="Logo Preview" fill className="object-contain" sizes="80px" />
                  ) : (
                    <Building2 className="text-slate-300" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <label 
                    htmlFor="logo-upload"
                    className="btn-secondary text-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <Upload size={14} />
                    {form.logo ? 'Change Logo' : 'Upload Logo'}
                  </label>
                  <input 
                    id="logo-upload"
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => update('logo', reader.result as string);
                        reader.onerror = () => toast.error('Failed to read image file');
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <p className="text-[10px] text-slate-400 mt-2 italic">Recommended: 400x400 PNG/SVG</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Banner Image</label>
              <div className="flex flex-col gap-3">
                <div className="h-20 w-full rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative">
                  {form.banner ? (
                    <Image src={form.banner} alt="Banner Preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  ) : (
                    <Globe className="text-slate-300" size={24} />
                  )}
                </div>
                <label 
                  htmlFor="banner-upload"
                  className="btn-secondary text-xs cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Upload size={14} />
                  {form.banner ? 'Change Banner' : 'Upload Banner'}
                </label>
                <input 
                  id="banner-upload"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => update('banner', reader.result as string);
                      reader.onerror = () => toast.error('Failed to read image file');
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-3">Campus & Gallery Images</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {form.imagesList.map((img, idx) => (
                  <div key={img} className="relative aspect-square rounded-xl bg-slate-100 overflow-hidden group">
                    <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
                    <button type="button" 
                      onClick={() => {
                        const newList = form.imagesList.filter((_, i) => i !== idx);
                        update('imagesList', newList);
                      }}
                      className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer">
                  <Plus className="text-slate-400 group-hover:text-indigo-500" size={20} />
                  <span className="text-[10px] font-bold text-slate-400">Add Image</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setForm(prev => ({
                            ...prev,
                            imagesList: [...(prev as any).imagesList, reader.result as string]
                          }));
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Partnership & Commission */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Plus size={16} className="text-indigo-600" />
              </div>
              <h2 className="text-base font-bold text-slate-700">Partnership & Commission</h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <input 
                type="checkbox" 
                checked={form.isPartnershipNA} 
                onChange={e => update('isPartnershipNA', e.target.checked)} 
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-600">Not Applicable</span>
            </label>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-300 ${form.isPartnershipNA ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Partner</label>
              <div className="flex gap-2">
                <select 
                  value={form.partnerId} 
                  onChange={e => update('partnerId', e.target.value)} 
                  disabled={form.isPartnershipNA}
                  className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer disabled:cursor-not-allowed"
                >
                  <option value="">Select a partner from settings…</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <Link 
                  href="/settings?tab=partners" 
                  className={`btn-secondary whitespace-nowrap ${form.isPartnershipNA ? 'opacity-50' : ''}`}
                  title="Manage Partners in Settings"
                >
                  <Plus size={14} />
                  Manage
                </Link>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 italic">Choose a partner registered in the system settings.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Partnership Amount</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  {COUNTRIES.find(c => c.name === form.country)?.currencySymbol || '$'}
                </div>
                <input 
                  type="number" 
                  value={form.partnershipAmount} 
                  onChange={e => update('partnershipAmount', e.target.value)} 
                  disabled={form.isPartnershipNA}
                  placeholder="e.g. 5000" 
                  className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed" 
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 italic">Amount paid for the partnership agreement.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Commission Type</label>
                <select 
                  value={form.commissionType} 
                  onChange={e => update('commissionType', e.target.value)} 
                  disabled={form.isPartnershipNA}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer disabled:cursor-not-allowed"
                >
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Flat">Flat Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Value</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={form.commissionValue} 
                    onChange={e => update('commissionValue', e.target.value)} 
                    disabled={form.isPartnershipNA}
                    placeholder={form.commissionType === 'Percentage' ? 'e.g. 15' : 'e.g. 1000'} 
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed" 
                  />
                  {form.commissionType === 'Percentage' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Commission Currency</label>
              <select 
                value={form.commissionCurrency} 
                onChange={e => update('commissionCurrency', e.target.value)} 
                disabled={form.isPartnershipNA}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer disabled:cursor-not-allowed"
              >
                <option value="">Select currency…</option>
                {Array.from(new Set(COUNTRIES.map(c => c.currency))).sort().map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-slate-700">General Requirements</h2>
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
              Select all requirements that apply generally to this university's programs. Individual courses can have additional specific requirements.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pb-6">
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary px-8">
            {universityId ? 'Save Changes' : 'Add University'}
          </button>
        </div>
      </form>
    </div>
  );
}

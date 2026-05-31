'use client';

import React, { useState, useEffect, useRef, useReducer } from 'react';
import Image from 'next/image';
import { ArrowLeft, Building2, Globe, Award, CheckCircle, AlertCircle, Upload, Plus, X, Info, Loader2 } from 'lucide-react';
import { REQUIREMENTS_LIST } from '@/lib/constants';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { COUNTRIES } from '@/lib/data/countries';
import FormHeader from './FormHeader';
import BasicInfoCard from './BasicInfoCard';
import AccreditationCard from './AccreditationCard';
import ContactCard from './ContactCard';
import MediaCard from './MediaCard';
import PartnershipCard from './PartnershipCard';
import RequirementsCard from './RequirementsCard';
import FormActions from './FormActions';

const ACCREDITATION_BODIES = [
  'NECHE', 'WSCUC', 'HLC', 'SACSCOC', 'QAA', 'ASIIN', 'AAQ', 'CPE',
  'NIAD-QE', 'KCUE', 'NAAC', 'ANVUR', 'CHE', 'TEQSA', 'CACUSS',
];

const INITIAL_FORM = {
  name: '',
  shortName: '',
  country: '',
  type: 'Public' as const,
  accreditation: [] as string[],
  accredited: true,
  website: '',
  email: '',
  phone: '',
  address: '',
  ranking: '',
  foundedYear: '',
  description: '',
  status: 'Active' as const,
  logo: null as string | null,
  banner: null as string | null,
  imagesList: [] as string[],
  requirements: [] as string[],
  partnerId: '',
  partnershipAmount: '',
  commissionType: 'Percentage' as const,
  commissionValue: '',
  commissionCurrency: '',
  isPartnershipNA: false,
  cities: [] as string[],
};

type PageAction =
  | { type: 'partnersLoaded'; partners: any[] }
  | { type: 'universityLoaded'; form: typeof INITIAL_FORM }
  | { type: 'loadError' }
  | { type: 'setField'; field: string; value: any }
  | { type: 'addGalleryImage'; image: string }
  | { type: 'resetForm' };

function pageReducer(state: { form: typeof INITIAL_FORM; partners: any[]; isLoading: boolean }, action: PageAction) {
  switch (action.type) {
    case 'partnersLoaded':
      return { ...state, partners: action.partners };
    case 'universityLoaded':
      return { ...state, form: action.form, isLoading: false };
    case 'loadError':
      return { ...state, isLoading: false };
    case 'setField':
      return { ...state, form: { ...state.form, [action.field]: action.value } };
    case 'addGalleryImage':
      return { ...state, form: { ...state.form, imagesList: [...state.form.imagesList, action.image] } };
    case 'resetForm':
      return { ...state, form: INITIAL_FORM, partners: [] };
    default:
      return state;
  }
}

interface UniversityFormProps {
  universityId?: string;
}

export default function UniversityForm({ universityId }: UniversityFormProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [accInput, setAccInput] = useState('');
  const [pageState, dispatch] = useReducer(pageReducer, {
    form: INITIAL_FORM,
    partners: [] as any[],
    isLoading: !!universityId,
  });
  const { form, partners, isLoading } = pageState;
  const isLoadingPartners = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    isLoadingPartners.current = true;
    fetch('/api/partners', { signal: ac.signal })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) dispatch({ type: 'partnersLoaded', partners: data });
        isLoadingPartners.current = false;
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          isLoadingPartners.current = false;
        }
      });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (!universityId) return;
    const ac = new AbortController();
    fetch(`/api/universities/${universityId}`, { signal: ac.signal })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          dispatch({
            type: 'universityLoaded',
            form: {
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
            },
          });
        } else {
          dispatch({ type: 'loadError' });
        }
      })
      .catch(() => {
        toast.error('Failed to load university data');
        dispatch({ type: 'loadError' });
      });
    return () => ac.abort();
  }, [universityId]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: any) => {
    dispatch({ type: 'setField', field, value });
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
                          <button type="button" onClick={() => { setSubmitted(false); dispatch({ type: 'resetForm' }); }} className="btn-primary">
            Add Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <FormHeader universityId={universityId} formName={form.name} onBack={() => router.back()} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <BasicInfoCard
          form={form}
          errors={errors}
          update={update}
          COUNTRIES={COUNTRIES}
        />

        <AccreditationCard
          form={form}
          update={update}
          accInput={accInput}
          setAccInput={setAccInput}
        />

        <ContactCard form={form} update={update} />

        <MediaCard
          form={form}
          update={update}
          dispatch={dispatch}
          toast={toast}
        />

        <PartnershipCard
          form={form}
          update={update}
          partners={partners}
          COUNTRIES={COUNTRIES}
        />

        <RequirementsCard form={form} update={update} />

        <FormActions universityId={universityId} onBack={() => router.back()} />
      </form>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Building2,
  Globe,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  ExternalLink,
  Mail,
  Phone,
  Info,
  Search,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowLeft,
  Users,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  LazyMotion,
  m as motion,
  domAnimation,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { getLatestRates, convertToNPR, formatNPR } from "@/lib/forex";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";

const formatIntake = (intakeStr: string | undefined) => {
  if (!intakeStr) return "TBA";
  try {
    if (typeof intakeStr === "string" && intakeStr.startsWith("[")) {
      const intakes = JSON.parse(intakeStr);
      if (Array.isArray(intakes) && intakes.length > 0) {
        const first = intakes[0];
        return `${first.name}${intakes.length > 1 ? ` (+${intakes.length - 1})` : ""}`;
      }
    }
  } catch (_e) {}
  return intakeStr;
};

const formatCities = (cityStr: string | undefined) => {
  if (!cityStr) return "N/A";
  try {
    if (typeof cityStr === "string" && cityStr.startsWith("[")) {
      const cities = JSON.parse(cityStr);
      if (Array.isArray(cities) && cities.length > 0) {
        return cities.join(", ");
      }
    }
  } catch (_e) {}
  return cityStr;
};

const formatEnglishTests = (testsStr: string | undefined) => {
  if (!testsStr) return "IELTS 6.0";
  try {
    if (typeof testsStr === "string" && testsStr.startsWith("[")) {
      const tests = JSON.parse(testsStr);
      if (Array.isArray(tests) && tests.length > 0) {
        const first = tests[0];
        return `${first.type} ${first.overall}${tests.length > 1 ? ` (+${tests.length - 1})` : ""}`;
      }
    }
  } catch (_e) {}
  return testsStr || "IELTS 6.0";
};

interface Course {
  id: string;
  name: string;
  faculty: string;
  degreeType: string;
  level: string;
  credits: number;
  duration: string;
  tuitionFee: string;
  currency: string;
  applicationFee: string;
  applicationFeeCurrency: string;
  status: string;
  initials: string;
  color: string;
  applicationDeadline?: string;
  intake?: string;
  courseCode?: string;
  englishTests?: string;
  language?: string;
}

interface University {
  id: string;
  name: string;
  shortName?: string;
  country: string;
  city: string;
  type?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  founded?: number;
  ranking?: number;
  accreditation?: string | string[];
  logo?: string;
  banner?: string;
  description?: string;
  requirements?: string[];
  color: string;
  initials: string;
  partner?: { name: string };
  partnershipAmount?: string;
  commissionType?: string;
  commissionValue?: string;
  commissionCurrency?: string;
  currency?: string;
  images?: string | string[];
  groupedCourses: Record<string, Course[]>;
}

export default function UniversityDetailContent({ id }: { id: string }) {
  const prefersReducedMotion = useReducedMotion();
  const [university, setUniversity] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFaculty, setActiveFaculty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInNPR, setShowInNPR] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({ NPR: 1 });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const now = new Date();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/universities/${id}`);
        if (!res.ok) throw new Error("University not found");
        const data = await res.json();
        setUniversity(data);
      } catch (err) {
        toast.error("Failed to load university details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const faculties = useMemo(() => {
    if (!university) return [];
    return Object.keys(university.groupedCourses).sort();
  }, [university]);

  const filteredCourses = useMemo(() => {
    if (!university) return [];

    let allCourses: Course[] = [];
    if (activeFaculty === "all") {
      Object.values(university.groupedCourses).forEach((courses) => {
        allCourses = [...allCourses, ...courses];
      });
    } else {
      allCourses = university.groupedCourses[activeFaculty] || [];
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      allCourses = allCourses.filter(
        (c) => c.name.toLowerCase().includes(q) || c.degreeType.toLowerCase().includes(q)
      );
    }

    return allCourses;
  }, [university, activeFaculty, searchQuery]);

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!confirm(`Are you sure you want to delete ${courseName}?`)) return;

    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete course");

      toast.success("Course deleted successfully");

      // Update local state
      if (university) {
        const updatedGroupedCourses = { ...university.groupedCourses };
        Object.keys(updatedGroupedCourses).forEach((faculty) => {
          updatedGroupedCourses[faculty] = updatedGroupedCourses[faculty].filter(
            (c) => c.id !== courseId
          );
          if (updatedGroupedCourses[faculty].length === 0) {
            delete updatedGroupedCourses[faculty];
          }
        });
        setUniversity({ ...university, groupedCourses: updatedGroupedCourses });
      }
    } catch (err) {
      toast.error("Failed to delete course");
      console.error(err);
    }
  };

  const formatTuition = (fee: string | null, currency: string | null) => {
    if (!fee || fee === "0") return "N/A";
    const c = currency || "USD";

    if (showInNPR) {
      const nprVal = convertToNPR(fee, c, rates);
      return formatNPR(nprVal);
    }

    return `${c} ${parseFloat(fee).toLocaleString()}`;
  };

  const formatAppFee = (fee: string | null, currency: string | null) => {
    if (!fee || fee === "0") return "N/A";
    const c = currency || university?.currency || "USD";

    if (showInNPR) {
      const nprVal = convertToNPR(fee, c, rates);
      return formatNPR(nprVal);
    }

    return `${c} ${parseFloat(fee).toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <AppLayoutWrapper>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="size-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Loading university profileâ€¦</p>
        </div>
      </AppLayoutWrapper>
    );
  }

  if (!university) {
    return (
      <AppLayoutWrapper>
        <div className="text-center py-20">
          <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 size={40} className="text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">University Not Found</h2>
          <p className="text-slate-500 mb-8">
            The university you are looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/universities" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Universities
          </Link>
        </div>
      </AppLayoutWrapper>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <AppLayoutWrapper>
        <div className="animate-fade-in pb-20 p-4 md:p-8">
          {/* Back Button & Actions */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/universities"
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors group"
            >
              <div className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
                <ArrowLeft size={16} />
              </div>
              Back to Listing
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const newVal = !showInNPR;
                  setShowInNPR(newVal);
                  if (newVal && Object.keys(rates).length <= 1) {
                    getLatestRates().then(setRates);
                  }
                }}
                className={`btn-secondary ${showInNPR ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700" : ""}`}
              >
                <DollarSign size={16} />
                {showInNPR ? "Showing in NPR" : "Show in NPR"}
              </button>
              <Link href={`/universities/${university.id}/edit`} className="btn-primary">
                <Edit2 size={16} />
                Edit Profile
              </Link>
            </div>
          </div>

          <HeroSection university={university} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column: Details & Sidebar */}
            <div className="space-y-8">
              {/* Quick Stats */}
              <div>
                <div className="card p-6 bg-gradient-to-br from-white to-slate-50 border-emerald-100 shadow-sm">
                  <BookOpen size={24} className="text-emerald-500 mb-4" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Total Programs
                  </p>
                  <p className="text-3xl font-black text-slate-800">
                    {Object.values(university.groupedCourses).reduce(
                      (acc, curr) => acc + curr.length,
                      0
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    Across {Object.keys(university.groupedCourses).length} faculties
                  </p>
                </div>
              </div>

              <AboutCard university={university} />

              {/* Admission Requirements */}
              <div className="card p-8">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <CheckCircle size={18} className="text-emerald-500" />
                  Admission Info
                </h3>
                {university.requirements && university.requirements.length > 0 ? (
                  <ul className="space-y-4">
                    {university.requirements.map((req, _i) => (
                      <li key={req} className="flex items-start gap-3">
                        <div className="size-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle size={10} className="text-emerald-600" />
                        </div>
                        <span className="text-xs text-slate-600 font-medium leading-relaxed">
                          {req}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No specific general requirements listed.
                  </p>
                )}
              </div>

              <PartnershipInfo university={university} />
              <CampusGallery images={university.images} onSelectImage={setSelectedImage} />
            </div>

            <CourseCatalog
              university={university}
              activeFaculty={activeFaculty}
              setActiveFaculty={setActiveFaculty}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredCourses={filteredCourses}
              faculties={faculties}
              prefersReducedMotion={prefersReducedMotion}
              handleDeleteCourse={handleDeleteCourse}
              formatTuition={formatTuition}
              formatAppFee={formatAppFee}
              now={now}
            />

            <div className="lg:col-span-3">
              <LocationMapSection university={university} />
            </div>
          </div>
        </div>

        <ImageLightbox
          selectedImage={selectedImage}
          onClose={() => setSelectedImage(null)}
          prefersReducedMotion={prefersReducedMotion}
        />
      </AppLayoutWrapper>
    </LazyMotion>
  );
}

function HeroSection({ university }: { university: University }) {
  return (
    <div className="relative mb-10">
      <div className="h-56 md:h-72 w-full rounded-[40px] bg-slate-200 overflow-hidden relative shadow-2xl">
        {university.banner ? (
          <Image src={university.banner} alt="" fill className="object-cover" sizes="100vw" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

        <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-left">
            <div
              className="size-32 md:w-40 md:h-40 rounded-[32px] border-8 border-white/10 backdrop-blur-md shadow-2xl flex items-center justify-center text-white text-4xl font-black flex-shrink-0 overflow-hidden relative"
              style={{ backgroundColor: university.logo ? "transparent" : university.color }}
            >
              {university.logo ? (
                <Image
                  src={university.logo}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 128px, 160px"
                />
              ) : (
                university.initials
              )}
            </div>
            <div className="pb-4">
              <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-md border border-white/20 text-indigo-200 text-[10px] font-black uppercase tracking-widest">
                  {university.shortName || "Verified Institution"}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-white/20 text-emerald-200 text-[10px] font-black uppercase tracking-widest">
                  {university.type || "Active"}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-xl">
                {university.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-white/70 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-indigo-400" />
                  {formatCities(university.city)}, {university.country}
                </span>
                <span className="size-1.5 rounded-full bg-white/20" />
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-indigo-400" />
                  Est. {university.founded || "N/A"}
                </span>
                <span className="size-1.5 rounded-full bg-white/20" />
                <span className="flex items-center gap-2">
                  <Award size={16} className="text-indigo-400" />
                  Global Rank #{university.ranking || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutCard({ university }: { university: University }) {
  return (
    <div className="card p-8">
      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
        <Info size={18} className="text-indigo-500" />
        University Overview
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-8">
        {university.description ||
          "Information about this university's mission, history, and campus life will appear here."}
      </p>

      <div className="space-y-4">
        {university.website && (
          <a
            href={
              university.website.startsWith("http")
                ? university.website
                : `https://${university.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-100 shadow-sm">
                <Globe size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-0.5">
                  Website
                </p>
                <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                  {university.website}
                </p>
              </div>
            </div>
            <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-500" />
          </a>
        )}

        {university.email && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
              <Mail size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-0.5">
                Email
              </p>
              <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                {university.email}
              </p>
            </div>
          </div>
        )}

        {university.phone && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
              <Phone size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-0.5">
                Phone
              </p>
              <p className="text-xs font-bold text-slate-700">{university.phone}</p>
            </div>
          </div>
        )}

        {university.address && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
              <MapPin size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-0.5">
                Address
              </p>
              <p className="text-xs font-bold text-slate-700 leading-tight">{university.address}</p>
            </div>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
          <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
            <Award size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-0.5">
              Accreditation
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {Array.isArray(university.accreditation) ? (
                university.accreditation.length > 0 ? (
                  university.accreditation.map((acc, _i) => (
                    <span
                      key={acc}
                      className="px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-100 rounded text-[10px] font-bold"
                    >
                      {acc}
                    </span>
                  ))
                ) : (
                  <p className="text-xs font-bold text-slate-700">Pending Review</p>
                )
              ) : (
                <p className="text-xs font-bold text-slate-700">
                  {university.accreditation || "Pending Review"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnershipInfo({ university }: { university: University }) {
  return (
    <div className="card p-8 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100">
      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
        <Users size={18} className="text-indigo-600" />
        Partnership & Commission
      </h3>

      {university.partner ? (
        <div className="space-y-6 animate-fade-in">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              University Partner
            </p>
            <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="size-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                {university.partner?.name?.[0] || "P"}
              </div>
              <span className="text-sm font-bold text-slate-700">{university.partner?.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Partnership Amount
              </p>
              <p className="text-lg font-black text-slate-800">
                {university.partnershipAmount
                  ? `${university.commissionCurrency || "$"} ${Number(university.partnershipAmount).toLocaleString()}`
                  : "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Commission Structure
              </p>
              <div className="flex items-end gap-2">
                <p className="text-lg font-black text-indigo-600">
                  {university.commissionValue
                    ? university.commissionType === "Flat"
                      ? `${university.commissionCurrency || "$"} ${Number(university.commissionValue).toLocaleString()}`
                      : `${university.commissionValue}%`
                    : "N/A"}
                </p>
                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  ({university.commissionType || "Percentage"})
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center animate-fade-in">
          <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <Info size={24} className="text-slate-400" />
          </div>
          <p className="text-sm font-black text-slate-600 uppercase tracking-widest">
            Not Applicable
          </p>
          <p className="text-[11px] text-slate-400 mt-2 px-6 leading-relaxed italic">
            This institution is currently managed directly without an external partner or commission
            structure.
          </p>
        </div>
      )}
    </div>
  );
}

function CampusGallery({
  images,
  onSelectImage,
}: {
  images: string | string[] | undefined;
  onSelectImage: (img: string) => void;
}) {
  const imageList = Array.isArray(images)
    ? images
    : images
      ? images.startsWith("[")
        ? JSON.parse(images)
        : [images]
      : [];

  if (!images || imageList.length === 0) return null;

  return (
    <div className="card p-8">
      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
        <Globe size={18} className="text-indigo-600" />
        Campus Gallery
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {imageList.length === 0 ? (
          <p className="col-span-2 text-xs text-slate-400 italic text-center py-4">
            No campus images available.
          </p>
        ) : (
          imageList.map((img: string, i: number) => (
            <button
              type="button"
              key={img}
              className="aspect-video rounded-2xl bg-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer border border-slate-100 relative"
              onClick={() => onSelectImage(img)}
            >
              <Image
                src={img}
                alt={`Campus ${i}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function CourseCatalog({
  university,
  activeFaculty,
  setActiveFaculty,
  searchQuery,
  setSearchQuery,
  filteredCourses,
  faculties,
  prefersReducedMotion,
  handleDeleteCourse,
  formatTuition,
  formatAppFee,
  now,
}: {
  university: University;
  activeFaculty: string;
  setActiveFaculty: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filteredCourses: Course[];
  faculties: string[];
  prefersReducedMotion: boolean | null;
  handleDeleteCourse: (id: string, name: string) => void;
  formatTuition: (fee: string | null, currency: string | null) => string;
  formatAppFee: (fee: string | null, currency: string | null) => string;
  now: Date;
}) {
  return (
    <div className="lg:col-span-3 space-y-8">
      {/* Courses Header & Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-100">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Available Programs</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">
                {filteredCourses.length} courses found
              </span>
              <span className="size-1 rounded-full bg-slate-300" />
              <span className="text-[11px] text-indigo-600 font-black uppercase tracking-widest">
                {faculties.length} faculties
              </span>
            </div>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search programs by name or level..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 text-sm border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-medium shadow-sm"
          />
        </div>
      </div>

      {/* Faculty Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveFaculty("all")}
          className={`
            px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all
            ${
              activeFaculty === "all"
                ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
            }
          `}
        >
          All Departments
        </button>
        {faculties.map((faculty) => (
          <button
            type="button"
            key={faculty}
            onClick={() => setActiveFaculty(faculty)}
            className={`
              px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all
              ${
                activeFaculty === faculty
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              }
            `}
          >
            {faculty}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden border-none shadow-xl shadow-slate-100/50">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50/60">
              <tr className="border-b border-slate-100">
                <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Program Name
                </th>
                <th className="p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Level
                </th>
                <th className="p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Faculty
                </th>
                <th className="p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Duration
                </th>
                <th className="p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Language Req
                </th>
                <th className="p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Tuition Fee
                </th>
                <th className="p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Intake
                </th>
                <th className="p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide text-center">
                  App. Fee
                </th>
                <th className="p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide text-right pr-5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <motion.tr
                      layout
                      initial={prefersReducedMotion ? false : { opacity: 0 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={course.id}
                      className="group hover:bg-slate-50 transition-colors border-b border-slate-50"
                    >
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-xl flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden border border-slate-100 bg-white relative">
                            {university.logo ? (
                              <Image
                                src={university.logo}
                                alt=""
                                fill
                                className="object-contain p-1"
                                sizes="32px"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ backgroundColor: course.color }}
                              >
                                {course.initials}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-800">{course.name}</p>
                              {course.courseCode && (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tighter flex-shrink-0">
                                  {course.courseCode}
                                </span>
                              )}
                            </div>
                            {course.applicationDeadline && (
                              <p className="text-[10px] text-red-500 font-medium mt-0.5">
                                Deadline:{" "}
                                {new Date(course.applicationDeadline).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-tight">
                          {course.level}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-medium text-slate-600">{course.faculty}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock size={12} />
                          <span className="text-xs font-medium">{course.duration} Years</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-700">
                            {formatEnglishTests(course.englishTests)}
                          </span>
                          {course.language !== "English" && (
                            <span className="text-[9px] text-slate-400 font-medium">
                              {course.language}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 max-w-[120px]">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800 tabular-nums leading-tight truncate">
                            {formatTuition(course.tuitionFee, course.currency)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                            per year
                          </span>
                        </div>
                      </td>
                      <td className="p-3" suppressHydrationWarning>
                        {(() => {
                          try {
                            if (course.intake && course.intake.startsWith("[")) {
                              const intakes = JSON.parse(course.intake);
                              if (Array.isArray(intakes) && intakes.length > 0) {
                                const openIntake = intakes.find((i) => {
                                  const open = new Date(i.openDate);
                                  const deadline = new Date(i.deadline);
                                  return now >= open && now <= deadline;
                                });

                                if (openIntake) {
                                  return (
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1 w-fit">
                                        {openIntake.name}
                                        <span className="size-1 rounded-full bg-emerald-500 animate-pulse"></span>
                                      </span>
                                      <span className="text-[8px] text-emerald-600 font-bold uppercase tracking-tighter ml-1">
                                        Open
                                      </span>
                                    </div>
                                  );
                                }
                              }
                            }
                          } catch (_e) {}
                          return (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {formatIntake(course.intake)}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-3 text-center max-w-[100px]">
                        <span
                          className={`inline-flex items-center justify-center text-[10px] font-bold px-2 py-0.5 rounded-lg truncate max-w-full ${course.applicationFee && course.applicationFee !== "0" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}
                        >
                          {formatAppFee(course.applicationFee, course.applicationFeeCurrency)}
                        </span>
                      </td>
                      <td className="p-3 text-right pr-5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/search?id=${course.id}`}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-800 hover:text-indigo-600 transition-all"
                            title="View Details"
                          >
                            <Info size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(course.id, course.name)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-800 hover:text-rose-600 transition-all"
                            title="Delete Course"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <Search size={24} className="text-slate-300" />
                        </div>
                        <h3 className="font-bold text-slate-500 mb-1">
                          No matching programs found
                        </h3>
                        <p className="text-xs text-slate-400">
                          Try a different search term or faculty category.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LocationMapSection({ university }: { university: University }) {
  return (
    <div className="card p-6 mt-8 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <MapPin size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Location & Campus</h3>
            <p className="text-xs text-slate-400">
              {formatCities(university.city)} | {university.country}
            </p>
          </div>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(university.address || university.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-xs flex items-center gap-2"
        >
          Open in Google Maps
          <ExternalLink size={14} />
        </a>
      </div>

      <div className="w-full h-[450px] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          title="University Location"
          sandbox="allow-scripts"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(university.address || university.name)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
        ></iframe>
      </div>
    </div>
  );
}

function ImageLightbox({
  selectedImage,
  onClose,
  prefersReducedMotion,
}: {
  selectedImage: string | null;
  onClose: () => void;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <AnimatePresence>
      {selectedImage && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={prefersReducedMotion ? {} : { opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md cursor-zoom-out"
        >
          <motion.div
            initial={prefersReducedMotion ? false : { scale: 0.9, opacity: 0 }}
            animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Preview"
              fill
              className="object-contain rounded-2xl shadow-2xl"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-4 -right-4 size-10 bg-white rounded-full flex items-center justify-center shadow-xl hover:bg-slate-100 transition-colors"
            >
              <X size={20} className="text-slate-800" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

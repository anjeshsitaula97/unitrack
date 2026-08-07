"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: "hero", label: "Explore" },
  { id: "stats-section", label: "Overview" },
  { id: "program-section", label: "Programs" },
  { id: "solutions-section", label: "360 Solutions" },
  { id: "community", label: "Testimonials" },
  { id: "institutions", label: "Institutions" },
  { id: "partners", label: "Partners" },
  { id: "faqs-section", label: "FAQs" },
];

export default function ScrollIndicator() {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(Math.max((window.scrollY / totalHeight) * 100, 0), 100);
        setScrollProgress(progress);
      }
      setIsVisible(window.scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Section observer
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // SVG Circle stroke math
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  // Only render the landing-page scroll indicators on the main website, never in the portal.
  if (pathname !== "/") return null;

  return (
    <>
      {/* 1. Top Reading Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-slate-200/20 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#0055c3] via-indigo-600 to-cyan-400 shadow-sm transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. Side Section Dot Progress Indicator (Desktop View) */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-2.5 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200/80">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className="relative group flex items-center justify-center p-1 focus:outline-none"
              aria-label={`Scroll to ${sec.label}`}
            >
              {/* Floating Tooltip */}
              <span className="absolute right-8 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-md whitespace-nowrap">
                {sec.label}
              </span>
              {/* Indicator Dot */}
              <span
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? "w-3 h-3 bg-[#0055c3] ring-4 ring-blue-100 scale-110"
                    : "w-2 h-2 bg-slate-300 group-hover:bg-[#0055c3] group-hover:scale-125"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* 3. Circular SVG Progress Ring with Scroll to Top */}
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center">
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            title={`Scroll to top (${Math.round(scrollProgress)}%)`}
            className="relative p-3.5 bg-[#0055c3] hover:bg-[#1e6deb] text-white rounded-full shadow-2xl hover:shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer group"
          >
            {/* Circular SVG Gauge */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 p-0.5" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-white/20 fill-none"
                strokeWidth="3"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-white fill-none transition-all duration-150 ease-out"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <ArrowUp className="w-5 h-5 z-10 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}
    </>
  );
}

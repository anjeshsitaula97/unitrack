"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronRight, ChevronLeft, GraduationCap } from "lucide-react";
import { clearAuthCache } from "./AppLayoutWrapper";

const steps = [
  {
    target: "#nav-dashboard",
    title: "Dashboard",
    content: "Your command center. View KPIs, charts, and recent activity at a glance.",
  },
  {
    target: "#nav-universities",
    title: "Universities",
    content: "Manage university listings, add new partners, and track partnerships.",
  },
  {
    target: "#nav-courses",
    title: "Courses",
    content: "Browse and manage course offerings across all partner universities.",
  },
  {
    target: "#nav-students",
    title: "Students",
    content: "View and manage student profiles, applications, and payments.",
  },
  {
    target: "#nav-leads",
    title: "Leads",
    content: "Track incoming leads, assign counselors, and convert to students.",
  },
  {
    target: "#nav-applications",
    title: "Applications",
    content: "Review and process student applications from submission to visa.",
  },
];

interface GuidedTourProps {
  user?: { isFirstLogin?: boolean | null } | null;
}

export default function GuidedTour({ user }: GuidedTourProps) {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [prevActive, setPrevActive] = useState(active);
  const [tourCompleted, setTourCompleted] = useState(false);

  if (prevActive !== active) {
    setPrevActive(active);
    if (!active) {
      setTooltipPos(null);
    }
  }

  const complete = useCallback(async () => {
    setActive(false);
    setTourCompleted(true);
    try {
      await fetch("/api/auth/tour-completed", { method: "PATCH" });
      clearAuthCache();
    } catch {
      /* ignore */
    }
  }, []);

  const skip = useCallback(() => {
    complete();
  }, [complete]);

  useEffect(() => {
    if (user?.isFirstLogin === true && !tourCompleted) {
      const timer = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, [user, tourCompleted]);

  const updatePosition = useCallback(() => {
    const step = steps[currentStep];
    const el = document.querySelector(step.target);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let top = rect.top + rect.height / 2;
    let left = rect.right + 16;
    const tooltipW = 280;
    const tooltipH = 180;
    if (left + tooltipW > window.innerWidth - 16) {
      left = rect.left - tooltipW - 16;
    }
    const halfH = tooltipH / 2;
    if (top - halfH < 16) top = Math.max(16, top - halfH + 60);
    if (top + halfH > window.innerHeight - 16) top = Math.min(window.innerHeight - 16 - halfH, top);
    setTooltipPos({ top, left });
  }, [currentStep]);

  useEffect(() => {
    if (!active) return;
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector(steps[currentStep].target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        el.classList.add("ring-2", "ring-indigo-400", "ring-offset-2", "rounded-lg");
      }
      updatePosition();
    });
    return () => {
      cancelAnimationFrame(raf);
      const el = document.querySelector(steps[currentStep].target);
      if (el) el.classList.remove("ring-2", "ring-indigo-400", "ring-offset-2", "rounded-lg");
    };
  }, [active, currentStep, updatePosition]);

  useEffect(() => {
    if (!active) return;
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [active, updatePosition]);

  if (!active || !user?.isFirstLogin || tourCompleted) return null;

  const step = steps[currentStep];

  return (
    <>
      <div className="fixed inset-0 bg-black/10 z-[90]" onClick={skip} />

      <div
        ref={tooltipRef}
        className="fixed z-[100] w-[280px] animate-slide-up"
        style={
          tooltipPos
            ? { top: tooltipPos.top, left: tooltipPos.left, transform: "translateY(-50%)" }
            : { top: "50%", left: "50%", transform: "translate(-50%,-50%)" }
        }
      >
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 border-8 border-transparent border-r-white dark:border-r-slate-800" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <GraduationCap size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-white">Quick Tour</span>
            </div>
            <button
              type="button"
              onClick={skip}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mb-3">
            <div className="flex gap-1 mb-3">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i === currentStep ? "bg-indigo-500" : i < currentStep ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`}
                />
              ))}
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{step.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {step.content}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={skip}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              Skip
            </button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="btn-secondary !px-3 !py-1.5 !text-xs"
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="btn-primary !px-3 !py-1.5 !text-xs"
                >
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={complete}
                  className="btn-primary !px-3 !py-1.5 !text-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  Done!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

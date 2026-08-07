"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroY1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const heroY2 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroY3 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroY4 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    sections.forEach((section) => {
      section.classList.add("fade-in-section");
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  const scrollToStats = () => {
    document.getElementById("stats-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        body { font-family: 'Open Sans', sans-serif; }
        h1, h2, h3, h4 { font-family: 'Montserrat', sans-serif; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .fade-in-section {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-in-section.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <span
              className="text-[#0055c3] tracking-tight font-extrabold text-xl sm:text-2xl"
              style={{ fontFamily: "Montserrat" }}
            >
              UniBridgeWorld
            </span>
            <div className="hidden md:flex gap-6 items-center">
              <a
                href="#hero"
                className="font-bold text-[#0055c3] border-b-2 border-[#0055c3] pb-1 cursor-pointer"
              >
                Explore
              </a>
              <a
                href="#institutions"
                className="text-[#424654] hover:text-[#0055c3] transition-colors cursor-pointer"
              >
                Institutions
              </a>
              <a
                href="#community"
                className="text-[#424654] hover:text-[#0055c3] transition-colors cursor-pointer"
              >
                Community
              </a>
              <Link
                href="/partner-with-us"
                className="text-[#424654] hover:text-[#0055c3] transition-colors cursor-pointer"
              >
                Partner with Us
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="bg-[#0055c3] text-white px-5 sm:px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e6deb] transition-all active:scale-95 text-sm sm:text-base shadow-sm"
            >
              Login
            </Link>
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-[#0055c3] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-bold text-[#0055c3] bg-blue-50"
            >
              Explore
            </a>
            <a
              href="#institutions"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
            >
              Institutions
            </a>
            <a
              href="#community"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
            >
              Community
            </a>
            <Link
              href="/partner-with-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
            >
              Partner with Us
            </Link>
          </div>
        )}
      </nav>

      <main className="pt-20 sm:pt-24 overflow-x-hidden">
        {/* Hero Section */}
        <section
          id="hero"
          className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 pb-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full my-auto">
            <div className="lg:col-span-6 z-10 text-center lg:text-left">
              <span className="inline-block py-1.5 px-4 rounded-full bg-[#d9e2ff] text-[#00429b] font-bold text-xs uppercase tracking-widest mb-4 sm:mb-6 shadow-sm">
                Start Your Journey
              </span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#131b31] leading-[1.15] mb-4 sm:mb-6">
                Your Global Ambition <br className="hidden sm:inline" />
                <span className="text-[#0055c3] italic">Starts Here</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-[#434A63] mb-8 lg:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Unlock your potential at 1,500+ world-class institutions. Join the 1.5M+ students
                who secured their future with our industry-leading 95% visa success rate.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/login"
                  className="bg-[#1E6DEB] text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 text-center"
                >
                  Register as a Student
                </Link>
                <button
                  onClick={scrollToStats}
                  className="bg-white border-2 border-[#c2c6d7] text-[#0055c3] px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-[#ebedff] transition-all"
                >
                  Explore Programs
                </button>
              </div>
            </div>
            <div className="lg:col-span-6 relative w-full">
              <div className="relative w-full h-[280px] sm:h-[400px] md:h-[480px] lg:h-[540px] grid grid-cols-12 grid-rows-12 gap-2.5 sm:gap-4">
                <motion.div
                  style={{ y: heroY1 }}
                  className="relative col-span-8 row-span-7 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl group"
                >
                  <Image
                    fill
                    sizes="(max-width: 1024px) 60vw, 45vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    src="/assets/images/hero_students_1.png"
                    alt="Students laughing in university lobby"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/images/no_image.png";
                    }}
                  />
                </motion.div>
                <motion.div
                  style={{ y: heroY2 }}
                  className="relative col-span-4 row-span-5 col-start-9 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl"
                >
                  <Image
                    fill
                    sizes="(max-width: 1024px) 30vw, 25vw"
                    className="object-cover"
                    src="/assets/images/hero_campus_2.png"
                    alt="Student walking across European campus"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/images/no_image.png";
                    }}
                  />
                </motion.div>
                <motion.div
                  style={{ y: heroY3 }}
                  className="relative col-span-5 row-span-5 row-start-8 col-start-2 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl"
                >
                  <Image
                    fill
                    sizes="(max-width: 1024px) 40vw, 30vw"
                    className="object-cover"
                    src="/assets/images/hero_study_3.png"
                    alt="Student desk with laptop and travel brochures"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/images/no_image.png";
                    }}
                  />
                </motion.div>
                <motion.div
                  style={{ y: heroY4 }}
                  className="relative col-span-6 row-span-4 row-start-6 col-start-7 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-4 sm:border-8 border-white"
                >
                  <Image
                    fill
                    sizes="(max-width: 1024px) 50vw, 40vw"
                    className="object-cover"
                    src="/assets/images/hero_grad_4.png"
                    alt="Student holding acceptance letter"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/images/no_image.png";
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats-section" className="bg-[#F5F8FF] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#131b31] mb-4">
                The Fastest and Easiest Way to Success
              </h2>
              <div className="h-1.5 w-24 bg-[#0055c3] mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              {[
                { icon: "groups", stat: "1.5M+", label: "Students Helped" },
                { icon: "school", stat: "1,500+", label: "Institutions Globally" },
                { icon: "menu_book", stat: "150,000+", label: "Global Programs" },
                { icon: "public", stat: "180+", label: "Nationalities" },
                { icon: "verified", stat: "10+", label: "Years of Expertise" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center group bg-white p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#F5F8FF] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-[#0055c3] group-hover:text-white transition-all duration-300 text-[#0055c3]">
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">
                      {item.icon}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0055c3] mb-1">
                    {item.stat}
                  </h3>
                  <p className="text-[#434A63] text-xs sm:text-sm font-semibold">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature: Perfect Program */}
        <section
          id="program-section"
          className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-12">
                  <div className="relative bg-white p-2 rounded-3xl shadow-xl">
                    <Image
                      fill
                      sizes="(max-width: 1024px) 45vw, 25vw"
                      className="rounded-2xl object-cover"
                      src="/assets/images/hero_study_3.png"
                      alt="Student checking phone with acceptance"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/images/no_image.png";
                      }}
                    />
                  </div>
                  <div className="bg-[#1e6deb] p-4 sm:p-6 rounded-3xl text-white">
                    <h4 className="text-3xl sm:text-4xl font-extrabold mb-1 sm:mb-2">95%</h4>
                    <p className="text-xs sm:text-sm font-medium opacity-90 leading-tight">
                      Acceptance Rate for guided applications through our AI platform.
                    </p>
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <div className="relative bg-white p-2 rounded-3xl shadow-xl overflow-hidden aspect-[4/5]">
                    <Image
                      fill
                      sizes="(max-width: 1024px) 40vw, 25vw"
                      className="object-cover"
                      src="/assets/images/hero_students_1.png"
                      alt="Student in library"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/images/no_image.png";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-[#0055c3] font-bold uppercase tracking-widest text-xs sm:text-sm mb-3 block">
                International Students
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 sm:mb-6 text-[#131b31]">
                Find Your Perfect Study Program
              </h2>
              <p className="text-[#434A63] mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
                We&apos;ve spent a decade perfecting a faster, easier, quality-first international
                study application process. Now, the world is yours to explore in just a few clicks.
              </p>
              <ul className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
                <li className="flex gap-4 items-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#d9e2ff] flex-shrink-0 flex items-center justify-center text-[#0055c3]">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">layers</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#131b31] text-base sm:text-lg">
                      Easily apply to multiple programs
                    </h4>
                    <p className="text-xs sm:text-sm text-[#424654]">
                      One profile, unlimited possibilities across top global institutions.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#d9e2ff] flex-shrink-0 flex items-center justify-center text-[#0055c3]">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">
                      search_check
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#131b31] text-base sm:text-lg">
                      Quality checks and AI technology
                    </h4>
                    <p className="text-xs sm:text-sm text-[#424654]">
                      Our system pre-screens your documents to ensure 100% compliance.
                    </p>
                  </div>
                </li>
              </ul>
              <Link
                href="/login"
                className="inline-block bg-[#0055c3] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#1e6deb] transition-all text-center w-full sm:w-auto"
              >
                Create a Student Account
              </Link>
            </div>
          </div>
        </section>

        {/* 360 Solutions */}
        <section
          id="solutions-section"
          className="bg-[#282f47] text-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-1/3 h-full bg-[#0055c3] opacity-10 blur-3xl transform rotate-12 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12 sm:mb-16">
              <span className="text-[#d9e2ff] font-bold uppercase tracking-widest text-xs sm:text-sm mb-3 block">
                360 Solutions
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 sm:mb-6">
                The Only All-In-One Platform for Your Global Success
              </h2>
              <p className="max-w-2xl mx-auto text-[#ebedff] opacity-80 text-sm sm:text-base leading-relaxed">
                Don&apos;t just apply—arrive. From exclusive language test discounts to guaranteed
                GIC programs and pre-vetted housing, we handle the complexity so you can focus on
                your studies.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {[
                { icon: "payments", label: "Student Loans" },
                { icon: "language", label: "Language Tests" },
                { icon: "account_balance", label: "Banking" },
                { icon: "description", label: "Visa Services" },
                { icon: "apartment", label: "Housing" },
                { icon: "currency_exchange", label: "GIC Program" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/10 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-white/10 text-center hover:bg-white/20 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-3xl sm:text-4xl mb-3 sm:mb-4 text-[#d9e2ff]">
                    {item.icon}
                  </span>
                  <p className="font-bold text-xs sm:text-sm">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 sm:mt-16 flex justify-center">
              <button className="bg-[#0055c3] text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold shadow-lg hover:shadow-[#0055c3]/20 transition-all text-sm sm:text-base">
                Get Your 360 Plan
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="community" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-2 text-[#131b31]">
                What Our Students Say
              </h2>
              <p className="text-[#424654] text-sm sm:text-base">
                Hear from real international students about their success stories.
              </p>
            </div>
            <div className="flex gap-3 self-start sm:self-auto">
              <button className="p-2 rounded-full border border-[#c2c6d7] hover:bg-[#ebedff] transition-all">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="p-2 rounded-full border border-[#c2c6d7] hover:bg-[#ebedff] transition-all">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-[#e3e7ff] relative">
              <span className="material-symbols-outlined text-[#b0c6ff] text-5xl sm:text-6xl absolute top-6 right-6 sm:right-8 opacity-30">
                format_quote
              </span>
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-[#0055c3] italic">
                &quot;Like an answer from heaven&quot;
              </h3>
              <p className="text-[#424654] mb-6 sm:mb-8 text-base sm:text-lg italic leading-relaxed">
                &quot;I tried applying to institutions and it took months for me to get an answer.
                But then I stumbled upon UniBridgeWorld, and it was like an answer from heaven. The
                process was so smooth.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0055c3] overflow-hidden flex-shrink-0">
                  <Image
                    fill
                    sizes="48px"
                    className="object-cover"
                    src="/assets/images/hero_grad_4.png"
                    alt="Arabelle"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/images/no_image.png";
                    }}
                  />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base">Arabelle A.</p>
                  <p className="text-[10px] sm:text-xs text-[#424654] uppercase tracking-wider">
                    Business Administration Student
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-[#e3e7ff] relative">
              <span className="material-symbols-outlined text-[#b0c6ff] text-5xl sm:text-6xl absolute top-6 right-6 sm:right-8 opacity-30">
                format_quote
              </span>
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-[#0055c3] italic">
                &quot;All thanks to UniBridgeWorld&quot;
              </h3>
              <p className="text-[#424654] mb-6 sm:mb-8 text-base sm:text-lg italic leading-relaxed">
                &quot;I wanted to make my parents proud, and they are proud. And it was all thanks
                to UniBridgeWorld. They guided me through every visa step and loan application
                without any stress.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0055c3] overflow-hidden flex-shrink-0">
                  <Image
                    fill
                    sizes="48px"
                    className="object-cover"
                    src="/assets/images/hero_students_1.png"
                    alt="Krupali"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/images/no_image.png";
                    }}
                  />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base">Krupali P.</p>
                  <p className="text-[10px] sm:text-xs text-[#424654] uppercase tracking-wider">
                    Engineering Student
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted Partners */}
        <section id="institutions" className="bg-[#F5F8FF] py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-[#0055c3] font-bold uppercase tracking-widest text-xs sm:text-sm mb-3 block">
                Trusted Partners
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-6 text-[#131b31]">
                Trusted by 1,500+ Institutions Worldwide
              </h2>
              <div className="flex flex-wrap justify-center gap-2.5 sm:gap-4 mb-8 sm:mb-12">
                {["Canada", "United States", "United Kingdom", "Australia", "Ireland"].map(
                  (country, i) => (
                    <button
                      key={country}
                      className={`px-4 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                        i === 0
                          ? "bg-[#0055c3] text-white shadow-sm"
                          : "bg-white text-[#424654] border border-[#c2c6d7] hover:border-[#0055c3]"
                      }`}
                    >
                      {i === 0 && <span className="material-symbols-outlined text-sm">flag</span>}
                      {country}
                    </button>
                  )
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 sm:mb-12">
              {[
                {
                  name: "Western University",
                  location: "London, Ontario, CA",
                  badge: "Featured",
                  desc: "Since 1878, Western University has been a choice destination for minds seeking the best education at a research university in Canada.",
                  img: "/assets/images/hero_campus_2.png",
                },
                {
                  name: "Laurentian University",
                  location: "Sudbury, Ontario, CA",
                  badge: null,
                  desc: "Laurentian University is an international leader in niches such as stressed watershed systems and mining innovations.",
                  img: "/assets/images/hero_students_1.png",
                },
                {
                  name: "Lakehead University",
                  location: "Thunder Bay, Ontario, CA",
                  badge: "New Partner",
                  desc: "Small enough to offer the personalized approach to supports and education that allows students to thrive.",
                  img: "/assets/images/hero_study_3.png",
                },
              ].map((school) => (
                <div
                  key={school.name}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 sm:h-48">
                      <Image
                        fill
                        sizes="(max-width: 1024px) 90vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        src={school.img}
                        alt={school.name}
                        onError={(e) => {
                          e.currentTarget.src = "/assets/images/no_image.png";
                        }}
                      />
                      {school.badge && (
                        <span className="absolute top-4 left-4 bg-[#0055c3] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow">
                          {school.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-5 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold mb-1 text-[#131b31]">
                        {school.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#424654] mb-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>{" "}
                        {school.location}
                      </p>
                      <p className="text-xs sm:text-sm text-[#424654] leading-relaxed line-clamp-3 mb-4">
                        {school.desc}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                    <span className="inline-flex items-center gap-2 text-[#0055c3] font-bold text-sm hover:underline cursor-pointer">
                      View Details{" "}
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button className="bg-[#0055c3] text-white px-8 py-3.5 sm:py-4 rounded-xl font-bold hover:bg-[#1e6deb] transition-all text-sm sm:text-base">
                Explore More Canadian Institutions
              </button>
            </div>
          </div>
        </section>

        {/* Channel Partners */}
        <section id="partners" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#131b31]">
              How We Help Our Partners
            </h2>
            <div className="h-1 bg-[#0055c3] w-20 mx-auto mt-3 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="bg-[#f2f3ff] p-6 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden group">
              <div className="relative z-10">
                <span className="text-[#0055c3] font-bold uppercase tracking-widest text-xs mb-3 block">
                  For Institutions
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 text-[#131b31]">
                  Partner Institutions
                </h3>
                <ul className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
                  {[
                    {
                      icon: "public",
                      text: "Diversify your enrolment with students from 180+ nationalities",
                    },
                    {
                      icon: "trending_up",
                      text: "Receive higher quality applications and improve conversion by 10%",
                    },
                    { icon: "speed", text: "Save time and reduce manual processing by 40%" },
                  ].map((item) => (
                    <li key={item.icon} className="flex items-start gap-3 sm:gap-4">
                      <span className="material-symbols-outlined text-[#0055c3] p-2 bg-white rounded-lg flex-shrink-0 text-xl">
                        {item.icon}
                      </span>
                      <p className="text-[#424654] font-medium text-xs sm:text-sm">{item.text}</p>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/partner-with-us"
                  className="inline-block bg-[#0055c3] text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg transition-all text-sm sm:text-base w-full sm:w-auto text-center"
                >
                  Partner with Us
                </Link>
              </div>
              <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 sm:w-64 sm:h-64 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
                <span className="material-symbols-outlined text-[150px] sm:text-[200px] text-[#0055c3]">
                  school
                </span>
              </div>
            </div>
            <div className="bg-[#dadefa]/30 p-6 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden group">
              <div className="relative z-10">
                <span className="text-[#585d75] font-bold uppercase tracking-widest text-xs mb-3 block">
                  For Agents
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 text-[#131b31]">
                  Recruitment Partners
                </h3>
                <ul className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
                  {[
                    {
                      icon: "inventory_2",
                      text: "Access 150,000+ programs at 1,500+ academic institutions",
                    },
                    {
                      icon: "auto_awesome",
                      text: "Use AI tools to benefit from a 95% application success rate",
                    },
                    {
                      icon: "support_agent",
                      text: "Extra built-in services, from language tests to student loans",
                    },
                  ].map((item) => (
                    <li key={item.icon} className="flex items-start gap-3 sm:gap-4">
                      <span className="material-symbols-outlined text-[#585d75] p-2 bg-white rounded-lg flex-shrink-0 text-xl">
                        {item.icon}
                      </span>
                      <p className="text-[#424654] font-medium text-xs sm:text-sm">{item.text}</p>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/join-our-network"
                  className="inline-block bg-[#585d75] text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg transition-all text-sm sm:text-base w-full sm:w-auto text-center"
                >
                  Join Our Network
                </Link>
              </div>
              <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 sm:w-64 sm:h-64 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
                <span className="material-symbols-outlined text-[150px] sm:text-[200px] text-[#585d75]">
                  handshake
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12 sm:mb-20">
          <div className="bg-[#0055c3] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 md:p-16 lg:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(30,109,235,0.4),transparent,transparent)] pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6 leading-tight">
                Ready to Start Your Student Journey?
              </h2>
              <p className="text-white/90 text-sm sm:text-lg lg:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
                Pick your programs. Apply all at once. Built-in quality checks give you a ~95%
                chance of application success.
              </p>
              <Link
                href="/login"
                className="inline-block bg-white text-[#0055c3] px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-extrabold text-base sm:text-xl shadow-2xl hover:bg-[#f2f3ff] transition-all active:scale-95 text-center"
              >
                Start Your Journey Now
              </Link>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section
          id="faqs-section"
          className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto"
        >
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-[#0055c3] font-bold uppercase tracking-widest text-xs sm:text-sm mb-3 block">
              FAQs
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#131b31]">
              Got Questions? We Have Answers
            </h2>
          </div>
          <div className="space-y-4">
            <details
              className="group bg-white rounded-2xl border border-[#e3e7ff] overflow-hidden shadow-sm"
              open
            >
              <summary className="flex justify-between items-center p-5 sm:p-6 cursor-pointer list-none font-bold text-base sm:text-lg text-[#131b31]">
                How can I find my dream program?
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-[#0055c3]">
                  expand_more
                </span>
              </summary>
              <div className="p-5 sm:p-6 pt-0 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-[#e3e7ff]/60">
                It couldn&apos;t be easier! Register for a free UniBridgeWorld account, then take a
                few short minutes to tell us about your educational goals. Our platform will suggest
                study programs just for your needs.
              </div>
            </details>
            <details className="group bg-white rounded-2xl border border-[#e3e7ff] overflow-hidden shadow-sm">
              <summary className="flex justify-between items-center p-5 sm:p-6 cursor-pointer list-none font-bold text-base sm:text-lg text-[#131b31]">
                How do I apply once I&apos;ve found the right program?
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-[#0055c3]">
                  expand_more
                </span>
              </summary>
              <div className="p-5 sm:p-6 pt-0 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-[#e3e7ff]/60">
                With the click of a button! Our platform guides you through the whole process, from
                document collection to submission. We even help connect you with visa support.
              </div>
            </details>
            <details className="group bg-white rounded-2xl border border-[#e3e7ff] overflow-hidden shadow-sm">
              <summary className="flex justify-between items-center p-5 sm:p-6 cursor-pointer list-none font-bold text-base sm:text-lg text-[#131b31]">
                Why should I use UniBridgeWorld?
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-[#0055c3]">
                  expand_more
                </span>
              </summary>
              <div className="p-5 sm:p-6 pt-0 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-[#e3e7ff]/60">
                We have helped over 1.5M+ students and maintain a 95% acceptance rate. Applying
                directly can be confusing; we make sure every detail is perfect.
              </div>
            </details>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#282f47] text-white pt-12 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 mb-12 sm:mb-16">
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <span
                className="text-[#b0c6ff] tracking-tight font-extrabold text-xl sm:text-2xl mb-4 sm:mb-6 block"
                style={{ fontFamily: "Montserrat" }}
              >
                UniBridgeWorld
              </span>
              <p className="text-xs sm:text-sm text-[#ebedff] opacity-70 mb-6 leading-relaxed">
                101 Frederick St,
                <br />
                Kitchener, ON
                <br />
                N2H 6R2
              </p>
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0055c3] transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-sm">share</span>
                </span>
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0055c3] transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-sm">chat</span>
                </span>
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0055c3] transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-sm">videocam</span>
                </span>
              </div>
            </div>
            {[
              { title: "Explore", links: ["Study Abroad", "Destinations", "About", "Careers"] },
              {
                title: "Destinations",
                links: ["Canada", "United States", "United Kingdom", "Australia"],
              },
              { title: "Resources", links: ["Blog", "Support", "Insights", "Trends Report"] },
              { title: "Partners", links: ["Institutions", "Recruiters"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-sm sm:text-base mb-4 sm:mb-6 text-white">
                  {col.title}
                </h4>
                <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-[#ebedff] opacity-70">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="hover:text-white transition-colors cursor-pointer">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#ebedff] opacity-50 text-center md:text-left">
            <p>&copy; 2024 UniBridgeWorld. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <span className="hover:text-white transition-colors cursor-pointer">
                Privacy Policy
              </span>
              <span className="hover:text-white transition-colors cursor-pointer">
                Terms of Service
              </span>
              <span className="hover:text-white transition-colors cursor-pointer">Legal</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

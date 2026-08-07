"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToView() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button if window is scrolled down or any container is scrolled
      const scrolled = window.scrollY > 200;
      setIsVisible(scrolled);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Also reset scroll for internal scrollable elements if present
    const scrollableElements = document.querySelectorAll("main, nav, div");
    scrollableElements.forEach((el) => {
      if (el.scrollTop > 0) {
        el.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Scroll to top"
      className="fixed bottom-6 right-6 z-[9999] p-3.5 bg-[#0055c3] hover:bg-[#1e6deb] text-white rounded-full shadow-2xl hover:shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center ring-4 ring-white/30 cursor-pointer"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

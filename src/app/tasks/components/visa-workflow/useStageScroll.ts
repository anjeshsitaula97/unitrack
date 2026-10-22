"use client";

import { useState, useCallback, useRef } from "react";

export function useStageScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scrollBy = useCallback(
    (direction: "left" | "right") => {
      const el = scrollRef.current;
      if (!el) return;
      const amount = el.clientWidth * 0.7;
      el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
      setTimeout(updateScrollButtons, 350);
    },
    [updateScrollButtons]
  );

  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    updateScrollButtons,
    scrollBy,
  };
}

"use client";

import { useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";

export function BackToTop() {
  const { scrollY } = useScroll();
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    const next = value > innerHeight * 0.9;
    if (next !== visible) setVisible(next);
  });

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" })}
      className="back-to-top"
      aria-label="Zpět nahoru"
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      data-visible={visible}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}

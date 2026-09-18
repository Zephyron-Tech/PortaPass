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
      onClick={(event) => {
        // A real click can leave the button focused in some browsers; the
        // scroll this triggers is what makes `visible` (and so
        // aria-hidden) go false a moment later, which would otherwise
        // hide a still-focused element from assistive tech. Blur it
        // up front rather than reaching for `inert` — toggling `inert`
        // on a focused element mid-animation was found to abort
        // window.scrollTo's smooth-scroll outright in Chromium.
        event.currentTarget.blur();
        window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
      }}
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

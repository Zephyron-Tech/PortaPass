"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Keep native scrolling and the CSS timeline; soften wheel steps on the card only. */
export function HeroCardMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = ref.current;
    if (!card || !CSS.supports("animation-timeline", "view()")) return;
    const enabled = matchMedia("(min-width: 64rem) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let source: Animation | undefined;
    let smoothing: Animation | undefined;
    let displayed = 0;
    let previousTime = 0;
    let lastWheel = 0;

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      smoothing?.cancel();
      smoothing = undefined;
      source = undefined;
    }

    function tick(now: number) {
      const target = source?.effect?.getComputedTiming().progress;
      if (!enabled.matches || document.hidden || target == null || !smoothing) {
        reset();
        return;
      }
      // Time-based damping behaves identically on 60Hz and 120Hz displays.
      // Unlike easing the scroll timeline, this bridges discrete wheel events.
      const elapsed = Math.min(now - previousTime, 64);
      previousTime = now;
      displayed += (target - displayed) * (1 - Math.exp(-elapsed / 90));
      smoothing.currentTime = displayed * 1000;
      if (now - lastWheel > 120 && Math.abs(target - displayed) < 0.0001) {
        reset();
        return;
      }
      frame = requestAnimationFrame(tick);
    }

    function wheel(event: WheelEvent) {
      if (!enabled.matches || event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const bounds = card!.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > innerHeight) return;
      lastWheel = performance.now();
      if (smoothing) return;
      source = card!.getAnimations().find((animation) =>
        animation instanceof CSSAnimation && animation.animationName === "key-card-turn",
      );
      const progress = source?.effect?.getComputedTiming().progress;
      if (progress == null) return;
      displayed = progress;
      // A paused document-timeline overlay leaves the CSS source advancing.
      // Canceling it restores native touch/keyboard and no-JS behavior.
      smoothing = card!.animate([
        { transform: "rotate3d(0.08, 1, -0.04, 0deg)" },
        { transform: "rotate3d(0.08, 1, -0.04, 360deg)" },
      ], { duration: 1000, fill: "both", easing: "linear" });
      smoothing.pause();
      smoothing.currentTime = displayed * 1000;
      previousTime = lastWheel;
      frame = requestAnimationFrame(tick);
    }

    window.addEventListener("wheel", wheel, { passive: true });
    window.addEventListener("keydown", reset);
    window.addEventListener("pointerdown", reset);
    window.addEventListener("touchstart", reset, { passive: true });
    window.addEventListener("resize", reset);
    document.addEventListener("visibilitychange", reset);
    enabled.addEventListener("change", reset);
    return () => {
      reset();
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("pointerdown", reset);
      window.removeEventListener("touchstart", reset);
      window.removeEventListener("resize", reset);
      document.removeEventListener("visibilitychange", reset);
      enabled.removeEventListener("change", reset);
    };
  }, []);

  return <div ref={ref} className="hero-card">{children}</div>;
}

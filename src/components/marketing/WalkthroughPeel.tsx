"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { BankIdLogo } from "@/components/bankid/BankIdLogo";
import { Cta } from "@/components/marketing/Cta";
import { DeviceShot } from "@/components/marketing/DeviceShot";

export type WalkthroughStep = {
  title: string;
  body: string;
  alt: string;
  src?: string;
  bankId?: boolean;
};

const stackQuery = "(min-width: 64rem) and (min-height: 44rem) and (prefers-reduced-motion: no-preference)";

function subscribeToStack(notify: () => void) {
  const media = window.matchMedia(stackQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}

const getStackSnapshot = () => window.matchMedia(stackQuery).matches;
const getServerSnapshot = () => false;

// Tablet (48rem-64rem) keeps the vertical stack; only genuine phone widths
// get the horizontal swipe carousel (see the matching CSS breakpoint).
const carouselQuery = "(max-width: 47.9375rem)";

function subscribeToCarousel(notify: () => void) {
  const media = window.matchMedia(carouselQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}

const getCarouselSnapshot = () => window.matchMedia(carouselQuery).matches;

function segment(value: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}

function WalkthroughCard({
  step,
  index,
  progress,
  active,
  current,
  onImageLoad,
}: {
  step: WalkthroughStep;
  index: number;
  progress: MotionValue<number>;
  active: boolean;
  current: number;
  onImageLoad: (index: number) => void;
}) {
  // Surfaces can overlap; readable content never crossfades through another step.
  const lift = useTransform(() => index === 0 ? segment(progress.get(), 0.16, 0.32) : segment(progress.get(), 0.58, 0.76));
  const promoted = useTransform(() => segment(progress.get(), 0.16, 0.32) + segment(progress.get(), 0.58, 0.76));
  const depth = useTransform(promoted, (value) => Math.max(0, index - value));
  const y = useTransform(() => `calc(${index < 2 ? -125 * lift.get() : 0}% + ${depth.get() * 14}px)`);
  const scale = useTransform(() => 1 - depth.get() * 0.035 - (index < 2 ? lift.get() * 0.035 : 0));
  const rotateX = useTransform(() => index < 2 ? lift.get() * 9 : 0);
  const rotateZ = useTransform(() => index < 2 ? lift.get() * -2 : 0);
  const surfaceOpacity = useTransform(lift, [0, 0.88, 1], [1, 1, 0]);
  const contentOpacity = useTransform(() => {
    const value = progress.get();
    if (index === 0) return 1 - segment(value, 0.16, 0.24);
    if (index === 1) return segment(value, 0.26, 0.34) * (1 - segment(value, 0.58, 0.66));
    return segment(value, 0.68, 0.78);
  });

  return (
    <motion.article
      className="walkthrough-peel-card"
      aria-hidden={active && current !== index ? true : undefined}
      inert={active && current !== index}
      style={active
        ? { y, scale, rotateX, rotateZ, opacity: index < 2 ? surfaceOpacity : 1, zIndex: 3 - index }
        : { y: 0, scale: 1, rotateX: 0, rotateZ: 0, opacity: 1 }}
    >
      <motion.div className="walkthrough-peel-content" style={{ opacity: active ? contentOpacity : 1 }}>
      <div className="walkthrough-copy">
        <span aria-hidden="true" className="font-serif text-[2.5rem] leading-none tabular-nums text-ink-3">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="mt-4 font-serif text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.15] tracking-[-0.015em] text-ink">
          {step.title}
        </h3>
        <p className="mt-4 max-w-[46ch] text-[17px] leading-[1.65] text-pretty text-ink-2">{step.body}</p>
        {step.bankId ? (
          <div className="mt-6 hidden md:block">
            <span className="inline-block bg-white px-5 py-4 ring-1 ring-hairline"><BankIdLogo width={108} title="Bank iD" /></span>
          </div>
        ) : null}
        {index === 2 ? <div className="mt-7 hidden md:block"><Cta href="/demo" transitionTypes={["nav-forward"]}>Vyzkoušet demo</Cta></div> : null}
      </div>
      <div className="walkthrough-device"><DeviceShot src={step.src} alt={step.alt} reveal={false} loading="eager" onLoad={() => onImageLoad(index)} sizes="(min-width: 1024px) 288px, (min-width: 768px) 272px, 208px" /></div>
      {index === 2 ? <div className="mt-6 flex justify-center md:hidden"><Cta href="/demo" transitionTypes={["nav-forward"]}>Vyzkoušet demo</Cta></div> : null}
      </motion.div>
    </motion.article>
  );
}

export function WalkthroughPeel({ steps }: { steps: WalkthroughStep[] }) {
  const target = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const active = useSyncExternalStore(subscribeToStack, getStackSnapshot, getServerSnapshot);
  const isCarousel = useSyncExternalStore(subscribeToCarousel, getCarouselSnapshot, getServerSnapshot);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const [current, setCurrent] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  const ready = loaded.size === steps.length;
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = value < 0.26 ? 0 : value < 0.68 ? 1 : 2;
    if (next !== current) setCurrent(next);
  });

  function markImageLoaded(index: number) {
    setLoaded((previous) => previous.has(index) ? previous : new Set(previous).add(index));
  }

  useEffect(() => {
    const element = target.current;
    if (!active || !element) return;
    const section = element;
    let animation: ReturnType<typeof animate> | undefined;
    let lastWheel = -Infinity;
    let intent = 0;
    let entryGesture = false;
    let previousDelta = 0;
    let decelerated = false;

    function cancel() {
      animation?.stop();
      animation = undefined;
      intent = 0;
      entryGesture = false;
    }

    function settle(destination: number, arrival = false) {
      intent = 0;
      const from = window.scrollY;
      // Cosine easing peaks at PI/2 times its average speed. Include that
      // factor so even a tall viewport cannot exceed 650 CSS pixels/second.
      const duration = arrival
        ? Math.min(0.45, Math.max(0.18, Math.abs(destination - from) / 1600))
        : Math.max(1.15, Math.abs(destination - from) * Math.PI / (2 * 650));
      animation = animate(from, destination, {
        duration,
        ease: (t) => (1 - Math.cos(Math.PI * t)) / 2,
        onUpdate: (top) => window.scrollTo({ top, behavior: "instant" }),
        onComplete: () => {
          animation = undefined;
          intent = 0;
        },
      });
    }

    function advance(event: WheelEvent) {
      // Preserve zoom, horizontal gestures, and scrollable/editor controls.
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      if (event.target instanceof HTMLElement) {
        if (event.target.closest("input, textarea, select, [contenteditable=true]")) return;
        for (let node: HTMLElement | null = event.target; node && node !== document.body; node = node.parentElement) {
          if (/(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight) return;
        }
      }
      const now = performance.now();
      const gap = now - lastWheel;
      const freshGesture = now - lastWheel > 320;
      lastWheel = now;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (event.deltaY <= 0) {
        cancel();
        return;
      }
      const renewedImpulse = decelerated && delta >= 24 && delta > previousDelta * 1.8;
      if (delta < previousDelta * 0.8) decelerated = true;
      previousDelta = delta;
      if (animation) {
        event.preventDefault();
        return;
      }
      // Only entry consumes the arriving gesture. A short pause or a new
      // acceleration after a decaying tail re-arms it without a long lockout.
      if (entryGesture) {
        if (gap < 180 && !renewedImpulse) {
          event.preventDefault();
          return;
        }
        entryGesture = false;
        intent = 0;
        decelerated = false;
      }
      if (freshGesture) intent = 0;
      const rect = section.getBoundingClientRect();
      const start = rect.top + scrollY;
      // Catch the gesture before it crosses the stage, rather than rewinding
      // after the first card has already peeled away.
      if (rect.top > 1 && rect.top <= delta + 16) {
        event.preventDefault();
        entryGesture = true;
        decelerated = false;
        settle(start, true);
        return;
      }
      if (rect.top > 1 || rect.bottom < innerHeight) { intent = 0; return; }
      const progress = -rect.top / (section.clientHeight - innerHeight);
      const destination = progress < 0.339 ? 0.34 : progress < 0.779 ? 0.78 : null;
      if (destination === null) return;

      intent += delta;
      // Do not let a single large wheel packet skip an entire transition.
      if (intent < 180) return;
      event.preventDefault();
      // The hold intervals are visually identical. Skip their remaining
      // distance so confirmed input immediately produces visible movement.
      const peelStart = destination === 0.34 ? 0.16 : 0.58;
      const distance = section.clientHeight - innerHeight;
      if (progress < peelStart) window.scrollTo({ top: start + distance * peelStart, behavior: "instant" });
      settle(start + distance * destination);
    }

    window.addEventListener("wheel", advance, { passive: false });
    window.addEventListener("pointerdown", cancel);
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", cancel);
    window.addEventListener("resize", cancel);
    return () => {
      cancel();
      window.removeEventListener("wheel", advance);
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
      window.removeEventListener("resize", cancel);
    };
  }, [active, scrollYProgress]);

  // Phone only: track which slide is currently snapped into view, purely to
  // drive the dot indicator and each slide's dimmed/focused state. Separate
  // from the desktop peel's scroll-jack machinery above, which never runs
  // here since isCarousel and active are mutually exclusive by breakpoint.
  useEffect(() => {
    const element = scene.current;
    if (!isCarousel || !element) return;
    const slides = Array.from(element.children) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = slides.indexOf(visible.target as HTMLElement);
        if (index === -1) return;
        setCarouselIndex(index);
        for (const slide of slides) slide.dataset.active = String(slide === visible.target);
      },
      { root: element, threshold: 0.6 },
    );
    for (const slide of slides) observer.observe(slide);
    slides[0].dataset.active = "true";
    return () => observer.disconnect();
  }, [isCarousel, steps.length]);

  return (
    <div ref={target} className="walkthrough-peel" data-enhanced={active} data-loading={!ready} data-ready={ready}>
      <div className="walkthrough-peel-sticky">
        <div className="walkthrough-peel-skeleton" aria-hidden="true">
          <div className="walkthrough-peel-skeleton-copy">
            <span /><span /><span /><span />
          </div>
          <div className="walkthrough-peel-skeleton-device" />
        </div>
        <div ref={scene} className="walkthrough-peel-scene">
          {steps.map((step, index) => <WalkthroughCard key={step.title} step={step} index={index} progress={scrollYProgress} active={active} current={current} onImageLoad={markImageLoaded} />)}
        </div>
        <div className="walkthrough-carousel-dots" aria-hidden="true">
          {steps.map((step, index) => <span key={step.title} data-current={carouselIndex === index} />)}
        </div>
        {active ? (
          <div className="walkthrough-peel-position" aria-hidden="true">
            <span>0{current + 1} / 03</span>
            <div className="walkthrough-peel-track">
              {steps.map((step, index) => <span key={step.title} data-current={current === index} />)}
            </div>
            <span>Posunutím pokračujete</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
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

// Tablet (48rem-64rem) keeps the vertical stack; phone and desktop both get
// the horizontal carousel (phone via swipe, desktop via arrows/dots).
const carouselQuery = "(max-width: 47.9375rem), (min-width: 64rem)";

function subscribeToCarousel(notify: () => void) {
  const media = window.matchMedia(carouselQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}

const getCarouselSnapshot = () => window.matchMedia(carouselQuery).matches;
const getServerSnapshot = () => false;

function WalkthroughCard({ step, index }: { step: WalkthroughStep; index: number }) {
  return (
    <article className="walkthrough-peel-card">
      <div className="walkthrough-peel-content">
        <div className="walkthrough-copy">
          <div className="flex items-baseline gap-3 md:block">
            <span aria-hidden="true" className="font-serif text-[2.5rem] leading-none tabular-nums text-ink-3">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-serif text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.15] tracking-[-0.015em] text-ink md:mt-4">
              {step.title}
            </h3>
          </div>
          <p className="mt-4 max-w-[46ch] text-[17px] leading-[1.65] text-pretty text-ink-2">{step.body}</p>
          {step.bankId ? (
            <div className="mt-6 hidden md:block">
              <span className="inline-block bg-white px-5 py-4 ring-1 ring-hairline"><BankIdLogo width={108} title="Bank iD" /></span>
            </div>
          ) : null}
          {index === 2 ? <div className="mt-7 hidden md:block"><Cta href="/demo" transitionTypes={["nav-forward"]}>Vyzkoušet demo</Cta></div> : null}
        </div>
        <div className="walkthrough-device"><DeviceShot src={step.src} alt={step.alt} reveal={false} loading="eager" sizes="(min-width: 1024px) 288px, (min-width: 768px) 272px, 208px" /></div>
      </div>
    </article>
  );
}

export function WalkthroughPeel({ steps }: { steps: WalkthroughStep[] }) {
  const scene = useRef<HTMLDivElement>(null);
  const isCarousel = useSyncExternalStore(subscribeToCarousel, getCarouselSnapshot, getServerSnapshot);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselIndexRef = useRef(0);

  const goTo = useCallback((index: number) => {
    const element = scene.current;
    if (!element) return;
    const clamped = Math.max(0, Math.min(steps.length - 1, index));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollTo({ left: clamped * element.clientWidth, behavior: reduced ? "instant" : "smooth" });
  }, [steps.length]);

  // Track which slide is currently snapped into view, to drive the dot
  // indicator, the arrow disabled state, and each slide's dimmed state.
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
        carouselIndexRef.current = index;
        for (const slide of slides) slide.dataset.active = String(slide === visible.target);
      },
      { root: element, threshold: 0.6 },
    );
    for (const slide of slides) observer.observe(slide);
    slides[0].dataset.active = "true";
    return () => observer.disconnect();
  }, [isCarousel, steps.length]);

  // Desktop: the scene doesn't natively scroll (overflow-x: hidden, see CSS
  // comment) so a page-scroll wheel gesture never gets misread as sideways
  // carousel movement. A genuine horizontal trackpad/wheel gesture (deltaX
  // dominant) is still a valid second way to step next/prev, alongside the
  // arrows — one step per gesture. A single trackpad swipe fires dozens of
  // small wheel events, so steps only trigger once accumulated horizontal
  // movement clears a threshold, then the accumulator locks until the
  // gesture pauses (or reverses) — this is what makes it move exactly one
  // slide per swipe instead of racing through several.
  useEffect(() => {
    const element = scene.current;
    if (!isCarousel || !element || !matchMedia("(min-width: 64rem)").matches) return;
    const threshold = 60;
    const gestureGapMs = 150;
    let accumulated = 0;
    let lastEventTime = 0;
    let locked = false;
    function onWheel(event: WheelEvent) {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastEventTime > gestureGapMs) {
        accumulated = 0;
        locked = false;
      }
      lastEventTime = now;
      if (locked) return;
      accumulated += event.deltaX;
      if (Math.abs(accumulated) < threshold) return;
      locked = true;
      goTo(carouselIndexRef.current + (accumulated > 0 ? 1 : -1));
    }
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [isCarousel, goTo]);

  return (
    <div className="walkthrough-peel">
      <div className="walkthrough-peel-sticky">
        <div className="walkthrough-peel-nav">
          <button type="button" className="walkthrough-peel-arrow" aria-label="Předchozí krok" disabled={carouselIndex === 0} onClick={() => goTo(carouselIndex - 1)}>
            <span aria-hidden="true">‹</span>
          </button>
          <div ref={scene} className="walkthrough-peel-scene">
            {steps.map((step, index) => <WalkthroughCard key={step.title} step={step} index={index} />)}
          </div>
          <button type="button" className="walkthrough-peel-arrow" aria-label="Další krok" disabled={carouselIndex === steps.length - 1} onClick={() => goTo(carouselIndex + 1)}>
            <span aria-hidden="true">›</span>
          </button>
        </div>
        <div className="walkthrough-carousel-dots">
          {steps.map((step, index) => (
            <button key={step.title} type="button" aria-label={`Krok ${index + 1}`} data-current={carouselIndex === index} onClick={() => goTo(index)} />
          ))}
        </div>
        <div className="mt-6 flex justify-center md:hidden">
          <Cta href="/demo" transitionTypes={["nav-forward"]}>Vyzkoušet demo</Cta>
        </div>
      </div>
    </div>
  );
}

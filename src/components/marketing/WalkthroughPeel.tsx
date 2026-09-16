"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
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

function segment(value: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}

function WalkthroughCard({
  step,
  index,
  progress,
  active,
  current,
}: {
  step: WalkthroughStep;
  index: number;
  progress: MotionValue<number>;
  active: boolean;
  current: number;
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
          <div className="mt-6">
            <span className="inline-block bg-white px-5 py-4 ring-1 ring-hairline"><BankIdLogo width={108} title="Bank iD" /></span>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-3">Ověření v&nbsp;testovacím prostředí Bank iD.</p>
          </div>
        ) : null}
        {index === 2 ? <div className="mt-7"><Cta href="/demo" transitionTypes={["nav-forward"]}>Vyzkoušet demo</Cta></div> : null}
      </div>
      <div className="walkthrough-device"><DeviceShot src={step.src} alt={step.alt} reveal={false} sizes="(min-width: 1024px) 288px, (min-width: 768px) 272px, 208px" /></div>
      </motion.div>
    </motion.article>
  );
}

export function WalkthroughPeel({ steps }: { steps: WalkthroughStep[] }) {
  const target = useRef<HTMLDivElement>(null);
  const active = useSyncExternalStore(subscribeToStack, getStackSnapshot, getServerSnapshot);
  const [current, setCurrent] = useState(0);
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = value < 0.26 ? 0 : value < 0.68 ? 1 : 2;
    if (next !== current) setCurrent(next);
  });

  return (
    <div ref={target} className="walkthrough-peel" data-enhanced={active}>
      <div className="walkthrough-peel-sticky">
        <div className="walkthrough-peel-scene">
          {steps.map((step, index) => <WalkthroughCard key={step.title} step={step} index={index} progress={scrollYProgress} active={active} current={current} />)}
        </div>
        {active ? (
          <div className="walkthrough-peel-position" aria-hidden="true">
            <span>0{current + 1} / 03</span>
            <div className="walkthrough-peel-track">
              {steps.map((step, index) => <span key={step.title} data-current={current === index} />)}
            </div>
            <span>Pokračujte posunutím</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { IdentificationCard, DeviceMobileCamera, LockKeyOpen, ArrowRight } from "@phosphor-icons/react";
import { AppHeader } from "@/components/AppHeader";

const steps = [
  { icon: IdentificationCard, label: "Ověření totožnosti" },
  { icon: DeviceMobileCamera, label: "Digitální klíč do peněženky" },
  { icon: LockKeyOpen, label: "Odemknutí pokoje telefonem" },
];

export default function Home() {
  return (
    <main
      className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-1 flex-col justify-start gap-8 px-5 py-10"
      style={{
        paddingTop: "max(4rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <AppHeader title="Digitální klíč od pokoje" />

      <p className="-mt-4 text-base leading-relaxed text-neutral-500">
        Ukázka odkazu, který host dostane e-mailem nebo SMS ještě před
        příjezdem do hotelu.
      </p>

      <div className="flex flex-col gap-1 rounded-3xl border border-white/60 bg-white/50 p-2 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_16px_40px_-20px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        {steps.map(({ icon: Icon, label }, i) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-neutral-600"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-amber-700 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <Icon size={18} weight="duotone" />
            </span>
            {label}
            {i < steps.length - 1 && (
              <span className="ml-auto text-neutral-300">
                <ArrowRight size={14} weight="bold" />
              </span>
            )}
          </div>
        ))}
      </div>

      <Link
        href="/checkin/room-101?token=abc"
        className="flex items-center justify-center rounded-2xl bg-neutral-900 py-4 text-center text-base font-medium text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] transition active:scale-[0.98] active:bg-neutral-800"
      >
        Otevřít ukázkový check-in
      </Link>
    </main>
  );
}

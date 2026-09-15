"use client";

import { useState } from "react";
import { PageHeading } from "@/components/AppHeader";
import { AppleWalletButton } from "@/components/AppleWalletButton";
import { KeyCard } from "@/components/KeyCard";
import { Screen } from "@/components/Screen";
import type { MockBooking } from "@/lib/mockData";

type Step = "intro" | "verifying" | "verified" | "error";

const stepIndex: Record<Step, number> = {
  intro: 0,
  verifying: 1,
  verified: 2,
  error: 0,
};

function Progress({ step }: { step: Step }) {
  const current = stepIndex[step];
  return (
    <div className="flex gap-1.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${
            i <= current ? "bg-neutral-900" : "bg-neutral-900/12"
          }`}
        />
      ))}
    </div>
  );
}

export default function CheckinFlow({ roomId, token }: { roomId: string; token: string }) {
  const [step, setStep] = useState<Step>("intro");
  const [booking, setBooking] = useState<MockBooking | null>(null);

  async function handleVerify() {
    setStep("verifying");
    try {
      // Simulace odezvy BankID.
      await new Promise((r) => setTimeout(r, 1800));

      const res = await fetch("/api/checkin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, token }),
      });

      if (!res.ok) throw new Error("verification failed");
      const data = await res.json();
      setBooking(data.booking);
      setStep("verified");
    } catch {
      setStep("error");
    }
  }

  return (
    <Screen>
      <PageHeading
        title={step === "verified" ? "Klíč je připraven" : "Online check-in"}
        subtitle={
          step === "verified"
            ? undefined
            : "Ověřte svou totožnost a dokončete check-in. Klíč od pokoje pak uložíte přímo do peněženky v telefonu."
        }
      />

      <div className="animate-rise-in mt-10" style={{ animationDelay: "80ms" }}>
        <Progress step={step} />
      </div>

      <div className="mt-8">
        {step === "intro" && (
          <div key="intro" className="animate-step-in">
            <button
              onClick={handleVerify}
              className="flex h-[54px] w-full select-none items-center justify-center rounded-2xl bg-neutral-900 text-[16px] font-medium text-white transition duration-150 ease-out active:scale-[0.975] active:bg-neutral-800"
            >
              Ověřit přes BankID
            </button>
            <p className="mt-4 text-center text-[13px] text-neutral-400">
              Bezpečné ověření totožnosti bankovní identitou
            </p>
          </div>
        )}

        {step === "verifying" && (
          <div key="verifying" className="animate-step-in flex items-center gap-3 py-2">
            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-[1.5px] border-neutral-300 border-t-neutral-900" />
            <p className="text-[15px] text-neutral-500">Ověřujeme vaši totožnost…</p>
          </div>
        )}

        {step === "error" && (
          <div
            key="error"
            className="animate-step-in rounded-2xl border border-red-900/10 bg-red-50/60 px-5 py-4"
          >
            <p className="text-[15px] leading-relaxed text-red-900/80">
              Rezervaci se nepodařilo najít. Zkontrolujte odkaz nebo kontaktujte
              recepci hotelu.
            </p>
          </div>
        )}

        {step === "verified" && booking && (
          <div key="verified" className="animate-step-in">
            <KeyCard booking={booking} />
            <div className="mt-7">
              <AppleWalletButton
                href={`/api/pass?roomId=${encodeURIComponent(roomId)}&token=${encodeURIComponent(token)}`}
              />
              <p className="mt-4 text-center text-[13px] text-neutral-400">
                Klíč se uloží do Apple Wallet a zůstane dostupný i offline.
              </p>
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}

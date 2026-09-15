"use client";

import { useState } from "react";
import { PageHeading } from "@/components/AppHeader";
import { AppleWalletButton } from "@/components/AppleWalletButton";
import { BankIdButton } from "@/components/bankid/BankIdButton";
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

const failureMessages: Record<string, string> = {
  declined: "Ověření bylo v bance zrušeno. Zkuste to prosím znovu.",
  booking: "K tomuto odkazu se nepodařilo najít rezervaci.",
  state: "Ověření vypršelo. Začněte prosím znovu.",
  session: "Ověření vypršelo. Začněte prosím znovu.",
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

export default function CheckinFlow({
  roomId,
  token,
  bankIdEnabled,
  verifiedBooking,
  verifiedName,
  failureReason,
}: {
  roomId: string;
  token: string;
  bankIdEnabled: boolean;
  verifiedBooking: MockBooking | null;
  verifiedName: string | null;
  failureReason: string | null;
}) {
  const [step, setStep] = useState<Step>(() => {
    if (verifiedBooking) return "verified";
    if (failureReason) return "error";
    return "intro";
  });
  const [booking, setBooking] = useState<MockBooking | null>(verifiedBooking);
  const [errorText, setErrorText] = useState<string | null>(
    failureReason
      ? (failureMessages[failureReason] ??
        "Ověření se nezdařilo. Zkuste to prosím znovu.")
      : null,
  );

  // Real BankID: hand off to the bank. Full-page navigation, no fetch.
  function startBankId() {
    setStep("verifying");
    const url = new URL("/api/auth/bankid/start", window.location.origin);
    url.searchParams.set("roomId", roomId);
    url.searchParams.set("token", token);
    window.location.assign(url.toString());
  }

  // Fallback used when BankID credentials aren't configured, so the demo
  // still runs end to end.
  async function mockVerify() {
    setStep("verifying");
    try {
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
      setErrorText("Rezervaci se nepodařilo najít. Zkontrolujte odkaz nebo kontaktujte recepci hotelu.");
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
            <BankIdButton onClick={bankIdEnabled ? startBankId : mockVerify} />
            <p className="mt-4 text-center text-[13px] text-ink-3">
              Bezpečné ověření totožnosti bankovní identitou
            </p>
          </div>
        )}

        {step === "verifying" && (
          <div key="verifying" className="animate-step-in flex items-center gap-3 py-2">
            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-[1.5px] border-neutral-300 border-t-neutral-900" />
            <p className="text-[15px] text-neutral-500">
              {bankIdEnabled ? "Přesměrováváme vás do banky…" : "Ověřujeme vaši totožnost…"}
            </p>
          </div>
        )}

        {step === "error" && (
          <div key="error" className="animate-step-in">
            <div className="rounded-2xl border border-red-900/10 bg-red-50/60 px-5 py-4">
              <p className="text-[15px] leading-relaxed text-red-900/80">{errorText}</p>
            </div>
            <div className="mt-4">
              <BankIdButton onClick={bankIdEnabled ? startBankId : mockVerify} />
            </div>
          </div>
        )}

        {step === "verified" && booking && (
          <div key="verified" className="animate-step-in">
            {verifiedName && (
              <p className="mb-5 text-[14px] text-neutral-500">
                Totožnost ověřena přes Bank iD — <span className="text-neutral-800">{verifiedName}</span>
              </p>
            )}
            <KeyCard booking={booking} />
            <div className="mt-7">
              <AppleWalletButton
                href={`/api/pass/${encodeURIComponent(roomId)}/${encodeURIComponent(
                  token,
                )}/klic-${encodeURIComponent(booking.roomNumber)}.pkpass`}
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

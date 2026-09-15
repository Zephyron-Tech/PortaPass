"use client";

import { useState } from "react";
import {
  AppleLogo,
  CheckCircle,
  CircleNotch,
  DoorOpen,
  WarningCircle,
} from "@phosphor-icons/react";
import { AppHeader } from "@/components/AppHeader";
import type { MockBooking } from "@/lib/mockData";

type Step = "intro" | "verifying" | "verified" | "error";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
  });
}

function KeyCard({ booking }: { booking: MockBooking }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-black p-6 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_24px_48px_-20px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300/80">
            Digitální klíč
          </p>
          <p className="mt-1 truncate text-lg font-semibold text-white">
            {booking.hotelName}
          </p>
        </div>
        <div className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-neutral-300">
          {booking.roomType}
        </div>
      </div>

      <div className="relative mt-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500">Pokoj</p>
          <p className="text-5xl font-semibold tabular-nums text-white">
            {booking.roomNumber}
          </p>
        </div>
        <DoorOpen size={40} weight="duotone" className="text-amber-300/80" />
      </div>

      <div className="relative mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-sm">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Host</p>
          <p className="mt-0.5 truncate text-neutral-200">{booking.guestName}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Pobyt</p>
          <p className="mt-0.5 text-neutral-200">
            {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
          </p>
        </div>
      </div>
    </div>
  );
}

function AppleWalletButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-black text-[17px] font-semibold text-white transition active:scale-[0.98] active:bg-neutral-900"
    >
      <AppleLogo size={20} weight="fill" />
      <span>Přidat do Apple Wallet</span>
    </a>
  );
}

export default function CheckinFlow({ roomId, token }: { roomId: string; token: string }) {
  const [step, setStep] = useState<Step>("intro");
  const [booking, setBooking] = useState<MockBooking | null>(null);

  async function handleVerify() {
    setStep("verifying");
    try {
      // Simulace odezvy BankID.
      await new Promise((r) => setTimeout(r, 1600));

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
    <div
      className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-1 flex-col justify-start gap-6 px-5 py-10"
      style={{
        paddingTop: "max(4rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <AppHeader title="Online check-in" />

      {step === "intro" && (
        <div className="rounded-3xl border border-white/60 bg-white/50 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-20px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <p className="leading-relaxed text-neutral-600">
            Ověřte svou totožnost a dokončete check-in. Poté obdržíte digitální
            klíč od pokoje přímo do peněženky ve vašem telefonu.
          </p>
          <button
            onClick={handleVerify}
            className="mt-6 w-full rounded-2xl bg-neutral-900 py-4 text-base font-medium text-white transition active:scale-[0.98] active:bg-neutral-800"
          >
            Ověřit přes BankID
          </button>
          <p className="mt-3 text-center text-xs text-neutral-400">
            Bezpečné ověření totožnosti bankovní identitou
          </p>
        </div>
      )}

      {step === "verifying" && (
        <div className="rounded-3xl border border-white/60 bg-white/50 p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-20px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <CircleNotch size={36} weight="bold" className="mx-auto animate-spin text-amber-600" />
          <p className="mt-5 text-neutral-600">Ověřujeme vaši totožnost…</p>
        </div>
      )}

      {step === "error" && (
        <div className="flex items-start gap-3 rounded-3xl border border-red-200/70 bg-red-50/70 p-6 backdrop-blur-xl">
          <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-red-700">
            Rezervaci se nepodařilo najít. Zkontrolujte odkaz nebo kontaktujte
            recepci hotelu.
          </p>
        </div>
      )}

      {step === "verified" && booking && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <CheckCircle size={18} weight="fill" />
            Totožnost ověřena
          </div>

          <KeyCard booking={booking} />

          <div className="rounded-3xl border border-white/60 bg-white/50 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-20px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <AppleWalletButton
              href={`/api/pass?roomId=${encodeURIComponent(roomId)}&token=${encodeURIComponent(token)}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

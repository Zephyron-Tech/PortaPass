"use client";

import { useState } from "react";
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
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-amber-300/80">
          <path
            d="M12 2C9.24 2 7 4.24 7 7v3H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-1V7c0-2.76-2.24-5-5-5Zm3 8H9V7a3 3 0 0 1 6 0v3Zm-3 3.5a1.5 1.5 0 0 1 1 2.62V18a1 1 0 1 1-2 0v-1.88a1.5 1.5 0 0 1 1-2.62Z"
            fill="currentColor"
          />
        </svg>
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
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-base font-medium text-white transition active:scale-[0.98] active:bg-neutral-900"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M16.365 1.43c0 1.14-.462 2.15-1.222 2.9-.83.82-2.18 1.45-3.29 1.36-.14-1.1.46-2.24 1.19-2.98.82-.83 2.26-1.45 3.32-1.28ZM20.02 17.24c-.36.83-.79 1.63-1.31 2.38-.7 1.02-1.28 1.73-1.73 2.13-.7.66-1.45 1-2.26 1.02-.58.02-1.28-.16-2.09-.5-.81-.34-1.55-.5-2.24-.5-.72 0-1.48.16-2.29.5-.81.35-1.46.53-1.97.55-.78.03-1.55-.32-2.3-1.06-.49-.45-1.1-1.19-1.83-2.24-.79-1.12-1.44-2.42-1.95-3.9-.55-1.6-.82-3.15-.82-4.65 0-1.72.37-3.2 1.11-4.44a6.5 6.5 0 0 1 2.35-2.38A6.35 6.35 0 0 1 6.02 3.1c.62 0 1.44.19 2.46.57 1.02.38 1.67.57 1.96.57.21 0 .93-.22 2.16-.66 1.16-.41 2.14-.58 2.95-.51 2.18.18 3.82 1.03 4.9 2.58-1.95 1.18-2.92 2.83-2.9 4.94.02 1.64.6 3.01 1.75 4.09.52.5 1.1.88 1.75 1.16-.14.41-.29.8-.44 1.19Z"
          fill="currentColor"
        />
      </svg>
      Přidat do Apple Wallet
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
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(202,138,4,0.10),transparent_70%)]" />

      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-700/15 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
          PortaPass
        </span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">
          Online check-in
        </h1>
      </div>

      {step === "intro" && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_30px_-15px_rgba(0,0,0,0.12)]">
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
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_30px_-15px_rgba(0,0,0,0.12)]">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-neutral-200 border-t-amber-600" />
          <p className="mt-5 text-neutral-600">Ověřujeme vaši totožnost…</p>
        </div>
      )}

      {step === "error" && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">
            Rezervaci se nepodařilo najít. Zkontrolujte odkaz nebo kontaktujte
            recepci hotelu.
          </p>
        </div>
      )}

      {step === "verified" && booking && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" fill="currentColor" />
            </svg>
            Totožnost ověřena
          </div>

          <KeyCard booking={booking} />

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_30px_-15px_rgba(0,0,0,0.12)]">
            <AppleWalletButton
              href={`/api/pass?roomId=${encodeURIComponent(roomId)}&token=${encodeURIComponent(token)}`}
            />

            <p className="mt-4 text-xs leading-relaxed text-neutral-400">
              Proof of concept: tento klíč je vizuální ukázka. Reálné odemykání
              dveří vyžaduje integraci s certifikovaným výrobcem zámků — viz
              ROADMAP.md.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

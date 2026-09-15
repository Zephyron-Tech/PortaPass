"use client";

import { useState } from "react";
import { CheckCircle, CircleNotch, DoorOpen, WarningCircle } from "@phosphor-icons/react";
import { AppHeader } from "@/components/AppHeader";
import type { MockBooking } from "@/lib/mockData";

// Apple's own mark, as shipped in Apple's official "Sign in with Apple" JS
// button widget (appleid.auth.js) — the real logo, not a third-party redraw.
function AppleMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="6 6 44 44" fill="currentColor" aria-hidden>
      <path d="M28.2226562,20.3846154 C29.0546875,20.3846154 30.0976562,19.8048315 30.71875,19.0317864 C31.28125,18.3312142 31.6914062,17.352829 31.6914062,16.3744437 C31.6914062,16.2415766 31.6796875,16.1087095 31.65625,16 C30.7304687,16.0362365 29.6171875,16.640178 28.9492187,17.4494596 C28.421875,18.06548 27.9414062,19.0317864 27.9414062,20.0222505 C27.9414062,20.1671964 27.9648438,20.3121424 27.9765625,20.3604577 C28.0351562,20.3725366 28.1289062,20.3846154 28.2226562,20.3846154 Z M25.2929688,35 C26.4296875,35 26.9335938,34.214876 28.3515625,34.214876 C29.7929688,34.214876 30.109375,34.9758423 31.375,34.9758423 C32.6171875,34.9758423 33.4492188,33.792117 34.234375,32.6325493 C35.1132812,31.3038779 35.4765625,29.9993643 35.5,29.9389701 C35.4179688,29.9148125 33.0390625,28.9122695 33.0390625,26.0979021 C33.0390625,23.6579784 34.9140625,22.5588048 35.0195312,22.474253 C33.7773438,20.6382708 31.890625,20.5899555 31.375,20.5899555 C29.9804688,20.5899555 28.84375,21.4596313 28.1289062,21.4596313 C27.3554688,21.4596313 26.3359375,20.6382708 25.1289062,20.6382708 C22.8320312,20.6382708 20.5,22.5950413 20.5,26.2911634 C20.5,28.5861411 21.3671875,31.013986 22.4335938,32.5842339 C23.3476562,33.9129053 24.1445312,35 25.2929688,35 Z" />
    </svg>
  );
}

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
  const [opening, setOpening] = useState(false);

  return (
    <a
      href={href}
      onClick={() => {
        setOpening(true);
        window.setTimeout(() => setOpening(false), 2200);
      }}
      className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-black text-[17px] font-semibold text-white transition-all duration-150 active:scale-[0.96] active:bg-neutral-900"
    >
      {opening ? (
        <CircleNotch size={18} weight="bold" className="animate-spin" />
      ) : (
        <AppleMark size={18} />
      )}
      <span>{opening ? "Otevírání Wallet…" : "Přidat do Apple Wallet"}</span>
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
        <div
          key="intro"
          className="animate-step-in rounded-3xl border border-white/60 bg-white/50 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-20px_rgba(0,0,0,0.18)] backdrop-blur-xl"
        >
          <p className="leading-relaxed text-neutral-600">
            Ověřte svou totožnost a dokončete check-in. Poté obdržíte digitální
            klíč od pokoje přímo do peněženky ve vašem telefonu.
          </p>
          <button
            onClick={handleVerify}
            className="mt-6 w-full rounded-2xl bg-neutral-900 py-4 text-base font-medium text-white transition-all duration-150 active:scale-[0.96] active:bg-neutral-800"
          >
            Ověřit přes BankID
          </button>
          <p className="mt-3 text-center text-xs text-neutral-400">
            Bezpečné ověření totožnosti bankovní identitou
          </p>
        </div>
      )}

      {step === "verifying" && (
        <div
          key="verifying"
          className="animate-step-in rounded-3xl border border-white/60 bg-white/50 p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-20px_rgba(0,0,0,0.18)] backdrop-blur-xl"
        >
          <CircleNotch size={36} weight="bold" className="mx-auto animate-spin text-amber-600" />
          <p className="mt-5 text-neutral-600">Ověřujeme vaši totožnost…</p>
        </div>
      )}

      {step === "error" && (
        <div
          key="error"
          className="animate-step-in flex items-start gap-3 rounded-3xl border border-red-200/70 bg-red-50/70 p-6 backdrop-blur-xl"
        >
          <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-red-700">
            Rezervaci se nepodařilo najít. Zkontrolujte odkaz nebo kontaktujte
            recepci hotelu.
          </p>
        </div>
      )}

      {step === "verified" && booking && (
        <div key="verified" className="animate-step-in flex flex-col gap-5">
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

"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, ViewTransition } from "react";
import { PageHeading } from "@/components/AppHeader";
import { AppleWalletButton } from "@/components/AppleWalletButton";
import { BankIdButton } from "@/components/bankid/BankIdButton";
import { GoogleWalletButton } from "@/components/GoogleWalletButton";
import { KeyCard } from "@/components/KeyCard";
import { CheckMark } from "@/components/marks";
import { Screen } from "@/components/Screen";
import { useAbortableRequest } from "@/hooks/useAbortableRequest";
import type { WalletPlatform } from "@/lib/device";
import type { MockBooking } from "@/lib/mockData";
import { failureMessages, isBooking } from "./helpers";

type Step = "intro" | "verifying" | "success" | "verified" | "error";

// Hidden for now: BankID's branded button always shows (even where BankID
// isn't actually configured), but it never redirects to the real sandbox —
// clicking it runs the same mocked verification as the no-BankID path. Flip
// to false to go back to real config-driven behavior (bankIdEnabled prop).
const MOCK_BANKID = true;
// A real fetch to the mock API resolves almost instantly, which reads as
// broken rather than fast. Keep "verifying" up for at least this long, then
// hold a brief success confirmation before moving on to the Wallet step.
const MIN_VERIFYING_MS = 900;
const SUCCESS_DISPLAY_MS = 1100;

export default function CheckinFlow({
  roomId,
  token,
  validLink,
  bankIdEnabled,
  walletPlatform,
  verifiedBooking,
  verifiedName,
  failureReason,
}: {
  roomId: string;
  token: string;
  validLink: boolean;
  bankIdEnabled: boolean;
  walletPlatform: WalletPlatform;
  verifiedBooking: MockBooking | null;
  verifiedName: string | null;
  failureReason: string | null;
}) {
  const [step, setStepState] = useState<Step>(() => {
    if (!validLink) return "error";
    if (verifiedBooking) return "verified";
    return failureReason ? "error" : "intro";
  });
  const [booking, setBooking] = useState<MockBooking | null>(verifiedBooking);
  const [errorText, setErrorText] = useState(
    !validLink ? failureMessages.booking :
      failureReason && Object.hasOwn(failureMessages, failureReason)
        ? failureMessages[failureReason]
        : "Ověření se nezdařilo. Zkuste to prosím znovu.",
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const inFlight = useRef(false);
  const { start, isCurrent, finish } = useAbortableRequest();
  const [, startStepTransition] = useTransition();
  const showBankId = MOCK_BANKID || bankIdEnabled;
  const usingRealBankId = bankIdEnabled && !MOCK_BANKID;
  // Plain setState doesn't trigger React's <ViewTransition> — only updates
  // wrapped in a Transition do — so every setStep call below goes through
  // this wrapper. It only visibly animates where the "stage" derived from
  // step (see below) actually changes, i.e. the Ověření → Wallet handoff.
  function setStep(next: Step) {
    startStepTransition(() => setStepState(next));
  }

  useEffect(() => {
    // A full-page bank redirect can leave "verifying" in the back/forward cache.
    function restoreFromBank(event: PageTransitionEvent) {
      if (event.persisted && usingRealBankId && inFlight.current) {
        inFlight.current = false;
        setErrorText("Vrátili jste se z banky bez dokončení ověření. Můžete ho spustit znovu.");
        setStep("error");
      }
    }
    window.addEventListener("pageshow", restoreFromBank);
    return () => {
      window.removeEventListener("pageshow", restoreFromBank);
      inFlight.current = false;
    };
  }, [usingRealBankId]);

  useEffect(() => {
    // Outcomes are announced through focus, not a second live-region message.
    if (step === "error") errorRef.current?.focus();
    if (step === "verified") headingRef.current?.focus();
  }, [step]);

  function startBankId() {
    if (!validLink || !usingRealBankId || inFlight.current || step === "verified") return;
    inFlight.current = true;
    setStep("verifying");
    const url = new URL("/api/auth/bankid/start", window.location.origin);
    url.searchParams.set("roomId", roomId);
    url.searchParams.set("token", token);
    // Let the branded control render its pending state before full navigation.
    window.setTimeout(() => window.location.assign(url.toString()), 180);
  }

  async function mockVerify() {
    if (!validLink || usingRealBankId || inFlight.current || step === "verified") return;
    inFlight.current = true;
    setStep("verifying");
    const request = start(15_000);
    const startedAt = Date.now();
    let failure = "Spojení se nezdařilo. Zkontrolujte připojení a spusťte simulaci znovu.";
    try {
      const res = await fetch("/api/checkin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, token }),
        signal: request.controller.signal,
      });
      failure = res.status === 404
        ? failureMessages.booking
        : "Server vrátil neočekávanou odpověď. Zkuste simulaci znovu za chvíli.";
      if (!res.ok) throw new Error("Verification response failed");
      const data: unknown = await res.json();
      if (!data || typeof data !== "object" ||
        !("verified" in data) || data.verified !== true ||
        !("booking" in data) || !isBooking(data.booking) ||
        data.booking.roomId !== roomId || data.booking.token !== token) {
        throw new Error("Invalid verification response");
      }
      if (!isCurrent(request)) return;
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_VERIFYING_MS) await new Promise((resolve) => setTimeout(resolve, MIN_VERIFYING_MS - elapsed));
      if (!isCurrent(request)) return;
      setBooking(data.booking);
      setStep("success");
      await new Promise((resolve) => setTimeout(resolve, SUCCESS_DISPLAY_MS));
      if (!isCurrent(request)) return;
      setStep("verified");
    } catch {
      if (!isCurrent(request)) return;
      setErrorText(request.controller.signal.aborted
        ? "Simulace neodpověděla do 15 sekund. Zkuste ji prosím znovu."
        : failure);
      setStep("error");
    } finally {
      if (finish(request)) inFlight.current = false;
    }
  }

  const pending = step === "verifying" || step === "success";
  const pendingText = step === "success"
    ? "Ověření proběhlo úspěšně. Připravujeme ukázkový klíč…"
    : usingRealBankId
      ? "Přesměrováváme vás do Bank iD…"
      : "Načítáme ukázkovou rezervaci…";
  // Ověření (intro/verifying/success/error) and Wallet are the two "pages"
  // of this flow; only the handoff between them crossfades, not every
  // intermediate step change within Ověření.
  const stage = step === "verified" ? "wallet" : "verify";

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
    <Screen desktop>
    <ViewTransition key={stage} enter="nav-forward" exit="nav-forward" default="none">
    <>
      <PageHeading
        headingRef={headingRef}
        progress={step === "verified" ? "2 ze 2 · Apple Wallet" : "1 ze 2 · Ověření"}
        title={step === "verified" ? "Ukázkový klíč je připraven" : "Ověření hosta"}
        subtitle={step === "verified"
          ? "Průkaz do Apple Wallet. Pouze ukázka, která neodemyká dveře."
          : "Ověření a ukázkový průkaz do Apple Wallet. Bez instalace hotelové aplikace."}
        aside={
          <Link
            href="/demo"
            transitionTypes={["nav-back"]}
            className="inline-flex min-h-11 min-w-11 items-center justify-center underline underline-offset-4 hover:text-ink"
          >
            Zpět na ukázku
          </Link>
        }
      />

      <div className="guest-content mt-8 min-w-0">
        {step !== "verified" && validLink && (
          <p className="text-[15px] leading-relaxed text-ink-2">
            {usingRealBankId
              ? "Pokračujete ke službě Bank iD. Po ověření se vrátíte sem ke smyšlené rezervaci. Ukázka neporovnává totožnost s držitelem rezervace."
              : showBankId
                ? "Ověření přes Bank iD je pro tuto ukázku dočasně simulované — krok proběhne bez přesměrování do banky."
                : "Bank iD není připojené. Simulace načte smyšlenou rezervaci. Neověřuje totožnost ani vás nepřihlašuje do banky."}
          </p>
        )}

        {step === "error" && (
          <p
            ref={errorRef}
            tabIndex={-1}
            className="mt-6 rounded-2xl border border-hairline-strong bg-background px-5 py-4 text-[15px] leading-relaxed text-ink [overflow-wrap:anywhere] focus:outline-none"
          >
            {errorText}
          </p>
        )}

        {step === "success" && (
          <p className="mt-6 flex items-center gap-3 rounded-2xl border border-hairline-strong bg-background px-5 py-4 text-[15px] leading-relaxed text-ink">
            <CheckMark className="h-5 w-5 shrink-0 text-[#2f5d43]" />
            Ověření úspěšné.
          </p>
        )}

        {step === "verified" && booking && (
          <>
            <p className="mb-5 text-sm leading-relaxed text-ink-2 [overflow-wrap:anywhere]">
              {verifiedBooking
                ? <>Totožnost ověřena přes Bank iD{verifiedName ? `: ${verifiedName}` : "."}</>
                : "Simulace dokončena. Totožnost nebyla ověřena."}
            </p>
            <div aria-hidden="true"><KeyCard booking={booking} /></div>
            <details className="mt-4 border-y border-hairline">
              <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-ink">Podrobnosti ukázkové rezervace</summary>
              <dl className="grid grid-cols-2 gap-4 pb-5 text-sm [overflow-wrap:anywhere]">
                {[
                  ["Hotel", booking.hotelName],
                  ["Host", booking.guestName],
                  ["Pokoj", booking.roomNumber],
                  ["Typ pokoje", booking.roomType],
                  ["Příjezd", new Date(booking.checkIn).toLocaleDateString("cs-CZ", { timeZone: "UTC" })],
                  ["Odjezd", new Date(booking.checkOut).toLocaleDateString("cs-CZ", { timeZone: "UTC" })],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-ink-3">{label}</dt>
                    <dd className="mt-0.5 text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </>
        )}
      </div>

      <p role="status" aria-live="polite" aria-atomic="true" className="mt-6 text-sm text-ink-2">
        {pending ? pendingText : ""}
      </p>

      <div className="guest-actions" aria-busy={pending}>
        {step === "verified" && booking ? (
          <div className="flex flex-col gap-3">
            {walletPlatform !== "google" && (
              <AppleWalletButton
                href={`/api/pass/${encodeURIComponent(roomId)}/${encodeURIComponent(
                  token,
                )}/klic-${encodeURIComponent(booking.roomNumber)}.pkpass`}
              />
            )}
            {walletPlatform !== "apple" && (
              <GoogleWalletButton
                href={`/api/generate-google-pass?roomId=${encodeURIComponent(roomId)}&token=${encodeURIComponent(token)}`}
              />
            )}
          </div>
        ) : !validLink ? (
          <Link href="/demo" transitionTypes={["nav-back"]} className="app-button w-full">Zpět na ukázku</Link>
        ) : pending && !usingRealBankId && !showBankId ? (
          <button type="button" disabled className="app-button w-full">
            {step === "success" ? "Ověřeno" : "Probíhá simulace…"}
          </button>
        ) : showBankId ? (
          <div className="rounded-2xl border border-hairline-strong p-4">
            <BankIdButton
              onClick={usingRealBankId ? startBankId : mockVerify}
              pending={pending}
              pendingLabel={usingRealBankId ? undefined : step === "success" ? "Ověřeno" : "Ověřování…"}
            />
          </div>
        ) : (
          <button type="button" onClick={mockVerify} className="app-button w-full">
            Spustit simulaci
          </button>
        )}
      </div>
    </>
    </ViewTransition>
    </Screen>
    </ViewTransition>
  );
}

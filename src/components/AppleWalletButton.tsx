"use client";

import { useEffect, useRef, useState } from "react";
import { AppleMark } from "@/components/marks";

export function AppleWalletButton({ href }: { href: string }) {
  const [opening, setOpening] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  return (
    <a
      href={href}
      onClick={() => {
        setOpening(true);
        // Safari hands the pass to Wallet without unloading this page, so
        // there is no navigation event to reset on — fall back to a timer.
        if (timer.current !== null) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setOpening(false), 2400);
      }}
      aria-live="polite"
      className="app-button flex min-h-[54px] w-full select-none items-center justify-center gap-[7px] rounded-2xl bg-black px-3 text-white transition duration-150 ease-out active:scale-[0.975] active:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f7]"
    >
      {/* `leading-none` on the label makes its line box shorter than the
          font's content area (negative half-leading), which pulls the text
          baseline up. Flex centring of the raw boxes then lands the mark
          ~1px above the label's cap-height centre. Centring the mark on the
          *button* instead puts both on the same optical centre line. */}
      <AppleMark className="h-[18px] shrink-0" />
      <span className="text-[17px] font-semibold leading-none tracking-[-0.01em]">
        {opening ? "Otevírání Wallet…" : "Přidat do Apple Wallet"}
      </span>
    </a>
  );
}

"use client";

import { GoogleMark } from "@/components/marks";

export function GoogleWalletButton({ href }: { href: string }) {
  return (
    // Opens in a new tab: Google's save flow is a real page navigation
    // (sign-in + confirm), unlike Apple's in-Safari Wallet sheet which never
    // unloads this page — the visitor should be able to get back to the
    // demo without losing their place.
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="app-button flex min-h-[54px] w-full select-none items-center justify-center gap-[7px] rounded-2xl bg-black px-3 text-white transition duration-150 ease-out hover:bg-neutral-800 active:scale-[0.975] active:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f7]"
    >
      <GoogleMark className="h-[23px] shrink-0" />
      <span className="text-[17px] font-semibold leading-none tracking-[-0.01em]">
        Přidat do Google Wallet
      </span>
    </a>
  );
}

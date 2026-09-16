"use client";

import { useEffect, useState } from "react";

export function CopyEmailButton({ email, className = "" }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const [sweeping, setSweeping] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2_000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setSweeping(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={copy}
        className="copy-email-button group relative flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 overflow-hidden border-b border-hairline py-2 text-left text-[clamp(1.125rem,5.6vw,1.5rem)] font-medium tracking-[-0.025em] text-ink transition-colors hover:text-ink-2 focus-visible:outline-none"
        aria-label={`Kopírovat e-mail ${email}`}
      >
        <span className="relative min-w-0 truncate">
          {email}
          {sweeping ? <span aria-hidden onAnimationEnd={() => setSweeping(false)} className="copy-email-sweep" /> : null}
        </span>
        <span aria-hidden className="relative grid size-6 shrink-0 place-items-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`absolute size-6 transition-all duration-150 ${copied ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}>
            <rect x="8" y="3" width="11" height="14" rx="2" />
            <path d="M16 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3" />
          </svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={`absolute size-6 transition-all duration-150 ${copied ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
            <path d="m5 12.5 4.2 4.2L19.5 6.5" />
          </svg>
        </span>
      </button>
      <p aria-live="polite" className="mt-2 text-[12px] text-ink-3 md:sr-only">
        {copied ? "E-mail zkopírován" : "Kliknutím zkopírujete e-mailovou adresu"}
      </p>
    </div>
  );
}

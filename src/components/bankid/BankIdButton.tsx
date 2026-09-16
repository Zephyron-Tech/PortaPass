"use client";

import { BankIdLogo } from "@/components/bankid/BankIdLogo";

/**
 * Bank iD CTA built to the official spec (logomanuál v05/2026, "WEB: Základní
 * tlačítka"): 48px high, 8px radius, #000 fill, white logotype and label, set
 * in Poppins, laid out as [logotype] │ [popis akce].
 *
 * The styleguide is explicit that no other visualisation of the button is
 * permitted, so height/radius/colours stay off-spec from the rest of the
 * site deliberately — that mismatch with our own 54px/16px-radius buttons
 * (Cta.tsx) is not a bug, it's a foreign brand mark placed deliberately.
 *
 * The centre divider WAS a real bug, independent of the brand spec: with
 * `justify-content: center`, the row centres as a whole, and the logo
 * (108px) is much wider than the label — so the divider always landed well
 * right of the button's true centre (measured: 21.6px off on a 360px-wide
 * button). Laid out as a 3-column grid instead, so the divider sits at
 * exactly 50% regardless of how the logo and label widths compare.
 *
 * `label` is restricted to the sanctioned action strings.
 */
type BankIdAction = "Přihlásit se" | "Podepsat" | "Ověřit se" | "Registrovat se";

export function BankIdButton({
  onClick,
  label = "Ověřit se",
  className = "",
}: {
  onClick: () => void;
  label?: BankIdAction;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} s Bank iD`}
      style={{ height: 48, minHeight: 48, maxHeight: 48, flexShrink: 0 }}
      className={`font-bankid grid w-full min-w-max select-none grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-[8px] bg-black px-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f7] ${className}`}
    >
      <span className="flex justify-end">
        <BankIdLogo width={108} tone="white" decorative />
      </span>
      <span aria-hidden className="h-5 w-px bg-white/30" />
      <span className="justify-self-start whitespace-nowrap text-[15px] font-medium tracking-[-0.01em]">
        {label}
      </span>
    </button>
  );
}

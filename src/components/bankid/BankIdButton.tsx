"use client";

import { BankIdLogo } from "@/components/bankid/BankIdLogo";

/**
 * Bank iD CTA built to the official spec (logomanuál v05/2026, "WEB: Základní
 * tlačítka"): 48px high, 8px radius, #000 fill, white logotype and label, set
 * in Poppins, laid out as [logotype] │ [popis akce].
 *
 * The styleguide is explicit that no other visualisation of the button is
 * permitted, so none of these values should be "designed" to match the rest
 * of the site — deviating is a brand breach, not a style choice.
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
      onClick={onClick}
      className={`font-bankid flex h-12 w-full select-none items-center justify-center gap-3 rounded-lg bg-black text-white transition duration-150 ease-out active:scale-[0.985] active:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f7] ${className}`}
    >
      <BankIdLogo width={72} tone="white" decorative />
      <span aria-hidden className="h-5 w-px bg-white/30" />
      <span className="text-[15px] font-medium tracking-[-0.01em]">{label}</span>
    </button>
  );
}

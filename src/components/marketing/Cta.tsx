import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared call to action. The focus ring colour and offset live in the
 * variants, NOT in `base` — on the dark band a ring offset of the page cream
 * would be invisible, which is the whole point of having inverse variants.
 */
const base =
  "app-button inline-flex min-h-[54px] min-w-11 select-none items-center justify-center rounded-2xl px-8 py-3 text-center text-[16px] font-medium transition duration-150 ease-out active:scale-[0.975] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const variants = {
  primary:
    "bg-ink text-[#faf9f7] active:bg-[#2a2620] focus-visible:ring-ink focus-visible:ring-offset-[#faf9f7]",
  quiet:
    "border border-hairline-strong bg-transparent text-ink-2 hover:border-ink-3 active:bg-black/[0.03] focus-visible:ring-ink focus-visible:ring-offset-[#faf9f7]",
  inverse:
    "bg-band-ink text-ink active:bg-[#e9e1d4] focus-visible:ring-band-ink focus-visible:ring-offset-[#191713]",
  quietInverse:
    "border border-band-hairline bg-transparent text-band-ink hover:border-band-ink-muted active:bg-white/5 focus-visible:ring-band-ink focus-visible:ring-offset-[#191713]",
};

export function Cta({
  href,
  children,
  variant = "primary",
  external = false,
  transitionTypes,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  external?: boolean;
  transitionTypes?: string[];
}) {
  const className = `${base} ${variants[variant]}`;

  if (external) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} transitionTypes={transitionTypes}>
      {children}
    </Link>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared call to action. Centralises the focus-visible ring — the rest of the
 * app styles only `active:`, which leaves keyboard users with no visible
 * focus on a near-black button.
 */
const base =
  "inline-flex h-[54px] select-none items-center justify-center rounded-2xl px-8 text-[16px] font-medium transition duration-150 ease-out active:scale-[0.975] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f7]";

const variants = {
  primary: "bg-neutral-900 text-white active:bg-neutral-800",
  quiet:
    "border border-neutral-900/15 text-neutral-800 hover:border-neutral-900/30 active:bg-neutral-900/[0.03]",
};

export function Cta({
  href,
  children,
  variant = "primary",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  external?: boolean;
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
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

import type { ReactNode } from "react";

/**
 * Wide page container for marketing sections. Deliberately separate from
 * Screen, which is phone-width (max-w-[26rem]) because the check-in flow
 * depends on that framing.
 */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[68rem] px-6 sm:px-8 ${className}`}>{children}</div>
  );
}

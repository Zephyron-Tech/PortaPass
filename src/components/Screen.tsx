import type { ReactNode } from "react";

/** Shared, naturally scrolling frame for guest and legal pages. */
export function Screen({ children, desktop = false }: { children: ReactNode; desktop?: boolean }) {
  return <main className={`guest-screen${desktop ? " guest-screen-desktop" : ""}`}>{children}</main>;
}

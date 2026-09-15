import type { ReactNode } from "react";

/** Shared, naturally scrolling frame for guest and legal pages. */
export function Screen({ children }: { children: ReactNode }) {
  return <main className="guest-screen">{children}</main>;
}

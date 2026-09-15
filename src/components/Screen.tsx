import type { ReactNode } from "react";

/**
 * Single source of truth for page framing. Both screens use this so their
 * headers sit at the identical position and the safe-area handling stays
 * consistent.
 */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <main
      className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col px-6 pb-10"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 3.5rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 2.5rem)",
      }}
    >
      {children}
    </main>
  );
}

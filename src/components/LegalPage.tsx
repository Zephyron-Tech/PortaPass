import type { ReactNode } from "react";
import { Wordmark } from "@/components/AppHeader";
import { Screen } from "@/components/Screen";

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="border-b border-neutral-900/10 py-6 last:border-b-0">
      <h2 className="text-[13px] font-medium uppercase tracking-[0.14em] text-neutral-400">
        {heading}
      </h2>
      <div className="mt-3 text-[15px] leading-relaxed text-neutral-700 [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </section>
  );
}

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <Screen>
      <Wordmark />
      <h1 className="mt-6 font-serif text-[2.1rem] leading-[1.1] tracking-[-0.01em] text-neutral-900">
        {title}
      </h1>
      <p className="mt-2 text-[13px] text-neutral-400">Aktualizováno {updated}</p>
      <div className="mt-6">{children}</div>
    </Screen>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/AppHeader";
import { Screen } from "@/components/Screen";

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="border-b border-hairline py-6 last:border-b-0">
      <h2 className="text-[13px] font-medium uppercase tracking-[0.14em] text-ink-3">
        {heading}
      </h2>
      <div className="mt-3 text-[15px] leading-relaxed text-ink-2 [&_a]:underline [&_a]:underline-offset-2">
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
      <Wordmark
        aside={
          <Link
            href="/"
            className="inline-flex min-h-11 min-w-11 items-center justify-center underline underline-offset-4 hover:text-ink"
          >
            Zpět na web
          </Link>
        }
      />
      <h1 className="mt-6 font-serif text-[2.1rem] leading-[1.1] tracking-[-0.01em] text-ink">
        {title}
      </h1>
      <p className="mt-2 text-[13px] text-ink-3">Aktualizováno {updated}</p>
      <div className="mt-6">{children}</div>
    </Screen>
  );
}

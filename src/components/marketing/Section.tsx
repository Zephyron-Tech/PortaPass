import type { ReactNode } from "react";
import { Container } from "@/components/marketing/Container";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500">
      {children}
    </p>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-4 max-w-[22ch] font-serif text-[1.85rem] leading-[1.15] tracking-[-0.01em] text-neutral-900 md:text-[2.4rem]">
      {children}
    </h2>
  );
}

export function Section({
  id,
  eyebrow,
  heading,
  lead,
  children,
  bordered = true,
}: {
  id?: string;
  eyebrow?: string;
  heading?: string;
  lead?: string;
  children?: ReactNode;
  bordered?: boolean;
}) {
  return (
    <section id={id} className={bordered ? "border-t border-neutral-900/10" : undefined}>
      <Container className="py-20 md:py-28">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        {heading ? <SectionHeading>{heading}</SectionHeading> : null}
        {lead ? (
          <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-neutral-600 md:text-[17px]">
            {lead}
          </p>
        ) : null}
        {children}
      </Container>
    </section>
  );
}

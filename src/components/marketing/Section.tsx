import type { ReactNode } from "react";
import { Container } from "@/components/marketing/Container";

export function Eyebrow({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <p
      className={`text-[12px] font-medium uppercase tracking-[0.18em] ${
        tone === "dark" ? "text-band-ink-faint" : "text-ink-3"
      }`}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <h2
      className={`mt-4 max-w-[20ch] font-serif text-[clamp(2rem,4.6vw,3rem)] leading-[1.08] tracking-[-0.018em] text-balance ${
        tone === "dark" ? "text-band-ink" : "text-ink"
      }`}
    >
      {children}
    </h2>
  );
}

/** The eyebrow / heading / lead trio — the one thing genuinely shared. */
export function SectionHeader({
  eyebrow,
  heading,
  lead,
  tone = "light",
}: {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  tone?: "light" | "dark";
}) {
  return (
    <>
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      {heading ? <SectionHeading tone={tone}>{heading}</SectionHeading> : null}
      {lead ? (
        <p
          className={`mt-6 max-w-[46ch] text-[18px] leading-[1.55] text-pretty md:text-[20px] ${
            tone === "dark" ? "text-band-ink-muted" : "text-ink-2"
          }`}
        >
          {lead}
        </p>
      ) : null}
    </>
  );
}

/**
 * Spacing + hairline primitive. Deliberately has no opinion about content —
 * each section writes its own grid, which is what stops them all looking the
 * same.
 */
export function Section({
  id,
  children,
  bordered = true,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <section id={id} className={bordered ? "border-t border-hairline" : undefined}>
      <Container className={`py-20 md:py-28 ${className}`}>{children}</Container>
    </section>
  );
}

/** Full-bleed dark band. The <section> is already edge-to-edge, so no breakout. */
export function Band({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <section id={id} className="bg-band">
      <Container className="py-24 md:py-32">{children}</Container>
    </section>
  );
}

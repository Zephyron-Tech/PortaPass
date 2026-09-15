import type { ReactNode } from "react";

export function Wordmark({ aside }: { aside?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-400">
        PortaPass
      </span>
      {aside ? <span className="text-[13px] text-neutral-400">{aside}</span> : null}
    </div>
  );
}

/**
 * Shared page heading. Both screens render this in the same slot of Screen,
 * so the title always lands at the same height.
 */
export function PageHeading({
  title,
  subtitle,
  aside,
}: {
  title: string;
  subtitle?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="animate-rise-in">
      <Wordmark aside={aside} />
      <h1 className="mt-6 font-serif text-[2.1rem] leading-[1.1] tracking-[-0.01em] text-neutral-900">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">{subtitle}</p>
      ) : null}
    </header>
  );
}

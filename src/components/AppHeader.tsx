import type { ReactNode, Ref } from "react";
import Image from "next/image";

export function Wordmark({ aside }: { aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
      <Image src="/brand/PortaPass Logo.png" alt="PortaPass" width={229} height={83} className="h-auto w-[110px]" priority />
      {aside ? <span className="text-[13px] text-ink-2">{aside}</span> : null}
    </div>
  );
}

export function PageHeading({
  title,
  subtitle,
  aside,
  progress,
  headingRef,
}: {
  title: string;
  subtitle?: string;
  aside?: ReactNode;
  progress?: string;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <header className="text-left">
      <Wordmark aside={aside} />
      {progress ? <p className="mt-8 text-sm font-medium text-ink-3">{progress}</p> : null}
      <h1
        ref={headingRef}
        tabIndex={-1}
        className={`${progress ? "mt-3" : "mt-6"} font-serif text-[2.1rem] leading-[1.1] tracking-[-0.01em] text-ink [overflow-wrap:anywhere] focus:outline-none`}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{subtitle}</p>
      ) : null}
    </header>
  );
}

import type { CSSProperties } from "react";

/**
 * Numbered hairline list. Shared by the landing page and the demo entry so
 * the two can't drift apart.
 */
export function StepList({
  steps,
  className = "",
  style,
}: {
  steps: string[];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <ol role="list" className={`border-t border-hairline ${className}`} style={style}>
      {steps.map((label, i) => (
        <li key={label} className="flex items-baseline gap-5 border-b border-hairline py-4">
          <span aria-hidden="true" className="text-[12px] font-medium tabular-nums text-ink-3">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-[15px] text-ink-2">{label}</span>
        </li>
      ))}
    </ol>
  );
}

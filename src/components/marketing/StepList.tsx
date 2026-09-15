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
    <ol className={`border-t border-neutral-900/10 ${className}`} style={style}>
      {steps.map((label, i) => (
        <li key={label} className="flex items-baseline gap-5 border-b border-neutral-900/10 py-4">
          <span className="text-[12px] font-medium tabular-nums text-neutral-400">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-[15px] text-neutral-700">{label}</span>
        </li>
      ))}
    </ol>
  );
}

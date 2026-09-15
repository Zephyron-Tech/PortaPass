export function AppHeader({ title }: { title: string }) {
  return (
    <div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-700/15 bg-amber-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800 backdrop-blur-sm">
        PortaPass
      </span>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">{title}</h1>
    </div>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <main
      className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-1 flex-col justify-start gap-8 px-6 py-16 sm:justify-center"
      style={{
        paddingTop: "max(6rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(202,138,4,0.10),transparent_70%)]" />

      <div className="flex flex-col items-start gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-700/15 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
          PortaPass
        </span>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
          Digitální klíč od&nbsp;pokoje
        </h1>
        <p className="text-base leading-relaxed text-neutral-500">
          Proof of concept: ukázka odkazu, který host dostane e-mailem nebo
          SMS ještě před příjezdem do hotelu.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_30px_-15px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            1
          </span>
          Ověření totožnosti
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            2
          </span>
          Digitální klíč do peněženky
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            3
          </span>
          Odemknutí pokoje telefonem
        </div>
      </div>

      <Link
        href="/checkin/room-101?token=abc"
        className="flex items-center justify-center rounded-2xl bg-neutral-900 py-4 text-center text-base font-medium text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] transition active:scale-[0.98] active:bg-neutral-800"
      >
        Otevřít ukázkový check-in
      </Link>
    </main>
  );
}

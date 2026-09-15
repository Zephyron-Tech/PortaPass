"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PageHeading } from "@/components/AppHeader";
import { Screen } from "@/components/Screen";

const steps = [
  "Ověření totožnosti",
  "Digitální klíč do peněženky",
  "Odemknutí pokoje telefonem",
];

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Screen>
      <PageHeading
        title="Digitální klíč od pokoje"
        subtitle="Ukázka odkazu, který host dostane e-mailem nebo SMS ještě před příjezdem do hotelu."
      />

      <ol
        className="animate-rise-in mt-12 border-t border-neutral-900/10"
        style={{ animationDelay: "80ms" }}
      >
        {steps.map((label, i) => (
          <li
            key={label}
            className="flex items-baseline gap-5 border-b border-neutral-900/10 py-4"
          >
            <span className="text-[12px] font-medium tabular-nums text-neutral-400">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[15px] text-neutral-700">{label}</span>
          </li>
        ))}
      </ol>

      <button
        onClick={() => startTransition(() => router.push("/checkin/room-101?token=abc"))}
        disabled={isPending}
        className="animate-rise-in mt-10 flex h-[54px] w-full select-none items-center justify-center rounded-2xl bg-neutral-900 text-[16px] font-medium text-white transition duration-150 ease-out active:scale-[0.975] active:bg-neutral-800 disabled:opacity-60"
        style={{ animationDelay: "140ms" }}
      >
        {isPending ? "Otevírání…" : "Otevřít ukázkový check-in"}
      </button>
    </Screen>
  );
}

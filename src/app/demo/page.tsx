"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, ViewTransition } from "react";
import { PageHeading } from "@/components/AppHeader";
import { Screen } from "@/components/Screen";
import { StepList } from "@/components/marketing/StepList";
import { CHECKIN_STEPS } from "@/lib/content";

export default function DemoPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
    <Screen desktop>
      <PageHeading
        title="Vyzkoušejte check-in"
        subtitle="Projděte ukázkovou rezervaci až ke kartě do Apple Wallet. Ukázková karta neodemyká dveře."
        aside={
          <Link
            href="/"
            transitionTypes={["nav-back"]}
            className="inline-flex min-h-11 min-w-11 items-center justify-center underline underline-offset-4 hover:text-ink"
          >
            Zpět na web
          </Link>
        }
      />

      <div className="guest-content mt-10">
      <StepList steps={CHECKIN_STEPS} />
      <p className="mt-6 text-sm leading-relaxed text-ink-2">
        Jde o&nbsp;testovací demo se smyšlenými údaji. Bez připojení k&nbsp;Bank iD
        nabídne označenou simulaci bez ověření totožnosti.
      </p>
      </div>

      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {isPending ? "Otevíráme ukázkovou rezervaci." : ""}
      </p>
      <div className="guest-actions" aria-busy={isPending}>
        <button
          type="button"
          onClick={() => startTransition(() => router.push("/checkin/room-101?token=abc", { transitionTypes: ["nav-forward"] }))}
          disabled={isPending}
          className="app-button w-full"
        >
          {isPending ? "Otevírání rezervace…" : "Otevřít ukázkovou rezervaci"}
        </button>
      </div>
    </Screen>
    </ViewTransition>
  );
}

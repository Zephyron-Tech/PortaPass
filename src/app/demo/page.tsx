"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PageHeading } from "@/components/AppHeader";
import { Screen } from "@/components/Screen";
import { StepList } from "@/components/marketing/StepList";
import { CHECKIN_STEPS } from "@/lib/content";

export default function DemoPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Screen>
      <PageHeading
        title="Digitální klíč od pokoje"
        subtitle="Ukázka odkazu, který host dostane e-mailem nebo SMS ještě před příjezdem do hotelu."
        aside={
          <Link
            href="/"
            className="transition-colors hover:text-neutral-900 focus-visible:text-neutral-900"
          >
            Zpět
          </Link>
        }
      />

      <StepList
        steps={CHECKIN_STEPS}
        className="animate-rise-in mt-12"
        style={{ animationDelay: "80ms" }}
      />

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

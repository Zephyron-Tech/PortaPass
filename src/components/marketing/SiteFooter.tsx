import Link from "next/link";
import { Container } from "@/components/marketing/Container";
import { COMPANY, CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/content";

const link =
  "inline-flex min-h-11 min-w-11 items-center py-2 transition-colors hover:text-ink focus-visible:text-ink";

const label = "text-[11px] font-medium uppercase tracking-[0.2em] text-ink-3";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <Container className="pt-14">
        {/* A two-block flex row (brand vs. nav) either left a huge gap with
            justify-between, or clumped both blocks together on the left with
            a fixed gap on wide screens. Neither scales. A grid with
            proportional columns fills the container's width at any size —
            note Container itself caps at max-w-[68rem], so these columns
            never stretch further no matter how wide the viewport is. */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1.3fr_1fr_1fr] sm:gap-12 lg:gap-16">
          <div>
            <p className={label}>PortaPass</p>
            <p className="mt-3 max-w-[32ch] text-[14px] leading-relaxed text-ink-3">
              Vizuální prototyp online check-inu a digitálního klíče pro nezávislé
              hotely. Ukázkový klíč neodemyká dveře.
            </p>
            <a href={CONTACT_MAILTO} className={`mt-2 text-[14px] text-ink-2 ${link}`}>
              {CONTACT_EMAIL}
            </a>
          </div>

          <nav aria-label="Produkt" className="flex flex-col items-start gap-1">
            <p className={label}>Produkt</p>
            <Link href="/demo" transitionTypes={["nav-forward"]} className={`mt-1 text-[14px] text-ink-2 ${link}`}>
              Demo
            </Link>
            <Link href="/#kontakt" className={`text-[14px] text-ink-2 ${link}`}>
              Kontakt
            </Link>
          </nav>

          <nav aria-label="Právní informace" className="flex flex-col items-start gap-1">
            <p className={label}>Právní</p>
            <Link href="/podminky" className={`mt-1 text-[14px] text-ink-2 ${link}`}>
              Podmínky použití
            </Link>
            <Link href="/ochrana-osobnich-udaju" className={`text-[14px] text-ink-2 ${link}`}>
              Ochrana osobních údajů
            </Link>
          </nav>
        </div>

        <p
          className="mt-12 border-t border-hairline pt-6 text-[13px] text-ink-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 3rem)" }}
        >
          © 2026 {COMPANY}
        </p>
      </Container>
    </footer>
  );
}

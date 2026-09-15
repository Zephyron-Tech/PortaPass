import Link from "next/link";
import { Container } from "@/components/marketing/Container";
import { COMPANY, CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/content";

const link =
  "inline-flex min-h-11 min-w-11 items-center py-2 transition-colors hover:text-ink focus-visible:text-ink";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <Container className="pt-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-3">
              PortaPass
            </p>
            <p className="mt-3 max-w-[32ch] text-[14px] leading-relaxed text-ink-3">
              Vizuální prototyp online check-inu a digitálního klíče pro nezávislé
              hotely. Ukázkový klíč neodemyká dveře.
            </p>
          </div>

          <nav className="flex flex-col items-start gap-1 text-[14px] text-ink-2">
            <Link href="/demo" className={link}>
              Demo
            </Link>
            <a href={CONTACT_MAILTO} className={link}>
              {CONTACT_EMAIL}
            </a>
            <Link href="/podminky" className={link}>
              Podmínky použití
            </Link>
            <Link href="/ochrana-osobnich-udaju" className={link}>
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

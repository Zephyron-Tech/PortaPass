import Link from "next/link";
import { Container } from "@/components/marketing/Container";
import { COMPANY, CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/content";

const link =
  "-my-2 py-2 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-4 focus-visible:text-neutral-900";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-900/10">
      <Container className="pt-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500">
              PortaPass
            </p>
            <p className="mt-3 max-w-[32ch] text-[14px] leading-relaxed text-neutral-500">
              Online check-in a digitální klíč od pokoje pro nezávislé hotely.
              Pilotní provoz.
            </p>
          </div>

          <nav className="flex flex-col items-start gap-3 text-[14px] text-neutral-600">
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
          className="mt-12 border-t border-neutral-900/10 pt-6 text-[13px] text-neutral-500"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 3rem)" }}
        >
          © 2026 {COMPANY}
        </p>
      </Container>
    </footer>
  );
}

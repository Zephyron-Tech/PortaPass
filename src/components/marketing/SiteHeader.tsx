import Link from "next/link";
import { Container } from "@/components/marketing/Container";
import { CONTACT_MAILTO } from "@/lib/content";

const link =
  "inline-flex min-h-11 min-w-11 items-center py-2 transition-colors hover:text-ink focus-visible:text-ink";

export function SiteHeader() {
  return (
    <header className="pt-8 md:pt-10">
      <Container>
        <nav className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className={`text-[11px] font-medium uppercase tracking-[0.24em] text-ink-3 ${link}`}
          >
            PortaPass
          </Link>
          <div className="flex items-center gap-4 text-[14px] text-ink-2 sm:gap-6">
            <Link href="/demo" className={link}>
              Demo
            </Link>
            <a href={CONTACT_MAILTO} className={link}>
              Kontakt
            </a>
          </div>
        </nav>
      </Container>
    </header>
  );
}

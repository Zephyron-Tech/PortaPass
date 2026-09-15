import Link from "next/link";
import { Container } from "@/components/marketing/Container";
import { CONTACT_MAILTO } from "@/lib/content";

const link =
  "-my-2 py-2 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-4 focus-visible:text-neutral-900";

export function SiteHeader() {
  return (
    <header className="pt-8 md:pt-10">
      <Container>
        <nav className="flex items-baseline justify-between gap-6">
          <Link
            href="/"
            className={`text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500 ${link}`}
          >
            PortaPass
          </Link>
          <div className="flex items-baseline gap-6 text-[14px] text-neutral-600">
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

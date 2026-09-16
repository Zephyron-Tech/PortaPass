import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/marketing/Container";

const link =
  "inline-flex min-h-11 min-w-11 items-center py-2 transition-colors hover:text-ink focus-visible:text-ink";

export function SiteHeader() {
  return (
    <header className="pt-8 md:pt-10">
      <Container>
        <nav className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className={`shrink-0 ${link}`}
          >
            <Image src="/brand/PortaPass Logo.png" alt="PortaPass" width={229} height={83} className="h-auto w-[110px]" priority />
          </Link>
          <div className="flex items-center gap-4 text-[14px] text-ink-2 sm:gap-6">
            <Link href="/demo" transitionTypes={["nav-forward"]} className={link}>
              Demo
            </Link>
            <Link href="/#kontakt" className={link}>
              Kontakt
            </Link>
          </div>
        </nav>
      </Container>
    </header>
  );
}

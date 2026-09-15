import type { Metadata } from "next";
import { KeyCard } from "@/components/KeyCard";
import { Container } from "@/components/marketing/Container";
import { Cta } from "@/components/marketing/Cta";
import { DeviceShot } from "@/components/marketing/DeviceShot";
import { Eyebrow, Section } from "@/components/marketing/Section";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { StepList } from "@/components/marketing/StepList";
import { CHECKIN_STEPS, CONTACT_MAILTO } from "@/lib/content";
import { findBookingByToken } from "@/lib/mockData";

export const metadata: Metadata = {
  title: "PortaPass — online check-in a digitální klíč pro nezávislé hotely",
  description:
    "Host se ověří bankovní identitou ještě před příjezdem a klíč od pokoje mu přistane do Apple Wallet. Bez fronty na recepci, bez plastových karet.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    siteName: "PortaPass",
    title: "PortaPass — digitální klíč od pokoje",
    description:
      "Online check-in s ověřením přes Bank iD a digitální klíč od pokoje v Apple Wallet. Pro nezávislé hotely a penziony.",
  },
};

// Same booking the demo uses, so the hero card and the demo never disagree.
const demoBooking = findBookingByToken("room-101", "abc");

const facts = [
  {
    value: "Září 2026",
    label: "První česká hotelová síť spustila odemykání pokojů telefonem.",
  },
  {
    value: "~10 000",
    label: "Ubytovacích zařízení v Česku, z nichž většina jsou nezávislé provozy.",
  },
  {
    value: "3 pracovní dny",
    label:
      "Lhůta pro nahlášení zahraničního hosta přes UbyPort. Pokuta až 50 000 Kč.",
  },
];

const capabilities = [
  {
    title: "Klíč v Apple Wallet",
    body: "Host si uloží klíč od pokoje do peněženky v telefonu. Žádná aplikace k instalaci, funguje i offline.",
  },
  {
    title: "Ověření přes Bank iD",
    body: "Totožnost hosta ověří jeho banka. Víte, že check-in provádí skutečně osoba uvedená na rezervaci.",
  },
  {
    title: "Podklady pro evidenci",
    body: "Ověřené údaje o hostovi jako základ pro domovní knihu a hlášení cizinců přes UbyPort.",
  },
  {
    title: "Napojení na váš systém",
    body: "Navrženo jako mezivrstva nad vaším PMS — Previo, Mews i další. Nemusíte měnit, na co jste zvyklí.",
  },
  {
    title: "Ve vašem brandu",
    body: "White-label řešení. Host vidí váš hotel, ne nás.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <Container className="pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div className="animate-rise-in">
              <Eyebrow>Pilotní program · přijímáme první hotely</Eyebrow>

              <h1 className="mt-6 max-w-[16ch] font-serif text-[2.4rem] leading-[1.06] tracking-[-0.015em] text-neutral-900 md:text-[3.25rem] lg:text-[3.6rem]">
                Online check-in a digitální klíč pro nezávislé hotely
              </h1>

              <p className="mt-6 max-w-[48ch] text-[16px] leading-relaxed text-neutral-600 md:text-[17px]">
                Host se ověří bankovní identitou ještě před příjezdem a klíč od
                pokoje mu přistane do Apple Wallet. Bez fronty na recepci, bez
                plastových karet.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Cta href="/demo">Vyzkoušet demo</Cta>
                <Cta href={CONTACT_MAILTO} variant="quiet" external>
                  Domluvit ukázku
                </Cta>
              </div>

              {/* The honesty beat belongs here, not only in the section far
                  below — this is the line that gets read. */}
              <p className="mt-7 max-w-[46ch] text-[14px] leading-relaxed text-neutral-500">
                Demo je funkční, ne video — odkaz, ověření přes Bank iD
                a podepsaný klíč v Apple Wallet. Samotné odemykání dveří
                zatím stavíme;{" "}
                <a
                  href="#pilot"
                  className="underline decoration-neutral-900/25 underline-offset-4 transition-colors hover:text-neutral-900"
                >
                  co už funguje a co ne
                </a>
                .
              </p>
            </div>

            {/* Live component, not a screenshot — always sharp, never stale,
                and it makes the LCP element text rather than an image. */}
            {demoBooking ? (
              <div
                className="animate-rise-in mx-auto w-full max-w-[26rem] lg:max-w-none"
                style={{ animationDelay: "120ms" }}
              >
                <KeyCard booking={demoBooking} />
                <p className="mt-4 text-center text-[13px] text-neutral-500">
                  Ukázkový klíč. Údaje jsou smyšlené.
                </p>
              </div>
            ) : null}
          </div>
        </Container>

        {/* Why now */}
        <Section
          eyebrow="Proč teď"
          heading="Řetězce už začaly. Nezávislé hotely se mohou svézt dřív."
          lead="Digitální klíč přestává být výsadou velkých značek. Host, který si v jednom hotelu odemkne pokoj telefonem, to bude čekat i příště — a nezávislé provozy mají výhodu, že se rozhodnou rychleji než korporátní centrála."
        >
          <dl className="mt-14 border-t border-neutral-900/10">
            {facts.map((fact) => (
              <div
                key={fact.value}
                className="flex flex-col gap-2 border-b border-neutral-900/10 py-6 sm:flex-row sm:items-baseline sm:gap-10"
              >
                <dt className="shrink-0 font-serif text-[1.5rem] leading-none text-neutral-900 sm:w-56">
                  {fact.value}
                </dt>
                <dd className="max-w-[54ch] text-[15px] leading-relaxed text-neutral-600">
                  {fact.label}
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* How it works */}
        <Section
          eyebrow="Jak to funguje"
          heading="Tři kroky, žádná instalace"
          lead="Host dostane odkaz e-mailem nebo SMS před příjezdem. Zbytek zvládne z telefonu cestou."
        >
          <StepList steps={CHECKIN_STEPS} className="mt-14 max-w-[42rem]" />
        </Section>

        {/* Demo screenshots */}
        <Section
          eyebrow="Ukázka"
          heading="Celý průchod hosta"
          lead="Funkční demo si můžete projít sami — od odkazu až po klíč uložený v Apple Wallet."
        >
          <div className="mt-14 grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
            <DeviceShot
              alt="Obrazovka online check-inu v telefonu"
              caption="Online check-in"
              className="sm:mt-8"
            />
            <DeviceShot
              alt="Ověření totožnosti přes Bank iD"
              caption="Ověření přes Bank iD"
            />
            <DeviceShot
              alt="Digitální klíč od pokoje uložený v Apple Wallet"
              caption="Klíč v Apple Wallet"
              className="sm:mt-8"
            />
          </div>

          <div className="mt-14">
            <Cta href="/demo">Otevřít demo</Cta>
          </div>
        </Section>

        {/* Capabilities */}
        <Section eyebrow="Co to řeší" heading="Co PortaPass hotelu přináší">
          <dl className="mt-14 border-t border-neutral-900/10">
            {capabilities.map((item) => (
              <div
                key={item.title}
                className="grid gap-2 border-b border-neutral-900/10 py-6 sm:grid-cols-[16rem_1fr] sm:gap-10"
              >
                <dt className="text-[15px] font-medium text-neutral-900">{item.title}</dt>
                <dd className="max-w-[56ch] text-[15px] leading-relaxed text-neutral-600">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* Pilot — the honest block */}
        <Section
          id="pilot"
          eyebrow="Pilotní program"
          heading="Hledáme první hotely, se kterými to dotáhneme"
          lead="Jsme na začátku a nechceme nic předstírat. Tady je přesně, co dnes funguje a co teprve stavíme."
        >
          <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500">
                Funguje dnes
              </h3>
              <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-neutral-700">
                <li>Online check-in na telefonu hosta</li>
                <li>Ověření totožnosti přes Bank iD</li>
                <li>Vydání digitálního klíče do Apple Wallet</li>
              </ul>
            </div>
            <div>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500">
                Stavíme
              </h3>
              <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-neutral-700">
                <li>
                  Samotné odemykání dveří — vyžaduje integraci s výrobcem zámků
                  (Salto, ASSA ABLOY / VingCard, dormakaba)
                </li>
                <li>Napojení na PMS a automatické hlášení přes UbyPort</li>
                <li>Klíč v Google Wallet</li>
              </ul>
            </div>
          </div>

          <div className="mt-16 border-t border-neutral-900/10 pt-10">
            <p className="max-w-[52ch] text-[16px] leading-relaxed text-neutral-600">
              Pokud vás to zajímá, ozvěte se. Domluvíme si ukázku a probereme,
              co by nasazení znamenalo právě u vás. Cenu stavíme individuálně
              podle velikosti provozu.
            </p>
            <div className="mt-8">
              <Cta href={CONTACT_MAILTO} external>
                Napsat nám
              </Cta>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}

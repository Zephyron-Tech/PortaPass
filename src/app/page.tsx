import type { Metadata } from "next";
import { BankIdLogo } from "@/components/bankid/BankIdLogo";
import { KeyCard } from "@/components/KeyCard";
import { Container } from "@/components/marketing/Container";
import { Cta } from "@/components/marketing/Cta";
import { DeviceShot } from "@/components/marketing/DeviceShot";
import { Band, Eyebrow, Section, SectionHeader } from "@/components/marketing/Section";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { CONTACT_MAILTO } from "@/lib/content";
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
    label: "Ubytovacích zařízení v Česku, z nichž většina jsou nezávislé provozy.",
  },
  {
    value: "3 pracovní dny",
    label:
      "Lhůta pro nahlášení zahraničního hosta přes UbyPort. Pokuta až 50 000 Kč.",
  },
];

const steps = [
  {
    title: "Odkaz před příjezdem",
    body: "Host dostane odkaz e-mailem nebo SMS spolu s potvrzením rezervace. Otevře se v prohlížeči, nic se neinstaluje.",
    alt: "Obrazovka online check-inu v telefonu hosta",
  },
  {
    title: "Ověření totožnosti",
    body: "Host se přihlásí svou bankou. Máte jistotu, že se ubytovává ten, kdo rezervoval — bez focení dokladů na recepci.",
    alt: "Ověření totožnosti hosta přes Bank iD",
    bankId: true,
  },
  {
    title: "Klíč v peněžence",
    body: "Klíč se uloží do Apple Wallet. Zůstane dostupný i bez signálu a na zamčené obrazovce telefonu.",
    alt: "Digitální klíč od pokoje uložený v Apple Wallet",
  },
];

const capabilities = [
  {
    title: "Klíč v Apple Wallet",
    body: "Host si uloží klíč od pokoje do peněženky v telefonu. Žádná aplikace k instalaci, funguje i offline.",
    wide: true,
  },
  {
    title: "Ověření přes Bank iD",
    body: "Totožnost hosta ověří jeho banka. Víte, že check-in provádí skutečně osoba uvedená na rezervaci.",
  },
  {
    title: "Podklady pro evidenci",
    body: "Ověřené údaje o hostovi jako základ pro domovní knihu a hlášení cizinců přes UbyPort.",
  },
  {
    title: "Napojení na váš systém",
    body: "Mezivrstva nad vaším PMS — Previo, Mews i další. Nemusíte měnit, na co jste zvyklí.",
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
        {/* ---- S1: hero + "Proč teď", fused so the card can stay stuck ---- */}
        <section className="hero-stage">
          <Container className="pt-16 pb-24 md:pt-24 md:pb-32">
            <div className="grid gap-16 lg:grid-cols-[1.05fr_0.9fr] lg:items-start lg:gap-20">
              {/* items-start is required: a stretched grid child has zero
                  sticky travel and would never stick. */}
              <div>
                <div className="animate-rise-in">
                  <Eyebrow>Pilotní program · přijímáme první hotely</Eyebrow>

                  <h1 className="mt-6 max-w-[15ch] font-serif text-[clamp(2.6rem,6.4vw,4.25rem)] leading-[1.02] tracking-[-0.022em] text-balance text-ink">
                    Online check-in a digitální klíč pro nezávislé hotely
                  </h1>

                  <p className="mt-7 max-w-[46ch] text-[18px] leading-[1.55] text-pretty text-ink-2 md:text-[20px]">
                    Host se ověří bankovní identitou ještě před příjezdem
                    a&nbsp;klíč od pokoje mu přistane do Apple Wallet. Bez
                    fronty na recepci, bez plastových karet.
                  </p>

                  <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <Cta href="/demo">Vyzkoušet demo</Cta>
                    <Cta href={CONTACT_MAILTO} variant="quiet" external>
                      Domluvit ukázku
                    </Cta>
                  </div>

                  {/* The honesty beat belongs here, not only in the band far
                      below — this is the line that actually gets read. */}
                  <p className="mt-7 max-w-[46ch] text-[15px] leading-[1.6] text-ink-3">
                    Demo je funkční, ne video — odkaz, ověření přes Bank iD
                    a&nbsp;podepsaný klíč v&nbsp;Apple Wallet. Samotné
                    odemykání dveří zatím stavíme;{" "}
                    <a
                      href="#pilot"
                      className="underline decoration-hairline-strong underline-offset-4 transition-colors hover:text-ink"
                    >
                      co už funguje a&nbsp;co ne
                    </a>
                    .
                  </p>
                </div>

                {/* "Proč teď" lives in the same column so the card has
                    something tall to stick against. */}
                <div className="mt-24 md:mt-32">
                  <SectionHeader
                    eyebrow="Proč teď"
                    heading="Řetězce už začaly. Nezávislé hotely se rozhodnou rychleji."
                    lead="Host, který si v jednom hotelu odemkne pokoj telefonem, to bude čekat i příště. Nezávislý provoz má přitom výhodu, že nemusí čekat na korporátní centrálu."
                  />

                  <dl className="mt-16 space-y-12">
                    {facts.map((fact, i) => (
                      <div key={fact.value} data-reveal data-reveal-step={i + 1}>
                        <dt className="font-serif text-[clamp(2.25rem,5vw,3rem)] leading-none text-ink">
                          {fact.value}
                        </dt>
                        <dd className="mt-3 max-w-[38ch] text-[17px] leading-[1.65] text-ink-2">
                          {fact.label}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* Live component, not a screenshot: sharp at any DPI, never
                  stale, and it keeps the LCP element as text. */}
              {demoBooking ? (
                <div className="mx-auto w-full max-w-[26rem] lg:sticky lg:top-24 lg:max-w-none">
                  <div className="hero-card">
                    <KeyCard booking={demoBooking} />
                  </div>
                  <p className="mt-5 text-center text-[14px] text-ink-3">
                    Ukázkový klíč. Údaje jsou smyšlené.
                  </p>
                </div>
              ) : null}
            </div>
          </Container>
        </section>

        {/* ---- S2: the walkthrough — mockups distributed one per step ---- */}
        <Section>
          <SectionHeader
            eyebrow="Průběh"
            heading="Tři obrazovky, žádná aplikace"
            lead="Host dostane odkaz před příjezdem. Zbytek zvládne z telefonu cestou k vám."
          />

          <div className="mt-20 space-y-24 md:space-y-32">
            {steps.map((step, i) => (
              <div
                key={step.title}
                data-reveal
                className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] md:gap-16"
              >
                <div className={i % 2 === 1 ? "md:order-last" : undefined}>
                  <span className="font-serif text-[2.75rem] leading-none tabular-nums text-ink-3/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-serif text-[1.75rem] leading-[1.15] tracking-[-0.015em] text-ink md:text-[2rem]">
                    {step.title}
                  </h3>
                  <p className="mt-4 max-w-[46ch] text-[17px] leading-[1.65] text-pretty text-ink-2">
                    {step.body}
                  </p>

                  {step.bankId ? (
                    /* Bank iD logotype: black on a plain light ground, well
                       above the 80px minimum, with its 16% clear zone. */
                    <div className="mt-8">
                      <span className="inline-block bg-white px-5 py-4 ring-1 ring-hairline">
                        <BankIdLogo width={104} title="Bank iD" />
                      </span>
                      <p className="mt-3 text-[14px] text-ink-3">
                        Ověření zajišťuje Bank iD — bankovní identita, kterou
                        v&nbsp;Česku používají miliony lidí.
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="mx-auto w-full max-w-[13rem] md:max-w-[17rem]">
                  <DeviceShot alt={step.alt} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- S3: thin interlude — deliberately breaks the rhythm ---- */}
        <section className="border-t border-hairline">
          <Container className="flex flex-col items-center gap-7 py-16 text-center">
            <p className="max-w-[40ch] text-[18px] leading-[1.55] text-ink-2">
              Celý průchod si můžete projít sami. Nejlépe rovnou v&nbsp;telefonu.
            </p>
            <Cta href="/demo">Otevřít demo</Cta>
          </Container>
        </section>

        {/* ---- S4: capabilities — asymmetric grid, not another list ---- */}
        <Section>
          <SectionHeader eyebrow="Co to řeší" heading="Co PortaPass hotelu přináší" />

          <div className="mt-16 grid gap-px overflow-hidden bg-hairline md:grid-cols-2">
            {capabilities.map((item) => (
              <div
                key={item.title}
                data-reveal="row"
                className={`bg-[#faf9f7] px-6 py-10 sm:px-8 ${
                  item.wide ? "md:col-span-2" : ""
                }`}
              >
                <h3
                  className={`font-serif tracking-[-0.015em] text-ink ${
                    item.wide ? "text-[1.75rem] md:text-[2rem]" : "text-[1.35rem]"
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`mt-3 text-[17px] leading-[1.65] text-pretty text-ink-2 ${
                    item.wide ? "max-w-[52ch]" : "max-w-[42ch]"
                  }`}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- S5: the dark band — the honest block ---- */}
        <Band id="pilot">
          <SectionHeader
            tone="dark"
            eyebrow="Pilotní program"
            heading="Hledáme první hotely, se kterými to dotáhneme"
            lead="Jsme na začátku a nechceme nic předstírat. Tady je přesně, co dnes funguje a co teprve stavíme."
          />

          <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-16">
            <div data-reveal>
              <h3 className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.18em] text-band-ink-faint">
                <span aria-hidden className="h-px w-6 bg-accent" />
                Funguje dnes
              </h3>
              <ul className="mt-6 space-y-4 text-[17px] leading-[1.6] text-band-ink-muted">
                <li>Online check-in na telefonu hosta</li>
                <li>Ověření totožnosti přes Bank iD</li>
                <li>Vydání digitálního klíče do Apple Wallet</li>
              </ul>
            </div>
            <div data-reveal>
              <h3 className="text-[12px] font-medium uppercase tracking-[0.18em] text-band-ink-faint">
                Stavíme
              </h3>
              <ul className="mt-6 space-y-4 text-[17px] leading-[1.6] text-band-ink-muted">
                <li>
                  Samotné odemykání dveří — vyžaduje integraci s&nbsp;výrobcem
                  zámků (Salto, ASSA ABLOY / VingCard, dormakaba)
                </li>
                <li>Napojení na PMS a&nbsp;automatické hlášení přes UbyPort</li>
                <li>Klíč v&nbsp;Google Wallet</li>
              </ul>
            </div>
          </div>

          <div className="mt-16 border-t border-band-hairline pt-12">
            <p className="max-w-[52ch] text-[18px] leading-[1.6] text-pretty text-band-ink-muted">
              Odemykání dveří není otázka kódu, ale smlouvy s&nbsp;výrobcem
              zámků. S&nbsp;konkrétním hotelem za zády se taková smlouva
              vyjednává jinak než s&nbsp;prezentací.
            </p>
            <div className="mt-9">
              <Cta href={CONTACT_MAILTO} variant="inverse" external>
                Napsat nám
              </Cta>
            </div>
          </div>
        </Band>

        {/* ---- S6: quiet close. Also keeps the footer hairline off the
                 band's bottom edge, where it would read as a mistake. ---- */}
        <Section bordered={false}>
          <div className="flex flex-col items-center gap-7 text-center">
            <h2 className="max-w-[18ch] font-serif text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.1] tracking-[-0.018em] text-balance text-ink">
              Podíváte se na to?
            </h2>
            <p className="max-w-[44ch] text-[17px] leading-[1.6] text-pretty text-ink-2">
              Ukázka trvá minutu. Když bude co řešit, ozve se vám člověk, který
              to staví.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Cta href="/demo">Vyzkoušet demo</Cta>
              <Cta href={CONTACT_MAILTO} variant="quiet" external>
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

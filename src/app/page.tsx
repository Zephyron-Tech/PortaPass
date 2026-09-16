import type { Metadata } from "next";
import Image from "next/image";
import { ViewTransition } from "react";
import { BankIdLogo } from "@/components/bankid/BankIdLogo";
import { KeyCard } from "@/components/KeyCard";
import { Container } from "@/components/marketing/Container";
import { Cta } from "@/components/marketing/Cta";
import { DeviceShot } from "@/components/marketing/DeviceShot";
import { LeadForm } from "@/components/marketing/LeadForm";
import { Band, Eyebrow, Section, SectionHeader } from "@/components/marketing/Section";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { findBookingByToken } from "@/lib/mockData";

export const metadata: Metadata = {
  title: "PortaPass – ukázka online check-inu pro nezávislé hotely",
  description: "Vyzkoušejte ověření hosta a ukázkový průkaz do Apple Wallet. Pilotní projekt pro nezávislé hotely; vydaný průkaz neodemyká dveře.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: "cs_CZ", siteName: "PortaPass",
    title: "PortaPass – check-in začíná před příjezdem",
    description: "Funkční prototyp ověření hosta a ukázkového průkazu do Apple Wallet. Odemykání dveří vyžaduje partnerství s výrobcem zámků.",
  },
};

const demoBooking = findBookingByToken("room-101", "abc");
const decisions = [
  { title: "Nejdřív zkušenost hosta", body: "Projděte si ukázkový odkaz na vlastním telefonu. Bez instalace hotelové aplikace." },
  { title: "Potom váš provoz", body: "Společně projdeme způsob rezervací, práci recepce a systém, který už používáte." },
  { title: "Zámky až s partnerem", body: "Skutečný přístup do pokoje vyžaduje smlouvu a integraci s certifikovaným výrobcem zámků." },
];
const steps = [
  { title: "Jeden odkaz", body: "V demu otevřete smyšlenou rezervaci. V budoucím provozu by host odkaz dostal před příjezdem; rozesílání e-mailů a SMS zatím není součástí prototypu.", alt: "Ukázka odkazu na check-in v telefonu", src: "/mockups/mockup1.png" },
  { title: "Ověření přes Bank iD", body: "Prototyp podporuje ověření v testovacím prostředí Bank iD. Bez připojení k Bank iD nabídne označenou simulaci. Porovnání totožnosti s držitelem rezervace zatím neprovádíme.", alt: "Ukázka ověření totožnosti přes Bank iD", bankId: true, src: "/mockups/mockup2.png" },
  { title: "Ukázkový klíč ve Wallet", body: "Na iPhonu si uložíte podepsaný ukázkový průkaz do Apple Wallet. Zůstane dostupný i offline. Je to vizuální ukázka, nikoli přístupový klíč: dveře neodemyká.", alt: "Ukázkový klíč připravený k přidání do Apple Wallet", src: "/mockups/mockup3.png" },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <ViewTransition
        enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
        exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
        default="none"
      >
      <main id="main-content" className="flex-1">
        <section className="hero-stage">
          <Container className="pt-12 pb-20 md:pt-20 md:pb-28">
            <div className="hero-grid">
              <div className="hero-intro">
                <Eyebrow>Pilotní program pro nezávislé hotely</Eyebrow>
                <h1 className="mt-6 max-w-[16ch] font-serif text-[clamp(2.75rem,5.4vw,4.25rem)] leading-[1.08] tracking-[-0.025em] text-balance text-ink">Check-in začíná před příjezdem.</h1>
                <p className="mt-6 max-w-[40ch] text-[18px] leading-[1.6] text-pretty text-ink-2 md:text-[20px]">Ověření hosta a&nbsp;ukázkový klíč do Apple Wallet. Vyzkoušejte, jak by mohl vypadat příjezd do vašeho hotelu.</p>
              </div>
              {demoBooking ? (
                <div className="hero-card-sticky">
                  <div className="hero-card-scene">
                    {/* Pure CSS scroll-timeline drives the rotation (see
                        .hero-card in globals.css) — no JS wrapper needed. A
                        hand-rolled wheel-smoothing layer used to sit here,
                        overlaying a second Animation on the same transform
                        and hard-cancelling it on pointerdown/keydown/resize
                        mid-lerp with no reconciliation, which could snap
                        visibly against the live CSS value. Removed. */}
                    <div className="hero-card">
                      <div className="hero-card-front"><KeyCard booking={demoBooking} /></div>
                      <div className="hero-card-back" aria-hidden="true">
                        <span className="text-[12px] font-medium uppercase tracking-[0.22em]">PortaPass</span>
                        <span className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] leading-tight">Váš příjezd.<br />Váš hotel.</span>
                        <span className="border-t border-white/25 pt-3 text-[12px] text-white/75">Ukázkový průkaz · neodemyká dveře</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-6 text-center text-[14px] leading-relaxed text-ink-3 lg:hidden">Ukázkový klíč. Neodemyká dveře.</p>
                </div>
              ) : null}
              <div className="hero-actions-block">
                <div className="hero-actions">
                  <Cta href="/demo" transitionTypes={["nav-forward"]}>Vyzkoušet demo</Cta>
                  <Cta href="#kontakt" variant="quiet" external>Domluvit ukázku</Cta>
                </div>
                <a href="#pilot" className="mt-2 inline-flex min-h-11 items-center text-[15px] text-ink-2 underline underline-offset-4">Co funguje dnes a&nbsp;co stavíme</a>
              </div>
              <div className="hero-reasons">
                <SectionHeader heading="Nejdřív si to vyzkoušejte. Pak se rozhodněte." />
                <dl className="mt-10 space-y-8">
                  {decisions.map((item, i) => (
                    <div key={item.title} data-reveal data-reveal-step={i + 1} className="border-t border-hairline pt-6">
                      <dt className="font-serif text-[1.6rem] leading-tight text-ink">{item.title}</dt>
                      <dd className="mt-3 max-w-[42ch] text-[17px] leading-[1.65] text-ink-2">{item.body}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Container>
        </section>
        <Section>
          <SectionHeader heading="Od odkazu po peněženku" lead="Tři části ukázky. Žádná hotelová aplikace." />
          <div className="mt-14 space-y-16 md:space-y-20">
            {steps.map((step, i) => (
              <div key={step.title} className={`walkthrough-step ${i === 1 ? "walkthrough-reverse" : ""} ${i === 2 ? "walkthrough-finish" : ""}`}>
                <div data-reveal className="walkthrough-copy">
                  <span aria-hidden="true" className="font-serif text-[2.5rem] leading-none tabular-nums text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 font-serif text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.15] tracking-[-0.015em] text-ink">{step.title}</h3>
                  <p className="mt-4 max-w-[46ch] text-[17px] leading-[1.65] text-pretty text-ink-2">{step.body}</p>
                  {step.bankId ? (
                    <div className="mt-6">
                      <span className="inline-block bg-white px-5 py-4 ring-1 ring-hairline"><BankIdLogo width={108} title="Bank iD" /></span>
                      <p className="mt-3 text-[14px] leading-relaxed text-ink-3">Ověření v&nbsp;testovacím prostředí Bank iD.</p>
                    </div>
                  ) : null}
                  {i === 2 ? <div className="mt-7"><Cta href="/demo" transitionTypes={["nav-forward"]}>Vyzkoušet demo</Cta></div> : null}
                </div>
                <div className="walkthrough-device"><DeviceShot src={step.src} alt={step.alt} priority={i === 0} /></div>
              </div>
            ))}
          </div>
        </Section>
        <Section>
          <SectionHeader heading="Co má navazovat na pilot" lead="Tahle propojení zatím nejsou hotová. Jejich rozsah určíme s prvním hotelem." />
          <div className="mt-10 divide-y divide-hairline border-y border-hairline">
            {[
              ["Váš rezervační systém", "Plánujeme napojení na PMS, například Previo nebo Mews. Dnes používáme pouze smyšlenou rezervaci."],
              ["Evidence hostů", "Údaje z ověření mohou být základem pro evidenci. Domovní knihu ani automatické hlášení přes UbyPort zatím prototyp nevede."],
              ["Jméno vašeho hotelu", "Vlastní vzhled a komunikaci hotelu připravíme v rámci pilotu. Současná ukázka nese značku PortaPass."],
            ].map(([title, body]) => (
              <div key={title} data-reveal className="grid gap-4 py-8 md:grid-cols-[1fr_1.5fr] md:gap-12">
                <h3 className="font-serif text-[1.6rem] leading-tight text-ink">{title}</h3>
                <p className="max-w-[50ch] text-[17px] leading-[1.65] text-ink-2">{body}</p>
              </div>
            ))}
          </div>
        </Section>
        <Band id="pilot">
          <SectionHeader tone="dark" eyebrow="Pilotní program" heading="Hledáme hotel, se kterým uděláme další krok" lead="Prototyp si můžete projít už dnes. Skutečný provoz vyžaduje další integrace a smlouvy." />
          <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-16">
            <div data-reveal>
              <h3 className="flex items-center gap-3 text-[13px] font-medium uppercase tracking-[0.14em] text-band-ink"><span aria-hidden="true" className="h-px w-6 bg-accent" />Funguje dnes</h3>
              <ul className="mt-6 space-y-4 text-[17px] leading-[1.65] text-band-ink-muted">
                <li>Ukázkový check-in se smyšlenou rezervací</li>
                <li>Bank iD v&nbsp;testovacím prostředí, případně označená simulace bez ověření totožnosti</li>
                <li>Podepsaný ukázkový průkaz do Apple Wallet při nastavených certifikátech</li>
              </ul>
            </div>
            <div data-reveal>
              <h3 className="text-[13px] font-medium uppercase tracking-[0.14em] text-band-ink">Stavíme</h3>
              <ul className="mt-6 space-y-4 text-[17px] leading-[1.65] text-band-ink-muted">
                <li>Odemykání dveří: vyžaduje obchodní partnerství a&nbsp;integraci s&nbsp;výrobcem zámků (Salto, ASSA ABLOY / VingCard, dormakaba)</li>
                <li>Napojení na PMS a&nbsp;automatické hlášení přes UbyPort</li>
                <li>Klíč v&nbsp;Google Wallet</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-band-hairline pt-10">
            <p className="max-w-[56ch] text-[18px] leading-[1.6] text-band-ink-muted">Odemykání není jen otázka kódu. Bez partnerství s&nbsp;výrobcem zámků nelze vydávat skutečné přístupové klíče. Ukázkový průkaz proto dveře neodemyká.</p>
            <div className="mt-8"><Cta href="#kontakt" variant="inverse" external>Domluvit ukázku</Cta></div>
          </div>
        </Band>
        <Section bordered={false}>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
            <div className="max-w-[40rem]">
              <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.018em] text-ink">Projděte si příjezd očima hosta.</h2>
              <p className="mt-5 max-w-[44ch] text-[17px] leading-[1.65] text-ink-2">Nejlépe na iPhonu, kde si ukázkový průkaz přidáte do Apple Wallet. Na ostatních zařízeních si můžete projít ověření.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Cta href="/demo" transitionTypes={["nav-forward"]}>Vyzkoušet demo</Cta>
                <Cta href="#kontakt" variant="quiet" external>Domluvit ukázku</Cta>
              </div>
            </div>
            <div className="relative mx-auto aspect-[2354/2188] w-full max-w-[24rem]">
              <Image
                src="/mockups/mockup4.png"
                alt="Ukázkový průkaz otevřený v Apple Wallet na iPhonu"
                fill
                sizes="(min-width: 1024px) 24rem, 80vw"
                quality={90}
                className="object-contain"
                style={{
                  maskImage: "linear-gradient(to bottom, black 70%, transparent 96%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 96%)",
                }}
              />
            </div>
          </div>
        </Section>
        <Section id="kontakt">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-20">
            <div>
              <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] text-ink">Domluvme si ukázku.</h2>
              <p className="mt-5 max-w-[38ch] text-[17px] leading-relaxed text-ink-2">Napište, pro který hotel PortaPass zvažujete. Ozveme se vám a&nbsp;domluvíme společný průchod ukázkou.</p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-3">Stačí název hotelu a&nbsp;e-mail. Telefon i&nbsp;zpráva jsou nepovinné.</p>
            </div>
            <LeadForm />
          </div>
        </Section>
      </main>
      </ViewTransition>
      <SiteFooter />
    </>
  );
}

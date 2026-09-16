import type { Metadata } from "next";
import { LegalPage, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Podmínky použití",
  description: "Podmínky používání služby PortaPass.",
  alternates: { canonical: "/podminky" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Podmínky použití" updated="15. 9. 2026">
      <Section heading="Provozovatel">
        Službu PortaPass provozuje společnost Zephyron Tech s.r.o., IČO 23793538,
        zapsaná v obchodním rejstříku.
      </Section>

      <Section heading="Povaha služby">
        PortaPass umožňuje hostům ubytovacích zařízení provést online check-in,
        ověřit svou totožnost a uložit si digitální klíč od pokoje do peněženky
        v mobilním telefonu.
      </Section>

      <Section heading="Zkušební provoz">
        Služba je aktuálně provozována ve zkušebním režimu (proof of concept) pro
        účely předvedení funkčnosti. Vydaný digitální klíč slouží jako vizuální
        ukázka a neodemyká dveře hotelového pokoje. Dostupnost služby není
        garantována.
      </Section>

      <Section heading="Odpovědnost">
        Provozovatel neodpovídá za škodu vzniklou nedostupností služby ve
        zkušebním provozu. Za rezervaci, ubytování a přístup do pokoje odpovídá
        příslušné ubytovací zařízení.
      </Section>

      <Section heading="Kontakt">
        Dotazy směřujte na <a href="mailto:hello@zephyron.tech">hello@zephyron.tech</a>.
      </Section>
    </LegalPage>
  );
}

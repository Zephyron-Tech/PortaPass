import type { Metadata } from "next";
import { LegalPage, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů — PortaPass",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Ochrana osobních údajů" updated="15. 9. 2026">
      <Section heading="Správce">
        Zephyron Tech s.r.o., IČO 23793538. Kontakt:{" "}
        <a href="mailto:hello@zephyron.tech">hello@zephyron.tech</a>.
      </Section>

      <Section heading="Jaké údaje zpracováváme">
        Při ověření totožnosti prostřednictvím Bank iD získáváme pouze údaje
        odpovídající rozsahu, který nám udělíte souhlasem ve své bance: jméno a
        příjmení, datum narození a — je-li vyžádáno — údaje o dokladu totožnosti.
        Nežádáme rodné číslo ani údaje o platebních účtech.
      </Section>

      <Section heading="Účel zpracování">
        Údaje slouží výhradně k ověření, že check-in provádí osoba uvedená na
        rezervaci, a k vydání digitálního klíče od pokoje.
      </Section>

      <Section heading="Doba uložení">
        Ve zkušebním provozu neukládáme získané údaje do žádné databáze. Údaje
        existují pouze po dobu nezbytnou k vydání klíče, v podepsaném dočasném
        cookie s platností 15 minut, a poté zanikají.
      </Section>

      <Section heading="Předávání">
        Údaje nepředáváme třetím stranám ani je nevyužíváme k marketingu.
        Ověření totožnosti technicky zajišťuje Bankovní identita, a.s.
      </Section>

      <Section heading="Vaše práva">
        Máte právo na přístup k údajům, jejich opravu či výmaz, na omezení
        zpracování a právo vznést námitku. Uplatnit je můžete na kontaktní
        adrese výše. Rovněž máte právo podat stížnost u Úřadu pro ochranu
        osobních údajů.
      </Section>
    </LegalPage>
  );
}

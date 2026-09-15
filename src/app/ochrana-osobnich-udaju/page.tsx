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
        Údaje slouží k ověření totožnosti a k vydání ukázkového digitálního klíče.
        Prototyp neověřuje shodu totožnosti s rezervací. Ukázkový klíč neodemyká dveře.
      </Section>

      <Section heading="Doba uložení">
        Údaje získané při ověření přes Bank iD neukládáme do databáze. Tyto údaje
        existují pouze po dobu nezbytnou k vydání klíče, v podepsaném dočasném
        cookie s platností 15 minut, a poté zanikají.
      </Section>

      <Section heading="Poptávka ukázky">
        Při odeslání kontaktního formuláře zpracováváme název hotelu a&nbsp;e-mail,
        případně vámi uvedený telefon a&nbsp;zprávu. Slouží k&nbsp;vyřízení poptávky
        a&nbsp;navazující komunikaci, nikoli k&nbsp;rozesílání reklamních sdělení.
        Zpracování je založeno na našem oprávněném zájmu odpovídat na obchodní poptávky.
        Zpráva je doručena do naší e-mailové schránky prostřednictvím služby Resend
        (Plus Five Five, Inc.), která zajišťuje technické zpracování doručení.
        Korespondenci uchováváme po dobu vyřizování poptávky a&nbsp;navazujícího jednání;
        po jeho ukončení ji odstraníme, pokud není dále potřebná pro smluvní vztah
        nebo splnění zákonné povinnosti. Výmaz z&nbsp;e-mailové schránky není automatizován touto aplikací.
      </Section>

      <Section heading="Předávání">
        Ověření totožnosti technicky zajišťuje Bankovní identita, a.s.
        Kontaktní poptávky zpracovávají také poskytovatelé hostingu, služby Resend
        a&nbsp;naší e-mailové schránky v&nbsp;rozsahu potřebném pro přijetí a&nbsp;doručení zprávy.
        Služba Resend může údaje zpracovávat mimo Evropský hospodářský prostor;
        podmínky zpracování a&nbsp;záruky předávání upravuje její smlouva o&nbsp;zpracování údajů.
        Údaje neprodáváme ani je nepoužíváme k&nbsp;nevyžádanému marketingu.
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

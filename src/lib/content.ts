/** Copy shared between the marketing page and the demo. */
import type { WalkthroughStep } from "@/components/marketing/WalkthroughPeel";

export const CONTACT_EMAIL = "hello@zephyron.tech";

/** Prefilled subject so inbound pilot enquiries are triageable. */
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "PortaPass – pilotní program",
)}`;

export const COMPANY = "Zephyron Tech s.r.o., IČO 23793538";

export const CHECKIN_STEPS = [
  "Otevření ukázkové rezervace",
  "Ověření nebo simulace podle konfigurace",
  "Ukázková karta do Apple Wallet",
];

export const PILOT_DECISIONS = [
  { title: "Nejdřív zkušenost hosta", body: "Projděte si ukázkový odkaz na vlastním telefonu. Bez instalace hotelové aplikace." },
  { title: "Potom váš provoz", body: "Společně projdeme způsob rezervací, práci recepce a systém, který už používáte." },
  { title: "Zámky řešíme s partnerem", body: "Napojení na zámkový systém domluvíme s certifikovaným výrobcem (Salto, ASSA ABLOY, dormakaba) přímo pro váš hotel." },
];

export const HOME_WALKTHROUGH_STEPS: WalkthroughStep[] = [
  { title: "Jeden odkaz", body: "Host dostane odkaz na rezervaci ještě před příjezdem. Stačí kliknout – žádná aplikace, žádné čekání na recepci.", alt: "Ukázka odkazu na check-in v telefonu", src: "/mockups/mockup1.png" },
  { title: "Ověření přes Bank iD", body: "Totožnost hosta ověříme bezpečně přes Bank iD, přímo v telefonu.", alt: "Ukázka ověření totožnosti přes Bank iD", bankId: true, src: "/mockups/mockup2.png" },
  { title: "Ukázkový klíč ve Wallet", body: "Na iPhonu si uložíte podepsaný ukázkový průkaz do Apple Wallet. Zůstane dostupný i offline.", alt: "Ukázkový klíč připravený k přidání do Apple Wallet", src: "/mockups/mockup3.png" },
];

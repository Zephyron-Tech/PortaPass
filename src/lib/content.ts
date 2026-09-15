/** Copy shared between the marketing page and the demo. */

export const CONTACT_EMAIL = "hello@zephyron.tech";

/** Prefilled subject so inbound pilot enquiries are triageable. */
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "PortaPass – pilotní program",
)}`;

export const COMPANY = "Zephyron Tech s.r.o., IČO 23793538";

export const CHECKIN_STEPS = [
  "Ověření totožnosti",
  "Digitální klíč do peněženky",
  "Odemknutí pokoje telefonem",
];

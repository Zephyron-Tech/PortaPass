import { createHash } from "node:crypto";
import type { MockBooking } from "@/lib/mockData";

const BASE_URL = process.env.APP_BASE_URL ?? "https://portapass.zephyron.tech";

// Matches pass.json's backgroundColor (rgb(222,226,214)) so both wallets
// render the same card color.
const BACKGROUND_COLOR = "#dee2d6";

// Same demo disclaimer as the Apple pass's backFields entry (pass.json) —
// the fact that this is a visual sample that doesn't unlock doors is a real
// constraint, not tone, and has to read identically on both wallets.
const DISCLAIMER =
  "Tento klíč je vizuální ukázka pro účely předvedení služby a neodemyká dveře hotelového pokoje.";

/**
 * A real PIN would come from the lock vendor integration (see
 * lib/apple-wallet's own "no NFC field" note — neither wallet actually
 * unlocks anything yet). For the demo, derive a stable 6-digit PIN from the
 * booking token so the same booking always gets the same pass content.
 */
export function mockAccessPin(token: string): string {
  const digest = createHash("sha256").update(token).digest("hex");
  return String(Number.parseInt(digest.slice(0, 8), 16) % 1_000_000).padStart(6, "0");
}

/** Minimal shape of the Google Wallet Generic pass object we send — only
 * the fields this app actually sets, not the full Google API surface. */
export type GenericObject = {
  id: string;
  classId: string;
  state: "ACTIVE";
  hexBackgroundColor: string;
  logo: { sourceUri: { uri: string }; contentDescription: { defaultValue: { language: string; value: string } } };
  heroImage: { sourceUri: { uri: string }; contentDescription: { defaultValue: { language: string; value: string } } };
  cardTitle: { defaultValue: { language: string; value: string } };
  header: { defaultValue: { language: string; value: string } };
  subheader: { defaultValue: { language: string; value: string } };
  textModulesData: { id: string; header: string; body: string }[];
  barcode: { type: "QR_CODE"; value: string; alternateText: string };
};

export function buildGenericObject(config: { issuerId: string; classId: string }, booking: MockBooking): GenericObject {
  const pin = mockAccessPin(booking.token);
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("cs-CZ", { timeZone: "UTC" });

  return {
    // Stable per booking (not a random UUID) so re-saving the same
    // reservation updates the existing pass instead of creating a duplicate
    // — Google Wallet's own recommendation for object ids.
    id: `${config.issuerId}.${booking.roomId}-${booking.token}`,
    classId: config.classId,
    state: "ACTIVE",
    hexBackgroundColor: BACKGROUND_COLOR,
    // Apple's header/primary fields are pushed at pass-generation time from
    // this same booking data (see apple-wallet/passkit.ts); mapped here to
    // Google's equivalent object-level fields for the same visual result.
    logo: {
      // encodeURI: the existing brand asset's filename has a space in it.
      sourceUri: { uri: encodeURI(`${BASE_URL}/brand/PortaPass Logo small.png`) },
      contentDescription: { defaultValue: { language: "cs-CZ", value: "PortaPass" } },
    },
    // TODO: export the Apple pass's own background art (passkit-model/
    // roomkey.pass/background@2x.png) to public/ and point this at it once
    // it has a public URL, for pixel-parity with the Apple card art.
    heroImage: {
      sourceUri: { uri: `${BASE_URL}/mockups/mockup4.png` },
      contentDescription: { defaultValue: { language: "cs-CZ", value: `Ukázkový klíč pro ${booking.hotelName}` } },
    },
    cardTitle: { defaultValue: { language: "cs-CZ", value: booking.hotelName } },
    header: { defaultValue: { language: "cs-CZ", value: `Pokoj ${booking.roomNumber}` } },
    subheader: { defaultValue: { language: "cs-CZ", value: `Host: ${booking.guestName}` } },
    textModulesData: [
      { id: "checkIn", header: "Check-in", body: formatDate(booking.checkIn) },
      { id: "checkOut", header: "Check-Out", body: formatDate(booking.checkOut) },
      { id: "accessPin", header: "Přístupový PIN", body: pin },
      { id: "disclaimer", header: "ZKUŠEBNÍ PROVOZ", body: DISCLAIMER },
    ],
    barcode: { type: "QR_CODE", value: pin, alternateText: pin },
  };
}

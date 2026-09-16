import fs from "node:fs";
import path from "node:path";
import { PKPass } from "passkit-generator";
import type { MockBooking } from "./mockData";

const MODEL_PATH = path.join(process.cwd(), "src/passkit-model/roomkey.pass");

/**
 * Certificates are never committed. Two ways to provide them:
 *
 * 1. Local dev: APPLE_*_CERT_PATH env vars pointing at PEM files in ./certs
 *    (gitignored). See certs/README.md.
 * 2. Deployed (Vercel etc.): the filesystem certs/ folder doesn't exist in
 *    the deployment bundle, so use APPLE_*_CERT_BASE64 env vars instead —
 *    base64-encoded PEM contents, set directly in the platform's env var UI.
 */
function readCert(base64EnvVar: string, pathEnvVar: string): Buffer | undefined {
  const base64 = process.env[base64EnvVar];
  if (base64) {
    return Buffer.from(base64, "base64");
  }

  const filePath = process.env[pathEnvVar];
  if (filePath) {
    return fs.readFileSync(filePath);
  }

  return undefined;
}

function loadCertificates() {
  const wwdr = readCert("APPLE_WWDR_CERT_BASE64", "APPLE_WWDR_CERT_PATH");
  const signerCert = readCert("APPLE_SIGNER_CERT_BASE64", "APPLE_SIGNER_CERT_PATH");
  const signerKey = readCert("APPLE_SIGNER_KEY_BASE64", "APPLE_SIGNER_KEY_PATH");
  const signerKeyPassphrase = process.env.APPLE_SIGNER_KEY_PASSPHRASE;

  if (!wwdr || !signerCert || !signerKey) {
    return null;
  }

  return {
    wwdr,
    signerCert,
    signerKey,
    // Omit entirely rather than pass "" — passkit-generator's schema rejects
    // an empty-string passphrase outright.
    ...(signerKeyPassphrase ? { signerKeyPassphrase } : {}),
  };
}

export class CertificatesNotConfiguredError extends Error {
  constructor() {
    super(
      "Certifikáty pro Apple Wallet nejsou nastavené. Nastavte APPLE_WWDR_CERT_PATH, " +
        "APPLE_SIGNER_CERT_PATH a APPLE_SIGNER_KEY_PATH — viz certs/README.md.",
    );
    this.name = "CertificatesNotConfiguredError";
  }
}

export async function generateRoomKeyPass(booking: MockBooking): Promise<Buffer> {
  const certificates = loadCertificates();
  if (!certificates) {
    throw new CertificatesNotConfiguredError();
  }

  const pass = await PKPass.from(
    {
      model: MODEL_PATH,
      certificates,
    },
    {
      serialNumber: `${booking.roomId}-${booking.token}`,
    },
  );

  // Field content and labels match the Pass Designer export exactly (see
  // pass.json's original source): a header showing the room, a primary
  // field for the guest, and check-in/check-out as native Apple date
  // fields (dateStyle formats them per the device's own locale, rather
  // than a hand-rolled string). The room/guest/dates also appear inside
  // the background art's own branded card graphic — that's intentional
  // duplication in the design, not a bug: the header/footer rows are
  // Apple's own glanceable chrome, the art underneath is the styled
  // presentation.
  const headerField = { key: "roomNo", label: "Pokoj", value: booking.roomNumber };
  const primaryField = { key: "memberName", label: "Host", value: booking.guestName };
  const checkInField = {
    key: "checkIn",
    label: "Check-in",
    value: new Date(booking.checkIn).toISOString(),
    dateStyle: "PKDateStyleShort" as const,
  };
  const checkOutField = {
    key: "checkOut",
    label: "Check-Out",
    value: new Date(booking.checkOut).toISOString(),
    dateStyle: "PKDateStyleShort" as const,
  };

  // The model declares both "generic" (legacy iOS) and "posterGeneric"
  // (iOS/watchOS 27+ poster-style Wallet passes) — see pass.json. Wallet
  // prioritizes posterGeneric over generic whenever both are present, on
  // devices that support it (Apple's own docs on "Creating a poster
  // generic pass"), which is what was actually rendering on a real
  // device — and posterGeneric's layout has NO secondaryFields slot at
  // all: it's headerFields, primaryFields, footerFields (max 2), and
  // backFields. Check-in/check-out pushed into secondaryFields there were
  // silently dropped, not missing data — legacy "generic" needs them in
  // secondaryFields, posterGeneric needs the exact same two fields in
  // footerFields instead.
  for (const passType of pass.types) {
    passType.headerFields.push(headerField);
    passType.primaryFields.push(primaryField);
    if (passType.type === "posterGeneric") {
      passType.footerFields.push(checkInField, checkOutField);
    } else {
      passType.secondaryFields.push(checkInField, checkOutField);
    }
  }

  // No NFC field: Apple's NFC pass field requires a real EC public key —
  // a placeholder string fails iOS's install-time validation silently (pass
  // shows the "Add to Wallet" prompt but never actually installs). Real
  // door-unlock NFC requires a certified lock vendor's credential manager
  // (Salto, VingCard/Assa Abloy, dormakaba) anyway — see ROADMAP.md. This
  // demo pass is visual only.

  return pass.getAsBuffer();
}

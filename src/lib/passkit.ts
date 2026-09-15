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

function formatPassDate(iso: string) {
  return new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" });
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

  pass.headerFields.push({
    key: "room",
    label: "POKOJ",
    value: booking.roomNumber,
  });

  // Sits over the strip image.
  pass.primaryFields.push({
    key: "hotel",
    label: "HOTEL",
    value: booking.hotelName,
  });

  // storeCard allows four secondary + auxiliary fields in total. Dates are
  // formatted rather than passed as raw ISO, and collapsed into one range so
  // they don't wrap onto separate rows.
  pass.secondaryFields.push(
    { key: "guest", label: "HOST", value: booking.guestName },
    {
      key: "stay",
      label: "POBYT",
      value: `${formatPassDate(booking.checkIn)} – ${formatPassDate(booking.checkOut)}`,
    },
  );

  pass.auxiliaryFields.push({
    key: "roomType",
    label: "KATEGORIE",
    value: booking.roomType,
  });

  // No NFC field: Apple's NFC pass field requires a real EC public key —
  // a placeholder string fails iOS's install-time validation silently (pass
  // shows the "Add to Wallet" prompt but never actually installs). Real
  // door-unlock NFC requires a certified lock vendor's credential manager
  // (Salto, VingCard/Assa Abloy, dormakaba) anyway — see ROADMAP.md. This
  // demo pass is visual only.

  return pass.getAsBuffer();
}

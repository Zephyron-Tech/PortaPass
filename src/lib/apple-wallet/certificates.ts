/**
 * Certificates are never committed. Two ways to provide them:
 *
 * 1. Local dev: APPLE_*_CERT_PATH env vars pointing at PEM files in ./certs
 *    (gitignored). See certs/README.md.
 * 2. Deployed (Vercel etc.): the filesystem certs/ folder doesn't exist in
 *    the deployment bundle, so use APPLE_*_CERT_BASE64 env vars instead —
 *    base64-encoded PEM contents, set directly in the platform's env var UI.
 */
import fs from "node:fs";

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

export function loadCertificates() {
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

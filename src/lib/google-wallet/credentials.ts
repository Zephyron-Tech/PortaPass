/**
 * Google Wallet auth is a service-account key, not a certificate pair, so
 * there's no local-file/base64 split like Apple's — just env vars. The one
 * wrinkle: most .env loaders (and platform env-var UIs) turn a multi-line
 * PEM's real newlines into the two-character sequence "\n", so it has to be
 * un-escaped back into actual newlines before jose can parse it as PKCS8.
 */
export type GoogleWalletConfig = {
  issuerId: string;
  /** Fully-qualified class id: `${issuerId}.${GOOGLE_WALLET_CLASS_ID}`. */
  classId: string;
  clientEmail: string;
  privateKey: string;
};

export function getGoogleWalletConfig(): GoogleWalletConfig | null {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const classSuffix = process.env.GOOGLE_WALLET_CLASS_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!issuerId || !classSuffix || !clientEmail || !rawPrivateKey) return null;

  return {
    issuerId,
    classId: `${issuerId}.${classSuffix}`,
    clientEmail,
    privateKey: rawPrivateKey.replace(/\\n/g, "\n"),
  };
}

export class GoogleWalletNotConfiguredError extends Error {
  constructor() {
    super(
      "Google Wallet není nastavený. Nastavte GOOGLE_WALLET_ISSUER_ID, " +
        "GOOGLE_WALLET_CLASS_ID, GOOGLE_CLIENT_EMAIL a GOOGLE_PRIVATE_KEY.",
    );
    this.name = "GoogleWalletNotConfiguredError";
  }
}

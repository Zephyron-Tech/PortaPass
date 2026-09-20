/**
 * Google Wallet auth is a service-account key, not a certificate pair, so
 * there's no local-file/base64 split like Apple's — just env vars. The
 * private key is the fragile one: depending on how it was pasted into the
 * hosting platform's env var UI, it can arrive with literal "\n" escape
 * sequences instead of real newlines (most .env loaders do this), "\r\n"
 * line endings, or — the classic mistake — the surrounding double quotes
 * from the downloaded service-account JSON's `private_key` field copied
 * along with the value. `jose`'s importPKCS8 rejects all of these silently
 * with an opaque "must be PKCS#8 formatted string", so all three get
 * normalized here rather than left for that error to surface in prod.
 */
function normalizePrivateKey(raw: string): string {
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  return key.replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
}

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

  const privateKey = normalizePrivateKey(rawPrivateKey);
  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    // Config is present but clearly malformed — surface this as the same
    // "not configured" 501 the missing-env-var case uses, instead of a
    // generic 500 with only a cryptic jose error in the logs.
    throw new GoogleWalletNotConfiguredError(
      "GOOGLE_PRIVATE_KEY nevypadá jako platný PKCS#8 klíč (chybí BEGIN PRIVATE KEY). " +
        "Zkontrolujte, že hodnota neobsahuje uvozovky navíc a že řádky jsou oddělené \\n.",
    );
  }

  return {
    issuerId,
    classId: `${issuerId}.${classSuffix}`,
    clientEmail,
    privateKey,
  };
}

export class GoogleWalletNotConfiguredError extends Error {
  constructor(
    message = "Google Wallet není nastavený. Nastavte GOOGLE_WALLET_ISSUER_ID, " +
      "GOOGLE_WALLET_CLASS_ID, GOOGLE_CLIENT_EMAIL a GOOGLE_PRIVATE_KEY.",
  ) {
    super(message);
    this.name = "GoogleWalletNotConfiguredError";
  }
}

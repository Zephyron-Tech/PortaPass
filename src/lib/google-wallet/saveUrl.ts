import { importPKCS8, SignJWT } from "jose";
import type { GoogleWalletConfig } from "./credentials";
import type { GenericObject } from "./genericObject";

const BASE_URL = process.env.APP_BASE_URL ?? "https://portapass.zephyron.tech";

/**
 * Signs the "Save to Google Wallet" JWT and returns the finished save URL.
 * `jose` (already a dependency for Bank iD's OIDC token verification) does
 * RS256 signing just as well as `jsonwebtoken`/`google-auth-library`, so no
 * new package is needed for this.
 */
export async function buildSaveUrl(config: GoogleWalletConfig, object: GenericObject): Promise<string> {
  const key = await importPKCS8(config.privateKey, "RS256");

  const jwt = await new SignJWT({
    iss: config.clientEmail,
    aud: "google",
    typ: "savetowallet",
    origins: [BASE_URL],
    payload: { genericObjects: [object] },
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .sign(key);

  return `https://pay.google.com/gp/v/save/${jwt}`;
}

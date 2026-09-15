import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Everything is derived from the issuer's OIDC discovery document rather than
 * hardcoded, so moving sandbox -> production is a single env var change.
 */
const DEFAULT_ISSUER = "https://oidc.sandbox.bankid.cz/";

/** Holds state/nonce/PKCE verifier across the round trip to the bank. */
export const TRANSACTION_COOKIE = "portapass_bankid_tx";

export type BankIdConfig = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
};

export function getBankIdConfig(): BankIdConfig | null {
  const clientId = process.env.BANKID_CLIENT_ID;
  const clientSecret = process.env.BANKID_CLIENT_SECRET;
  const redirectUri = process.env.BANKID_REDIRECT_URI;

  // Not configured -> callers fall back to the mocked flow, so the demo keeps
  // working without credentials.
  if (!clientId || !clientSecret || !redirectUri) return null;

  return {
    issuer: process.env.BANKID_ISSUER ?? DEFAULT_ISSUER,
    clientId,
    clientSecret,
    redirectUri,
    scopes: process.env.BANKID_SCOPES ?? "openid profile.name profile.birthdate",
  };
}

type Discovery = {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  issuer: string;
};

let discoveryCache: { issuer: string; value: Discovery; fetchedAt: number } | null = null;
const DISCOVERY_TTL_MS = 60 * 60 * 1000;

export async function getDiscovery(issuer: string): Promise<Discovery> {
  const fresh =
    discoveryCache &&
    discoveryCache.issuer === issuer &&
    Date.now() - discoveryCache.fetchedAt < DISCOVERY_TTL_MS;
  if (fresh) return discoveryCache!.value;

  const url = new URL(".well-known/openid-configuration", issuer);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`BankID discovery failed: ${res.status}`);

  const value = (await res.json()) as Discovery;
  discoveryCache = { issuer, value, fetchedAt: Date.now() };
  return value;
}

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(jwksUri: string) {
  let jwks = jwksCache.get(jwksUri);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(jwksUri));
    jwksCache.set(jwksUri, jwks);
  }
  return jwks;
}

function base64url(buf: Buffer) {
  return buf.toString("base64url");
}

export function createPkcePair() {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

export function randomToken() {
  return base64url(randomBytes(32));
}

export async function buildAuthorizationUrl(
  config: BankIdConfig,
  params: { state: string; nonce: string; codeChallenge: string },
) {
  const { authorization_endpoint } = await getDiscovery(config.issuer);
  const url = new URL(authorization_endpoint);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", config.scopes);
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", params.nonce);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

type TokenResponse = {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
};

export async function exchangeCode(
  config: BankIdConfig,
  params: { code: string; codeVerifier: string },
): Promise<TokenResponse> {
  const { token_endpoint } = await getDiscovery(config.issuer);

  // BankID supports client_secret_post (not _basic) — the secret goes in the
  // body, never in an Authorization header.
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: config.redirectUri,
    code_verifier: params.codeVerifier,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const res = await fetch(token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`BankID token exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as TokenResponse;
}

export type VerifiedIdentity = {
  subject: string;
  givenName?: string;
  familyName?: string;
  fullName?: string;
  birthdate?: string;
};

export async function verifyIdToken(
  config: BankIdConfig,
  idToken: string,
  expectedNonce: string,
): Promise<VerifiedIdentity> {
  const discovery = await getDiscovery(config.issuer);

  // BankID signs with PS512, not the usual RS256.
  const { payload } = await jwtVerify(idToken, getJwks(discovery.jwks_uri), {
    issuer: discovery.issuer,
    audience: config.clientId,
    algorithms: ["PS512"],
  });

  if (payload.nonce !== expectedNonce) {
    throw new Error("BankID nonce mismatch");
  }

  return {
    subject: String(payload.sub),
    givenName: payload.given_name as string | undefined,
    familyName: payload.family_name as string | undefined,
    fullName: payload.name as string | undefined,
    birthdate: payload.birthdate as string | undefined,
  };
}

/**
 * The ID token carries only what the granted scopes allow. Anything else
 * (e.g. idcards) has to come from /userinfo.
 */
export async function fetchUserInfo(config: BankIdConfig, accessToken: string) {
  const { userinfo_endpoint } = await getDiscovery(config.issuer);
  const res = await fetch(userinfo_endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`BankID userinfo failed: ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

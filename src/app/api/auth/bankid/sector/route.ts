import { NextResponse } from "next/server";

/**
 * OIDC sector identifier document.
 *
 * Required once the app registers redirect URIs on more than one hostname
 * (e.g. the deployed domain plus localhost). It must return a JSON array
 * containing *every* registered redirect URI. Grouping them under one sector
 * keeps the pairwise `sub` claim stable across them, so the same person is
 * recognisable whichever host they came through.
 */
const DEFAULT_REDIRECT_URIS = [
  "https://portapass.zephyron.tech/api/auth/bankid/callback",
  "http://localhost:3000/api/auth/bankid/callback",
];

export async function GET() {
  const configured = process.env.BANKID_REDIRECT_URIS?.split(",")
    .map((uri) => uri.trim())
    .filter(Boolean);

  return NextResponse.json(configured?.length ? configured : DEFAULT_REDIRECT_URIS, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}

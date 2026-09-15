import { NextRequest, NextResponse } from "next/server";
import {
  TRANSACTION_COOKIE,
  buildAuthorizationUrl,
  createPkcePair,
  getBankIdConfig,
  randomToken,
} from "@/lib/bankid";

export async function GET(req: NextRequest) {
  const config = getBankIdConfig();
  if (!config) {
    return NextResponse.json({ error: "BankID not configured" }, { status: 501 });
  }

  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const token = searchParams.get("token");
  if (!roomId || !token) {
    return NextResponse.json({ error: "Missing roomId or token" }, { status: 400 });
  }

  const state = randomToken();
  const nonce = randomToken();
  const { verifier, challenge } = createPkcePair();

  const authUrl = await buildAuthorizationUrl(config, {
    state,
    nonce,
    codeChallenge: challenge,
  });

  const res = NextResponse.redirect(authUrl);

  // state/nonce/verifier must survive the round trip to the bank but must not
  // be readable by scripts. Short-lived and httpOnly.
  res.cookies.set(TRANSACTION_COOKIE, JSON.stringify({ state, nonce, verifier, roomId, token }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return res;
}

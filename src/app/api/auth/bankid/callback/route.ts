import { NextRequest, NextResponse } from "next/server";
import {
  TRANSACTION_COOKIE,
  exchangeCode,
  getBankIdConfig,
  verifyIdToken,
} from "@/lib/bankid";
import { findBookingByToken } from "@/lib/mockData";
import { createVerificationCookie } from "@/lib/session";

type Transaction = {
  state: string;
  nonce: string;
  verifier: string;
  roomId: string;
  token: string;
};

function failure(roomId: string | null, token: string | null, reason: string) {
  const target = roomId && token ? `/checkin/${roomId}?token=${token}` : "/";
  const url = new URL(target, process.env.APP_BASE_URL ?? "http://localhost:3000");
  url.searchParams.set("verify", "failed");
  url.searchParams.set("reason", reason);
  const res = NextResponse.redirect(url);
  res.cookies.delete(TRANSACTION_COOKIE);
  return res;
}

export async function GET(req: NextRequest) {
  const config = getBankIdConfig();
  if (!config) {
    return NextResponse.json({ error: "BankID not configured" }, { status: 501 });
  }

  const { searchParams } = new URL(req.url);
  const raw = req.cookies.get(TRANSACTION_COOKIE)?.value;

  let tx: Transaction | null = null;
  try {
    tx = raw ? (JSON.parse(raw) as Transaction) : null;
  } catch {
    tx = null;
  }
  if (!tx) return failure(null, null, "session");

  // The user may have declined at the bank.
  if (searchParams.get("error")) {
    return failure(tx.roomId, tx.token, "declined");
  }

  // CSRF: the state we get back must match the one we issued.
  if (searchParams.get("state") !== tx.state) {
    return failure(tx.roomId, tx.token, "state");
  }

  const code = searchParams.get("code");
  if (!code) return failure(tx.roomId, tx.token, "code");

  try {
    const tokens = await exchangeCode(config, { code, codeVerifier: tx.verifier });
    const identity = await verifyIdToken(config, tokens.id_token, tx.nonce);

    const booking = findBookingByToken(tx.roomId, tx.token);
    if (!booking) return failure(tx.roomId, tx.token, "booking");

    const cookie = await createVerificationCookie({
      roomId: tx.roomId,
      token: tx.token,
      subject: identity.subject,
      name:
        identity.fullName ??
        ([identity.givenName, identity.familyName].filter(Boolean).join(" ") || undefined),
      birthdate: identity.birthdate,
    });

    const url = new URL(
      `/checkin/${tx.roomId}?token=${tx.token}&verify=ok`,
      process.env.APP_BASE_URL ?? "http://localhost:3000",
    );
    const res = NextResponse.redirect(url);
    res.cookies.set(cookie.name, cookie.value, cookie.options);
    res.cookies.delete(TRANSACTION_COOKIE);
    return res;
  } catch (err) {
    console.error("BankID callback failed:", err);
    return failure(tx.roomId, tx.token, "exchange");
  }
}

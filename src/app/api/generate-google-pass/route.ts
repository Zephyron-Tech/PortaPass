import { NextRequest, NextResponse } from "next/server";
import { getGoogleWalletConfig, GoogleWalletNotConfiguredError } from "@/lib/google-wallet/credentials";
import { buildGenericObject } from "@/lib/google-wallet/genericObject";
import { buildSaveUrl } from "@/lib/google-wallet/saveUrl";
import { findBookingByToken } from "@/lib/mockData";

/**
 * Mirrors /api/pass (the Apple pass route): same roomId/token lookup, same
 * error shapes, same "not configured" vs. "not found" vs. generic failure
 * split — so both wallets are wired into the app identically, only the
 * generated artifact differs (a signed save-link here, a .pkpass there).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return respondWithSaveUrl(searchParams.get("roomId"), searchParams.get("token"));
}

export async function POST(req: NextRequest) {
  const { roomId, token } = await req.json();
  return respondWithSaveUrl(roomId, token);
}

async function respondWithSaveUrl(roomId: string | null | undefined, token: string | null | undefined) {
  const booking = roomId && token ? findBookingByToken(roomId, token) : undefined;
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const config = getGoogleWalletConfig();
  if (!config) {
    return NextResponse.json({ error: new GoogleWalletNotConfiguredError().message }, { status: 501 });
  }

  try {
    const object = buildGenericObject(config, booking);
    const url = await buildSaveUrl(config, object);
    return NextResponse.json({ url }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate Google Wallet pass" }, { status: 500 });
  }
}

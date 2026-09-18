import { NextRequest } from "next/server";
import { respondWithPass } from "@/lib/apple-wallet/respond";

// GET: iOS/Safari only opens the native "Add to Wallet" preview on a direct
// navigation to a .pkpass URL. A JS fetch+blob download instead triggers
// Safari's generic file-download confirmation sheet first — the wrong UX.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return respondWithPass(searchParams.get("roomId"), searchParams.get("token"));
}

export async function POST(req: NextRequest) {
  const { roomId, token } = await req.json();
  return respondWithPass(roomId, token);
}

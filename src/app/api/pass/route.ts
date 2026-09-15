import { NextRequest, NextResponse } from "next/server";
import { findBookingByToken } from "@/lib/mockData";
import { CertificatesNotConfiguredError, generateRoomKeyPass } from "@/lib/passkit";

async function respondWithPass(roomId: string | null, token: string | null) {
  const booking = roomId && token ? findBookingByToken(roomId, token) : undefined;
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  try {
    const buffer = await generateRoomKeyPass(booking);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="room-${booking.roomNumber}.pkpass"`,
      },
    });
  } catch (err) {
    if (err instanceof CertificatesNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 501 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to generate pass" }, { status: 500 });
  }
}

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

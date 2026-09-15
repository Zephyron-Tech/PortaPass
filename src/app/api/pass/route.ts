import { NextRequest, NextResponse } from "next/server";
import { findBookingByToken } from "@/lib/mockData";
import { CertificatesNotConfiguredError, generateRoomKeyPass } from "@/lib/passkit";

export async function POST(req: NextRequest) {
  const { roomId, token } = await req.json();

  const booking = findBookingByToken(roomId, token);
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

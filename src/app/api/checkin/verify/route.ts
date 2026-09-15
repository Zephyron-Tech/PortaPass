import { NextRequest, NextResponse } from "next/server";
import { findBookingByToken } from "@/lib/mockData";

// Mocks an identity verification provider (e.g. BankID). Always succeeds
// after a short delay simulated on the client.
export async function POST(req: NextRequest) {
  const { roomId, token } = await req.json();

  const booking = findBookingByToken(roomId, token);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ verified: true, booking });
}

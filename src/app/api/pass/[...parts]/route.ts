import { NextResponse } from "next/server";
import { findBookingByToken } from "@/lib/mockData";
import { CertificatesNotConfiguredError, generateRoomKeyPass } from "@/lib/passkit";

/**
 * Same pass, but reached at a URL whose path ends in `.pkpass`
 * (/api/pass/<roomId>/<token>/klic.pkpass) with no query string.
 *
 * Some clients route a download by the URL's file extension rather than by
 * Content-Type alone, so this gives iOS every signal it could key off. The
 * query-string form at /api/pass still works.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ parts: string[] }> },
) {
  const { parts } = await params;
  const [roomId, token] = parts;

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
        "Cache-Control": "no-store",
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

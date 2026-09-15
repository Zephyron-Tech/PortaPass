import { NextResponse } from "next/server";

/**
 * BankID requires a Notification URI on the application. It is called when a
 * user's claims change (the notification.claims_updated scope). We don't
 * store any user data, so there is nothing to reconcile — acknowledge and
 * drop it. Kept as a real endpoint so the registered URI resolves.
 */
export async function POST() {
  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  return new NextResponse(null, { status: 204 });
}

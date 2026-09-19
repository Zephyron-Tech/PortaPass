import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { getBankIdConfig } from "@/lib/bankid";
import { detectWalletPlatform } from "@/lib/device";
import { findBookingByToken } from "@/lib/mockData";
import { VERIFICATION_COOKIE, readVerificationCookie } from "@/lib/session";
import CheckinFlow from "./CheckinFlow";

export const metadata: Metadata = {
  title: "Ověření a ukázková karta",
  description: "Ověření ukázkové rezervace a karta do Apple Wallet. Karta neodemyká dveře.",
  robots: { index: false, follow: false },
};

export default async function CheckinPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{
    token?: string | string[];
    verify?: string | string[];
    reason?: string | string[];
  }>;
}) {
  const { roomId } = await params;
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";
  const failureReason = query.verify === "failed"
    ? (typeof query.reason === "string" ? query.reason : "unknown")
    : null;
  const linkedBooking = findBookingByToken(roomId, token) ?? null;

  const cookieStore = await cookies();
  const session = await readVerificationCookie(cookieStore.get(VERIFICATION_COOKIE)?.value);
  const walletPlatform = detectWalletPlatform((await headers()).get("user-agent"));

  // A session only counts for the booking it was issued against.
  const verified =
    session && session.roomId === roomId && session.token === token ? session : null;

  const booking = verified ? linkedBooking : null;

  return (
    <CheckinFlow
      key={JSON.stringify([roomId, token, Boolean(booking), failureReason])}
      roomId={roomId}
      token={token}
      validLink={Boolean(linkedBooking)}
      bankIdEnabled={Boolean(getBankIdConfig())}
      walletPlatform={walletPlatform}
      verifiedBooking={booking}
      verifiedName={verified?.name ?? null}
      failureReason={failureReason}
    />
  );
}

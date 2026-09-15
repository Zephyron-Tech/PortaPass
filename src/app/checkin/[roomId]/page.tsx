import { cookies } from "next/headers";
import { getBankIdConfig } from "@/lib/bankid";
import { findBookingByToken } from "@/lib/mockData";
import { VERIFICATION_COOKIE, readVerificationCookie } from "@/lib/session";
import CheckinFlow from "./CheckinFlow";

export default async function CheckinPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ token?: string; verify?: string; reason?: string }>;
}) {
  const { roomId } = await params;
  const { token, verify, reason } = await searchParams;

  const cookieStore = await cookies();
  const session = await readVerificationCookie(cookieStore.get(VERIFICATION_COOKIE)?.value);

  // A session only counts for the booking it was issued against.
  const verified =
    session && session.roomId === roomId && session.token === token ? session : null;

  const booking = verified ? (findBookingByToken(roomId, token ?? "") ?? null) : null;

  return (
    <CheckinFlow
      roomId={roomId}
      token={token ?? ""}
      bankIdEnabled={Boolean(getBankIdConfig())}
      verifiedBooking={booking}
      verifiedName={verified?.name ?? null}
      failureReason={verify === "failed" ? (reason ?? "unknown") : null}
    />
  );
}

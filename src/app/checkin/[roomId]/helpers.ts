import type { MockBooking } from "@/lib/mockData";

export const failureMessages: Record<string, string> = {
  declined: "Ověření bylo v bance zrušeno. Zkuste to prosím znovu.",
  booking: "K tomuto odkazu se nepodařilo najít rezervaci. Zkontrolujte celý odkaz nebo kontaktujte recepci.",
  state: "Ověření vypršelo. Začněte prosím znovu.",
  session: "Ověření vypršelo. Začněte prosím znovu.",
};

export function isBooking(value: unknown): value is MockBooking {
  if (!value || typeof value !== "object") return false;
  const booking = value as Record<string, unknown>;
  const fields = [
    "token", "roomId", "roomNumber", "roomType", "hotelName", "guestName", "checkIn", "checkOut",
  ];
  if (!fields.every((field) =>
    Object.hasOwn(booking, field) &&
    typeof booking[field] === "string" && booking[field].trim().length > 0,
  )) return false;

  return [booking.checkIn, booking.checkOut].every((value) => {
    const date = value as string;
    const timestamp = Date.parse(date);
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(timestamp) &&
      new Date(timestamp).toISOString().slice(0, 10) === date;
  }) && (booking.checkOut as string) >= (booking.checkIn as string);
}

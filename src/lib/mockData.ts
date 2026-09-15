// Hardcoded PMS data for the PoC. Replace with real Previo/Mews lookups later.

export type MockBooking = {
  token: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  hotelName: string;
  guestName: string;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
};

const bookings: MockBooking[] = [
  {
    token: "abc",
    roomId: "room-101",
    roomNumber: "101",
    roomType: "Deluxe Double",
    hotelName: "Hotel Vltava",
    guestName: "Jan Novák",
    checkIn: "2026-09-15",
    checkOut: "2026-09-18",
  },
];

export function findBookingByToken(roomId: string, token: string): MockBooking | undefined {
  return bookings.find((b) => b.roomId === roomId && b.token === token);
}

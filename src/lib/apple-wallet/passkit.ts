import path from "node:path";
import { PKPass } from "passkit-generator";
import type { MockBooking } from "@/lib/mockData";
import { CertificatesNotConfiguredError, loadCertificates } from "./certificates";

const MODEL_PATH = path.join(process.cwd(), "src/passkit-model/roomkey.pass");

export async function generateRoomKeyPass(booking: MockBooking): Promise<Buffer> {
  const certificates = loadCertificates();
  if (!certificates) {
    throw new CertificatesNotConfiguredError();
  }

  const pass = await PKPass.from(
    {
      model: MODEL_PATH,
      certificates,
    },
    {
      serialNumber: `${booking.roomId}-${booking.token}`,
    },
  );

  // Field content and labels match the Pass Designer export exactly (see
  // pass.json's original source): a header showing the room, a primary
  // field for the guest, and check-in/check-out as native Apple date
  // fields (dateStyle formats them per the device's own locale, rather
  // than a hand-rolled string). The room/guest/dates also appear inside
  // the background art's own branded card graphic — that's intentional
  // duplication in the design, not a bug: the header/footer rows are
  // Apple's own glanceable chrome, the art underneath is the styled
  // presentation.
  const headerField = { key: "roomNo", label: "Pokoj", value: booking.roomNumber };
  const primaryField = { key: "memberName", label: "Host", value: booking.guestName };
  const checkInField = {
    key: "checkIn",
    label: "Check-in",
    value: new Date(booking.checkIn).toISOString(),
    dateStyle: "PKDateStyleShort" as const,
  };
  const checkOutField = {
    key: "checkOut",
    label: "Check-Out",
    value: new Date(booking.checkOut).toISOString(),
    dateStyle: "PKDateStyleShort" as const,
  };

  // The model declares both "generic" (legacy iOS) and "posterGeneric"
  // (iOS/watchOS 27+ poster-style Wallet passes) — see pass.json. Wallet
  // prioritizes posterGeneric over generic whenever both are present, on
  // devices that support it, which is what was actually rendering on a
  // real device. posterGeneric has no secondaryFields slot: per the
  // reference design built in Pass Designer itself, Host/Check-in/
  // Check-out all sit together as up to four primaryFields rendered in
  // one row under the barcode, with footerFields left empty. Legacy
  // "generic" keeps the dates in secondaryFields as originally exported.
  for (const passType of pass.types) {
    passType.headerFields.push(headerField);
    if (passType.type === "posterGeneric") {
      passType.primaryFields.push(primaryField, checkInField, checkOutField);
    } else {
      passType.primaryFields.push(primaryField);
      passType.secondaryFields.push(checkInField, checkOutField);
    }
  }

  // No NFC field: Apple's NFC pass field requires a real EC public key —
  // a placeholder string fails iOS's install-time validation silently (pass
  // shows the "Add to Wallet" prompt but never actually installs). Real
  // door-unlock NFC requires a certified lock vendor's credential manager
  // (Salto, VingCard/Assa Abloy, dormakaba) anyway — see ROADMAP.md. This
  // demo pass is visual only.

  return pass.getAsBuffer();
}

import { ContactlessMark } from "@/components/marks";
import type { MockBooking } from "@/lib/mockData";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "short", timeZone: "UTC" });
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/65">
        {label}
      </div>
      <div className="mt-1 truncate text-[13px] text-white/85" title={value}>{value}</div>
    </div>
  );
}

/**
 * Proportioned to a real key card (ISO/IEC 7810 ID-1, 1.586:1) so it reads as
 * a physical object rather than a UI panel.
 */
export function KeyCard({ booking }: { booking: MockBooking }) {
  return (
    <div className="key-card relative aspect-[1.586] w-full rounded-[1.375rem] bg-ink shadow-[0_2px_4px_rgba(20,18,15,0.08),0_18px_40px_-16px_rgba(20,18,15,0.45)] ring-1 ring-ink/5">
      {/* Sheen: a single soft diagonal highlight, the way light falls across
          a matte card — not a colored glow. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.375rem]"
        style={{
          background:
            "linear-gradient(142deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 34%, rgba(255,255,255,0) 58%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.375rem] ring-1 ring-inset ring-white/10"
      />

      <div className="key-card-content relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-[10px] font-medium uppercase tracking-[0.2em] text-white/65" title={booking.roomType}>
              {booking.roomType}
            </div>
            <div className="key-card-hotel mt-1.5 truncate font-serif leading-tight text-white" title={booking.hotelName}>
              {booking.hotelName}
            </div>
          </div>
          <ContactlessMark className="mt-0.5 h-6 w-6 shrink-0 text-white/65" />
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 max-w-[45%]">
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/65">
              Pokoj
            </div>
            <div className="key-card-room mt-0.5 truncate font-serif leading-none tabular-nums text-white" title={booking.roomNumber}>
              {booking.roomNumber}
            </div>
          </div>
          <div className="key-card-meta flex min-w-0 flex-1 flex-col gap-1 text-right">
            <Field label="Host" value={booking.guestName} />
            <Field
              label="Pobyt"
              value={`${formatDate(booking.checkIn)} – ${formatDate(booking.checkOut)}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

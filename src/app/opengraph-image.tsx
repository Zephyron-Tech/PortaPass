import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "PortaPass – ukázka check-inu a průkazu do Apple Wallet. Neodemyká dveře.";

/**
 * Generated rather than a checked-in asset, so it can't drift from the brand.
 * Deliberately uses the default font: loading Instrument Serif here would mean
 * fetching a font over the network inside the OG route, which is a fragile
 * dependency for an image whose content never changes.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(180deg, #f5efe6 0%, #faf9f7 60%)",
          color: "#14120f",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#737373",
          }}
        >
          PortaPass
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, lineHeight: 1.1, letterSpacing: -1.5, maxWidth: 900 }}>
            Check-in začíná před příjezdem.
          </div>
          <div style={{ fontSize: 30, color: "#6f6a63", maxWidth: 820 }}>
            Ukázka ověření a průkazu do Apple Wallet. Neodemyká dveře.
          </div>
        </div>

        <div style={{ fontSize: 24, color: "#737373" }}>
          Pilotní program pro nezávislé hotely
        </div>
      </div>
    ),
    size,
  );
}

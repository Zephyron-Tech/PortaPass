import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif, Poppins } from "next/font/google";
import { BackToTop } from "@/components/BackToTop";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});

// Bank iD's brand font. Loaded only so Bank iD surfaces can be rendered to
// their own spec — the rest of the site stays on Geist.
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500"],
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_BASE_URL ?? "https://portapass.zephyron.tech"),
  title: "PortaPass",
  description: "Ukázka online check-inu a průkazu do Apple Wallet. Prototyp neodemyká dveře.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Required for env(safe-area-inset-*) and for content to extend behind
  // Safari's translucent chrome. Note: Safari 26 ignores themeColor and
  // samples the root element's CSS background instead (see globals.css).
  viewportFit: "cover",
  themeColor: "#f5efe6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${instrumentSerif.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <BackToTop />
      </body>
    </html>
  );
}

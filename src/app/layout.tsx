import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PortaPass",
  description: "Digitální klíč od pokoje — proof of concept",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf9f7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#faf9f7] text-[#1c1a17]">
        {/* Fixed to the viewport (not page content) so it can never clip or
            show a hard edge as Safari's dynamic toolbar resizes the viewport. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(202,138,4,0.12), transparent 60%)",
          }}
        />
        {children}
      </body>
    </html>
  );
}

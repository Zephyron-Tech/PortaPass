import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Ukázka check-inu | PortaPass",
  description: "Vyzkoušejte check-in a ukázkovou kartu do Apple Wallet. Karta neodemyká dveře.",
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return children;
}

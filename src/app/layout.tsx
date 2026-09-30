import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Chakra_Petch, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-chakra",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Órbita",
  description: "Perfiles personalizables con música y estilo propio.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#06050d",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${chakra.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}

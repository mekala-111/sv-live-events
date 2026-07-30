import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://svliveevents.example"),
  title: "SV Live Events | Premium Media Production & Live Event Coverage",
  description:
    "SV Live Events delivers premium photography, live streaming, drone, LED wall, and cinematic event production services for weddings, corporate events, concerts, and large-format experiences.",
  keywords: [
    "SV Live Events",
    "media production company",
    "live streaming",
    "drone photography",
    "LED wall",
    "event coverage",
    "wedding photography",
    "corporate events",
  ],
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
  openGraph: {
    title: "SV Live Events",
    description:
      "Luxury event visuals, premium live production, and technology-first storytelling.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SV Live Events",
    description:
      "Luxury event visuals, premium live production, and technology-first storytelling.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        {children}
      </body>
    </html>
  );
}

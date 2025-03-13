import type { Metadata } from "next";
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
  title: "Studio Music - Studio d'enregistrement professionnel",
  description: "Studio d'enregistrement professionnel proposant des services d'enregistrement, mixage, mastering et production musicale.",
  keywords: "studio, enregistrement, musique, mixage, mastering, production, audio",
  authors: [{ name: "Studio Music" }],
  creator: "Studio Music",
  publisher: "Studio Music",
  openGraph: {
    title: "Studio Music - Studio d'enregistrement professionnel",
    description: "Studio d'enregistrement professionnel proposant des services d'enregistrement, mixage, mastering et production musicale.",
    url: "https://studiomusic.fr",
    siteName: "Studio Music",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio Music - Studio d'enregistrement professionnel",
    description: "Studio d'enregistrement professionnel proposant des services d'enregistrement, mixage, mastering et production musicale.",
    creator: "@studiomusic",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

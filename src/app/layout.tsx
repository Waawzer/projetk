import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ViewportHandler from "@/components/ViewportHandler";

// Note: Nous n'ajoutons pas le Footer dans le layout car certaines pages
// utilisent "use client" et sont rendues côté client avec des composantes
// spécifiques à chaque page. Il est préférable d'ajouter le Footer
// individuellement dans chaque page pour plus de flexibilité dans la mise en page.

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kasar Studio - Studio d'enregistrement professionnel",
  description:
    "Studio d'enregistrement professionnel proposant des services d'enregistrement, mixage, mastering et production musicale.",
  keywords:
    "studio, enregistrement, musique, mixage, mastering, production, audio",
  authors: [{ name: "Kasar Studio" }],
  creator: "Kasar Studio",
  publisher: "Kasar Studio",
  openGraph: {
    title: "Kasar Studio - Studio d'enregistrement professionnel",
    description:
      "Studio d'enregistrement professionnel proposant des services d'enregistrement, mixage, mastering et production musicale.",
    url: "https://kasarstudio.fr",
    siteName: "Kasar Studio",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kasar Studio - Studio d'enregistrement professionnel",
    description:
      "Studio d'enregistrement professionnel proposant des services d'enregistrement, mixage, mastering et production musicale.",
    creator: "@kasarstudio",
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
        <ViewportHandler />
        {children}
      </body>
    </html>
  );
}

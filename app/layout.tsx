import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    template: '%s | Video IA - Tous les outils d\'IA pour la vidéo',
    default: 'Video IA - Découvrez les meilleurs outils d\'IA pour la vidéo',
  },
  description: "Le répertoire définitif des outils d'intelligence artificielle pour la création, l'édition et la production vidéo.",
  keywords: "IA vidéo, outils IA, génération vidéo, édition vidéo, montage automatique, intelligence artificielle, vidéo",
  openGraph: {
    title: 'Video IA - Découvrez les meilleurs outils d\'IA pour la vidéo',
    description: "Le répertoire définitif des outils d'intelligence artificielle pour la création, l'édition et la production vidéo.",
    url: 'https://video-ia.net',
    siteName: 'Video IA',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video IA - Découvrez les meilleurs outils d\'IA pour la vidéo',
    description: "Le répertoire définitif des outils d'intelligence artificielle pour la création, l'édition et la production vidéo.",
    creator: '@videoianet',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  authors: [
    {
      name: 'Video IA',
      url: 'https://video-ia.net',
    },
  ],
  metadataBase: new URL('https://video-ia.net'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background antialiased">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

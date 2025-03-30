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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <style>
          {`
            :root {
              --background: #f8fafc;
              --foreground: #1e293b;
              --card: #ffffff;
              --card-foreground: #1e293b;
              --primary: #6200ea;
              --primary-foreground: #ffffff;
              --muted: #f1f5f9;
              --muted-foreground: #64748b;
              --success: #10b981;
              --success-foreground: #ffffff;
              --accent: #f97316;
              --accent-foreground: #ffffff;
              --destructive: #ef4444;
              --destructive-foreground: #ffffff;
              --border: #e2e8f0;
              --input: #e2e8f0;
              --ring: #6200ea;
            }
            .dark {
              --background: #0f172a;
              --foreground: #f8fafc;
              --card: #1e293b;
              --card-foreground: #f8fafc;
              --primary: #9f75ff;
              --primary-foreground: #0f172a;
              --muted: #1e293b;
              --muted-foreground: #94a3b8;
              --success: #34d399;
              --success-foreground: #0f172a;
              --accent: #fb923c;
              --accent-foreground: #0f172a;
              --destructive: #f87171;
              --destructive-foreground: #0f172a;
              --border: #334155;
              --input: #334155;
              --ring: #9f75ff;
            }
            
            body {
              color: var(--foreground);
              background-color: var(--background);
            }
            h1, h2, h3, h4, h5, h6 {
              color: var(--foreground);
            }
            a {
              color: var(--primary);
            }
            
            .bg-white.dark\\:bg-gray-800 {
              background-color: var(--card);
              color: var(--card-foreground);
            }
            
            .dark .text-gray-900 {
              color: var(--foreground) !important;
            }
            .dark .text-gray-700 {
              color: var(--muted-foreground) !important;
            }
          `}
        </style>
      </head>
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

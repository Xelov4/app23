import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

const interSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Video-IA.net - Le répertoire des outils IA pour vidéo et image",
  description: "Trouvez les meilleurs outils d'intelligence artificielle pour la création, l'édition et le montage de vidéos et d'images.",
  keywords: "IA, intelligence artificielle, vidéo, image, outils IA, génération d'images, édition vidéo, montage automatique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${interSans.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navigation />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

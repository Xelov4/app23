"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Mail, 
  Twitter, 
  Github, 
  ExternalLink, 
  ChevronRight,
  Laptop,
  Tag,
  Lightbulb,
  Users,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

// Définir les liens des catégories populaires
// À remplacer par des données dynamiques
const popularCategories = [
  { name: "Montage Vidéo", slug: "video-editing" },
  { name: "Génération IA", slug: "ai-generation" },
  { name: "Sous-titres", slug: "subtitles" },
  { name: "Transcription", slug: "transcription" },
  { name: "Animation", slug: "animation" },
  { name: "Voix Off", slug: "voiceover" }
];

// Définir les liens du footer
const footerLinks = [
  {
    title: "Navigation",
    icon: <Laptop className="h-4 w-4" />,
    links: [
      { name: "Accueil", href: "/" },
      { name: "Catégories", href: "/categories" },
      { name: "Tags", href: "/tags" },
      { name: "Populaires", href: "/popular" },
      { name: "Nouveautés", href: "/latest" }
    ]
  },
  {
    title: "Explorer",
    icon: <Tag className="h-4 w-4" />,
    links: [
      { name: "Fonctionnalités", href: "/features" },
      { name: "Types d'utilisateurs", href: "/user-types" },
      { name: "Cas d'utilisation", href: "/use-cases" },
      { name: "Recherche avancée", href: "/search" }
    ]
  },
  {
    title: "À propos",
    icon: <Lightbulb className="h-4 w-4" />,
    links: [
      { name: "À propos", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Mentions légales", href: "/legal" },
      { name: "Politique de confidentialité", href: "/privacy" }
    ]
  }
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background border-t border-border py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent mb-4">
                Vidéo-IA.net
              </h2>
            </Link>
            <p className="text-muted-foreground mb-4">
              Votre guide complet des outils d'intelligence artificielle pour la création et l'édition vidéo.
            </p>
          </div>
          
          {/* Liens rapides */}
          <div>
            <h3 className="font-medium text-sm uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tous les outils
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tags
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Liens légaux */}
          <div>
            <h3 className="font-medium text-sm uppercase tracking-wider mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Vidéo-IA.net - Tous droits réservés
          </p>
          <p className="text-sm text-muted-foreground mt-2 md:mt-0">
            Fait avec ❤️ pour les créateurs vidéo
          </p>
        </div>
      </div>
    </footer>
  );
} 
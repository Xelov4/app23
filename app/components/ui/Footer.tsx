import Link from "next/link";
import { Separator } from "@/components/ui/separator";

// Liste des catégories principales pour le footer
const mainCategories = [
  { name: "Génération de vidéos", slug: "generation-videos" },
  { name: "Édition vidéo", slug: "edition-videos" },
  { name: "Animation", slug: "animation" },
  { name: "Audio", slug: "audio" },
];

// Liste des catégories secondaires pour le footer
const secondaryCategories = [
  { name: "Voix", slug: "voix" },
  { name: "Transcription", slug: "transcription" },
  { name: "Sous-titres", slug: "sous-titres" },
  { name: "Effets spéciaux", slug: "effets-speciaux" },
];

// Liens rapides
const quickLinks = [
  { name: "Accueil", href: "/" },
  { name: "Tous les outils", href: "/tools" },
  { name: "Plan du site", href: "/sitemap" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t mt-24">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* À propos */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl">Video-IA.net</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Le répertoire définitif des outils d'intelligence artificielle 
              pour la vidéo et l'image. Trouvez les meilleurs outils pour 
              créer, éditer et améliorer vos contenus visuels.
            </p>
          </div>

          {/* Catégories principales */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider">
              Principales catégories
            </h3>
            <nav className="flex flex-col space-y-2">
              {mainCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="text-gray-600 hover:text-primary-600 transition text-sm"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Catégories secondaires */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider">
              Autres catégories
            </h3>
            <nav className="flex flex-col space-y-2">
              {secondaryCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="text-gray-600 hover:text-primary-600 transition text-sm"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Liens rapides */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider">
              Liens utiles
            </h3>
            <nav className="flex flex-col space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-primary-600 transition text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} Video-IA.net — Tous droits réservés
          </p>
          
          {/* Ajout éventuel de liens vers réseaux sociaux ou des liens vers des pages légales */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-500 hover:text-primary-600 text-sm">
              Politique de confidentialité
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-primary-600 text-sm">
              Conditions d'utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 
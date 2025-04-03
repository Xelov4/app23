import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Separator } from "@/components/ui/separator";

// Récupérer les principales catégories pour le footer
async function getFooterCategories() {
  try {
    return await db.category.findMany({
      take: 6,
      orderBy: {
        CategoriesOnTools: {
          _count: 'desc'
        }
      }
    });
  } catch (error) {
    console.error("Échec de la récupération des catégories pour le footer:", error);
    return [];
  }
}

export default async function Footer() {
  const categories = await getFooterCategories();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted mt-auto">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Video IA</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Découvrez les meilleurs outils d'IA pour la création, l'édition et la production vidéo.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  href="/tools" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tous les outils
                </Link>
              </li>
              <li>
                <Link 
                  href="/categories" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Catégories
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4">Catégories populaires</h3>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4">Liens utiles</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/a-propos" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  href="/mentions-legales" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link 
                  href="/politique-confidentialite" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col items-center sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Video IA - Tous droits réservés.
          </p>
          <div className="flex items-center mt-4 sm:mt-0 space-x-4">
            <Link 
              href="https://twitter.com/videoianet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
              <span className="sr-only">Twitter</span>
            </Link>
            <Link 
              href="https://www.linkedin.com/company/videoianet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
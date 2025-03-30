import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getCategoryEmoji, getCategoryColor } from "@/lib/design-system/primitives";
import { Search, ArrowRight } from "lucide-react";

export const revalidate = 3600; // Revalider les données toutes les heures
export const dynamic = 'force-dynamic';

// Récupérer toutes les catégories
async function getCategories() {
  try {
    return await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { CategoriesOnTools: true }
        }
      }
    });
  } catch (error) {
    console.error("Échec de la récupération des catégories:", error);
    return [];
  }
}

export default async function CategoriesPage() {
  // Récupérer toutes les catégories
  const categories = await getCategories();
  
  // Organiser les catégories par ordre alphabétique pour un affichage clair
  const categoriesByLetter: Record<string, typeof categories> = {};
  
  categories.forEach(category => {
    const firstLetter = category.name.charAt(0).toUpperCase();
    if (!categoriesByLetter[firstLetter]) {
      categoriesByLetter[firstLetter] = [];
    }
    categoriesByLetter[firstLetter].push(category);
  });
  
  // Obtenir les lettres de l'alphabet qui ont des catégories
  const letters = Object.keys(categoriesByLetter).sort();
  
  // Calculer les statistiques pour le header
  const totalTools = categories.reduce((sum, cat) => sum + cat._count.CategoriesOnTools, 0);
  
  return (
    <div className="bg-background min-h-screen">
      {/* En-tête simple */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Toutes les catégories d'outils d'IA vidéo
            </h1>
            <p className="text-primary-100 mb-6">
              Explorez notre collection d'outils d'IA pour la vidéo par catégorie.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Input 
                placeholder="Rechercher une catégorie..." 
                className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur border-white/20 text-white placeholder:text-white/60 hover:bg-white/20 focus:bg-white/20"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
            </div>
          </div>
          
          {/* Statistiques simples */}
          <div className="flex justify-center mt-8 space-x-12">
            <div className="text-center">
              <div className="text-3xl font-bold">{categories.length}</div>
              <div className="text-primary-200 text-sm">Catégories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{totalTools}</div>
              <div className="text-primary-200 text-sm">Outils</div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        {/* Index alphabétique pour navigation rapide */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 sticky top-0 pt-4 pb-4 bg-background z-10">
          {letters.map(letter => (
            <a 
              key={letter} 
              href={`#letter-${letter}`}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-white transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>
        
        {/* Liste des catégories par lettre */}
        <div className="space-y-8">
          {letters.map(letter => (
            <div key={letter} id={`letter-${letter}`} className="scroll-mt-20">
              <Separator className="my-4" />
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white mr-3">
                  {letter}
                </span>
                Catégories commençant par {letter}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoriesByLetter[letter].map(category => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow flex items-center"
                  >
                    <div className="mr-3 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                      {getCategoryEmoji(category.slug)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category._count.CategoriesOnTools} outil{category._count.CategoriesOnTools !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground ml-2" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Suggestion d'ajout de catégorie */}
        <div className="mt-12 bg-muted/50 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Vous ne trouvez pas ce que vous cherchez?</h3>
          <p className="text-muted-foreground max-w-lg mx-auto mb-4">
            Si vous connaissez une catégorie ou un outil qui n'est pas encore dans notre base de données, n'hésitez pas à nous le faire savoir.
          </p>
          <Button asChild>
            <Link href="/suggest">Suggérer une catégorie</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 
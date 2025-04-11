import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getCategoryEmoji, getCategoryColor } from "@/lib/design-system/primitives";
import { Search, ArrowRight } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";

export const metadata: Metadata = {
  title: "Catégories d'outils d'IA pour vidéo | Vidéo-IA.net",
  description: "Découvrez toutes nos catégories d'outils d'intelligence artificielle pour la vidéo. Trouvez les meilleurs outils pour l'édition, montage, création et bien plus.",
};

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

async function getAllCategories() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: {
            CategoriesOnTools: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return categories;
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return [];
  }
}

async function getPopularCategories() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: {
            CategoriesOnTools: true
          }
        }
      },
      orderBy: {
        CategoriesOnTools: {
          _count: 'desc'
        }
      },
      take: 4
    });

    return categories;
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories populaires:", error);
    return [];
  }
}

export default async function CategoriesPage() {
  const [allCategories, popularCategories] = await Promise.all([
    getAllCategories(),
    getPopularCategories()
  ]);

  // Regrouper par première lettre pour créer un index alphabétique
  const categoriesByLetter = allCategories.reduce((acc: Record<string, typeof allCategories>, category) => {
    const firstLetter = category.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(category);
    return acc;
  }, {});

  // Trier les lettres
  const sortedLetters = Object.keys(categoriesByLetter).sort();

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <div className="mb-6">
        <Breadcrumb 
          items={[
            { label: "Catégories", isCurrentPage: true },
          ]}
        />
      </div>
      
      {/* En-tête */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Catégories d'outils
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Explorez notre collection de {allCategories.length} catégories d'outils d'IA pour la vidéo. 
          Trouvez facilement des solutions adaptées à vos besoins spécifiques.
        </p>
      </div>
      
      {/* Recherche */}
      <div className="relative max-w-md mb-10">
        <Input
          type="text"
          placeholder="Rechercher une catégorie..."
          className="pl-10"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        </div>
      </div>
      
      {/* Catégories populaires */}
      {popularCategories.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Catégories populaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCategories.map(category => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow h-full flex flex-col group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mb-4">
                  {getCategoryEmoji(category.slug)}
                </div>
                <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 flex-grow">
                  {category.description && category.description.length > 100
                    ? `${category.description.substring(0, 100)}...`
                    : category.description}
                </p>
                <div className="text-sm text-muted-foreground">
                  {category._count?.CategoriesOnTools || 0} outil{(category._count?.CategoriesOnTools || 0) !== 1 ? 's' : ''}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Index alphabétique */}
      <div className="mb-8 flex flex-wrap gap-2">
        {sortedLetters.map(letter => (
          <Button
            key={letter}
            variant="outline"
            size="sm"
            className="min-w-[2.5rem]"
            asChild
          >
            <a href={`#letter-${letter}`}>{letter}</a>
          </Button>
        ))}
      </div>
      
      {/* Liste alphabétique des catégories */}
      <div className="space-y-10">
        {sortedLetters.map(letter => (
          <div key={letter} id={`letter-${letter}`} className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">{letter}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoriesByLetter[letter].map(category => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl mr-3">
                    {getCategoryEmoji(category.slug)}
                  </div>
                  <div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category._count?.CategoriesOnTools || 0} outil{(category._count?.CategoriesOnTools || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
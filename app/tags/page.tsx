import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Breadcrumb from "@/components/common/Breadcrumb";

export const metadata: Metadata = {
  title: "Tags d'outils d'IA pour vidéo | Vidéo-IA.net",
  description: "Découvrez tous nos tags d'outils d'intelligence artificielle pour la vidéo. Trouvez facilement les outils d'IA par fonctionnalités ou cas d'usage spécifiques.",
};

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

async function getAllTags() {
  try {
    const tags = await db.tag.findMany({
      include: {
        _count: {
          select: {
            TagsOnTools: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return tags;
  } catch (error) {
    console.error("Erreur lors de la récupération des tags:", error);
    return [];
  }
}

async function getPopularTags() {
  try {
    const tags = await db.tag.findMany({
      include: {
        _count: {
          select: {
            TagsOnTools: true
          }
        }
      },
      orderBy: {
        TagsOnTools: {
          _count: 'desc'
        }
      },
      take: 20
    });

    return tags;
  } catch (error) {
    console.error("Erreur lors de la récupération des tags populaires:", error);
    return [];
  }
}

export default async function TagsPage() {
  const [allTags, popularTags] = await Promise.all([
    getAllTags(),
    getPopularTags()
  ]);

  // Regrouper par première lettre pour créer un index alphabétique
  const tagsByLetter = allTags.reduce((acc: Record<string, typeof allTags>, tag) => {
    const firstLetter = tag.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(tag);
    return acc;
  }, {});

  // Trier les lettres
  const sortedLetters = Object.keys(tagsByLetter).sort();

  // Définir les tailles de texte pour le nuage de tags en fonction de la popularité
  const getTagSize = (count: number) => {
    const maxCount = popularTags.length > 0 
      ? Math.max(...popularTags.map(t => t._count?.TagsOnTools || 0))
      : 1;
    
    const minSize = 0.8;
    const maxSize = 2.0;
    
    if (maxCount <= 1) return 1; // Si tous les tags ont 0 ou 1 outil
    
    const normalizedCount = count / maxCount;
    return minSize + normalizedCount * (maxSize - minSize);
  };

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <div className="mb-6">
        <Breadcrumb 
          items={[
            { label: "Tags", isCurrentPage: true },
          ]}
        />
      </div>
      
      {/* En-tête */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Tags d'outils
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Explorez notre collection de {allTags.length} tags d'outils d'IA pour la vidéo. 
          Les tags vous aident à trouver des outils avec des fonctionnalités ou cas d'usage spécifiques.
        </p>
      </div>
      
      {/* Recherche */}
      <div className="relative max-w-md mb-10">
        <Input
          type="text"
          placeholder="Rechercher un tag..."
          className="pl-10"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        </div>
      </div>
      
      {/* Nuage de tags populaires */}
      {popularTags.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Tags populaires</h2>
          <div className="flex flex-wrap gap-3">
            {popularTags.map(tag => {
              const count = tag._count?.TagsOnTools || 0;
              const size = getTagSize(count);
              
              return (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="bg-muted hover:bg-muted/70 text-foreground px-3 py-1.5 rounded-full transition-colors relative group"
                  style={{ fontSize: `${size}rem` }}
                >
                  {tag.name}
                  <span 
                    className="absolute -top-2 -right-2 text-xs bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ fontSize: '0.7rem' }}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
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
      
      {/* Liste alphabétique des tags */}
      <div className="space-y-10">
        {sortedLetters.map(letter => (
          <div key={letter} id={`letter-${letter}`} className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">{letter}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {tagsByLetter[letter].map(tag => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors group justify-between"
                >
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {tag.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {tag._count?.TagsOnTools || 0}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
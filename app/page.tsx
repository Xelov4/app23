import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getImageWithFallback, truncateText, formatPricingType, getCategoryEmoji } from "@/lib/design-system/primitives";
import { Filter, Search, SlidersHorizontal, Grid3x3, List, ChevronDown, Star } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalider les données toutes les heures

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
    console.error("Erreur lors de la récupération des catégories:", error);
    return [];
  }
}

// Récupérer tous les tags
async function getTags() {
  try {
    return await db.tag.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des tags:", error);
    return [];
  }
}

// Récupérer tous les outils
async function getAllTools() {
  try {
    const tools = await db.tool.findMany({
      where: {
        isActive: true,
      },
      include: {
        CategoriesOnTools: {
          include: {
            Category: true,
          },
        },
        TagsOnTools: {
          include: {
            Tag: true,
          },
        },
        Review: true,
        _count: {
          select: {
            Review: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return tools.map(tool => {
      // Calculer la note moyenne
      const rating = tool.Review && tool.Review.length > 0
        ? tool.Review.reduce((acc, review) => acc + review.rating, 0) / tool.Review.length
        : 0;

      return {
        ...tool,
        rating,
        categories: tool.CategoriesOnTools.map(c => ({
          id: c.categoryId,
          name: c.Category.name,
          slug: c.Category.slug
        })),
        tags: tool.TagsOnTools.map(t => ({
          id: t.tagId,
          name: t.Tag.name,
          slug: t.Tag.slug
        })),
        reviewCount: tool._count.Review
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des outils:", error);
    return [];
  }
}

export default async function Home() {
  const [tools, categories, tags] = await Promise.all([
    getAllTools(),
    getCategories(),
    getTags()
  ]);

  // Obtenir les types de tarification uniques
  const pricingTypes = [...new Set(tools.map(tool => tool.pricingType))].filter(Boolean);

  return (
    <div className="bg-background min-h-screen">
      {/* En-tête simple */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Tous les outils d'IA pour la vidéo
            </h1>
            <p className="text-primary-100 mb-6">
              Découvrez notre base de données complète des meilleurs outils d'IA pour la création, l'édition et la production vidéo.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Input 
                placeholder="Rechercher un outil..." 
                className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur border-white/20 text-white placeholder:text-white/60 hover:bg-white/20 focus:bg-white/20"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Barre latérale des filtres */}
          <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 space-y-6">
            <div className="sticky top-4">
              {/* En-tête des filtres - visible uniquement sur mobile */}
              <div className="flex md:hidden items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Filter size={18} className="mr-2" />
                  Filtres
                </h2>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <SlidersHorizontal size={16} />
                  Filtrer
                </Button>
              </div>
              
              {/* Filtres conteneur */}
              <div className="bg-card rounded-lg shadow p-5 space-y-6">
                {/* Tri */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Trier par</h3>
                  <Select defaultValue="name_asc">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un tri" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name_asc">Nom (A-Z)</SelectItem>
                      <SelectItem value="name_desc">Nom (Z-A)</SelectItem>
                      <SelectItem value="rating_desc">Note (Meilleure)</SelectItem>
                      <SelectItem value="rating_asc">Note (Pire)</SelectItem>
                      <SelectItem value="date_desc">Date (Récent)</SelectItem>
                      <SelectItem value="date_asc">Date (Ancien)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Affichage */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Affichage</h3>
                  <div className="flex rounded-md overflow-hidden border">
                    <button className="flex-1 flex items-center justify-center py-2 bg-primary text-white">
                      <Grid3x3 size={16} />
                    </button>
                    <button className="flex-1 flex items-center justify-center py-2 bg-card hover:bg-muted transition-colors">
                      <List size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Catégories */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Catégories</h3>
                  <div className="max-h-52 overflow-y-auto space-y-2 pr-2">
                    {categories.slice(0, 10).map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox id={`category-${category.id}`} />
                        <label 
                          htmlFor={`category-${category.id}`}
                          className="text-sm flex items-center cursor-pointer"
                        >
                          <span>{getCategoryEmoji(category.slug)}</span>
                          <span className="ml-1">{category.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            ({category._count.CategoriesOnTools})
                          </span>
                        </label>
                      </div>
                    ))}
                    {categories.length > 10 && (
                      <Button variant="link" size="sm" className="text-xs w-full">
                        Voir plus de catégories
                        <ChevronDown size={14} className="ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Types de prix */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Tarification</h3>
                  <div className="space-y-2">
                    {pricingTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox id={`price-${type}`} />
                        <label 
                          htmlFor={`price-${type}`}
                          className="text-sm flex items-center cursor-pointer"
                        >
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            formatPricingType(type).className
                          }`}>
                            {formatPricingType(type).label}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Boutons d'action */}
                <div className="pt-2 flex flex-col space-y-2">
                  <Button variant="outline" size="sm">
                    Effacer les filtres
                  </Button>
                  <Button size="sm">
                    Appliquer les filtres
                  </Button>
                </div>
              </div>
            </div>
          </aside>
          
          {/* Liste des outils */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{tools.length} outils trouvés</h2>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Filtres actifs:</span>
                <Badge variant="outline" className="flex items-center">
                  Gratuit
                  <button className="ml-1 text-muted-foreground/70 hover:text-muted-foreground">×</button>
                </Badge>
              </div>
            </div>

            {/* Grille d'outils */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tools.map((tool) => (
                <Link 
                  href={`/tools/${tool.slug}`} 
                  key={tool.id}
                  className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full"
                >
                  <div className="relative bg-muted aspect-video">
                    <Image
                      src={getImageWithFallback(tool.logoUrl)}
                      alt={tool.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain p-4"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg mb-1">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-grow">
                      {truncateText(tool.description, 100)}
                    </p>
                    <div className="mt-auto">
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={`${
                                star <= Math.round(tool.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({tool.reviewCount})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={tool.pricingType === "free" ? "success" : "secondary"}>
                          {formatPricingType(tool.pricingType).label}
                        </Badge>
                        {tool.categories[0] && (
                          <Badge variant="outline" className="flex items-center">
                            <span className="mr-1">{getCategoryEmoji(tool.categories[0].slug)}</span>
                            {tool.categories[0].name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

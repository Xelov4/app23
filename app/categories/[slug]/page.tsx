import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getImageWithFallback, formatPricingType, getCategoryEmoji, truncateText } from "@/lib/design-system/primitives";
import { ArrowLeft, Filter, Star } from "lucide-react";

export const revalidate = 3600; // Revalider les données toutes les heures
export const dynamic = 'force-dynamic';

// Fonction pour générer les métadonnées de la page
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    return {
      title: 'Catégorie non trouvée',
      description: 'Cette catégorie n\'existe pas dans notre base de données.'
    };
  }
  
  return {
    title: `${category.name} - Outils IA pour la vidéo`,
    description: `Découvrez tous les outils d'IA pour ${category.name}. Une sélection d'outils de qualité pour améliorer vos projets vidéo.`
  };
}

// Récupérer une catégorie par son slug
async function getCategoryBySlug(slug: string) {
  try {
    return await db.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { CategoriesOnTools: true }
        }
      }
    });
  } catch (error) {
    console.error("Échec de la récupération de la catégorie:", error);
    return null;
  }
}

// Récupérer les outils d'une catégorie
async function getToolsByCategory(categorySlug: string) {
  try {
    const tools = await db.tool.findMany({
      where: {
        isActive: true,
        CategoriesOnTools: {
          some: {
            Category: {
              slug: categorySlug
            }
          }
        }
      },
      include: {
        CategoriesOnTools: {
          include: {
            Category: true
          }
        },
        Review: true,
        TagsOnTools: {
          include: {
            Tag: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Calculer la note moyenne pour chaque outil et transformer la structure
    return tools.map(tool => {
      // Calculer la note moyenne si des avis existent
      let rating = 0;
      const reviews = tool.Review || [];
      
      if (reviews.length > 0) {
        const sum = reviews.reduce((total: number, review: any) => {
          return total + (review.rating || 0);
        }, 0);
        rating = sum / reviews.length;
      }
      
      // Transformer pour être utilisé dans l'interface
      return {
        ...tool,
        rating,
        categories: tool.CategoriesOnTools.map(cat => ({
          id: cat.categoryId,
          slug: cat.Category.slug,
          name: cat.Category.name
        }))
      };
    });
  } catch (error) {
    console.error("Échec de la récupération des outils par catégorie:", error);
    return [];
  }
}

// Récupérer les catégories liées
async function getRelatedCategories(categorySlug: string) {
  try {
    // Récupérer d'abord les outils de cette catégorie
    const toolIds = await db.categoriesOnTools.findMany({
      where: {
        Category: {
          slug: categorySlug
        }
      },
      select: {
        toolId: true
      }
    });

    // Récupérer les catégories liées à ces outils (sauf la catégorie actuelle)
    if (toolIds.length > 0) {
      const relatedCategories = await db.category.findMany({
        where: {
          AND: [
            { 
              slug: { 
                not: categorySlug 
              } 
            },
            {
              CategoriesOnTools: {
                some: {
                  toolId: {
                    in: toolIds.map(t => t.toolId)
                  }
                }
              }
            }
          ]
        },
        include: {
          _count: {
            select: {
              CategoriesOnTools: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        },
        take: 10
      });
      
      return relatedCategories;
    }
    
    return [];
  } catch (error) {
    console.error("Échec de la récupération des catégories liées:", error);
    return [];
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  
  // Si la catégorie n'existe pas, retourner une 404
  if (!category) {
    notFound();
  }
  
  const tools = await getToolsByCategory(params.slug);
  const relatedCategories = await getRelatedCategories(params.slug);
  
  // Type pour les outils transformés
  type TransformedTool = {
    id: string;
    name: string;
    slug: string;
    description: string;
    logoUrl: string | null;
    pricingType: string;
    rating: number;
    categories: {
      id: string;
      name: string;
      slug: string;
    }[];
  };
  
  return (
    <div className="bg-background min-h-screen">
      {/* En-tête simple */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <Link href="/categories" className="flex items-center text-white/80 hover:text-white mb-6 self-start">
              <ArrowLeft size={16} className="mr-2" />
              Toutes les catégories
            </Link>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-4xl mx-auto mb-4">
                {getCategoryEmoji(category.slug)}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {category.name}
              </h1>
              <p className="text-primary-100">
                {category._count.CategoriesOnTools} outil{category._count.CategoriesOnTools !== 1 ? 's' : ''} disponible{category._count.CategoriesOnTools !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        {/* Barre d'outils */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          {/* Champ de recherche */}
          <div className="relative w-full md:w-auto md:flex-1 max-w-md">
            <Input 
              placeholder="Rechercher dans cette catégorie..." 
              className="pl-10"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
          </div>
          
          {/* Filtres et tri */}
          <div className="flex gap-3 w-full md:w-auto">
            <Select defaultValue="name">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom (A-Z)</SelectItem>
                <SelectItem value="nameDesc">Nom (Z-A)</SelectItem>
                <SelectItem value="rating">Meilleure note</SelectItem>
                <SelectItem value="newest">Plus récents</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} /> Filtres
            </Button>
          </div>
        </div>
        
        {/* Liste des outils */}
        {tools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {tools.map((tool: TransformedTool) => {
              const { label, className } = formatPricingType(tool.pricingType);
              
              return (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="bg-card rounded-lg border hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden group"
                >
                  {/* Image */}
                  <div className="p-4 flex items-center">
                    <Image
                      src={getImageWithFallback(tool.logoUrl)}
                      alt={tool.name}
                      width={48}
                      height={48}
                      className="rounded-md mr-4 bg-gray-50 object-contain"
                    />
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">{tool.name}</h3>
                      {tool.rating > 0 && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Star size={14} className="text-yellow-500 fill-yellow-500 mr-1" />
                          {tool.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Description et badges */}
                  <div className="p-4 pt-0 flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground mb-3 flex-1">
                      {truncateText(tool.description, 100)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <Badge className={className}>{label}</Badge>
                      
                      {/* Afficher les badges des catégories supplémentaires */}
                      {tool.categories && tool.categories.length > 1 && (
                        <div className="flex items-center gap-1">
                          {tool.categories
                            .filter((cat) => cat.slug !== category.slug)
                            .slice(0, 2)
                            .map((cat) => (
                              <Badge key={cat.id} variant="outline" className="text-xs">
                                {cat.name}
                              </Badge>
                            ))}
                            
                          {tool.categories.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{tool.categories.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Aucun outil disponible</h3>
            <p className="text-muted-foreground mb-6">
              Il n'y a actuellement aucun outil dans cette catégorie.
            </p>
            <Button asChild>
              <Link href="/categories">Voir d'autres catégories</Link>
            </Button>
          </div>
        )}
        
        {/* Catégories liées */}
        {relatedCategories.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Catégories liées</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {relatedCategories.map(related => (
                <Link
                  key={related.id}
                  href={`/categories/${related.slug}`}
                  className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow flex items-center"
                >
                  <div className="mr-3 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                    {getCategoryEmoji(related.slug)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{related.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {related._count.CategoriesOnTools} outil{related._count.CategoriesOnTools !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ArrowLeft size={16} className="text-muted-foreground ml-2 rotate-180" />
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Suggestion d'ajout d'outil */}
        <div className="mt-12 bg-muted/50 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Connaissez-vous un autre outil pour {category.name}?</h3>
          <p className="text-muted-foreground max-w-lg mx-auto mb-4">
            Si vous connaissez un outil qui n'est pas encore dans notre base de données, n'hésitez pas à nous le faire savoir.
          </p>
          <Button asChild>
            <Link href="/suggest">Suggérer un outil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 
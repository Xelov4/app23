import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { 
  formatPricingType, 
  getImageWithFallback, 
  truncateText,
  getCategoryEmoji
} from "@/lib/design-system/primitives";
import { SearchForm } from "@/components/ui/search-form";
import { FilterBar } from "@/components/ui/filter-bar";
import { FiltersDropdown } from "@/components/ui/filters-dropdown";

export const revalidate = 3600; // Revalider les données toutes les heures
export const dynamic = 'force-dynamic';

// Fonction pour extraire le texte brut du HTML
function htmlToPlainText(html: string): string {
  try {
    // Supprimer les balises HTML
    const plainText = html.replace(/<[^>]*>?/gm, '');
    // Remplacer les entités HTML courantes
    return plainText
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  } catch (error) {
    console.error("Erreur lors de la conversion du HTML en texte brut:", error);
    return html; // Retourner le HTML original en cas d'erreur
  }
}

// Fonction pour récupérer les outils avec pagination et filtrage
async function getTools({
  page = 1,
  limit = 12,
  searchTerm = '',
  filters = {}
}: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  filters?: any;
}) {
  try {
    const skip = (page - 1) * limit;
    
    // Construire la requête de filtrage
    const where: any = {
      isActive: true
    };
    
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }
    
    if (filters.pricing?.length) {
      where.pricingType = { in: filters.pricing };
    }
    
    if (filters.categories?.length) {
      where.CategoriesOnTools = {
        some: {
          categoryId: { in: filters.categories }
        }
      };
    }
    
    if (filters.tags?.length) {
      where.TagsOnTools = {
        some: {
          tagId: { in: filters.tags }
        }
      };
    }
    
    // Exécuter les requêtes en parallèle
    const [tools, totalItems, categories, tags] = await Promise.all([
      db.tool.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' }
        ],
        include: {
          CategoriesOnTools: {
            include: {
              Category: true
            }
          },
          TagsOnTools: {
            include: {
              Tag: true
            }
          },
          Review: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      }),
      db.tool.count({ where }),
      db.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { CategoriesOnTools: true } } }
      }),
      db.tag.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { TagsOnTools: true } } }
      })
    ]);
    
    // Transformer les données des outils
    const transformedTools = tools.map(tool => ({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      description: htmlToPlainText(tool.description),
      logoUrl: tool.logoUrl,
      websiteUrl: tool.websiteUrl,
      features: typeof tool.features === 'string' 
        ? tool.features.split(';').map(f => f.trim()).filter(Boolean)
        : tool.features || [],
      pricingType: tool.pricingType,
      pricingDetails: tool.pricingDetails,
      httpCode: tool.httpCode,
      rating: tool.rating,
      reviewCount: tool.reviewCount,
      latestReview: tool.Review.length > 0 ? tool.Review[0] : null,
      categories: tool.CategoriesOnTools.map(ct => ct.Category),
      primaryCategory: tool.CategoriesOnTools[0]?.Category || null,
      tags: tool.TagsOnTools.map(tt => tt.Tag),
      socialLinks: {
        twitter: tool.twitterUrl,
        instagram: tool.instagramUrl,
        facebook: tool.facebookUrl,
        linkedin: tool.linkedinUrl,
        github: tool.githubUrl
      }
    }));
    
    return {
      tools: transformedTools,
      categories,
      tags,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    console.error("Échec de la récupération des outils:", error);
    return {
      tools: [],
      categories: [],
      tags: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit
      }
    };
  }
}

// Récupérer les outils mis en avant
async function getFeaturedTools() {
  try {
    // Récupérer les 6 outils les mieux notés
    const featuredTools = await db.tool.findMany({
      where: {
        isActive: true,
        rating: { gt: 0 }
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' }
      ],
      take: 6,
      include: {
        CategoriesOnTools: {
          include: {
            Category: true
          }
        },
        TagsOnTools: {
          include: {
            Tag: true
          }
        }
      }
    });

    return featuredTools.map(tool => ({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      description: htmlToPlainText(tool.description),
      logoUrl: tool.logoUrl,
      websiteUrl: tool.websiteUrl,
      pricingType: tool.pricingType,
      categories: tool.CategoriesOnTools.map(ct => ct.Category),
      tags: tool.TagsOnTools.map(tt => tt.Tag),
      primaryCategory: tool.CategoriesOnTools[0]?.Category || null,
      rating: tool.rating,
      reviewCount: tool.reviewCount
    }));
  } catch (error) {
    console.error("Échec de la récupération des outils mis en avant:", error);
    return [];
  }
}

export default async function ToolsPage({
  searchParams
}: {
  searchParams: {
    page?: string;
    search?: string;
    pricing?: string;
    categories?: string;
    tags?: string;
    view?: string;
    sort?: string;
  }
}) {
  // Attendre les searchParams avant de les utiliser
  const params = await Promise.resolve(searchParams);
  const currentPage = parseInt(params.page || '1', 10);
  const searchTerm = params.search || '';
  const viewMode = params.view || 'grid'; // grid ou list
  
  // Préparer les filtres
  const filters: any = {};
  
  if (params.pricing) {
    filters.pricing = params.pricing.split(',');
  }
  
  if (params.categories) {
    filters.categories = params.categories.split(',');
  }
  
  if (params.tags) {
    filters.tags = params.tags.split(',');
  }
  
  // Récupérer les données en parallèle
  const [toolsData, featuredTools] = await Promise.all([
    getTools({ page: currentPage, searchTerm, filters }),
    searchTerm || Object.keys(filters).length > 0 ? [] : getFeaturedTools()
  ]);
  
  const { tools, categories, tags, pagination } = toolsData;
  
  // Déterminer si nous affichons les outils en vedette
  const showFeaturedTools = featuredTools.length > 0 && currentPage === 1 && !searchTerm && Object.keys(filters).length === 0;
  
  return (
    <div className="min-h-screen bg-background">
      {/* En-tête de la page avec recherche et titre */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white">
        {/* Motifs en arrière-plan */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.15"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 animate-fade-in">
              Outils d'IA vidéo
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-6 animate-fade-in max-w-2xl mx-auto">
              Découvrez notre sélection d'outils d'IA pour créer, éditer et produire des vidéos professionnelles
            </p>
            <div className="w-full max-w-2xl mx-auto mt-8">
              <SearchForm 
                defaultValue={searchTerm} 
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 hover:bg-white/20 focus-within:bg-white/20 focus-within:ring-2 ring-white/30" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <div className="container px-4 mx-auto py-10">
        {/* Afficher les outils en vedette avec un nouveau design */}
        {showFeaturedTools && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 inline-flex items-center">
              <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 p-1.5 rounded-md mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </span>
              Outils populaires
            </h2>
            
            {/* Carousel des outils populaires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTools.slice(0, 3).map((tool) => (
                <Link key={tool.id} href={`/tools/${tool.slug}`} className="group">
                  <div className="h-full rounded-xl overflow-hidden shadow-sm border border-muted bg-white dark:bg-gray-800 hover:shadow-md hover:border-primary/30 transition-all duration-300">
                    {/* Image de l'outil */}
                    <div className="aspect-[16/9] bg-muted/50 relative">
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-yellow-400/90 dark:bg-yellow-400/80 text-yellow-950 text-xs font-medium px-2 py-1 rounded-full flex items-center backdrop-blur-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                          {tool.rating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                      <img 
                        src={getImageWithFallback(tool.logoUrl)} 
                        alt={tool.name}
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                    
                    {/* Contenu */}
                    <div className="p-5">
                      <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors">{tool.name}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {truncateText(tool.description, 120)}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-muted">
                        <Badge variant={formatPricingType(tool.pricingType).className.includes('success') ? 'success' : 'default'} size="sm">
                          {formatPricingType(tool.pricingType).label}
                        </Badge>
                        <div className="flex items-center text-sm">
                          <span className="text-lg mr-1.5">{getCategoryEmoji(tool.primaryCategory?.slug)}</span>
                          <span className="text-muted-foreground">{tool.primaryCategory?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        
        {/* Interface de recherche et filtrage */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Barre latérale des filtres (desktop) */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-muted p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filtres
              </h3>
              <FilterBar 
                categories={categories} 
                tags={tags} 
                currentFilters={filters}
                searchParams={params}
              />
            </div>
          </aside>
          
          {/* Contenu principal - Outils */}
          <main className="flex-1">
            {/* Barre de filtres mobile */}
            <div className="lg:hidden mb-6">
              <FiltersDropdown 
                categories={categories} 
                tags={tags} 
                currentFilters={filters}
                searchParams={params}
              />
            </div>
            
            {/* En-tête avec résultats/tri/vue */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b">
              <h2 className="text-xl font-semibold mb-4 sm:mb-0">
                {searchTerm 
                  ? `Résultats pour "${searchTerm}" (${pagination.totalItems})` 
                  : Object.keys(filters).length > 0
                    ? `Outils filtrés (${pagination.totalItems})`
                    : `Tous les outils (${pagination.totalItems})`}
              </h2>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-1 border rounded-md p-1 bg-white dark:bg-gray-800">
                  <Link 
                    href={`/tools?${new URLSearchParams({...params, view: 'grid'}).toString()}`}
                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                    aria-label="Vue grille"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                  </Link>
                  <Link 
                    href={`/tools?${new URLSearchParams({...params, view: 'list'}).toString()}`}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-muted' : ''}`}
                    aria-label="Vue liste"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>
                  </Link>
                </div>
                <select 
                  className="border rounded-md p-2 text-sm bg-white dark:bg-gray-800"
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams as any);
                    params.set('sort', e.target.value);
                    window.location.href = `/tools?${params.toString()}`;
                  }}
                  defaultValue={params.sort || 'rating'}
                  aria-label="Trier par"
                >
                  <option value="rating">Les mieux notés</option>
                  <option value="newest">Plus récents</option>
                  <option value="name">Alphabétique</option>
                </select>
              </div>
            </div>
            
            {/* Affichage des outils en grille ou liste */}
            {tools.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-muted shadow-sm">
                <div className="w-16 h-16 bg-muted/50 rounded-full mx-auto flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                    <path d="M8 11h6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucun outil trouvé</h3>
                <p className="text-muted-foreground mb-6">
                  Aucun outil ne correspond à votre recherche ou aux filtres sélectionnés.
                </p>
                <Button asChild variant="outline">
                  <Link href="/tools">Réinitialiser les filtres</Link>
                </Button>
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {tools.map((tool) => (
                  <Link key={tool.id} href={`/tools/${tool.slug}`} className="group block">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-muted group-hover:border-primary/30 overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-muted/30 flex items-center justify-center p-4 relative">
                          {tool.rating && (
                            <div className="absolute top-2 right-2 z-10">
                              <span className="bg-yellow-400/90 dark:bg-yellow-400/80 text-yellow-950 text-xs px-1.5 py-0.5 rounded-full flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="mr-0.5">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                {tool.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          <img 
                            src={getImageWithFallback(tool.logoUrl)} 
                            alt={tool.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <h3 className="font-medium text-lg group-hover:text-primary transition-colors">{tool.name}</h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant={formatPricingType(tool.pricingType).className.includes('success') ? 'success' : 'default'} size="sm">
                                {formatPricingType(tool.pricingType).label}
                              </Badge>
                              {tool.httpCode !== null && (
                                <Badge variant={tool.httpCode >= 200 && tool.httpCode < 400 ? 'outline' : 'destructive'} size="sm">
                                  {tool.httpCode >= 200 && tool.httpCode < 400 ? 'Site en ligne' : 'Problème d\'accès'}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-4 flex-grow">
                            {truncateText(tool.description, 160)}
                          </p>
                          <div className="flex flex-wrap gap-2 items-center mt-auto pt-3 border-t border-muted">
                            {tool.categories.slice(0, 3).map(category => (
                              <Badge key={category.id} variant="secondary" size="sm" className="flex items-center">
                                <span className="mr-1">{getCategoryEmoji(category.slug)}</span>
                                {category.name}
                              </Badge>
                            ))}
                            {tool.features.length > 0 && (
                              <span className="text-xs text-muted-foreground ml-2">
                                {tool.features.length} fonctionnalités
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tools.map((tool) => (
                  <Link key={tool.id} href={`/tools/${tool.slug}`} className="group">
                    <div className="h-full rounded-xl overflow-hidden shadow-sm border border-muted bg-white dark:bg-gray-800 hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col">
                      {/* Image de l'outil */}
                      <div className="aspect-video bg-muted/30 relative">
                        {tool.rating && (
                          <div className="absolute top-2 right-2 z-10">
                            <span className="bg-yellow-400/90 dark:bg-yellow-400/80 text-yellow-950 text-xs px-1.5 py-0.5 rounded-full flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="mr-0.5">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                              {tool.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                        <img 
                          src={getImageWithFallback(tool.logoUrl)} 
                          alt={tool.name}
                          className="w-full h-full object-contain p-3"
                        />
                      </div>
                      
                      {/* Contenu */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-medium text-base md:text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{tool.name}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
                          {tool.description}
                        </p>
                        
                        <div className="mt-auto">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant={formatPricingType(tool.pricingType).className.includes('success') ? 'success' : 'default'} size="sm">
                              {formatPricingType(tool.pricingType).label}
                            </Badge>
                            {tool.primaryCategory && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <span className="mr-1">{getCategoryEmoji(tool.primaryCategory.slug)}</span>
                                <span>{tool.primaryCategory.name}</span>
                              </div>
                            )}
                          </div>
                          
                          {tool.features.length > 0 && (
                            <div className="pt-3 border-t border-muted">
                              <div className="text-xs text-muted-foreground mb-2">
                                {tool.features.length > 3 ? `${tool.features.length} fonctionnalités dont:` : "Fonctionnalités:"}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {tool.features.slice(0, 3).map((feature, i) => (
                                  <Badge key={i} variant="outline" size="sm">
                                    {truncateText(feature, 20)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination 
                  currentPage={pagination.currentPage} 
                  totalPages={pagination.totalPages}
                  basePath="/tools"
                  searchParams={new URLSearchParams(
                    Object.entries(params)
                      .filter(([_, value]) => value !== undefined)
                      .map(([key, value]) => [key, value as string])
                  )}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
} 
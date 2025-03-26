import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToolCard } from "@/components/ui/tool-card";
import { Pagination } from "@/components/ui/pagination";
import { PricingType } from "@prisma/client";

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
    const [tools, totalItems] = await Promise.all([
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
          }
        }
      }),
      db.tool.count({ where })
    ]);
    
    // Transformer les données des outils
    const transformedTools = tools.map(tool => ({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      description: htmlToPlainText(tool.description),
      logoUrl: tool.logoUrl,
      websiteUrl: tool.websiteUrl,
      pricingType: tool.pricingType,
      category: tool.CategoriesOnTools[0]?.Category.name || "Non catégorisé",
      categoryId: tool.CategoriesOnTools[0]?.categoryId,
      features: tool.features || []
    }));
    
    return {
      tools: transformedTools,
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
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit
      }
    };
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
  }
}) {
  // Attendre les searchParams avant de les utiliser
  const params = await Promise.resolve(searchParams);
  const currentPage = parseInt(params.page || '1', 10);
  const searchTerm = params.search || '';
  
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
  
  // Récupérer les données
  const toolsData = await getTools({ 
    page: currentPage, 
    searchTerm, 
    filters 
  });
  
  const { tools, pagination } = toolsData;
  
  return (
    <>
      {/* En-tête de la page */}
      <section className="bg-gradient-to-b from-primary-50 to-background py-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 animate-fade-in">
              Catalogue d'outils d'IA vidéo
            </h1>
            <p className="text-lg text-muted-foreground mb-6 animate-fade-in">
              Découvrez tous les outils d'IA pour la création, l'édition et la production vidéo
            </p>
          </div>
        </div>
      </section>
      
      <div className="container px-4 mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Barre latérale des filtres - TEMPORAIREMENT DÉSACTIVÉE */}
          {/*<aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-4">
              <div className="space-y-4 p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium mb-2">Recherche</h3>
                  <div className="relative">
                    <form action="/tools" method="get">
                      <input 
                        type="text"
                        name="search"
                        placeholder="Rechercher..."
                        className="w-full p-2 border rounded"
                        defaultValue={searchTerm}
                      />
                      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                        🔍
                      </button>
                    </form>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Filtres</h3>
                  <div className="text-sm text-muted-foreground">
                    Les filtres seront disponibles prochainement
                  </div>
                </div>
              </div>
            </div>
          </aside>*/}
          
          {/* Contenu principal - Outils */}
          <main className="flex-1">
            {/* En-tête avec résultats/tri */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-xl font-semibold">
                {searchTerm 
                  ? `Résultats pour "${searchTerm}" (${pagination.totalItems})` 
                  : `Tous les outils (${pagination.totalItems})`}
              </h2>
              
              {/* Options de tri - peut être implémentée ultérieurement */}
            </div>
            
            {/* Affichage des outils en grille */}
            {tools.length === 0 ? (
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Aucun outil trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  Aucun outil ne correspond à votre recherche ou aux filtres sélectionnés.
                </p>
                <Button asChild variant="outline">
                  <Link href="/tools">Réinitialiser les filtres</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tools.map((tool) => (
                  <ToolCard 
                    key={tool.id} 
                    tool={tool} 
                  />
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
    </>
  );
} 
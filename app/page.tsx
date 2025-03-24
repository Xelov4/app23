import Link from "next/link";
import { db } from "@/lib/db";

export const revalidate = 3600; // Revalider les données au maximum toutes les heures
export const dynamic = 'force-dynamic';

// Association d'emoji pour chaque catégorie
const categoryEmojis: Record<string, string> = {
  "generation-videos": "🎬",
  "edition-videos": "✂️",
  "animation": "🎭",
  "audio": "🎵",
  "voix": "🗣️",
  "transcription": "📝",
  "sous-titres": "💬",
  "effets-speciaux": "✨",
  "montage": "🎞️",
  "image-generation": "🖼️",
  "3d": "🧊",
  "realite-augmentee": "👓",
  "realite-virtuelle": "🥽",
  "avatars": "👤",
  "traduction": "🌐",
  "musique": "🎼",
  "analytics": "📊",
  "marketing": "📣",
  "diffusion": "📡",
  "monetisation": "💰"
};

// Récupération des filtres disponibles
async function getFilterOptions() {
  try {
    const [pricingTypes, allCategories, allTags] = await Promise.all([
      db.tool.findMany({
        select: { pricingType: true },
        distinct: ["pricingType"]
      }),
      db.category.findMany({
        orderBy: { 
          CategoriesOnTools: {
            _count: 'desc'
          }
        },
        include: {
          _count: { select: { CategoriesOnTools: true } }
        }
      }),
      db.tag.findMany({
        orderBy: {
          TagsOnTools: {
            _count: 'desc'
          }
        },
        include: {
          _count: { select: { TagsOnTools: true } }
        },
        take: 10
      })
    ]);

    return {
      pricingTypes: pricingTypes.map(p => p.pricingType),
      categories: allCategories,
      tags: allTags
    };
  } catch (error) {
    console.error("Échec de la récupération des options de filtrage:", error);
    return {
      pricingTypes: [],
      categories: [],
      tags: []
    };
  }
}

async function getCategories() {
  try {
    return await db.category.findMany({
      take: 12,
      orderBy: {
        CategoriesOnTools: {
          _count: 'desc'
        }
      }
    });
  } catch (error) {
    console.error("Échec de la récupération des catégories:", error);
    return [];
  }
}

async function getFeaturedTools(page = 1, pageSize = 6, filters = {}) {
  try {
    // Obtenir le nombre total pour la pagination
    const totalCount = await db.tool.count();
    
    // Calculer la pagination
    const totalPages = Math.ceil(totalCount / pageSize);
    const skip = (page - 1) * pageSize;
    
    // Obtenir les outils avec pagination
    const tools = await db.tool.findMany({
      skip,
      take: pageSize,
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        CategoriesOnTools: {
          include: {
            Category: true
          }
        }
      }
    });

    // Transformer les données dans un format plus simple
    const transformedTools = tools.map(tool => ({
      id: tool.id,
      slug: tool.slug,
      name: tool.name,
      description: tool.description,
      imageUrl: tool.logoUrl,
      category: tool.CategoriesOnTools[0]?.Category.name || "Non catégorisé",
      pricing: tool.pricingType
    }));

    return {
      tools: transformedTools,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        pageSize
      }
    };
  } catch (error) {
    console.error("Échec de la récupération des outils:", error);
    return { 
      tools: [], 
      pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: page,
        pageSize
      } 
    };
  }
}

export default async function Home({ searchParams }: { searchParams: { page?: string, category?: string, pricing?: string } }) {
  // Obtenir la page actuelle à partir des paramètres de requête URL ou par défaut à 1
  const params = await searchParams;
  const currentPage = params?.page ? parseInt(params.page, 10) : 1;
  
  const [filterOptions, featuredCategories, featuredToolsData] = await Promise.all([
    getFilterOptions(),
    getCategories(),
    getFeaturedTools(currentPage)
  ]);
  
  const { tools: featuredTools, pagination } = featuredToolsData;

  // Pagination: Afficher au maximum 3 pages autour de la page actuelle
  const generatePaginationItems = (currentPage: number, totalPages: number) => {
    // Toujours afficher la première, la dernière, et au max 3 pages autour de la page actuelle
    const items = [];
    
    // Première page toujours visible
    items.push(1);
    
    // Pages autour de la page actuelle
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    if (start > 2) {
      items.push('...');
    }
    
    for (let i = start; i <= end; i++) {
      items.push(i);
    }
    
    if (end < totalPages - 1) {
      items.push('...');
    }
    
    // Dernière page si différente de la première
    if (totalPages > 1) {
      items.push(totalPages);
    }
    
    return items;
  };
  
  const paginationItems = generatePaginationItems(pagination.currentPage, pagination.totalPages);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-center mb-6">Video-IA.net</h1>
        <p className="text-xl text-center text-gray-600 max-w-2xl mx-auto">
          Le répertoire définitif des outils d'IA pour la vidéo et l'image
        </p>
        
        <div className="mt-8 max-w-xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un outil IA..."
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-md">
              Rechercher
            </button>
          </div>
        </div>
      </header>

      {/* Section des catégories populaires sous forme de nuage de tags */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Catégories populaires</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-800 text-sm font-medium flex items-center"
            >
              <span className="mr-1.5">{categoryEmojis[category.slug] || "🔍"}</span>
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar de filtres */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-4 bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Filtres</h3>
            
            {/* Filtres par prix */}
            <div className="mb-5">
              <h4 className="font-medium mb-2">Prix</h4>
              <div className="space-y-2">
                {filterOptions.pricingTypes.map((pricingType) => (
                  <div key={pricingType} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`price-${pricingType}`} 
                      className="mr-2"
                    />
                    <label htmlFor={`price-${pricingType}`} className="text-sm">
                      {pricingType === "FREE" ? "Gratuit" : 
                       pricingType === "PAID" ? "Payant" : 
                       pricingType === "FREEMIUM" ? "Freemium" : 
                       "Abonnement"}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Filtres par catégorie */}
            <div className="mb-5">
              <h4 className="font-medium mb-2">Catégories</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filterOptions.categories.slice(0, 8).map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`cat-${category.id}`} 
                      className="mr-2"
                    />
                    <label htmlFor={`cat-${category.id}`} className="text-sm flex items-center">
                      <span className="mr-1">{categoryEmojis[category.slug] || "🔍"}</span>
                      {category.name}
                      <span className="ml-1 text-xs text-gray-500">({category._count.CategoriesOnTools})</span>
                    </label>
                  </div>
                ))}
              </div>
              {filterOptions.categories.length > 8 && (
                <button className="text-blue-600 text-sm mt-2 hover:underline">
                  Voir plus
                </button>
              )}
            </div>
            
            {/* Filtres par tag */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Tags populaires</h4>
              <div className="flex flex-wrap gap-2">
                {filterOptions.tags.map((tag) => (
                  <div 
                    key={tag.id}
                    className="px-2 py-1 bg-gray-100 rounded-full text-xs cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                Appliquer les filtres
              </button>
              <button className="w-full text-gray-600 py-2 mt-2 text-sm hover:underline">
                Réinitialiser
              </button>
            </div>
          </div>
        </aside>

        {/* Contenu principal - Outils IA */}
        <section className="flex-1">
          <h2 className="text-2xl font-bold mb-6">Outils IA en vedette</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredTools.map((tool) => (
              <div key={tool.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 relative">
                  {tool.imageUrl && (
                    <img 
                      src={tool.imageUrl} 
                      alt={tool.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {tool.pricing === "FREE" ? "Gratuit" : 
                     tool.pricing === "PAID" ? "Payant" : 
                     tool.pricing === "FREEMIUM" ? "Freemium" : 
                     "Abonnement"}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-1">
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{tool.category}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{tool.name}</h3>
                  <p className="text-gray-600 line-clamp-2">{tool.description}</p>
                  <Link 
                    href={`/tools/${tool.slug}`}
                    className="mt-4 inline-block text-blue-600 hover:underline"
                  >
                    Voir plus →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination améliorée */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                <Link
                  href={`/?page=${Math.max(1, pagination.currentPage - 1)}`}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.currentPage === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
                
                {paginationItems.map((item, index) => (
                  item === '...' ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    >
                      ...
                    </span>
                  ) : (
                    <Link
                      key={`page-${item}`}
                      href={`/?page=${item}`}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        item === pagination.currentPage
                          ? 'border-blue-500 bg-blue-50 text-blue-600 z-10'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      } text-sm font-medium`}
                    >
                      {item}
                    </Link>
                  )
                ))}

                <Link
                  href={`/?page=${Math.min(pagination.totalPages, pagination.currentPage + 1)}`}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.currentPage === pagination.totalPages 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Suivant</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </nav>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

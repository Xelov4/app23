import Link from "next/link";
import { db } from "@/lib/db";

export const revalidate = 3600; // Revalider les données au maximum toutes les heures
export const dynamic = 'force-dynamic';

async function getCategories() {
  try {
    return await db.category.findMany({
      take: 3,
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

async function getFeaturedTools(page = 1, pageSize = 6) {
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

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  // Obtenir la page actuelle à partir des paramètres de requête URL ou par défaut à 1
  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  
  const [featuredCategories, featuredToolsData] = await Promise.all([
    getCategories(),
    getFeaturedTools(currentPage)
  ]);
  
  const { tools: featuredTools, pagination } = featuredToolsData;

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

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Catégories populaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="p-6 border rounded-lg hover:shadow-md transition-shadow bg-gray-50"
            >
              <h3 className="text-xl font-semibold">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Outils IA en vedette</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <span className="text-sm text-gray-500">{tool.category}</span>
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
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="inline-flex rounded-md shadow">
              {pagination.currentPage > 1 && (
                <Link
                  href={`/?page=${pagination.currentPage - 1}`}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50"
                >
                  Précédent
                </Link>
              )}
              
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <Link
                  key={i + 1}
                  href={`/?page=${i + 1}`}
                  className={`relative inline-flex items-center px-4 py-2 border ${
                    i + 1 === pagination.currentPage
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } text-sm font-medium`}
                >
                  {i + 1}
                </Link>
              ))}
              
              {pagination.currentPage < pagination.totalPages && (
                <Link
                  href={`/?page=${pagination.currentPage + 1}`}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50"
                >
                  Suivant
                </Link>
              )}
            </nav>
          </div>
        )}
      </section>
    </div>
  );
}

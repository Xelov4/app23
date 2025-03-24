import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export const revalidate = 3600; // Revalidate the data at most every hour

async function getToolBySlug(slug: string) {
  try {
    const tool = await db.tool.findUnique({
      where: { slug },
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
        Review: true
      }
    });

    if (!tool) {
      return null;
    }

    // Calculer la note moyenne
    const averageRating = tool.Review.length 
      ? tool.Review.reduce((sum, review) => sum + review.rating, 0) / tool.Review.length 
      : null;

    return {
      ...tool,
      categories: tool.CategoriesOnTools.map(ct => ct.Category),
      tags: tool.TagsOnTools.map(tt => tt.Tag),
      averageRating,
      reviewCount: tool.Review.length
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'outil:", error);
    return null;
  }
}

async function getSimilarTools(categoryId: string, currentToolId: string, limit = 3) {
  try {
    const similarTools = await db.tool.findMany({
      where: {
        id: { not: currentToolId },
        CategoriesOnTools: {
          some: {
            categoryId
          }
        }
      },
      include: {
        CategoriesOnTools: {
          include: {
            Category: true
          }
        }
      },
      take: limit
    });

    return similarTools.map(tool => ({
      id: tool.id,
      slug: tool.slug,
      name: tool.name,
      description: tool.description,
      logoUrl: tool.logoUrl,
      category: tool.CategoriesOnTools[0]?.Category.name || "Non catégorisé"
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des outils similaires:", error);
    return [];
  }
}

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const tool = await getToolBySlug(params.slug);
  
  if (!tool) {
    notFound();
  }

  // Obtenir des outils similaires de la même catégorie principale
  const primaryCategoryId = tool.CategoriesOnTools[0]?.categoryId;
  const similarTools = primaryCategoryId 
    ? await getSimilarTools(primaryCategoryId, tool.id) 
    : [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Retour à l'accueil
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gray-200 h-64 md:h-auto relative">
            {tool.logoUrl && (
              <img 
                src={tool.logoUrl} 
                alt={tool.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${tool.pricingType === "FREE" ? "bg-green-100 text-green-800" : 
                  tool.pricingType === "PAID" ? "bg-red-100 text-red-800" :
                  "bg-blue-100 text-blue-800"}`}>
                {tool.pricingType === "FREE" ? "Gratuit" : 
                 tool.pricingType === "PAID" ? "Payant" : 
                 tool.pricingType === "FREEMIUM" ? "Freemium" : 
                 "Abonnement"}
              </span>
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              Catégorie: {tool.categories.map((category, index) => (
                <span key={category.id}>
                  {index > 0 && ", "}
                  <Link href={`/categories/${category.slug}`} className="text-blue-600 hover:underline">
                    {category.name}
                  </Link>
                </span>
              ))}
            </div>
            
            {tool.averageRating !== null && (
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(tool.averageRating as number)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600 ml-2">
                  {(tool.averageRating as number).toFixed(1)} ({tool.reviewCount} avis)
                </span>
              </div>
            )}
            
            <p className="text-gray-700 mb-6">{tool.description}</p>
            
            {tool.pricingDetails && (
              <div className="mb-4 text-sm">
                <span className="font-semibold">Détails de tarification:</span> {tool.pricingDetails}
              </div>
            )}
            
            <a
              href={tool.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-6 py-2 rounded-md inline-block hover:bg-blue-700 transition-colors"
            >
              Visiter le site
            </a>
          </div>
        </div>
        
        <div className="p-6 border-t">
          <h2 className="text-xl font-bold mb-4">Fonctionnalités</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {tool.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {tool.tags.length > 0 && (
          <div className="p-6 border-t">
            <h2 className="text-xl font-bold mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {tool.tags.map(tag => (
                <span 
                  key={tag.id}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {similarTools.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Outils similaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarTools.map(tool => (
              <div key={tool.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gray-200 relative">
                  {tool.logoUrl && (
                    <img 
                      src={tool.logoUrl} 
                      alt={tool.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <span className="text-sm text-gray-500">{tool.category}</span>
                  <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{tool.description}</p>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="mt-2 inline-block text-blue-600 hover:underline"
                  >
                    Voir plus →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
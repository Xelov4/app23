import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PricingType } from '@prisma/client';

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
      reviewCount: tool.Review.length,
      features: typeof tool.features === 'string' ? JSON.parse(tool.features) : tool.features,
      socialLinks: {
        twitter: tool.twitterUrl,
        instagram: tool.instagramUrl,
        facebook: tool.facebookUrl,
        linkedin: tool.linkedinUrl,
        github: tool.githubUrl
      }
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
        isActive: true,
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

export default async function ToolPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = params.slug;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    notFound();
  }
  
  if (!tool.isActive) {
    notFound();
  }

  // Obtenir des outils similaires de la même catégorie principale
  const primaryCategoryId = tool.CategoriesOnTools[0]?.categoryId;
  const similarTools = primaryCategoryId 
    ? await getSimilarTools(primaryCategoryId, tool.id) 
    : [];

  // Le contenu HTML sera utilisé directement sans conversion puisqu'il est déjà en HTML
  const descriptionHtml = tool.description || '';

  // Vérifie si l'outil a au moins un réseau social
  const hasSocialLinks = tool.socialLinks && 
    Object.values(tool.socialLinks).some(link => link);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Retour à l'accueil
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Image de l'outil centrée en haut */}
        <div className="flex justify-center items-center bg-gray-200 p-6">
          {tool.logoUrl ? (
            <img 
              src={tool.logoUrl} 
              alt={tool.name}
              className="max-h-64 object-contain"
            />
          ) : (
            <div className="h-48 w-48 flex items-center justify-center bg-gray-300 rounded-full">
              <span className="text-2xl font-bold text-gray-500">{tool.name.charAt(0)}</span>
            </div>
          )}
        </div>
        
        {/* Métadonnées de l'outil */}
        <div className="p-6 border-t">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
            <div className="flex justify-center items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${tool.pricingType === "FREE" ? "bg-green-100 text-green-800" : 
                  tool.pricingType === "PAID" ? "bg-red-100 text-red-800" :
                  "bg-blue-100 text-blue-800"}`}>
                {tool.pricingType === "FREE" ? "Gratuit" : 
                 tool.pricingType === "PAID" ? "Payant" : 
                 tool.pricingType === "FREEMIUM" ? "Freemium" : 
                 "Abonnement"}
              </span>
              
              {tool.averageRating !== null && (
                <div className="flex items-center">
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
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            {tool.pricingDetails && (
              <div className="text-sm">
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
          
          {/* Fonctionnalités */}
          <div className="mb-6">
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
        </div>
        
        {/* Réseaux sociaux */}
        {hasSocialLinks && (
          <div className="p-6 border-t">
            <h2 className="text-xl font-bold mb-4">Réseaux sociaux</h2>
            <div className="flex flex-wrap gap-4">
              {tool.socialLinks.twitter && (
                <a 
                  href={tool.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                  <span>Twitter</span>
                </a>
              )}
              
              {tool.socialLinks.instagram && (
                <a 
                  href={tool.socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
              )}
              
              {tool.socialLinks.facebook && (
                <a 
                  href={tool.socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                  </svg>
                  <span>Facebook</span>
                </a>
              )}
              
              {tool.socialLinks.linkedin && (
                <a 
                  href={tool.socialLinks.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
              )}
              
              {tool.socialLinks.github && (
                <a 
                  href={tool.socialLinks.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </a>
              )}
            </div>
          </div>
        )}
        
        {/* Tags */}
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
      
      {/* Description de l'outil */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 border border-blue-100 relative overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full -mr-20 -mt-20 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-50"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4 text-blue-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            À propos de {tool.name}
          </h2>
          
          <div className="prose max-w-none">
            <div 
              className="markdown-content text-gray-700 leading-relaxed text-lg"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
        </div>
      </div>
      
      {/* Outils similaires */}
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
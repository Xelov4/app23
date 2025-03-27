import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PricingType } from '@prisma/client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ToolCard } from "@/components/ui/tool-card";
import { 
  formatPricingType, 
  getImageWithFallback,
  getCategoryColor 
} from "@/lib/design-system/primitives";

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

    // Gestion sécurisée du parsing des features
    let parsedFeatures = [];
    if (tool.features) {
      try {
        if (typeof tool.features === 'string') {
          // Tenter de parser le JSON
          parsedFeatures = JSON.parse(tool.features);
        } else if (Array.isArray(tool.features)) {
          // Si c'est déjà un tableau, l'utiliser directement
          parsedFeatures = tool.features;
        } else if (typeof tool.features === 'object') {
          // Si c'est un objet, le conserver tel quel
          parsedFeatures = tool.features;
        }
      } catch (error) {
        console.error(`Erreur de parsing des features pour ${slug}:`, error);
        // En cas d'erreur, traiter les features comme une chaîne ou un tableau vide
        if (typeof tool.features === 'string') {
          // Si ce n'est pas un JSON valide, essayer de le traiter comme une liste (une fonctionnalité par ligne)
          parsedFeatures = tool.features.split('\n').filter(line => line.trim() !== '');
        }
      }
    }

    return {
      ...tool,
      categories: tool.CategoriesOnTools.map(ct => ct.Category),
      tags: tool.TagsOnTools.map(tt => tt.Tag),
      averageRating,
      reviewCount: tool.Review.length,
      features: parsedFeatures,
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

async function getSimilarTools(categoryId: string, currentToolId: string, limit = 4) {
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
      websiteUrl: tool.websiteUrl,
      pricingType: tool.pricingType,
      category: tool.CategoriesOnTools[0]?.Category.name || "Non catégorisé",
      categoryId: tool.CategoriesOnTools[0]?.categoryId,
      features: tool.features || []
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
  
  // Formater le type de tarification
  const pricingType = formatPricingType(tool.pricingType);
  
  // Obtenir l'image avec fallback
  const logoUrl = getImageWithFallback(tool.logoUrl);

  // Vérifie si l'outil a au moins un réseau social
  const hasSocialLinks = tool.socialLinks && 
    Object.values(tool.socialLinks).some(link => link);
    
  // Obtenir la couleur de la catégorie principale
  const primaryCategory = tool.categories[0];
  const categoryGradient = primaryCategory ? getCategoryColor(primaryCategory.slug) : "from-primary-500 to-primary-600";

  return (
    <>
      {/* En-tête avec navigation */}
      <div className="container px-4 mx-auto pt-6">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/tools">← Retour aux outils</Link>
          </Button>
          
          {primaryCategory && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/categories/${primaryCategory.slug}`}>
                Voir la catégorie {primaryCategory.name}
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* En-tête de l'outil */}
      <section className="py-10 border-b">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Logo/Image de l'outil */}
            <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 relative bg-muted rounded-xl overflow-hidden">
              {logoUrl ? (
                <Image 
                  src={logoUrl} 
                  alt={tool.name} 
                  fill 
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted-foreground/10 to-muted">
                  <span className="text-4xl font-bold text-muted-foreground">{tool.name.charAt(0)}</span>
                </div>
              )}
            </div>
            
            {/* Informations principales de l'outil */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{tool.name}</h1>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                <Badge variant={pricingType.label === "Gratuit" ? "success" : 
                               pricingType.label === "Freemium" ? "primary" : 
                               "accent"}>
                  {pricingType.label}
                </Badge>
                
                {tool.categories.map((category) => (
                  <Badge key={category.id} variant="secondary">
                    {category.name}
                  </Badge>
                ))}
              </div>
              
              {tool.averageRating !== null && (
                <div className="flex items-center justify-center md:justify-start mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(tool.averageRating as number)
                          ? "text-yellow-500"
                          : "text-muted"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {(tool.averageRating as number).toFixed(1)} ({tool.reviewCount} avis)
                  </span>
                </div>
              )}
              
              <div className="mt-6">
                <Button size="lg" asChild className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
                  <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
                    Visiter le site officiel
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Corps principal avec description et fonctionnalités */}
      <section className="py-12">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale avec description */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">À propos de {tool.name}</h2>
              
              <div 
                className="prose prose-lg max-w-none mb-8 markdown-content"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
              
              {tool.pricingDetails && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Informations de tarification</h3>
                  <Card>
                    <CardContent className="p-4">
                      <p>{tool.pricingDetails}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
            
            {/* Colonne secondaire avec fonctionnalités et liens */}
            <div>
              {/* Fonctionnalités */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Fonctionnalités principales</h3>
                  
                  <ul className="space-y-2">
                    {Array.isArray(tool.features) ? tool.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-success mr-2 flex-shrink-0 mt-1">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.66674 10.1147L12.7947 3.98599L13.7381 4.92866L6.66674 12L2.42407 7.75733L3.36674 6.81466L6.66674 10.1147Z" fill="currentColor"/>
                          </svg>
                        </span>
                        <span>{feature}</span>
                      </li>
                    )) : (
                      <li className="text-muted-foreground">Aucune fonctionnalité spécifiée</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Tags */}
              {tool.tags.length > 0 && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.map(tag => (
                        <Badge key={tag.id} variant="outline">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Réseaux sociaux */}
              {hasSocialLinks && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Réseaux sociaux</h3>
                    <div className="flex flex-wrap gap-3">
                      {tool.socialLinks.twitter && (
                        <a 
                          href={tool.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
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
                          className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
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
                          className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          <span>Facebook</span>
                        </a>
                      )}
                      
                      {tool.socialLinks.linkedin && (
                        <a 
                          href={tool.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          <span>LinkedIn</span>
                        </a>
                      )}
                      
                      {tool.socialLinks.github && (
                        <a 
                          href={tool.socialLinks.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                          </svg>
                          <span>GitHub</span>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Outils similaires */}
      {similarTools.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container px-4 mx-auto">
            <h2 className="text-2xl font-bold mb-8">Outils similaires</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarTools.map(tool => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Vous connaissez un outil similaire?</h2>
          <p className="max-w-2xl mx-auto mb-8 opacity-90">
            Si vous connaissez un autre outil d'IA vidéo qui devrait être dans notre catalogue, n'hésitez pas à nous le faire savoir.
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            asChild
          >
            <Link href="/contact">Suggérer un outil</Link>
          </Button>
        </div>
      </section>
    </>
  );
} 
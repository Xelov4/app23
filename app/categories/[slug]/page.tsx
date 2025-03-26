import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ToolCard } from "@/components/ui/tool-card";
import { getCategoryEmoji, getCategoryColor } from "@/lib/design-system/primitives";

export const revalidate = 3600; // Revalider les données au maximum toutes les heures

async function getCategoryBySlug(slug: string) {
  try {
    const category = await db.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { CategoriesOnTools: true }
        }
      }
    });
    
    return category;
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error);
    return null;
  }
}

async function getToolsByCategory(categoryId: string) {
  try {
    const tools = await db.tool.findMany({
      where: {
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
      }
    });
    
    return tools.map(tool => ({
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
    console.error("Erreur lors de la récupération des outils par catégorie:", error);
    return [];
  }
}

async function getRelatedCategories(categoryId: string) {
  try {
    // Trouver des outils dans cette catégorie
    const tools = await db.tool.findMany({
      where: {
        CategoriesOnTools: {
          some: {
            categoryId
          }
        }
      },
      select: {
        id: true,
        CategoriesOnTools: {
          include: {
            Category: true
          }
        }
      },
      take: 10
    });
    
    // Extraire les IDs de toutes les catégories de ces outils, sauf celle actuelle
    const categoryIds = new Set<string>();
    tools.forEach(tool => {
      tool.CategoriesOnTools.forEach(ct => {
        if (ct.categoryId !== categoryId) {
          categoryIds.add(ct.categoryId);
        }
      });
    });
    
    // Récupérer les informations complètes des catégories
    if (categoryIds.size > 0) {
      return await db.category.findMany({
        where: {
          id: {
            in: Array.from(categoryIds)
          }
        },
        include: {
          _count: {
            select: { CategoriesOnTools: true }
          }
        },
        take: 3
      });
    }
    
    return [];
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories associées:", error);
    return [];
  }
}

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const category = await getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const tools = await getToolsByCategory(category.id);
  const relatedCategories = await getRelatedCategories(category.id);
  const gradientClass = getCategoryColor(category.slug);
  const emoji = getCategoryEmoji(category.slug);
  const toolCount = category._count?.CategoriesOnTools || 0;

  return (
    <>
      {/* En-tête de la catégorie */}
      <section className={`bg-gradient-to-b ${gradientClass} py-16`}>
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Link href="/categories">
              <Button variant="secondary" size="sm" className="opacity-90 hover:opacity-100">
                ← Toutes les catégories
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="bg-white/20 rounded-full w-20 h-20 flex items-center justify-center text-white shrink-0">
              <span className="text-4xl">{emoji}</span>
            </div>
            
            <div className="text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{category.name}</h1>
              <p className="text-white/90 max-w-2xl">
                {category.description}
              </p>
              <div className="mt-2 text-white/80">
                {toolCount} outil{toolCount > 1 ? 's' : ''} disponible{toolCount > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Liste des outils */}
      <section className="py-12 bg-background">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="text-2xl font-bold">Outils dans cette catégorie</h2>
            
            {/* Options de tri - à implémenter ultérieurement */}
            <div className="mt-4 md:mt-0">
              <Button variant="outline" size="sm" disabled className="opacity-50">
                Options de tri à venir
              </Button>
            </div>
          </div>
          
          {tools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                />
              ))}
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Aucun outil dans cette catégorie</h3>
              <p className="text-muted-foreground mb-4">
                Nous n'avons pas encore d'outils répertoriés dans cette catégorie.
              </p>
              <Button asChild>
                <Link href="/tools">Explorer tous les outils</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* Catégories associées */}
      {relatedCategories.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container px-4 mx-auto">
            <h2 className="text-2xl font-bold mb-8">Catégories associées</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedCategories.map((relatedCategory) => (
                <Link 
                  key={relatedCategory.id}
                  href={`/categories/${relatedCategory.slug}`}
                  className={`p-4 rounded-lg bg-gradient-to-br ${getCategoryColor(relatedCategory.slug)} text-white hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                      <span className="text-xl">{getCategoryEmoji(relatedCategory.slug)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{relatedCategory.name}</h3>
                      <p className="text-white/80 text-sm">
                        {relatedCategory._count?.CategoriesOnTools || 0} outil{relatedCategory._count?.CategoriesOnTools !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container px-4 mx-auto">
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Vous connaissez un outil qui devrait être dans cette catégorie?</h3>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              Si vous connaissez un outil d'IA qui devrait être répertorié dans cette catégorie, n'hésitez pas à nous le faire savoir.
            </p>
            <Button asChild>
              <Link href="/contact">Suggérer un outil</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
} 
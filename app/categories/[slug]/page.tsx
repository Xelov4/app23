import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getImageWithFallback, formatPricingType, getCategoryEmoji, truncateText } from "@/lib/design-system/primitives";
import { ArrowLeft, Filter, Star, ChevronRight } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { ToolCard } from "@/components/ui/tool-card";

export const revalidate = 3600; // Revalider les données toutes les heures
export const dynamic = 'force-dynamic';

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

// Générer les métadonnées dynamiquement
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const slug = await Promise.resolve(params.slug);
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    return {
      title: "Catégorie non trouvée | Vidéo-IA.net",
      description: "Cette catégorie d'outils n'a pas été trouvée dans notre base de données."
    };
  }

  return {
    title: `${category.name} - Outils d'IA pour ${category.name} | Vidéo-IA.net`,
    description: category.metaDescription || category.description,
    openGraph: {
      title: category.seoTitle || `${category.name} - Outils d'IA pour la vidéo`,
      description: category.metaDescription || category.description,
      type: "website",
    },
  };
}

// Récupérer une catégorie par son slug
async function getCategoryBySlug(slug: string) {
  const category = await db.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      seoTitle: true,
      metaDescription: true,
      iconName: true,
      _count: {
        select: {
          CategoriesOnTools: true,
        },
      },
    },
  });
  
  return category;
}

// Récupérer les outils associés à une catégorie
async function getToolsByCategory(categoryId: string) {
  const tools = await db.tool.findMany({
    where: {
      isActive: true,
      CategoriesOnTools: {
        some: {
          categoryId,
        },
      },
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
      _count: {
        select: {
          Review: true,
        },
      },
    },
    orderBy: [
      { rating: 'desc' },
      { reviewCount: 'desc' },
    ],
  });

  // Formater les données des outils
  return tools.map(tool => ({
    id: tool.id,
    name: tool.name,
    slug: tool.slug,
    description: tool.description,
    logoUrl: tool.logoUrl,
    websiteUrl: tool.websiteUrl,
    pricingType: tool.pricingType,
    rating: tool.rating || 0,
    createdAt: tool.createdAt,
    updatedAt: tool.updatedAt,
    categories: tool.CategoriesOnTools.map(cat => ({
      categoryId: cat.categoryId,
      category: cat.Category,
    })),
    tags: tool.TagsOnTools.map(tag => ({
      tagId: tag.tagId,
      tag: tag.Tag,
    })),
    _count: {
      reviews: tool._count.Review,
    },
  }));
}

// Récupérer les catégories liées à une catégorie principale
async function getRelatedCategories(categoryId: string) {
  // Trouver les outils associés à cette catégorie
  const toolsInCategory = await db.categoriesOnTools.findMany({
    where: {
      categoryId,
    },
    select: {
      toolId: true,
    },
  });

  const toolIds = toolsInCategory.map(t => t.toolId);

  // Trouver d'autres catégories associées à ces outils
  const relatedCategories = await db.categoriesOnTools.findMany({
    where: {
      toolId: {
        in: toolIds,
      },
      categoryId: {
        not: categoryId,
      },
    },
    select: {
      Category: true,
    },
    distinct: ['categoryId'],
    take: 6,
  });

  // Extraire les catégories uniques
  return relatedCategories.map(rc => rc.Category);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const slug = await Promise.resolve(params.slug);
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    notFound();
  }
  
  const [tools, relatedCategories] = await Promise.all([
    getToolsByCategory(category.id),
    getRelatedCategories(category.id),
  ]);

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <div className="mb-6">
        <Breadcrumb 
          items={[
            { label: "Catégories", href: "/categories" },
            { label: category.name, isCurrentPage: true },
          ]}
        />
      </div>
      
      {/* En-tête de la catégorie */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-3xl">
            {getCategoryEmoji(category.slug)}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          <div className="max-w-3xl">
            <p className="text-muted-foreground text-lg mb-4">
              {category.description}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="font-medium">{tools.length} outil{tools.length !== 1 ? 's' : ''}</span>
              <span className="mx-2">•</span>
              <span>Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/categories">
                Toutes les catégories
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Liste des outils (3/4) */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold mb-6">
            Outils d'IA pour {category.name}
          </h2>
          
          {tools.length > 0 ? (
            <div className="space-y-6">
              {tools.map(tool => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                  variant="horizontal"
                />
              ))}
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p>Aucun outil trouvé dans cette catégorie.</p>
            </div>
          )}
        </div>
        
        {/* Sidebar (1/4) */}
        <div className="space-y-6">
          {/* Catégories liées */}
          {relatedCategories.length > 0 && (
            <div className="bg-card border rounded-lg p-5 shadow-sm">
              <h3 className="font-medium text-lg mb-4">Catégories liées</h3>
              
              <div className="space-y-2">
                {relatedCategories.map(relatedCat => (
                  <Link
                    key={relatedCat.id}
                    href={`/categories/${relatedCat.slug}`}
                    className="flex items-center group hover:bg-muted/30 p-2 rounded-md transition-colors"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-xl mr-3">
                      {getCategoryEmoji(relatedCat.slug)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {relatedCat.name}
                      </h4>
                    </div>
                    
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Autres widgets comme les tags populaires, etc. */}
        </div>
      </div>
    </div>
  );
} 
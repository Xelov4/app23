import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolCard } from "@/components/ui/tool-card";
import Breadcrumb from "@/components/common/Breadcrumb";
import { db } from "@/lib/db";

type TagPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const slug = await Promise.resolve(params.slug);
  const tag = await getTagBySlug(slug);
  
  if (!tag) {
    return {
      title: "Tag non trouvé | Vidéo-IA.net",
      description: "Ce tag n'a pas été trouvé dans notre base de données."
    };
  }

  return {
    title: `${tag.name} - Outils d'IA pour la vidéo | Vidéo-IA.net`,
    description: `Découvrez les meilleurs outils d'IA pour la vidéo associés au tag ${tag.name}. Explorez notre sélection d'outils spécialisés.`,
    openGraph: {
      title: `${tag.name} - Outils d'IA pour la vidéo | Vidéo-IA.net`,
      description: `Découvrez les meilleurs outils d'IA pour la vidéo associés au tag ${tag.name}. Explorez notre sélection d'outils spécialisés.`,
      type: "website",
    },
  };
}

async function getTagBySlug(slug: string) {
  const tag = await db.tag.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      seoTitle: true,
      metaDescription: true,
      _count: {
        select: {
          TagsOnTools: true,
        },
      },
    },
  });
  
  return tag;
}

async function getToolsByTag(tagId: string) {
  const tools = await db.tool.findMany({
    where: {
      isActive: true,
      TagsOnTools: {
        some: {
          tagId,
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

async function getRelatedTags(tagId: string) {
  // Trouver les outils associés à ce tag
  const toolsWithTag = await db.tagsOnTools.findMany({
    where: {
      tagId,
    },
    select: {
      toolId: true,
    },
  });

  const toolIds = toolsWithTag.map(t => t.toolId);

  // Trouver d'autres tags associés à ces outils
  const relatedTags = await db.tagsOnTools.findMany({
    where: {
      toolId: {
        in: toolIds,
      },
      tagId: {
        not: tagId,
      },
    },
    select: {
      Tag: true,
    },
    distinct: ['tagId'],
    take: 10,
  });

  // Extraire les tags uniques
  return relatedTags.map(rt => rt.Tag);
}

export default async function TagPage({ params }: TagPageProps) {
  const slug = await Promise.resolve(params.slug);
  const tag = await getTagBySlug(slug);
  
  if (!tag) {
    notFound();
  }
  
  const [tools, relatedTags] = await Promise.all([
    getToolsByTag(tag.id),
    getRelatedTags(tag.id),
  ]);

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <div className="mb-6">
        <Breadcrumb 
          items={[
            { label: "Tags", href: "/tags" },
            { label: tag.name, isCurrentPage: true },
          ]}
        />
      </div>
      
      {/* En-tête du tag */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
            <Tag size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{tag.name}</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          <div className="max-w-3xl">
            {tag.metaDescription && (
              <p className="text-muted-foreground text-lg mb-4">
                {tag.metaDescription}
              </p>
            )}
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="font-medium">{tools.length} outil{tools.length !== 1 ? 's' : ''}</span>
              <span className="mx-2">•</span>
              <span>Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/tags">
                Tous les tags
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Liste des outils (3/4) */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold mb-6">
            Outils avec le tag "{tag.name}"
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
              <p>Aucun outil trouvé avec ce tag.</p>
            </div>
          )}
        </div>
        
        {/* Sidebar (1/4) */}
        <div className="space-y-6">
          {/* Tags liés */}
          {relatedTags.length > 0 && (
            <div className="bg-card border rounded-lg p-5 shadow-sm">
              <h3 className="font-medium text-lg mb-4">Tags liés</h3>
              
              <div className="flex flex-wrap gap-2">
                {relatedTags.map(relatedTag => (
                  <Button
                    key={relatedTag.id}
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    <Link href={`/tags/${relatedTag.slug}`}>
                      {relatedTag.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
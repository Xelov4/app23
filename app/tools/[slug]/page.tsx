import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { safeJsonParse } from "@/lib/utils";

// Import des nouveaux composants
import ToolHeader from "@/components/tool/ToolHeader";
import ToolContent from "@/components/tool/ToolContent";
import ToolSidebar from "@/components/tool/ToolSidebar";

// Options de page Next.js
export const revalidate = 3600;
export const fetchCache = "default-no-store";

// Types
type ToolPageProps = {
  params: {
    slug: string;
  };
};

// Ajoutez cette fonction améliorée pour parser de manière sécurisée JSON
function safeFeaturesParse(jsonString: string | null | undefined): any[] {
  if (!jsonString) return [];
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Erreur lors du parsing JSON:", error);
    // Si c'est une chaîne, essayer de la diviser par des virgules
    if (typeof jsonString === 'string') {
      return jsonString.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  }
}

// Fonction pour récupérer un outil par son slug
async function getToolBySlug(slug: string) {
  const tool = await db.tool.findUnique({
    where: {
      slug: slug,
      isActive: true,
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
      Review: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10, // Augmenté pour afficher plus d'avis
      },
      _count: {
        select: {
          Review: true,
        },
      },
      UseCasesOnTools: {
        include: {
          UseCase: true,
        },
      },
      UserTypesOnTools: {
        include: {
          UserType: true,
        },
      },
      FeaturesOnTools: {
        include: {
          Feature: true,
        },
      },
      ToolsOnSearches: {
        include: {
          Search: true,
        },
        take: 10,
      },
    },
  });

  if (!tool) {
    return null;
  }

  // Calcul de la note moyenne
  const rating =
    tool.Review && tool.Review.length > 0
      ? tool.Review.reduce((acc: number, review: any) => acc + review.rating, 0) /
        tool.Review.length
      : 0;

  // Utilisation de la fonction sécurisée pour parser les features
  const features = safeFeaturesParse(tool.features);

  // Formatter les cas d'utilisation
  const useCases = tool.UseCasesOnTools.map(uc => ({
    id: uc.useCaseId,
    name: uc.UseCase.name,
    description: uc.UseCase.description
  }));
  
  // Formatter les catégories
  const categories = tool.CategoriesOnTools.map(cat => ({
    categoryId: cat.categoryId,
    category: cat.Category
  }));
  
  // Formatter les tags
  const tags = tool.TagsOnTools.map(tag => ({
    tagId: tag.tagId,
    tag: tag.Tag
  }));

  // Formatter les types d'utilisateurs
  const userTypes = tool.UserTypesOnTools.map(ut => ({
    id: ut.userTypeId,
    name: ut.UserType.name,
    description: ut.UserType.description
  }));

  // Formatter les recherches associées
  const relatedSearches = tool.ToolsOnSearches.map(ts => ({
    id: ts.searchId,
    keyword: ts.Search.keyword,
    slug: ts.Search.slug,
    relevance: ts.relevance
  }));

  return {
    ...tool,
    rating,
    features,
    useCases,
    categories,
    tags,
    userTypes,
    relatedSearches,
    reviews: tool.Review,
    _count: {
      reviews: tool._count.Review
    }
  };
}

// Fonction pour récupérer des outils similaires
async function getSimilarTools(categoryIds: string[], tagIds: string[], currentToolId: string) {
  if (!categoryIds.length && !tagIds.length) return [];

  const similarTools = await db.tool.findMany({
    where: {
      id: {
        not: currentToolId,
      },
      isActive: true,
      OR: [
        {
      CategoriesOnTools: {
        some: {
          categoryId: {
            in: categoryIds,
          },
        },
      },
        },
        {
          TagsOnTools: {
            some: {
              tagId: {
                in: tagIds,
              },
            },
          },
        },
      ],
    },
    include: {
      CategoriesOnTools: {
        include: {
          Category: true,
        },
      },
    },
    take: 5,
  });

  return similarTools.map((tool) => ({
    ...tool,
    features: safeFeaturesParse(tool.features),
    categories: tool.CategoriesOnTools.map((c) => c.Category),
  }));
}

// Fonction pour récupérer les catégories populaires
async function getPopularCategories() {
  const categories = await db.category.findMany({
    take: 8,
    orderBy: {
      CategoriesOnTools: {
        _count: "desc",
      },
    },
  });

  return categories;
}

// Metadata dynamique
export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const slug = params.slug;
  const tool = await getToolBySlug(slug);
  
  if (!tool) {
    return {
      title: "Outil non trouvé | Vidéo-IA.net",
      description: "L'outil que vous recherchez n'existe pas ou a été supprimé.",
    };
  }

  // Créer une méta-description à partir de la description de l'outil
  const metaDescription = tool.description
    ? tool.description.substring(0, 160) + (tool.description.length > 160 ? "..." : "")
    : "Découvrez cet outil d'IA pour la vidéo et améliorez votre processus de création.";

  return {
    title: `${tool.name} - Outil d'IA pour vidéo | Vidéo-IA.net`,
    description: metaDescription,
    openGraph: {
      title: `${tool.name} - Outil d'IA pour vidéo | Vidéo-IA.net`,
      description: metaDescription,
      type: "website",
    },
  };
}

// Composant principal
export default async function ToolPage({
  params,
}: ToolPageProps) {
  const slug = params.slug;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  // Récupérer les IDs des catégories et tags pour trouver des outils similaires
  const categoryIds = tool.categories.map((cat) => cat.categoryId);
  const tagIds = tool.tags.map((tag) => tag.tagId);

  // Récupérer les outils similaires et les catégories populaires
  const [similarTools, popularCategories] = await Promise.all([
    getSimilarTools(categoryIds, tagIds, tool.id),
    getPopularCategories(),
  ]);

  return (
    <div className="min-h-screen pb-16">
      {/* Fil d'Ariane */}
      <div className="container max-w-screen-xl mx-auto px-4 py-4">
        <Link href="/tools" className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ChevronLeft size={14} className="mr-1" />
          Retour à la liste des outils
        </Link>
      </div>

      {/* En-tête */}
      <ToolHeader tool={tool} />
      
      {/* Contenu principal */}
      <div className="container max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Contenu principal (3/4) */}
          <div className="lg:col-span-3">
            <ToolContent tool={tool} relatedSearches={tool.relatedSearches} />
          </div>
          
          {/* Sidebar (1/4) */}
          <div className="lg:col-span-1">
            <ToolSidebar similarTools={similarTools} popularCategories={popularCategories} />
          </div>
        </div>
      </div>
    </div>
  );
} 
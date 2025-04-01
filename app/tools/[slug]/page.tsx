import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getImageWithFallback,
  formatDate,
  truncateText,
  formatPricingType,
  getCategoryEmoji
} from "@/lib/design-system/primitives";
import { db } from "@/lib/db";
import { ChevronLeft, Globe, ExternalLink, Tag, Clock, Calendar, Star, Info, CheckCircle, MessageSquare, ArrowRight } from "lucide-react";

// Import direct du composant client
import ClientTabsComponent from "@/components/tool/ClientTabs";

// Options de page Next.js
export const revalidate = 3600;
export const fetchCache = "default-no-store";

// Types
type ToolPageProps = {
  params: {
    slug: string;
  };
};

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
        take: 3,
      },
      _count: {
        select: {
          Review: true,
        },
      },
      UseCasesOnTools: true,
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

  // Formater les features
  const features = tool.features ? JSON.parse(tool.features) : [];

  // Formater les cas d'utilisation
  const useCases = tool.UseCasesOnTools && tool.UseCasesOnTools.length > 0 
    ? tool.UseCasesOnTools.map(uc => uc.useCaseId || "").filter(Boolean)
    : [];
  
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

  return {
    ...tool,
    rating,
    features,
    useCases,
    categories,
    tags,
    reviews: tool.Review,
    _count: {
      reviews: tool._count.Review
    }
  };
}

// Fonction pour récupérer des outils similaires
async function getSimilarTools(categoryIds: string[], currentToolId: string) {
  if (!categoryIds.length) return [];

  const similarTools = await db.tool.findMany({
    where: {
      id: {
        not: currentToolId,
      },
      isActive: true,
      CategoriesOnTools: {
        some: {
          categoryId: {
            in: categoryIds,
          },
        },
      },
    },
    include: {
      CategoriesOnTools: {
        include: {
          Category: true,
        },
      },
    },
    take: 3,
  });

  return similarTools.map((tool) => ({
    ...tool,
    rating: 0, // Valeur par défaut
    features: tool.features ? JSON.parse(tool.features) : [],
    categories: tool.CategoriesOnTools.map((c) => c.Category),
  }));
}

// Metadata dynamique
export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const slug = await Promise.resolve(params.slug);
  const tool = await getToolBySlug(slug);
  
  if (!tool) {
    return {
      title: "Outil non trouvé | Vidéo-IA.net",
      description: "Cet outil d'IA n'a pas été trouvé dans notre base de données.",
    };
  }

  return {
    title: `${tool.name} | Vidéo-IA.net`,
    description: truncateText(tool.description, 160),
    openGraph: {
      images: [{ url: getImageWithFallback(tool.logoUrl) }],
    },
  };
}

// Composant principal
export default async function ToolPage({
  params,
}: ToolPageProps) {
  const slug = await Promise.resolve(params.slug);
  const tool = await getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  // Récupérer les IDs des catégories
  const categoryIds = tool.categories.map((c) => c.categoryId);
  const similarTools = await getSimilarTools(categoryIds, tool.id);

  // Formater les liens sociaux s'ils existent
  const socialLinks = [];
  if (tool.twitterUrl) socialLinks.push({ name: "Twitter", url: tool.twitterUrl });
  if (tool.linkedinUrl) socialLinks.push({ name: "LinkedIn", url: tool.linkedinUrl });
  if (tool.instagramUrl) socialLinks.push({ name: "Instagram", url: tool.instagramUrl });
  if (tool.githubUrl) socialLinks.push({ name: "GitHub", url: tool.githubUrl });
  if (tool.facebookUrl) socialLinks.push({ name: "Facebook", url: tool.facebookUrl });

  // Ajouter les liens sociaux à l'objet outil pour le composant client
  const toolWithSocialLinks = {
    ...tool,
    socialLinks
  };

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <div className="mb-6">
        <Link href="/tools" className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ChevronLeft size={14} className="mr-1" />
          Retour à la liste des outils
        </Link>
      </div>

      {/* En-tête de l'outil */}
      <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
        {/* Logo - Version améliorée avec image plus grande et centrée */}
        <div className="w-24 h-24 md:w-40 md:h-40 relative rounded-lg border overflow-hidden flex-shrink-0 bg-white shadow-sm mx-auto md:mx-0 group hover:shadow-md transition-all duration-300">
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Image
            src={getImageWithFallback(tool.logoUrl)}
            alt={tool.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 96px, 160px"
            priority
          />
        </div>
        
        {/* Informations principales */}
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">{tool.name}</h1>
            <div className="flex items-center">
              <div className="flex mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${
                      star <= Math.round(tool.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({tool._count.reviews || 0})
              </span>
            </div>
          </div>

          {/* Tags et catégories */}
          <div className="flex flex-wrap gap-2 my-3">
            <Badge className={formatPricingType(tool.pricingType).className}>
              {formatPricingType(tool.pricingType).label}
            </Badge>
            
            {tool.categories.map((item) => (
              <Link
                key={item.categoryId}
                href={`/categories/${item.category.slug}`}
              >
                <Badge variant="outline" className="flex items-center hover:bg-muted">
                  <span className="mr-1">{getCategoryEmoji(item.category.slug)}</span>
                  {item.category.name}
                </Badge>
              </Link>
            ))}
          </div>
          
          {/* Description courte */}
          <p className="text-muted-foreground">
            {truncateText(tool.description, 200)}
          </p>
          
          {/* Actions principales */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button asChild>
              <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                <Globe size={16} className="mr-2" />
                Visiter le site
              </a>
            </Button>
            {tool.tags.length > 0 && (
              <div className="flex items-center text-muted-foreground text-sm">
                <Tag size={14} className="mr-1" />
                {tool.tags.slice(0, 3).map((tag, i) => (
                  <span key={tag.tagId}>
                    {i > 0 && ", "}
                    <Link href={`/tags/${tag.tag.slug}`} className="hover:underline">
                      {tag.tag.name}
                    </Link>
                  </span>
                ))}
                {tool.tags.length > 3 && "..."}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      {/* Contenu principal en onglets pour un format wiki */}
      <ClientTabsComponent tool={toolWithSocialLinks} similarTools={similarTools} />
    </div>
  );
} 
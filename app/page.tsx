import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getImageWithFallback, getCategoryEmoji } from "@/lib/design-system/primitives";
import { Filter, Search, SlidersHorizontal, Grid3x3, List, ChevronDown, Star, ArrowRight } from "lucide-react";

import HeroSection from "@/components/homepage/HeroSection";
import FeaturedTools from "@/components/homepage/FeaturedTools";
import CategoriesSection from "@/components/homepage/CategoriesSection";
import TagsCloud from "@/components/homepage/TagsCloud";

export const metadata: Metadata = {
  title: "Vidéo-IA.net | Outils d'IA pour la vidéo",
  description: "Découvrez les meilleurs outils d'IA pour la création, l'édition et l'optimisation de vidéos.",
};

export const revalidate = 3600; // Revalidate every hour

// Récupérer toutes les catégories
async function getCategories() {
  try {
    return await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { CategoriesOnTools: true }
        }
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return [];
  }
}

// Récupérer tous les tags
async function getTags() {
  try {
    return await db.tag.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des tags:", error);
    return [];
  }
}

// Récupérer tous les outils
async function getAllTools() {
  try {
    const tools = await db.tool.findMany({
      where: {
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
        Review: true,
        _count: {
          select: {
            Review: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return tools.map(tool => {
      // Calculer la note moyenne
      const rating = tool.Review && tool.Review.length > 0
        ? tool.Review.reduce((acc, review) => acc + review.rating, 0) / tool.Review.length
        : 0;

      return {
        ...tool,
        rating,
        categories: tool.CategoriesOnTools.map(c => ({
          id: c.categoryId,
          name: c.Category.name,
          slug: c.Category.slug
        })),
        tags: tool.TagsOnTools.map(t => ({
          id: t.tagId,
          name: t.Tag.name,
          slug: t.Tag.slug
        })),
        reviewCount: tool._count.Review
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des outils:", error);
    return [];
  }
}

async function getHomePageData() {
  // Comptage des totaux
  const [toolCount, categoryCount, reviewCount] = await Promise.all([
    db.tool.count({ where: { isActive: true } }),
    db.category.count(),
    db.review.count(),
  ]);

  // Récupération des outils populaires (basés sur le nombre d'avis)
  const popularTools = await db.tool.findMany({
    where: { isActive: true },
    include: {
      CategoriesOnTools: {
        include: { Category: true },
      },
      TagsOnTools: {
        include: { Tag: true },
      },
      Review: {
        select: {
          rating: true,
        }
      },
      _count: {
        select: { Review: true },
      },
    },
    orderBy: [
      { reviewCount: 'desc' },
      { rating: 'desc' },
    ],
    take: 6,
  });

  // Récupération des catégories populaires
  const popularCategories = await db.category.findMany({
    include: {
      _count: {
        select: { CategoriesOnTools: true }
      }
    },
    orderBy: {
      CategoriesOnTools: {
        _count: 'desc',
      },
    },
    take: 8,
  });

  // Formatage des données pour les outils populaires
  const formattedPopularTools = popularTools.map(tool => {
    // Calculer la note moyenne
    const reviewCount = tool._count.Review;
    const rating = tool.Review && tool.Review.length > 0
      ? tool.Review.reduce((acc, review) => acc + review.rating, 0) / tool.Review.length
      : 0;

    return {
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      logoUrl: tool.logoUrl,
      websiteUrl: tool.websiteUrl,
      pricingType: tool.pricingType,
      rating,
      reviewCount,
      categories: tool.CategoriesOnTools.map(cat => ({
        id: cat.categoryId,
        name: cat.Category.name,
        slug: cat.Category.slug
      })),
    };
  });

  return {
    counts: {
      tools: toolCount,
      categories: categoryCount,
      reviews: reviewCount,
    },
    popularTools: formattedPopularTools,
    popularCategories,
  };
}

// Fonction pour formater le type de tarification
function formatPricingType(type: string) {
  switch (type) {
    case 'free':
      return 'Gratuit';
    case 'freemium':
      return 'Freemium';
    case 'paid':
      return 'Payant';
    case 'subscription':
      return 'Abonnement';
    default:
      return type;
  }
}

// Fonction pour tronquer un texte
function truncateText(text: string, maxLength: number = 120) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Découvrez les meilleurs outils d'IA pour vos vidéos
            </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Une collection curatée des outils d'intelligence artificielle les plus puissants pour la création, l'édition et l'optimisation de vidéos.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-12">
            <div className="flex items-center h-12 rounded-lg border bg-background focus-within:ring-1 focus-within:ring-primary">
              <div className="flex items-center justify-center w-12 text-muted-foreground">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Rechercher un outil d'IA pour vidéo..." 
                className="flex-1 h-full bg-transparent border-0 focus:outline-none focus:ring-0 text-foreground"
              />
              <Button className="mr-1.5 h-9 rounded-md px-4">
                Rechercher
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8 py-4 px-6 rounded-lg bg-muted/30">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{data.counts.tools}</p>
              <p className="text-sm text-muted-foreground">Outils</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{data.counts.categories}</p>
              <p className="text-sm text-muted-foreground">Catégories</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{data.counts.reviews}</p>
              <p className="text-sm text-muted-foreground">Avis</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button asChild size="lg" className="gap-2">
              <Link href="/tools">
                Explorer tous les outils
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/categories">
                Parcourir par catégorie
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Outils populaires</h2>
            <Button asChild variant="ghost" className="gap-1">
              <Link href="/tools">
                Voir tous 
                <ArrowRight size={16} />
              </Link>
                </Button>
              </div>
              
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.popularTools.map((tool) => (
              <Link 
                key={tool.id} 
                href={`/tools/${tool.slug}`}
                className="group flex flex-col h-full bg-card rounded-lg border border-border/50 overflow-hidden transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {tool.logoUrl ? (
                        <div className="w-10 h-10 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                          <Image 
                            src={tool.logoUrl} 
                            alt={tool.name} 
                            width={40} 
                            height={40} 
                            className="object-cover"
                          />
                </div>
                      ) : (
                        <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center text-primary font-medium">
                          {tool.name.substring(0, 2)}
                  </div>
                      )}
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                </div>
                
                    {tool.rating > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">{tool.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {truncateText(tool.description, 100)}
                  </p>
                  
                  <div className="mt-auto pt-4 flex flex-wrap gap-2">
                    <Badge variant="outline">{formatPricingType(tool.pricingType)}</Badge>
                    {tool.categories.slice(0, 2).map((category) => (
                      <Badge key={category.id} variant="secondary">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
                </div>
              </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Catégories principales</h2>
            <Button asChild variant="ghost" className="gap-1">
              <Link href="/categories">
                Voir toutes
                <ArrowRight size={16} />
              </Link>
            </Button>
            </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.popularCategories.map((category) => (
                <Link 
                key={category.id} 
                href={`/categories/${category.slug}`}
                className="group p-6 bg-card rounded-lg border border-border/50 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
              >
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category._count.CategoriesOnTools || 0} outils
                </p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

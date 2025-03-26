import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToolCard } from "@/components/ui/tool-card";
import { CategoryCard } from "@/components/ui/category-card";

import { Tool } from "@/lib/design-system/types";
import { 
  truncateText, 
  getCategoryEmoji 
} from "@/lib/design-system/primitives";

export const revalidate = 3600; // Revalider les données au maximum toutes les heures
export const dynamic = 'force-dynamic';

// Fonction pour extraire le texte brut du HTML
function htmlToPlainText(html: string): string {
  try {
    // Supprimer les balises HTML
    const plainText = html.replace(/<[^>]*>?/gm, '');
    // Remplacer les entités HTML courantes
    return plainText
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  } catch (error) {
    console.error("Erreur lors de la conversion du HTML en texte brut:", error);
    return html; // Retourner le HTML original en cas d'erreur
  }
}

// Récupérer les catégories populaires
async function getPopularCategories() {
  try {
    return await db.category.findMany({
      take: 6, // Limiter à 6 catégories
      orderBy: {
        CategoriesOnTools: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: {
            CategoriesOnTools: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Échec de la récupération des catégories:", error);
    return [];
  }
}

// Récupérer les outils récents
async function getRecentTools() {
  try {
    const tools = await db.tool.findMany({
      where: {
        isActive: true
      },
      take: 8,
      orderBy: [
        { updatedAt: 'desc' }
      ],
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
      name: tool.name,
      slug: tool.slug,
      description: htmlToPlainText(tool.description),
      logoUrl: tool.logoUrl,
      websiteUrl: tool.websiteUrl,
      pricingType: tool.pricingType,
      category: tool.CategoriesOnTools[0]?.Category.name || "Non catégorisé",
      categoryId: tool.CategoriesOnTools[0]?.categoryId,
      features: tool.features || []
    }));
  } catch (error) {
    console.error("Échec de la récupération des outils récents:", error);
    return [];
  }
}

// Récupérer les outils populaires
async function getPopularTools() {
  try {
    const tools = await db.tool.findMany({
      where: {
        isActive: true
      },
      take: 4,
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' }
      ],
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
      name: tool.name,
      slug: tool.slug,
      description: htmlToPlainText(tool.description),
      logoUrl: tool.logoUrl,
      websiteUrl: tool.websiteUrl,
      pricingType: tool.pricingType,
      category: tool.CategoriesOnTools[0]?.Category.name || "Non catégorisé",
      categoryId: tool.CategoriesOnTools[0]?.categoryId,
      features: tool.features || []
    }));
  } catch (error) {
    console.error("Échec de la récupération des outils populaires:", error);
    return [];
  }
}

export default async function Home({ 
  searchParams 
}: { 
  searchParams: { search?: string, page?: string } 
}) {
  // Attendre les searchParams avant de les utiliser
  const params = await Promise.resolve(searchParams);
  const searchTerm = params.search || "";
  const currentPage = parseInt(params.page || "1", 10);
  
  const categories = await getPopularCategories();
  const recentTools = await getRecentTools();
  const popularTools = await getPopularTools();
  
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-background py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 animate-fade-in">
              Découvrez les meilleurs outils d'IA pour la vidéo
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
              Explorez un catalogue complet d'outils d'intelligence artificielle pour la création, l'édition et la production vidéo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-from-bottom">
              <Link href="/tools">
                <Button size="lg" className="w-full sm:w-auto">
                  Explorer les outils
                </Button>
              </Link>
              <Link href="/categories">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Parcourir les catégories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Categories */}
      <section className="py-16 bg-background">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Catégories populaires</h2>
              <p className="text-muted-foreground">
                Explorez les catégories les plus recherchées
              </p>
            </div>
            <Link href="/categories">
              <Button variant="outline" className="mt-4 md:mt-0">
                Toutes les catégories
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Outils populaires</h2>
              <p className="text-muted-foreground">
                Les outils d'IA vidéo les plus appréciés
              </p>
            </div>
            <Link href="/tools">
              <Button variant="outline" className="mt-4 md:mt-0">
                Tous les outils
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularTools.slice(0, 2).map((tool) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                variant="featured" 
              />
            ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {popularTools.slice(2).concat(recentTools.slice(0, 2)).map((tool) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Added Tools */}
      <section className="py-16 bg-background">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Ajouts récents</h2>
              <p className="text-muted-foreground">
                Les derniers outils d'IA vidéo ajoutés à notre catalogue
              </p>
            </div>
            <Link href="/tools">
              <Button variant="outline" className="mt-4 md:mt-0">
                Tous les outils
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentTools.slice(2, 6).map((tool) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Trouvez l'outil d'IA parfait pour votre projet vidéo
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Notre catalogue complet vous aide à découvrir les solutions d'IA les plus innovantes pour la création et l'édition vidéo.
            </p>
            <Link href="/tools">
              <Button variant="secondary" size="lg">
                Explorer tous les outils
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

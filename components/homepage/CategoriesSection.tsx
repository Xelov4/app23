"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryEmoji } from "@/lib/design-system/primitives";

type CategoryCardProps = {
  category: any;
  toolCount?: number;
};

function CategoryCard({ category, toolCount = 0 }: CategoryCardProps) {
  return (
    <Link 
      href={`/categories/${category.slug}`}
      className="flex flex-col h-full bg-card border rounded-xl overflow-hidden transition-all hover:shadow-md hover:-translate-y-1"
    >
      <div className="p-6 flex-grow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-2xl">
            {getCategoryEmoji(category.slug)}
          </div>
          
          <Badge variant="outline">
            {toolCount} outil{toolCount !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-3">
          {category.description}
        </p>
      </div>
      
      <div className="p-4 border-t bg-muted/30">
        <Button variant="ghost" className="w-full" size="sm">
          Explorer
        </Button>
      </div>
    </Link>
  );
}

type CategoriesSectionProps = {
  categories: any[];
  toolCountByCategory: Record<string, number>;
};

export default function CategoriesSection({ categories, toolCountByCategory }: CategoriesSectionProps) {
  // Limiter le nombre de catégories affichées (les plus populaires)
  const displayCategories = categories.slice(0, 6);
  
  return (
    <section className="py-16">
      <div className="container max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Explorer par catégorie
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Parcourez les outils d'IA pour la vidéo par catégories pour trouver exactement ce que vous cherchez.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCategories.map(category => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              toolCount={toolCountByCategory[category.id] || 0}
            />
          ))}
        </div>
        
        <div className="flex justify-center mt-10">
          <Button asChild variant="outline" size="lg">
            <Link href="/categories">
              Voir toutes les catégories
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
} 
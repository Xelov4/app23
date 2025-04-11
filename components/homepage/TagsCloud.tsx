"use client";

import Link from "next/link";
import { Tag } from "lucide-react";

type TagsCloudProps = {
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    toolCount?: number;
  }>;
};

export default function TagsCloud({ tags }: TagsCloudProps) {
  // On trie les tags par nombre d'outils si disponible, sinon par nom
  const sortedTags = [...tags].sort((a, b) => {
    if (a.toolCount !== undefined && b.toolCount !== undefined) {
      return b.toolCount - a.toolCount;
    }
    return a.name.localeCompare(b.name);
  });
  
  // Fonction pour déterminer la taille du tag en fonction de sa popularité
  const getTagSize = (index: number, count?: number): string => {
    // Si le nombre d'outils est disponible et > 0, on l'utilise
    if (count !== undefined && count > 0) {
      if (count > 20) return "font-semibold text-lg";
      if (count > 10) return "font-medium text-base";
      if (count > 5) return "text-sm";
      return "text-xs";
    }
    
    // Sinon, on se base sur l'index (les premiers tags sont considérés plus populaires)
    if (index < 5) return "font-semibold text-lg";
    if (index < 12) return "font-medium text-base";
    if (index < 20) return "text-sm";
    return "text-xs";
  };
  
  return (
    <section className="py-12 bg-muted/20">
      <div className="container max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center">
              <Tag className="mr-2 h-5 w-5" />
              Tags populaires
            </h2>
            <p className="text-muted-foreground">
              Découvrez des outils d'IA pour la vidéo par tags spécifiques
            </p>
          </div>
          
          <Link
            href="/tags"
            className="text-primary hover:underline text-sm font-medium"
          >
            Voir tous les tags
          </Link>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {sortedTags.slice(0, 30).map((tag, index) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className={`
                ${getTagSize(index, tag.toolCount)}
                px-3 py-1 rounded-full border hover:bg-muted/50 transition-colors
                ${index < 5 ? "bg-primary/5 border-primary/20" : "border-muted-foreground/20"}
              `}
            >
              {tag.name}
              {tag.toolCount !== undefined && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({tag.toolCount})
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { 
  getImageWithFallback,
  formatDate,
  truncateText,
  formatPricingType,
  getCategoryEmoji
} from "@/lib/design-system/primitives";
import { ArrowRight } from "lucide-react";

type ToolSidebarProps = {
  similarTools: any[];
  popularCategories: any[];
};

export default function ToolSidebar({ similarTools, popularCategories }: ToolSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Outils similaires */}
      {similarTools && similarTools.length > 0 && (
        <div className="bg-card border rounded-lg p-5 shadow-sm">
          <h3 className="font-medium text-lg mb-4">Outils similaires</h3>
          
          <div className="space-y-4">
            {similarTools.slice(0, 5).map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="flex items-start group hover:bg-muted/30 p-2 rounded-md transition-colors"
              >
                <div className="relative w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0 bg-white border">
                  <Image
                    src={getImageWithFallback(tool.logoUrl)}
                    alt={tool.name}
                    fill
                    className="object-contain p-1"
                    sizes="40px"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {truncateText(tool.description, 80)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          
          {similarTools.length > 5 && (
            <Link
              href="/tools"
              className="flex items-center justify-end text-xs text-primary mt-4 hover:underline"
            >
              Voir plus d'outils
              <ArrowRight size={12} className="ml-1" />
            </Link>
          )}
        </div>
      )}
      
      {/* Catégories populaires */}
      {popularCategories && popularCategories.length > 0 && (
        <div className="bg-card border rounded-lg p-5 shadow-sm">
          <h3 className="font-medium text-lg mb-4">Catégories populaires</h3>
          
          <div className="flex flex-wrap gap-2">
            {popularCategories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="inline-flex"
              >
                <Badge variant="secondary" className="flex items-center hover:bg-secondary/80">
                  <span className="mr-1">{getCategoryEmoji(category.slug)}</span>
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
          
          <Link
            href="/categories"
            className="flex items-center justify-end text-xs text-primary mt-4 hover:underline"
          >
            Toutes les catégories
            <ArrowRight size={12} className="ml-1" />
          </Link>
        </div>
      )}
      
      {/* Recherches associées - Ajout selon les besoins */}
      <div className="bg-card border rounded-lg p-5 shadow-sm">
        <h3 className="font-medium text-lg mb-4">Termes de recherche liés</h3>
        
        <div className="flex flex-wrap gap-2">
          {/* Simuler des recherches liées - à remplacer par des données réelles */}
          {['IA vidéo', 'montage vidéo', 'transcription', 'sous-titres', 'édition', 'création contenu'].map((term, index) => (
            <Link
              key={index}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="inline-flex"
            >
              <Badge variant="outline" className="hover:bg-muted transition-colors">
                {term}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 
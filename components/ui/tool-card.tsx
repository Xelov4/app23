"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Tag, Clock } from "lucide-react";
import { 
  getImageWithFallback, 
  formatDate, 
  truncateText, 
  formatPricingType,
  getCategoryEmoji
} from "@/lib/design-system/primitives";

type ToolCardProps = {
  tool: any;
  variant?: "default" | "compact" | "grid" | "horizontal";
  showCategories?: boolean;
  showTags?: boolean;
  showDate?: boolean;
};

export function ToolCard({ 
  tool, 
  variant = "default", 
  showCategories = true,
  showTags = true,
  showDate = true
}: ToolCardProps) {
  // Formater la date
  const formattedDate = formatDate(tool.updatedAt || tool.createdAt);
  
  // Définir les classes en fonction de la variante
  const cardClasses = {
    default: "flex flex-col h-full bg-card border rounded-xl overflow-hidden transition-all hover:shadow-md",
    compact: "flex bg-card border rounded-lg overflow-hidden hover:shadow-sm transition-all",
    grid: "flex flex-col h-full bg-card border rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md",
    horizontal: "flex bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all"
  };
  
  // Définir les classes du logo en fonction de la variante
  const logoClasses = {
    default: "relative w-full aspect-square bg-white flex-shrink-0",
    compact: "relative w-12 h-12 rounded-md overflow-hidden mr-3 flex-shrink-0 bg-white",
    grid: "relative w-full aspect-square bg-white flex-shrink-0",
    horizontal: "relative w-20 h-20 md:w-32 md:h-32 bg-white flex-shrink-0"
  };
  
  // Variante horizontale spéciale
  if (variant === "horizontal") {
    return (
      <article className={cardClasses[variant]}>
        {/* Logo */}
        <div className={logoClasses[variant]}>
          <Image
            src={getImageWithFallback(tool.logoUrl)}
            alt={tool.name}
            fill
            className="object-contain p-3"
            sizes="(max-width: 768px) 80px, 128px"
          />
        </div>
        
        {/* Contenu */}
        <div className="flex flex-col flex-grow p-4 md:p-6 justify-between">
          <div>
            <div className="flex justify-between items-start gap-4 mb-2">
              <h3 className="text-lg md:text-xl font-semibold line-clamp-2">{tool.name}</h3>
              
              {/* Rating */}
              <div className="flex items-center">
                <div className="flex mr-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={`${
                        star <= Math.round(tool.rating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  ({tool._count?.reviews || 0})
                </span>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-3 line-clamp-2">
              {truncateText(tool.description, 150)}
            </p>
            
            {/* Catégories */}
            {showCategories && tool.categories && tool.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={formatPricingType(tool.pricingType).className}>
                  {formatPricingType(tool.pricingType).label}
                </Badge>
                
                {tool.categories.slice(0, 2).map((item: any) => (
                  <Link
                    key={item.categoryId || item.id}
                    href={`/categories/${item.category?.slug || item.slug}`}
                  >
                    <Badge variant="outline" className="flex items-center hover:bg-muted">
                      <span className="mr-1">
                        {getCategoryEmoji(item.category?.slug || item.slug)}
                      </span>
                      {item.category?.name || item.name}
                    </Badge>
                  </Link>
                ))}
                
                {tool.categories.length > 2 && (
                  <Badge variant="outline">+{tool.categories.length - 2}</Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            {/* Tags */}
            {showTags && tool.tags && tool.tags.length > 0 && (
              <div className="hidden md:flex items-center text-muted-foreground text-sm">
                <Tag size={14} className="mr-1 flex-shrink-0" />
                <span className="truncate max-w-[200px]">
                  {tool.tags.slice(0, 3).map((tag: any, i: number) => (
                    <span key={tag.tagId || tag.id}>
                      {i > 0 && ", "}
                      <Link href={`/tags/${tag.tag?.slug || tag.slug}`} className="hover:underline">
                        {tag.tag?.name || tag.name}
                      </Link>
                    </span>
                  ))}
                  {tool.tags.length > 3 && "..."}
                </span>
              </div>
            )}
            
            {/* Date de mise à jour */}
            {showDate && (
              <div className="hidden md:flex items-center text-xs text-muted-foreground">
                <Clock size={12} className="mr-1" />
                <span>{formattedDate}</span>
              </div>
            )}
            
            {/* Boutons d'action */}
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/tools/${tool.slug}`}>
                  Détails
                </Link>
              </Button>
              <Button size="sm" asChild>
                <a 
                  href={tool.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1"
                >
                  Visiter
                  <ExternalLink size={12} />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  }
  
  // Variante compacte spéciale
  if (variant === "compact") {
    return (
      <article className={cardClasses[variant]}>
        <div className={logoClasses[variant]}>
          <Image
            src={getImageWithFallback(tool.logoUrl)}
            alt={tool.name}
            fill
            className="object-contain p-1"
            sizes="48px"
          />
        </div>
        
        <div className="flex flex-col py-2 pr-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium line-clamp-1">{tool.name}</h3>
            
            <Badge variant="outline" className="ml-2 text-xs">
              {formatPricingType(tool.pricingType).label}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-1">
            {truncateText(tool.description, 60)}
          </p>
        </div>
      </article>
    );
  }
  
  // Variantes default et grid
  return (
    <article className={cardClasses[variant]}>
      {/* Logo */}
      <div className={logoClasses[variant]}>
        <Image
          src={getImageWithFallback(tool.logoUrl)}
          alt={tool.name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
        />
      </div>
      
      {/* Contenu */}
      <div className="flex-grow p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold line-clamp-1">{tool.name}</h3>
          
          {/* Rating */}
          <div className="flex items-center">
            <Star
              size={14}
              className="text-yellow-400 fill-yellow-400 mr-1"
            />
            <span className="text-xs">
              {tool.rating?.toFixed(1) || '0.0'}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {truncateText(tool.description, 100)}
        </p>
        
        {/* Catégories */}
        {showCategories && tool.categories && tool.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge className={formatPricingType(tool.pricingType).className + " text-xs"}>
              {formatPricingType(tool.pricingType).label}
            </Badge>
            
            {tool.categories.slice(0, 2).map((item: any) => (
              <Link
                key={item.categoryId || item.id}
                href={`/categories/${item.category?.slug || item.slug}`}
              >
                <Badge variant="outline" className="text-xs flex items-center hover:bg-muted">
                  <span className="mr-1">
                    {getCategoryEmoji(item.category?.slug || item.slug)}
                  </span>
                  {item.category?.name || item.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Pied de carte avec lien */}
      <div className="p-4 pt-0 mt-auto">
        <div className="flex items-center justify-between">
          {showDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock size={12} className="mr-1" />
              <span>{formattedDate}</span>
            </div>
          )}
          
          <Button size="sm" asChild className="ml-auto">
            <Link href={`/tools/${tool.slug}`}>
              Voir détails
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
} 
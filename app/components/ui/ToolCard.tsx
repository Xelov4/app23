"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPricingType, truncateText } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface ToolCardProps {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  category: string;
  categorySlug?: string;
  pricing: string;
  isCompact?: boolean;
}

export default function ToolCard({
  id,
  slug,
  name,
  description,
  imageUrl,
  category,
  categorySlug,
  pricing,
  isCompact = false,
}: ToolCardProps) {
  const [imageError, setImageError] = useState(false);

  // Détermine la longueur de description à afficher
  const descriptionLength = isCompact ? 60 : 120;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col">
      <div className={`relative ${isCompact ? 'h-36' : 'h-48'} bg-gray-100`}>
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-3xl">{name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="font-medium">
            {formatPricingType(pricing)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="mb-1">
          {categorySlug ? (
            <Link href={`/categories/${categorySlug}`}>
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            </Link>
          ) : (
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          )}
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{name}</h3>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-auto">
          {truncateText(description, descriptionLength)}
        </p>
        
        <Link 
          href={`/tools/${slug}`}
          className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline inline-flex items-center"
        >
          Voir plus
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
      </CardContent>
    </Card>
  );
}

// Version Skeleton pour le chargement
export function ToolCardSkeleton({ isCompact = false }: { isCompact?: boolean }) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className={`relative ${isCompact ? 'h-36' : 'h-48'} bg-gray-100`}>
        <Skeleton className="h-full w-full" />
      </div>
      
      <CardContent className="p-4 flex-grow">
        <Skeleton className="h-5 w-16 mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-5 w-24" />
      </CardFooter>
    </Card>
  );
} 
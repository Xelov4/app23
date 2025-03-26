import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { 
  getCategoryColor, 
  getCategoryEmoji, 
  getImageWithFallback 
} from "@/lib/design-system/primitives";
import { CategoryCardProps } from "@/lib/design-system/types";

export function CategoryCard({ 
  category, 
  variant = "default", 
  className = "" 
}: CategoryCardProps) {
  const imageUrl = getImageWithFallback(category.imageUrl);
  const gradientClass = getCategoryColor(category.slug);
  const emoji = getCategoryEmoji(category.slug);
  const toolCount = category._count?.CategoriesOnTools || 0;
  
  if (variant === "compact") {
    return (
      <Link href={`/categories/${category.slug}`} className="block w-full h-full">
        <Card className="h-full transition-all hover:shadow-md hover:-translate-y-1">
          <CardContent className="p-3 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white`}>
              <span>{emoji}</span>
            </div>
            <div>
              <h3 className="font-medium text-sm">{category.name}</h3>
              <p className="text-xs text-muted-foreground">
                {toolCount} outil{toolCount > 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }
  
  if (variant === "featured") {
    return (
      <Link href={`/categories/${category.slug}`} className="block w-full h-full">
        <Card className="h-full overflow-hidden border-0 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 z-10"></div>
          <div className="relative h-48">
            {imageUrl ? (
              <Image 
                src={imageUrl} 
                alt={category.name} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradientClass}`}></div>
            )}
          </div>
          <CardContent className="absolute bottom-0 left-0 right-0 z-20 p-4 text-white">
            <h3 className="text-lg font-bold mb-1">{category.name}</h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/80">
                {toolCount} outil{toolCount > 1 ? 's' : ''}
              </p>
              <span className="text-2xl">{emoji}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }
  
  // Default variant
  return (
    <Link href={`/categories/${category.slug}`} className="block w-full h-full">
      <Card className={`h-full transition-all hover:shadow-md hover:-translate-y-1 ${className}`}>
        <div className={`h-24 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
          <span className="text-3xl">{emoji}</span>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-base mb-1">{category.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {category.description}
          </p>
          <p className="text-xs font-medium">
            {toolCount} outil{toolCount > 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
} 
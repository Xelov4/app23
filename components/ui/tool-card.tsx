import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  formatPricingType, 
  getImageWithFallback, 
  truncateText 
} from "@/lib/design-system/primitives";
import { ToolCardProps } from "@/lib/design-system/types";

export function ToolCard({ 
  tool, 
  variant = "default", 
  className = "" 
}: ToolCardProps) {
  const pricingType = formatPricingType(tool.pricingType);
  const logoUrl = getImageWithFallback(tool.logoUrl);

  // Mapping pour convertir les classes de formatPricingType en variants de Badge
  const pricingVariantMap: Record<string, "default" | "primary" | "secondary" | "outline" | "success" | "accent" | "destructive"> = {
    "bg-success-100 text-success-700": "success",
    "bg-primary-100 text-primary-700": "primary",
    "bg-accent-100 text-accent-700": "accent",
    "bg-neutral-100 text-neutral-700": "secondary"
  };

  // Obtenir le variant correct pour le badge
  const pricingBadgeVariant = pricingVariantMap[pricingType.className] || "default";

  if (variant === "compact") {
    return (
      <Link href={`/tools/${tool.slug}`} className="block w-full h-full">
        <Card className="h-full transition-all hover:shadow-md hover:-translate-y-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="relative flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-muted">
              <Image 
                src={logoUrl} 
                alt={tool.name} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-semibold text-sm truncate">{tool.name}</h3>
              <div className="flex items-center mt-1">
                <Badge variant={pricingBadgeVariant} size="sm">
                  {pricingType.label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/tools/${tool.slug}`} className="block w-full h-full">
        <Card className="h-full transition-all hover:shadow-md overflow-hidden border-0">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-4">
            <span className="inline-block text-xs px-2 py-1 rounded-full bg-white/20 font-medium">
              En vedette
            </span>
            <h3 className="text-xl font-bold mt-2">{tool.name}</h3>
            <p className="mt-1 text-white/80 text-sm">
              {truncateText(tool.description, 120)}
            </p>
          </div>
          <CardContent className="p-4 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white">
                  {logoUrl ? (
                    <Image 
                      src={logoUrl} 
                      alt={tool.name} 
                      fill 
                      className="object-contain p-1"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">{tool.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <Badge variant={pricingBadgeVariant}>
                  {pricingType.label}
                </Badge>
              </div>
              <div className="flex items-center text-muted-foreground">
                <span className="text-sm">Voir →</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/tools/${tool.slug}`} className="block w-full h-full">
      <Card className={`h-full transition-all hover:shadow-md hover:-translate-y-1 ${className}`}>
        <CardHeader className="p-4 pb-0 flex justify-center">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white flex items-center justify-center">
            {logoUrl ? (
              <Image 
                src={logoUrl} 
                alt={tool.name} 
                fill 
                className="object-contain p-1"
                priority
              />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {tool.name.charAt(0)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3 text-center">
          <h3 className="font-semibold text-base mb-1">{tool.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {truncateText(tool.description, 100)}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant={pricingBadgeVariant}>
              {pricingType.label}
            </Badge>
            {tool.category && (
              <Badge variant="secondary">
                {tool.category}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-center">
          <span className="text-sm text-primary hover:underline">
            Voir l'outil →
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
} 
import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PricingType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

import { cn } from "@/lib/design-system/primitives";
import { FilterOptions } from "@/lib/design-system/types";

interface SearchFiltersProps {
  filterOptions: FilterOptions;
  className?: string;
}

export function SearchFilters({ filterOptions, className }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // État pour maintenir les filtres sélectionnés
  const [selectedPricing, setSelectedPricing] = React.useState<string[]>(
    searchParams.get("pricing")?.split(",") || []
  );
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    searchParams.get("category")?.split(",") || []
  );
  const [selectedTags, setSelectedTags] = React.useState<string[]>(
    searchParams.get("tag")?.split(",") || []
  );
  const [searchTerm, setSearchTerm] = React.useState<string>(
    searchParams.get("search") || ""
  );
  
  // Fonction pour mettre à jour l'URL avec les filtres
  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedPricing.length > 0) params.set("pricing", selectedPricing.join(","));
    if (selectedCategories.length > 0) params.set("category", selectedCategories.join(","));
    if (selectedTags.length > 0) params.set("tag", selectedTags.join(","));
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  // Gestion des changements de filtres
  const handlePricingChange = (pricing: string) => {
    setSelectedPricing(prev => 
      prev.includes(pricing) 
        ? prev.filter(p => p !== pricing)
        : [...prev, pricing]
    );
  };
  
  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategories(prev => 
      prev.includes(categorySlug) 
        ? prev.filter(c => c !== categorySlug)
        : [...prev, categorySlug]
    );
  };
  
  const handleTagChange = (tagSlug: string) => {
    setSelectedTags(prev => 
      prev.includes(tagSlug) 
        ? prev.filter(t => t !== tagSlug)
        : [...prev, tagSlug]
    );
  };
  
  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setSelectedPricing([]);
    setSelectedCategories([]);
    setSelectedTags([]);
    setSearchTerm("");
    router.push(pathname);
  };
  
  // Formater les types de tarification pour l'affichage
  const formatPricingType = (type: PricingType): string => {
    switch (type) {
      case "FREE": return "Gratuit";
      case "FREEMIUM": return "Freemium";
      case "PAID": return "Payant";
      case "CONTACT": return "Sur devis";
      default: return type;
    }
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-medium mb-3">Recherche</h3>
        <div className="flex items-center space-x-2">
          <Input
            type="search"
            placeholder="Rechercher un outil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button 
            variant="default" 
            onClick={updateSearchParams}
          >
            Rechercher
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-3">Filtres actifs</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedPricing.length === 0 && 
           selectedCategories.length === 0 && 
           selectedTags.length === 0 ? (
            <span className="text-sm text-muted-foreground">Aucun filtre actif</span>
          ) : (
            <>
              {selectedPricing.map(pricing => (
                <Badge 
                  key={pricing} 
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handlePricingChange(pricing)}
                >
                  {formatPricingType(pricing as PricingType)}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-1 h-3 w-3"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </Badge>
              ))}
              
              {selectedCategories.map(categorySlug => {
                const category = filterOptions.categories.find(c => c.slug === categorySlug);
                return category ? (
                  <Badge 
                    key={categorySlug} 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleCategoryChange(categorySlug)}
                  >
                    {category.name}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-1 h-3 w-3"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </Badge>
                ) : null;
              })}
              
              {selectedTags.map(tagSlug => {
                const tag = filterOptions.tags.find(t => t.slug === tagSlug);
                return tag ? (
                  <Badge 
                    key={tagSlug} 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleTagChange(tagSlug)}
                  >
                    {tag.name}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-1 h-3 w-3"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </Badge>
                ) : null;
              })}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                className="ml-auto"
              >
                Réinitialiser les filtres
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-3">Type de tarification</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filterOptions.pricingTypes.map(pricing => (
            <div key={pricing} className="flex items-center space-x-2">
              <Checkbox 
                id={`pricing-${pricing}`}
                checked={selectedPricing.includes(pricing)}
                onCheckedChange={() => handlePricingChange(pricing)}
              />
              <label 
                htmlFor={`pricing-${pricing}`}
                className="text-sm cursor-pointer"
              >
                {formatPricingType(pricing)}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-3">Catégories</h3>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
          {filterOptions.categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`category-${category.slug}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => handleCategoryChange(category.slug)}
              />
              <label 
                htmlFor={`category-${category.slug}`}
                className="text-sm cursor-pointer flex-1 truncate"
              >
                {category.name}
                <span className="text-xs text-muted-foreground ml-1">
                  ({category._count?.CategoriesOnTools || 0})
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {filterOptions.tags.length > 0 && (
        <>
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-3">Tags populaires</h3>
            <div className="flex flex-wrap gap-2">
              {filterOptions.tags.map(tag => (
                <Badge 
                  key={tag.id} 
                  variant={selectedTags.includes(tag.slug) ? "primary" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagChange(tag.slug)}
                >
                  {tag.name}
                  <span className="text-xs ml-1">
                    ({tag._count?.TagsOnTools || 0})
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
      
      <Separator />
      
      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={resetFilters}
        >
          Réinitialiser
        </Button>
        <Button 
          onClick={updateSearchParams}
        >
          Appliquer les filtres
        </Button>
      </div>
    </div>
  );
} 
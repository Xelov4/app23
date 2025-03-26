"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Cross1Icon, FilterIcon, ResetIcon } from "@radix-ui/react-icons";
import { Separator } from "@/components/ui/separator";

interface FilterOption {
  id: string;
  name: string;
  count?: number;
  slug?: string;
  emoji?: string;
}

interface ToolFiltersProps {
  pricingOptions: FilterOption[];
  categoryOptions: FilterOption[];
  tagOptions: FilterOption[];
  initialFilters: {
    pricing: string[];
    categories: string[];
    tags: string[];
    search?: string;
  };
}

export default function ToolFilters({
  pricingOptions,
  categoryOptions,
  tagOptions,
  initialFilters,
}: ToolFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    pricing: initialFilters.pricing || [],
    categories: initialFilters.categories || [],
    tags: initialFilters.tags || [],
    search: initialFilters.search || "",
  });
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Met à jour l'état des filtres si les params de recherche changent
  useEffect(() => {
    setFilters({
      pricing: initialFilters.pricing || [],
      categories: initialFilters.categories || [],
      tags: initialFilters.tags || [],
      search: initialFilters.search || "",
    });
  }, [searchParams, initialFilters]);
  
  // Compte le nombre total de filtres actifs
  const activeFiltersCount = filters.pricing.length + filters.categories.length + filters.tags.length;
  
  // Fonction pour mettre à jour un filtre spécifique
  const updateFilter = (
    type: "pricing" | "categories" | "tags",
    id: string,
    checked: boolean
  ) => {
    setFilters((prev) => {
      if (checked) {
        return {
          ...prev,
          [type]: [...prev[type], id],
        };
      } else {
        return {
          ...prev,
          [type]: prev[type].filter((item) => item !== id),
        };
      }
    });
  };
  
  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    const newParams = new URLSearchParams();
    
    if (filters.search) {
      newParams.set("search", filters.search);
    }
    
    router.push(`/?${newParams.toString()}`);
    
    setMobileFiltersOpen(false);
  };
  
  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    const newParams = new URLSearchParams();
    
    if (filters.search) {
      newParams.set("search", filters.search);
    }
    
    if (filters.pricing.length > 0) {
      newParams.set("pricing", filters.pricing.join(","));
    }
    
    if (filters.categories.length > 0) {
      newParams.set("categories", filters.categories.join(","));
    }
    
    if (filters.tags.length > 0) {
      newParams.set("tags", filters.tags.join(","));
    }
    
    router.push(`/?${newParams.toString()}`);
    
    setMobileFiltersOpen(false);
  };
  
  // Fonction pour supprimer un filtre spécifique
  const removeFilter = (
    type: "pricing" | "categories" | "tags",
    id: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item !== id),
    }));
  };
  
  // Obtient le nom d'un filtre à partir de son ID
  const getFilterName = (type: "pricing" | "categories" | "tags", id: string) => {
    let options: FilterOption[] = [];
    
    if (type === "pricing") options = pricingOptions;
    if (type === "categories") options = categoryOptions;
    if (type === "tags") options = tagOptions;
    
    return options.find((option) => option.id === id)?.name || id;
  };
  
  // Version desktop du composant
  const DesktopFilters = () => (
    <div className="hidden md:block sticky top-24 w-full">
      <div className="bg-white p-5 rounded-lg border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Filtres</h3>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 text-xs flex items-center text-gray-500"
            >
              <ResetIcon className="mr-1 h-3 w-3" />
              Réinitialiser
            </Button>
          )}
        </div>
        
        {/* Affichage des filtres actifs */}
        {activeFiltersCount > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {filters.pricing.map((id) => (
                <Badge key={`pricing-${id}`} variant="secondary" className="px-2 py-1">
                  {getFilterName("pricing", id)}
                  <button
                    onClick={() => removeFilter("pricing", id)}
                    className="ml-1 hover:text-red-500"
                  >
                    <Cross1Icon className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {filters.categories.map((id) => (
                <Badge key={`category-${id}`} variant="secondary" className="px-2 py-1">
                  {getFilterName("categories", id)}
                  <button
                    onClick={() => removeFilter("categories", id)}
                    className="ml-1 hover:text-red-500"
                  >
                    <Cross1Icon className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {filters.tags.map((id) => (
                <Badge key={`tag-${id}`} variant="secondary" className="px-2 py-1">
                  {getFilterName("tags", id)}
                  <button
                    onClick={() => removeFilter("tags", id)}
                    className="ml-1 hover:text-red-500"
                  >
                    <Cross1Icon className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); applyFilters(); }}>
          {/* Filtres par prix */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-sm">Prix</h4>
            <div className="space-y-2">
              {pricingOptions.map((pricing) => (
                <div key={pricing.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`desktop-price-${pricing.id}`}
                    checked={filters.pricing.includes(pricing.id)}
                    onCheckedChange={(checked) =>
                      updateFilter("pricing", pricing.id, checked === true)
                    }
                  />
                  <Label htmlFor={`desktop-price-${pricing.id}`} className="text-sm cursor-pointer">
                    {pricing.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Filtres par catégorie */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-sm">Catégories</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {categoryOptions.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`desktop-cat-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={(checked) =>
                      updateFilter("categories", category.id, checked === true)
                    }
                  />
                  <Label htmlFor={`desktop-cat-${category.id}`} className="text-sm cursor-pointer flex items-center">
                    {category.emoji && <span className="mr-1.5">{category.emoji}</span>}
                    {category.name}
                    {category.count && <span className="ml-1 text-xs text-gray-500">({category.count})</span>}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Filtres par tag */}
          <div className="mb-5">
            <h4 className="font-medium mb-3 text-sm">Tags populaires</h4>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={filters.tags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => updateFilter("tags", tag.id, !filters.tags.includes(tag.id))}
                >
                  {tag.name}
                  {tag.count && <span className="ml-1 text-xs">({tag.count})</span>}
                </Badge>
              ))}
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Appliquer les filtres
          </Button>
        </form>
      </div>
    </div>
  );
  
  // Version mobile du composant
  const MobileFilters = () => (
    <div className="md:hidden flex mb-6">
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FilterIcon className="h-4 w-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 rounded-full text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] pt-6">
          <SheetHeader className="text-left">
            <SheetTitle>Filtres</SheetTitle>
            <SheetDescription>
              Filtrez les outils selon vos critères
            </SheetDescription>
          </SheetHeader>
          
          {/* Affichage des filtres actifs */}
          {activeFiltersCount > 0 && (
            <div className="my-4">
              <div className="flex flex-wrap gap-2">
                {filters.pricing.map((id) => (
                  <Badge key={`pricing-mobile-${id}`} variant="secondary" className="px-2 py-1">
                    {getFilterName("pricing", id)}
                    <button
                      onClick={() => removeFilter("pricing", id)}
                      className="ml-1 hover:text-red-500"
                    >
                      <Cross1Icon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                
                {filters.categories.map((id) => (
                  <Badge key={`category-mobile-${id}`} variant="secondary" className="px-2 py-1">
                    {getFilterName("categories", id)}
                    <button
                      onClick={() => removeFilter("categories", id)}
                      className="ml-1 hover:text-red-500"
                    >
                      <Cross1Icon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                
                {filters.tags.map((id) => (
                  <Badge key={`tag-mobile-${id}`} variant="secondary" className="px-2 py-1">
                    {getFilterName("tags", id)}
                    <button
                      onClick={() => removeFilter("tags", id)}
                      className="ml-1 hover:text-red-500"
                    >
                      <Cross1Icon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="h-full overflow-y-auto pb-24">
            <form onSubmit={(e) => { e.preventDefault(); applyFilters(); }}>
              {/* Filtres par prix */}
              <div className="mb-6 mt-4">
                <h4 className="font-medium mb-3 text-sm">Prix</h4>
                <div className="space-y-3">
                  {pricingOptions.map((pricing) => (
                    <div key={pricing.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mobile-price-${pricing.id}`}
                        checked={filters.pricing.includes(pricing.id)}
                        onCheckedChange={(checked) =>
                          updateFilter("pricing", pricing.id, checked === true)
                        }
                      />
                      <Label htmlFor={`mobile-price-${pricing.id}`} className="text-sm cursor-pointer">
                        {pricing.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {/* Filtres par catégorie */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm">Catégories</h4>
                <div className="space-y-3">
                  {categoryOptions.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mobile-cat-${category.id}`}
                        checked={filters.categories.includes(category.id)}
                        onCheckedChange={(checked) =>
                          updateFilter("categories", category.id, checked === true)
                        }
                      />
                      <Label htmlFor={`mobile-cat-${category.id}`} className="text-sm cursor-pointer flex items-center">
                        {category.emoji && <span className="mr-1.5">{category.emoji}</span>}
                        {category.name}
                        {category.count && <span className="ml-1 text-xs text-gray-500">({category.count})</span>}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {/* Filtres par tag */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm">Tags populaires</h4>
                <div className="flex flex-wrap gap-2">
                  {tagOptions.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={filters.tags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => updateFilter("tags", tag.id, !filters.tags.includes(tag.id))}
                    >
                      {tag.name}
                      {tag.count && <span className="ml-1 text-xs">({tag.count})</span>}
                    </Badge>
                  ))}
                </div>
              </div>
            </form>
          </div>
          
          <SheetFooter className="flex flex-row gap-3 absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={resetFilters}
            >
              Réinitialiser
            </Button>
            <Button 
              onClick={applyFilters}
              className="flex-1"
            >
              Appliquer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
  
  return (
    <>
      <MobileFilters />
      <DesktopFilters />
    </>
  );
} 
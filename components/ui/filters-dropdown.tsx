"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatPricingType } from "@/lib/design-system/primitives";

interface FiltersDropdownProps {
  categories: any[];
  tags: any[];
  currentFilters: {
    pricing?: string[];
    categories?: string[];
    tags?: string[];
  };
  searchParams: any;
}

export function FiltersDropdown({ 
  categories, 
  tags, 
  currentFilters,
  searchParams
}: FiltersDropdownProps) {
  const router = useRouter();
  const [selectedPricing, setSelectedPricing] = useState<string[]>(currentFilters.pricing || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentFilters.categories || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(currentFilters.tags || []);

  const pricingOptions = [
    { value: "FREE", label: formatPricingType("FREE").label },
    { value: "FREEMIUM", label: formatPricingType("FREEMIUM").label },
    { value: "PAID", label: formatPricingType("PAID").label },
    { value: "CONTACT", label: formatPricingType("CONTACT").label },
  ];

  const handlePricingChange = (value: string, checked: boolean) => {
    setSelectedPricing(
      checked
        ? [...selectedPricing, value]
        : selectedPricing.filter((item) => item !== value)
    );
  };

  const handleCategoryChange = (value: string, checked: boolean) => {
    setSelectedCategories(
      checked
        ? [...selectedCategories, value]
        : selectedCategories.filter((item) => item !== value)
    );
  };

  const handleTagChange = (value: string, checked: boolean) => {
    setSelectedTags(
      checked
        ? [...selectedTags, value]
        : selectedTags.filter((item) => item !== value)
    );
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    // Mettre à jour les filtres
    if (selectedPricing.length > 0) {
      params.set("pricing", selectedPricing.join(","));
    } else {
      params.delete("pricing");
    }
    
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    } else {
      params.delete("categories");
    }
    
    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    } else {
      params.delete("tags");
    }
    
    // Réinitialiser la page
    params.delete("page");
    
    // Rediriger
    router.push(`/tools?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedPricing([]);
    setSelectedCategories([]);
    setSelectedTags([]);
  };

  const hasFilters = 
    selectedPricing.length > 0 || 
    selectedCategories.length > 0 || 
    selectedTags.length > 0;

  const filtersCount = 
    selectedPricing.length + 
    selectedCategories.length + 
    selectedTags.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full flex justify-between items-center">
          <span>Filtres{filtersCount > 0 ? ` (${filtersCount})` : ""}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="21" x2="14" y1="4" y2="4"></line>
            <line x1="10" x2="3" y1="4" y2="4"></line>
            <line x1="21" x2="12" y1="12" y2="12"></line>
            <line x1="8" x2="3" y1="12" y2="12"></line>
            <line x1="21" x2="16" y1="20" y2="20"></line>
            <line x1="12" x2="3" y1="20" y2="20"></line>
            <line x1="14" x2="14" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="10" y2="14"></line>
            <line x1="16" x2="16" y1="18" y2="22"></line>
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] sm:h-[90vh]">
        <SheetHeader>
          <SheetTitle>Filtres</SheetTitle>
          <SheetDescription>
            Affinez votre recherche à l'aide des filtres ci-dessous
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 h-[calc(100%-10rem)] overflow-y-auto">
          <div className="space-y-6">
            {/* Prix */}
            <div>
              <h3 className="text-sm font-medium mb-3">Prix</h3>
              <div className="space-y-2">
                {pricingOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <Checkbox
                      id={`pricing-${option.value}`}
                      checked={selectedPricing.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handlePricingChange(option.value, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`pricing-${option.value}`}
                      className="ml-2 text-sm cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Catégories */}
            <div>
              <h3 className="text-sm font-medium mb-3">Catégories</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="ml-2 text-sm cursor-pointer flex justify-between w-full"
                    >
                      <span>{category.name}</span>
                      {category._count?.CategoriesOnTools > 0 && (
                        <span className="text-muted-foreground text-xs">
                          ({category._count.CategoriesOnTools})
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div>
              <h3 className="text-sm font-medium mb-3">Tags</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={selectedTags.includes(tag.id)}
                      onCheckedChange={(checked) =>
                        handleTagChange(tag.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`tag-${tag.id}`}
                      className="ml-2 text-sm cursor-pointer flex justify-between w-full"
                    >
                      <span>{tag.name}</span>
                      {tag._count?.TagsOnTools > 0 && (
                        <span className="text-muted-foreground text-xs">
                          ({tag._count.TagsOnTools})
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <SheetFooter className="flex-row gap-2 sm:justify-between">
          <Button 
            variant="outline" 
            onClick={clearFilters}
            disabled={!hasFilters}
            className="w-full sm:w-auto"
          >
            Effacer les filtres
          </Button>
          <SheetClose asChild>
            <Button onClick={applyFilters} className="w-full sm:w-auto">
              Appliquer les filtres
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 
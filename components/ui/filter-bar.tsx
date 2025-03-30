"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { formatPricingType } from "@/lib/design-system/primitives";
import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
  categories: any[];
  tags: any[];
  currentFilters: {
    pricing?: string[];
    categories?: string[];
    tags?: string[];
  };
  searchParams: any;
}

export function FilterBar({ 
  categories, 
  tags, 
  currentFilters,
  searchParams
}: FilterBarProps) {
  const router = useRouter();
  const [selectedPricing, setSelectedPricing] = useState<string[]>(currentFilters.pricing || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentFilters.categories || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(currentFilters.tags || []);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const pricingOptions = [
    { value: "FREE", label: formatPricingType("FREE").label },
    { value: "FREEMIUM", label: formatPricingType("FREEMIUM").label },
    { value: "PAID", label: formatPricingType("PAID").label },
    { value: "CONTACT", label: formatPricingType("CONTACT").label },
  ];

  const handlePricingChange = (value: string, checked: boolean) => {
    const newValues = checked
      ? [...selectedPricing, value]
      : selectedPricing.filter((item) => item !== value);
    
    setSelectedPricing(newValues);
    updateFilters({ pricing: newValues });
  };

  const handleCategoryChange = (value: string, checked: boolean) => {
    const newValues = checked
      ? [...selectedCategories, value]
      : selectedCategories.filter((item) => item !== value);
    
    setSelectedCategories(newValues);
    updateFilters({ categories: newValues });
  };

  const handleTagChange = (value: string, checked: boolean) => {
    const newValues = checked
      ? [...selectedTags, value]
      : selectedTags.filter((item) => item !== value);
    
    setSelectedTags(newValues);
    updateFilters({ tags: newValues });
  };

  const updateFilters = (updates: any) => {
    const params = new URLSearchParams(searchParams);
    
    // Pricing
    const pricing = updates.pricing !== undefined ? updates.pricing : selectedPricing;
    if (pricing.length > 0) {
      params.set("pricing", pricing.join(","));
    } else {
      params.delete("pricing");
    }
    
    // Categories
    const cats = updates.categories !== undefined ? updates.categories : selectedCategories;
    if (cats.length > 0) {
      params.set("categories", cats.join(","));
    } else {
      params.delete("categories");
    }
    
    // Tags
    const tgs = updates.tags !== undefined ? updates.tags : selectedTags;
    if (tgs.length > 0) {
      params.set("tags", tgs.join(","));
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
    updateFilters({ pricing: [], categories: [], tags: [] });
  };

  const filteredCategories = categories.filter(
    category => category.name.toLowerCase().includes(categoryFilter.toLowerCase())
  );

  const filteredTags = tags.filter(
    tag => tag.name.toLowerCase().includes(tagFilter.toLowerCase())
  );

  const hasFilters = 
    selectedPricing.length > 0 || 
    selectedCategories.length > 0 || 
    selectedTags.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="space-y-5">
        <div>
          <h3 className="font-medium mb-3 flex justify-between items-center">
            <span>Filtres</span>
            {hasFilters && (
              <Badge variant="outline" className="text-xs">
                {selectedPricing.length + selectedCategories.length + selectedTags.length}
              </Badge>
            )}
          </h3>
          
          {hasFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground w-full justify-start pl-1 -mt-1"
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Prix</h4>
          <div className="space-y-2">
            {pricingOptions.map((option) => (
              <div key={option.value} className="flex items-center">
                <Checkbox
                  id={`pricing-desktop-${option.value}`}
                  checked={selectedPricing.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handlePricingChange(option.value, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`pricing-desktop-${option.value}`}
                  className="ml-2 text-sm cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-2">Catégories</h4>
          <Input
            type="text"
            placeholder="Filtrer les catégories..."
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="mb-2 text-xs h-8"
          />
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {filteredCategories.map((category) => (
              <div key={category.id} className="flex items-center">
                <Checkbox
                  id={`category-desktop-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`category-desktop-${category.id}`}
                  className="ml-2 text-sm cursor-pointer flex justify-between w-full"
                >
                  <span className="truncate">{category.name}</span>
                  {category._count?.CategoriesOnTools > 0 && (
                    <span className="text-muted-foreground text-xs ml-1 flex-shrink-0">
                      ({category._count.CategoriesOnTools})
                    </span>
                  )}
                </Label>
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <p className="text-xs text-muted-foreground py-1">Aucune catégorie trouvée</p>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-2">Tags</h4>
          <Input
            type="text"
            placeholder="Filtrer les tags..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="mb-2 text-xs h-8"
          />
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {filteredTags.map((tag) => (
              <div key={tag.id} className="flex items-center">
                <Checkbox
                  id={`tag-desktop-${tag.id}`}
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={(checked) =>
                    handleTagChange(tag.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`tag-desktop-${tag.id}`}
                  className="ml-2 text-sm cursor-pointer flex justify-between w-full"
                >
                  <span className="truncate">{tag.name}</span>
                  {tag._count?.TagsOnTools > 0 && (
                    <span className="text-muted-foreground text-xs ml-1 flex-shrink-0">
                      ({tag._count.TagsOnTools})
                    </span>
                  )}
                </Label>
              </div>
            ))}
            {filteredTags.length === 0 && (
              <p className="text-xs text-muted-foreground py-1">Aucun tag trouvé</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
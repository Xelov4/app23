export {};
import { FilterOptions } from "@/lib/design-system/types";

/**
 * Données de test pour les options de filtres
 */
export const mockFilterOptions: FilterOptions = {
  pricingTypes: [
    "FREE",
    "FREEMIUM",
    "PAID",
    "CONTACT"
  ],
  categories: [
    {
      id: "cat1",
      name: "Génération de vidéo",
      slug: "video-generation",
      icon: "🎬",
      _count: {
        CategoriesOnTools: 12
      }
    },
    {
      id: "cat2",
      name: "Audio",
      slug: "audio",
      icon: "🎵",
      _count: {
        CategoriesOnTools: 8
      }
    },
    {
      id: "cat3",
      name: "Traduction",
      slug: "translation",
      icon: "🌍",
      _count: {
        CategoriesOnTools: 5
      }
    }
  ],
  tags: [
    {
      id: "tag1",
      name: "Intelligence artificielle",
      slug: "ai",
      _count: {
        TagsOnTools: 20
      }
    },
    {
      id: "tag2",
      name: "Productivité",
      slug: "productivity",
      _count: {
        TagsOnTools: 15
      }
    },
    {
      id: "tag3",
      name: "Automatisation",
      slug: "automation",
      _count: {
        TagsOnTools: 10
      }
    }
  ]
};

/**
 * Données de test pour les filtres sélectionnés
 */
export const mockSelectedFilters = {
  pricing: ["FREE", "FREEMIUM"],
  categories: ["video-generation"],
  tags: ["ai"]
};

/**
 * URL de test avec paramètres
 */
export const mockSearchParamsString = "search=test&pricing=FREE,FREEMIUM&category=video-generation&tag=ai"; 
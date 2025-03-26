import { PricingType } from "@prisma/client";

/**
 * Type pour les outils
 */
export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string | null;
  websiteUrl: string;
  pricingType: PricingType;
  pricingDetails?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  features: string[] | string; // Peut être un JSON string ou un tableau
  category?: string;
  categoryId?: string;
}

/**
 * Type pour les outils avec des données complètes
 */
export interface ToolWithDetails extends Tool {
  categories: Category[];
  tags: Tag[];
  averageRating?: number | null;
  socialLinks: {
    twitter?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
    github?: string | null;
  };
}

/**
 * Type pour les catégories
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string | null;
  _count?: {
    CategoriesOnTools: number;
  };
}

/**
 * Type pour les tags
 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: {
    TagsOnTools: number;
  };
}

/**
 * Type pour les avis
 */
export interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  userEmail: string;
  userName: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Type pour les cas d'utilisation
 */
export interface UseCase {
  id: string;
  name: string;
  slug: string;
  description: string;
}

/**
 * Type pour les options de filtrage
 */
export interface FilterOptions {
  pricingTypes: PricingType[];
  categories: Category[];
  tags: Tag[];
}

/**
 * Type pour les paramètres de recherche
 */
export interface SearchParams {
  search?: string;
  category?: string;
  tag?: string;
  pricing?: string;
  page?: number;
  limit?: number;
}

/**
 * Type pour les résultats de recherche paginés
 */
export interface PaginatedResults<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

/**
 * Type pour les propriétés de carte d'outil
 */
export interface ToolCardProps {
  tool: Tool;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

/**
 * Type pour les propriétés de carte de catégorie
 */
export interface CategoryCardProps {
  category: Category;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

/**
 * Type pour les propriétés de badge
 */
export interface BadgeProps {
  text: string;
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'success' | 'accent' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} 
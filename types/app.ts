import { PricingType, UserRole } from '@/lib/config';

/**
 * Types partagés entre le frontend et le backend 
 */

// Type pour les outils
export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  websiteUrl: string;
  pricingType: PricingType;
  pricingDetails: string | null;
  features: string;
  isActive: boolean;
  httpCode?: number | null;
  httpChain?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  youtubeUrl?: string | null;
  appStoreUrl?: string | null;
  playStoreUrl?: string | null;
  affiliateUrl?: string | null;
  hasAffiliateProgram?: boolean;
  detailedDescription?: string | null;
  rating?: number | null;
  reviewCount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  categories?: CategoryOnTool[];
  tags?: TagOnTool[];
}

// Type pour les catégories
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  iconName: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  toolCount?: number;
}

// Type pour les tags
export interface Tag {
  id: string;
  name: string;
  slug: string;
  seoTitle: string | null;
  metaDescription: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Type pour les avis
export interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  userEmail: string;
  userName: string;
  toolId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Type pour les utilisateurs
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Type pour les features
export interface Feature {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  metaDescription: string | null;
  seoTitle: string | null;
}

// Type pour les relations
export interface CategoryOnTool {
  toolId: string;
  categoryId: string;
  category?: Category;
}

export interface TagOnTool {
  toolId: string;
  tagId: string;
  tag?: Tag;
}

export interface FeatureOnTool {
  toolId: string;
  featureId: string;
  feature?: Feature;
}

// Types pour les requêtes d'API
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Types pour les formulaires
export interface ToolFormData {
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  websiteUrl: string;
  pricingType: PricingType;
  pricingDetails?: string;
  features?: string;
  categoryId: string;
  isActive?: boolean;
  tagIds?: string[];
  featureIds?: string[];
  twitterUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  detailedDescription?: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  iconName?: string;
  seoTitle?: string;
  metaDescription?: string;
}

export interface SearchFilterParams {
  categories?: string[];
  tags?: string[];
  features?: string[];
  pricingTypes?: PricingType[];
  query?: string;
}

// Types pour les réponses de l'IA
export interface AiGeneratedContent {
  description?: string;
  summary?: string;
  seoTitle?: string;
  metaDescription?: string;
  pros?: string[];
  cons?: string[];
  relatedTags?: string[];
}

// Types pour l'administration
export interface DashboardStats {
  totalTools: number;
  activeTools: number;
  totalCategories: number;
  totalTags: number;
  recentReviews: number;
  topCategories: {
    name: string;
    count: number;
  }[];
} 
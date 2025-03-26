import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine classes conditionnellement avec clsx et assure leur cohérence avec tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Tronque un texte à la longueur spécifiée
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Formate le type de tarification en texte lisible
 */
export function formatPricingType(pricingType: string): string {
  const pricingMap: Record<string, string> = {
    "FREE": "Gratuit",
    "PAID": "Payant",
    "FREEMIUM": "Freemium",
    "CONTACT": "Sur demande"
  };
  
  return pricingMap[pricingType] || pricingType;
}

/**
 * Génère un tableau de pages pour la pagination
 */
export function generatePaginationItems(currentPage: number, totalPages: number) {
  // Toujours afficher la première, la dernière, et au max 3 pages autour de la page actuelle
  const items = [];
  
  // Première page toujours visible
  items.push(1);
  
  // Pages autour de la page actuelle
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  
  if (start > 2) {
    items.push('...');
  }
  
  for (let i = start; i <= end; i++) {
    items.push(i);
  }
  
  if (end < totalPages - 1) {
    items.push('...');
  }
  
  // Dernière page si différente de la première
  if (totalPages > 1) {
    items.push(totalPages);
  }
  
  return items;
}

/**
 * Crée une URL de page pour la pagination
 */
export function createPageUrl(page: number, searchParams: any = {}) {
  const url = new URL('/', 'http://example.com');
  url.searchParams.set('page', page.toString());
  
  if (searchParams?.search) {
    url.searchParams.set('search', searchParams.search);
  }
  
  if (searchParams?.pricing) {
    url.searchParams.set('pricing', searchParams.pricing);
  }
  
  if (searchParams?.categories) {
    url.searchParams.set('categories', searchParams.categories);
  }
  
  if (searchParams?.tags) {
    url.searchParams.set('tags', searchParams.tags);
  }
  
  return url.pathname + url.search;
}

/**
 * Détermine si l'écran est de petit format (mobile)
 */
export function isSmallScreen(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

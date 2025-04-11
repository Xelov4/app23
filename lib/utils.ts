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

/**
 * Convertit une chaîne en slug URL (minuscules, sans accents, tirets à la place des espaces)
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/[^\w-]+/g, '') // Enlever les caractères non alphanumériques
    .replace(/--+/g, '-'); // Remplacer les tirets multiples par un seul
}

// Fonction pour parser de manière sécurisée les features
export function safeJsonParse(jsonString: string | null | undefined): any[] {
  if (!jsonString) return [];
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Erreur lors du parsing JSON:", error);
    // Si c'est une chaîne, essayer de la diviser par des virgules
    if (typeof jsonString === 'string') {
      return jsonString.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  }
}

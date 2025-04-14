/**
 * Configuration centralisée de l'application
 * Toutes les constantes et variables d'environnement sont centralisées ici
 */

// Configuration de l'API
export const API_CONFIG = {
  // Clés d'API (à remplacer par des variables d'environnement)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  
  // Endpoints externes
  GEMINI_API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
};

// Configuration de l'application
export const APP_CONFIG = {
  SITE_NAME: 'Video-IA.net',
  SITE_URL: process.env.SITE_URL || 'https://video-ia.net',
  DEFAULT_LOCALE: 'fr',
  DEFAULT_TIMEZONE: 'Europe/Paris',
  CONTACT_EMAIL: 'contact@video-ia.net',
};

// Configuration de l'administration
export const ADMIN_CONFIG = {
  ITEMS_PER_PAGE: 10,
  DEFAULT_SORT_FIELD: 'createdAt',
  DEFAULT_SORT_DIRECTION: 'desc' as const,
};

// Configuration des médias
export const MEDIA_CONFIG = {
  PLACEHOLDER_IMAGE: '/images/placeholder-logo.png',
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
};

// Configuration SEO
export const SEO_CONFIG = {
  DEFAULT_TITLE: 'Video-IA.net - Les meilleurs outils d\'IA pour la vidéo',
  DEFAULT_DESCRIPTION: 'Découvrez les meilleurs outils d\'intelligence artificielle pour améliorer vos créations vidéo.',
  DEFAULT_OG_IMAGE: '/images/og-image.jpg',
  TWITTER_HANDLE: '@videoianet',
};

// Configuration de la pagination
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE: 1,
  MAX_PAGE_SIZE: 100,
};

// Types pour les modèles communs
export const MODEL_TYPES = {
  PRICING_TYPES: ['FREE', 'FREEMIUM', 'PAID'] as const,
  USER_ROLES: ['USER', 'ADMIN', 'EDITOR'] as const,
};

// Types TypeScript pour les énumérations
export type PricingType = typeof MODEL_TYPES.PRICING_TYPES[number];
export type UserRole = typeof MODEL_TYPES.USER_ROLES[number]; 
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine les classes Tailwind en utilisant clsx et twMerge
 * pour éviter les conflits de classe et les duplications
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un prix avec le symbole de la devise
 */
export function formatPrice(price: number, currency: string = "€") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency === "€" ? "EUR" : currency,
  }).format(price);
}

/**
 * Tronque un texte à une longueur maximale
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Convertit une chaîne en slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Génère une couleur aléatoire pour les avatars
 */
export function getRandomColor(): string {
  const colors = [
    "bg-primary-100",
    "bg-accent-100",
    "bg-success-100",
    "bg-neutral-100",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Retourne l'image par défaut si l'URL est invalide
 */
export function getImageWithFallback(url: string | null | undefined, fallback: string = "/images/placeholder.png"): string {
  // Si l'URL est vide ou null, utiliser l'image par défaut
  if (!url) return fallback;
  
  // Si l'URL ne commence pas par http ou /, considérer qu'elle est relative
  if (!url.startsWith('http') && !url.startsWith('/')) {
    return `/${url}`;
  }
  
  // Si l'URL pointe vers une image d'outil qui n'existe pas ou est vide, utiliser un placeholder générique
  if (url.includes('/images/tools/') && url.length < 20) {
    return fallback;
  }
  
  return url;
}

/**
 * Formate une date selon la locale française
 */
export function formatDate(dateString: string | Date) {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Option 1: utiliser Intl.DateTimeFormat pour un format localisé
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
  
  // Option 2: format plus simple
  // const day = date.getDate().toString().padStart(2, '0');
  // const month = (date.getMonth() + 1).toString().padStart(2, '0');
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
}

/**
 * Retourne l'affichage d'un type de tarification
 */
export function formatPricingType(type: string): { label: string; className: string } {
  const pricingMap: Record<string, { label: string; className: string }> = {
    free: { 
      label: 'Gratuit', 
      className: 'bg-success-100 text-success-700'
    },
    freemium: { 
      label: 'Freemium', 
      className: 'bg-primary-100 text-primary-700'
    },
    paid: { 
      label: 'Payant', 
      className: 'bg-accent-100 text-accent-700'
    },
    subscription: { 
      label: 'Abonnement', 
      className: 'bg-neutral-100 text-neutral-700'
    },
    trial: { 
      label: 'Essai gratuit', 
      className: 'bg-primary-100 text-primary-700'
    }
  };
  
  return pricingMap[type] || { 
    label: type || 'Inconnu', 
    className: 'bg-neutral-100 text-neutral-700'
  };
}

/**
 * Génère une couleur pour une catégorie basée sur son nom
 */
export function getCategoryColor(categorySlug: string): string {
  const colorMap: Record<string, string> = {
    "generation-videos": "from-primary-500 to-primary-600",
    "edition-videos": "from-accent-500 to-accent-600",
    "animation": "from-success-500 to-success-600",
    "audio": "from-primary-400 to-accent-500",
    "voix": "from-accent-400 to-primary-500",
    "transcription": "from-success-400 to-primary-500",
    "sous-titres": "from-primary-500 to-success-500",
    "effets-speciaux": "from-accent-500 to-primary-500",
    "montage": "from-success-500 to-accent-500",
    "image-generation": "from-primary-500 to-success-600",
    "3d": "from-accent-500 to-success-600", 
    "realite-augmentee": "from-success-500 to-primary-600",
    "realite-virtuelle": "from-primary-600 to-accent-600",
    "avatars": "from-success-600 to-primary-600",
    "traduction": "from-accent-600 to-primary-600",
    "musique": "from-primary-600 to-success-600",
    "analytics": "from-success-600 to-accent-600",
    "marketing": "from-accent-500 to-success-500",
    "diffusion": "from-primary-500 to-accent-500",
    "monetisation": "from-success-500 to-primary-500"
  };

  return colorMap[categorySlug] || "from-neutral-500 to-neutral-600";
}

/**
 * Génère une icône pour une catégorie basée sur son slug
 */
export function getCategoryEmoji(slug?: string): string {
  if (!slug) return '🎯';
  
  const emojiMap: Record<string, string> = {
    'video-editing': '🎬',
    'ai-generation': '🤖',
    'subtitles': '💬',
    'transcription': '📝',
    'animation': '🎭',
    'voiceover': '🎙️',
    'audio': '🔊',
    'translation': '🌐',
    'screen-recording': '📹',
    'storytelling': '📚',
    'effects': '✨',
    'color-grading': '🎨',
    'music': '🎵',
    'analytics': '📊',
    'marketing': '📢',
    'social-media': '📱',
    'streaming': '📡',
    'motion-graphics': '⚡',
    'augmented-reality': '👓',
    'virtual-reality': '🥽',
    'scriptwriting': '📜',
    '3d': '🧊',
    'image-enhancement': '🖼️',
    'video-enhancement': '📺',
    'background-removal': '✂️',
    'video-compression': '📦',
    'character-animation': '🦸',
    'text-to-video': '📄',
    'video-to-text': '🔍',
    'noise-reduction': '🔇',
    'video-stabilization': '🧿',
    'face-animation': '😀',
    'content-moderation': '🛡️',
  };
  
  // Normaliser le slug
  const normalizedSlug = slug.toLowerCase().trim();
  
  // Retourner l'emoji correspondant ou un emoji par défaut
  return emojiMap[normalizedSlug] || '🎥';
} 
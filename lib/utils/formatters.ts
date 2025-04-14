import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une date en format français lisible
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'Date inconnue';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(parsedDate)) return 'Date invalide';
  
  return format(parsedDate, 'd MMMM yyyy', { locale: fr });
}

/**
 * Tronque un texte à une longueur donnée
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

/**
 * Formate un type de tarification en texte lisible et classe CSS
 */
export function formatPricingType(pricingType: string | null | undefined) {
  if (!pricingType) {
    return {
      label: 'Inconnu',
      className: 'bg-gray-100 text-gray-800'
    };
  }
  
  switch (pricingType.toUpperCase()) {
    case 'FREE':
      return {
        label: 'Gratuit',
        className: 'bg-green-100 text-green-800'
      };
    case 'FREEMIUM':
      return {
        label: 'Freemium',
        className: 'bg-blue-100 text-blue-800'
      };
    case 'PAID':
      return {
        label: 'Payant',
        className: 'bg-amber-100 text-amber-800'
      };
    default:
      return {
        label: pricingType,
        className: 'bg-gray-100 text-gray-800'
      };
  }
}

/**
 * Formate une URL pour l'affichage
 */
export function formatUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // Enlever le protocole (http://, https://)
  let formattedUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Enlever le chemin après le domaine
  formattedUrl = formattedUrl.split('/')[0];
  
  return formattedUrl;
}

/**
 * Obtient l'URL d'une image avec un fallback
 */
export function getImageWithFallback(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '/images/placeholder-logo.png';
  
  // Vérifier si l'URL est relative ou absolue
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // Vérifier si l'URL est déjà complète
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Ajouter http:// si nécessaire
  return `https://${imageUrl}`;
}

/**
 * Récupère l'emoji correspondant à une catégorie
 */
export function getCategoryEmoji(categorySlug: string | null | undefined): string {
  if (!categorySlug) return '🔧';
  
  const emojiMap: Record<string, string> = {
    'video-edition': '🎬',
    'video-generation': '🎥',
    'audio-generation': '🎵',
    'text-to-speech': '🗣️',
    'animation': '🎭',
    'subtitles': '💬',
    'translation': '🌍',
    'ai-voice': '🎤',
    'screen-recording': '📹',
    'video-enhancement': '✨',
    'transcription': '📝',
    'dubbing': '🔊',
    'background-removal': '🪄',
    'content-creation': '📱',
    'avatar-creation': '👤',
    'motion-graphics': '🎨',
    'video-analytics': '📊',
    'music-generation': '🎻',
    'sound-effects': '🔉',
    'marketing': '📣'
  };
  
  return emojiMap[categorySlug] || '🔧';
} 
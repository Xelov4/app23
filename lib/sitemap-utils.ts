/**
 * Détermine l'URL de base du site en fonction de l'environnement
 * @param {string} host - Optionnel : Le nom d'hôte pour override (utilisé pour les tests)
 * @returns {string} URL de base du site avec protocole (sans slash final)
 */
export function getSiteBaseUrl(host?: string): string {
  // En production, toujours utiliser https://www.video-ia.net
  if (process.env.NODE_ENV === 'production') {
    return 'https://www.video-ia.net';
  }
  
  // En développement, utiliser le host fourni ou localhost:3000
  const hostname = host || 'localhost:3000';
  return `http://${hostname}`;
}

/**
 * Génère l'en-tête XML pour un sitemap
 * @returns {string} En-tête XML pour un sitemap
 */
export function generateSitemapHeader(): string {
  return '<?xml version="1.0" encoding="UTF-8"?>\n';
}

/**
 * Formate une date au format ISO pour le sitemap
 * @param {Date} date - Date à formater
 * @returns {string} Date formatée au format ISO 8601
 */
export function formatSitemapDate(date: Date): string {
  return date.toISOString();
}

/**
 * Génère une entrée de sitemap pour une URL
 * @param {string} url - URL de la page
 * @param {Object} options - Options de l'entrée
 * @param {string} options.lastmod - Date de dernière modification (format ISO)
 * @param {string} options.changefreq - Fréquence de modification (daily, weekly, monthly...)
 * @param {string} options.priority - Priorité de la page (0.0 à 1.0)
 * @returns {string} Entrée XML pour le sitemap
 */
export function generateSitemapEntry(url: string, options: {
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}): string {
  const { lastmod, changefreq, priority } = options;
  
  let entry = `  <url>\n`;
  entry += `    <loc>${url}</loc>\n`;
  
  if (lastmod) {
    entry += `    <lastmod>${lastmod}</lastmod>\n`;
  }
  
  if (changefreq) {
    entry += `    <changefreq>${changefreq}</changefreq>\n`;
  }
  
  if (priority) {
    entry += `    <priority>${priority}</priority>\n`;
  }
  
  entry += `  </url>\n`;
  
  return entry;
}

/**
 * Génère une entrée pour un sitemap dans un sitemap index
 * @param {string} url - URL du sitemap
 * @param {string} lastmod - Date de dernière modification (format ISO)
 * @returns {string} Entrée XML pour le sitemap index
 */
export function generateSitemapIndexEntry(url: string, lastmod: string): string {
  let entry = `  <sitemap>\n`;
  entry += `    <loc>${url}</loc>\n`;
  entry += `    <lastmod>${lastmod}</lastmod>\n`;
  entry += `  </sitemap>\n`;
  
  return entry;
} 
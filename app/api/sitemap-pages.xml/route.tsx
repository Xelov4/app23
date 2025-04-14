import { NextResponse } from 'next/server';
import { getSiteBaseUrl, generateSitemapHeader, formatSitemapDate, generateSitemapEntry } from '@/lib/sitemap-utils';

export async function GET() {
  try {
    // Générer le contenu XML du sitemap
    const baseUrl = getSiteBaseUrl();
    const now = formatSitemapDate(new Date());

    let xml = generateSitemapHeader();
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Pages statiques
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/contact/', priority: '0.8', changefreq: 'monthly' },
      { path: '/sitemap/', priority: '0.7', changefreq: 'monthly' },
      { path: '/admin/', priority: '0.5', changefreq: 'weekly' },
      // Ajouter d'autres pages statiques si nécessaire
    ];

    staticPages.forEach(page => {
      xml += generateSitemapEntry(`${baseUrl}${page.path}`, {
        lastmod: now,
        changefreq: page.changefreq as any,
        priority: page.priority
      });
    });

    xml += '</urlset>';

    // Renvoyer la réponse avec le type MIME approprié
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400'
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap-pages:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du sitemap-pages' }, { status: 500 });
  }
} 
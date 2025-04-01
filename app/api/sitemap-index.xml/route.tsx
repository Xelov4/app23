import { NextResponse } from 'next/server';
import { getSiteBaseUrl, generateSitemapHeader, formatSitemapDate, generateSitemapIndexEntry } from '@/lib/sitemap-utils';

export async function GET() {
  try {
    const baseUrl = getSiteBaseUrl();
    const now = formatSitemapDate(new Date());

    let xml = generateSitemapHeader();
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Ajouter les références aux différents sitemaps
    const sitemaps = [
      { name: 'sitemap-pages.xml', lastmod: now },
      { name: 'sitemap-categories.xml', lastmod: now },
      { name: 'sitemap-tools.xml', lastmod: now },
      { name: 'sitemap-tags.xml', lastmod: now },
      { name: 'sitemap.xml', lastmod: now } // Sitemap global (facultatif)
    ];

    sitemaps.forEach(sitemap => {
      xml += generateSitemapIndexEntry(`${baseUrl}/api/${sitemap.name}`, sitemap.lastmod);
    });

    xml += '</sitemapindex>';

    // Renvoyer la réponse avec le type MIME approprié
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400'
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap-index:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du sitemap-index' }, { status: 500 });
  }
} 
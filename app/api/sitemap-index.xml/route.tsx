import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = 'https://www.video-ia.net';
    const now = new Date().toISOString();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Ajouter les références aux différents sitemaps
    const sitemaps = [
      { name: 'sitemap-pages.xml', lastmod: now },
      { name: 'sitemap-categories.xml', lastmod: now },
      { name: 'sitemap-tools.xml', lastmod: now }
    ];

    sitemaps.forEach(sitemap => {
      xml += `  <sitemap>\n`;
      xml += `    <loc>${baseUrl}/${sitemap.name}</loc>\n`;
      xml += `    <lastmod>${sitemap.lastmod}</lastmod>\n`;
      xml += `  </sitemap>\n`;
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
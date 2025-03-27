import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Générer le contenu XML du sitemap
    const baseUrl = 'https://www.video-ia.net';
    const now = new Date().toISOString();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Pages statiques
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/contact/', priority: '0.8', changefreq: 'monthly' },
      { path: '/sitemap/', priority: '0.7', changefreq: 'monthly' },
      // Ajouter d'autres pages statiques si nécessaire
    ];

    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
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
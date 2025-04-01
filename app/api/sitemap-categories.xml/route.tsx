import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSiteBaseUrl, generateSitemapHeader, formatSitemapDate, generateSitemapEntry } from '@/lib/sitemap-utils';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Récupérer l'hôte depuis l'URL de la requête pour déterminer l'environnement
    const url = new URL(request.url);
    const host = url.host;
    
    // Récupérer toutes les catégories
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    // Générer le contenu XML du sitemap
    const baseUrl = getSiteBaseUrl(host);
    const now = formatSitemapDate(new Date());

    let xml = generateSitemapHeader();
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Page principale des catégories
    xml += generateSitemapEntry(`${baseUrl}/categories/`, {
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.8'
    });

    // Ajouter les URLs des catégories
    categories.forEach(category => {
      xml += generateSitemapEntry(`${baseUrl}/categories/${category.slug}/`, {
        lastmod: formatSitemapDate(category.updatedAt),
        changefreq: 'weekly',
        priority: '0.7'
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
    console.error('Erreur lors de la génération du sitemap-categories:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du sitemap-categories' }, { status: 500 });
  }
} 
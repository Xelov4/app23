import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSiteBaseUrl, generateSitemapHeader, formatSitemapDate, generateSitemapEntry } from '@/lib/sitemap-utils';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupérer tous les tags
    const tags = await prisma.tag.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    // Générer le contenu XML du sitemap
    const baseUrl = getSiteBaseUrl();
    const now = formatSitemapDate(new Date());

    let xml = generateSitemapHeader();
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Page principale des tags (si elle existe)
    xml += generateSitemapEntry(`${baseUrl}/tags/`, {
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.7'
    });

    // Ajouter les URLs des tags
    tags.forEach(tag => {
      xml += generateSitemapEntry(`${baseUrl}/tags/${tag.slug}/`, {
        lastmod: formatSitemapDate(tag.updatedAt),
        changefreq: 'weekly',
        priority: '0.6'
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
    console.error('Erreur lors de la génération du sitemap-tags:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du sitemap-tags' }, { status: 500 });
  }
} 
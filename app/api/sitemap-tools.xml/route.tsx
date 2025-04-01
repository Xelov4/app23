import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSiteBaseUrl, generateSitemapHeader, formatSitemapDate, generateSitemapEntry } from '@/lib/sitemap-utils';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupérer tous les outils actifs
    const tools = await prisma.tool.findMany({
      where: { 
        isActive: true 
      },
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

    // Page principale des outils
    xml += generateSitemapEntry(`${baseUrl}/tools/`, {
      lastmod: now,
      changefreq: 'daily',
      priority: '0.9'
    });

    // Ajouter les URLs des outils
    tools.forEach(tool => {
      xml += generateSitemapEntry(`${baseUrl}/tools/${tool.slug}/`, {
        lastmod: formatSitemapDate(tool.updatedAt),
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
    console.error('Erreur lors de la génération du sitemap-tools:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du sitemap-tools' }, { status: 500 });
  }
} 
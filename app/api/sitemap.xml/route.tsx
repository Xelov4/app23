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
      },
    });

    // Récupérer tous les outils
    const tools = await prisma.tool.findMany({
      where: { isActive: true },
      select: {
        slug: true,
      },
    });

    // Récupérer tous les tags
    const tags = await prisma.tag.findMany({
      select: {
        slug: true,
      },
    });

    // Générer le contenu XML du sitemap
    const baseUrl = getSiteBaseUrl(host);
    const now = formatSitemapDate(new Date());

    let xml = generateSitemapHeader();
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Ajouter l'URL de la page d'accueil
    xml += generateSitemapEntry(`${baseUrl}/`, {
      lastmod: now,
      changefreq: 'daily',
      priority: '1.0'
    });

    // Ajouter les URLs de pages statiques
    const staticPages = ['/contact/', '/sitemap/', '/admin/'];
    
    staticPages.forEach(page => {
      xml += generateSitemapEntry(`${baseUrl}${page}`, {
        lastmod: now,
        changefreq: 'monthly',
        priority: '0.8'
      });
    });

    // URL de base pour les pages de liste
    xml += generateSitemapEntry(`${baseUrl}/categories/`, {
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.8'
    });

    xml += generateSitemapEntry(`${baseUrl}/tools/`, {
      lastmod: now,
      changefreq: 'daily',
      priority: '0.9'
    });

    xml += generateSitemapEntry(`${baseUrl}/tags/`, {
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.7'
    });

    // Ajouter les URLs des catégories
    categories.forEach(category => {
      xml += generateSitemapEntry(`${baseUrl}/categories/${category.slug}/`, {
        lastmod: now,
        changefreq: 'weekly',
        priority: '0.7'
      });
    });

    // Ajouter les URLs des outils
    tools.forEach(tool => {
      xml += generateSitemapEntry(`${baseUrl}/tools/${tool.slug}/`, {
        lastmod: now,
        changefreq: 'weekly',
        priority: '0.6'
      });
    });

    // Ajouter les URLs des tags
    tags.forEach(tag => {
      xml += generateSitemapEntry(`${baseUrl}/tags/${tag.slug}/`, {
        lastmod: now,
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
    console.error('Erreur lors de la génération du sitemap:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du sitemap' }, { status: 500 });
  }
} 
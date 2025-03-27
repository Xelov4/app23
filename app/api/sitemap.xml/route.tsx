import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupérer toutes les catégories
    const categories = await prisma.category.findMany({
      where: { },
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

    // Générer le contenu XML du sitemap
    const baseUrl = 'https://www.video-ia.net';
    const now = new Date().toISOString();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Ajouter l'URL de la page d'accueil
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Ajouter les URLs de pages statiques
    const staticPages = ['/contact/', '/sitemap/'];
    
    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Ajouter les URLs des catégories
    categories.forEach(category => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/categories/${category.slug}/</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    // Ajouter les URLs des outils
    tools.forEach(tool => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/tools/${tool.slug}/</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += '</urlset>';

    // Renvoyer la réponse avec le type MIME approprié
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du sitemap' }, { status: 500 });
  }
} 
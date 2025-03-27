import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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
    const baseUrl = 'https://www.video-ia.net';

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Page principale des outils
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/tools/</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    // Ajouter les URLs des outils
    tools.forEach(tool => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/tools/${tool.slug}/</loc>\n`;
      xml += `    <lastmod>${tool.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
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
    console.error('Erreur lors de la génération du sitemap-tools:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du sitemap-tools' }, { status: 500 });
  }
} 
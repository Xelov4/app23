import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

// Fonction pour crawler une URL et suivre les redirections
async function crawlUrl(url: string): Promise<{ httpCode: number, finalUrl: string }> {
  try {
    // Vérifier si l'URL a un protocole, sinon ajouter https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const controller = new AbortController();
    // Timeout après 10 secondes
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        method: 'HEAD', // Utiliser HEAD pour ne pas télécharger le contenu
        redirect: 'follow', // Suivre les redirections
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      // Obtenir l'URL finale après les redirections
      const finalUrl = response.url;
      
      return {
        httpCode: response.status,
        finalUrl
      };
    } catch (error) {
      // Si HEAD échoue, essayer avec GET
      clearTimeout(timeoutId);
      const secondTimeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal
        });
        
        clearTimeout(secondTimeoutId);
        
        return {
          httpCode: response.status,
          finalUrl: response.url
        };
      } catch (error) {
        clearTimeout(secondTimeoutId);
        console.error(`Erreur lors du crawl de ${url}:`, error);
        
        return {
          httpCode: 0, // 0 indique une erreur de connexion
          finalUrl: url
        };
      }
    }
  } catch (error) {
    console.error(`Erreur lors du crawl de ${url}:`, error);
    return {
      httpCode: 0,
      finalUrl: url
    };
  }
}

// POST /api/admin/crawl - Crawler une liste d'outils
export async function POST(request: NextRequest) {
  try {
    // Vérifier si l'utilisateur est admin
    const authorized = await isAdmin();
    if (!authorized) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { toolIds } = body;

    if (!toolIds || !Array.isArray(toolIds) || toolIds.length === 0) {
      return NextResponse.json(
        { message: 'Liste d\'identifiants d\'outils invalide' },
        { status: 400 }
      );
    }

    // Récupérer les outils à crawler
    const tools = await db.tool.findMany({
      where: {
        id: {
          in: toolIds
        }
      },
      select: {
        id: true,
        name: true,
        websiteUrl: true
      }
    });

    // Résultats du crawl
    const results = [];

    // Crawler chaque outil séquentiellement pour éviter de surcharger le serveur
    for (const tool of tools) {
      try {
        console.log(`Crawling ${tool.name} (${tool.websiteUrl})...`);
        
        const { httpCode, finalUrl } = await crawlUrl(tool.websiteUrl);
        
        // Mettre à jour l'outil dans la base de données
        await db.tool.update({
          where: { id: tool.id },
          data: { 
            httpCode,
            // Si l'URL finale est différente, mettre à jour l'URL du site
            ...(finalUrl !== tool.websiteUrl && {
              websiteUrl: finalUrl
            })
          }
        });
        
        results.push({
          id: tool.id,
          name: tool.name,
          originalUrl: tool.websiteUrl,
          finalUrl,
          httpCode
        });
        
      } catch (error) {
        console.error(`Erreur lors du traitement de l'outil ${tool.id}:`, error);
        results.push({
          id: tool.id,
          name: tool.name,
          originalUrl: tool.websiteUrl,
          error: (error as Error).message
        });
      }
      
      // Attendre un peu entre chaque requête pour éviter de surcharger le serveur
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      results
    });
    
  } catch (error) {
    console.error('Erreur lors du crawl des URLs:', error);
    return NextResponse.json(
      { message: 'Erreur lors du crawl des URLs', error: (error as Error).message },
      { status: 500 }
    );
  }
} 
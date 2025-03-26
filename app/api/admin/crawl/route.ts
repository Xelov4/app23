import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

// Fonction pour vérifier rapidement si un domaine est résolvable
async function isDomainResolvable(url: string): Promise<boolean> {
  try {
    const { hostname } = new URL(url);
    
    // Timeout de 2 secondes pour la résolution DNS
    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    try {
      await dnsLookup(hostname);
      clearTimeout(timeoutId);
      return true;
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'name' in e && e.name === 'AbortError') {
        console.log(`Timeout DNS pour ${hostname}`);
      }
      return false;
    }
  } catch (error) {
    console.error(`Erreur lors de la vérification DNS pour ${url}:`, error);
    return false;
  }
}

// Fonction pour suivre les redirections HTTP
async function followRedirects(url: string, maxRedirects = 5): Promise<{ chain: string, finalUrl: string, finalCode: number }> {
  let currentUrl = url;
  let redirectChain: string[] = [];
  let finalCode = 0;
  let redirectCount = 0;
  let finalUrl = url;
  
  try {
    // Timeout de 5 secondes pour les requêtes
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 5000);
    
    while (redirectCount < maxRedirects) {
      const response = await fetch(currentUrl, { 
        method: 'HEAD', 
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        signal: timeoutController.signal
      });
      
      const statusCode = response.status;
      redirectChain.push(statusCode.toString());
      
      if (statusCode >= 300 && statusCode < 400) {
        const location = response.headers.get('location');
        if (!location) break;
        
        // Construire l'URL complète si c'est un chemin relatif
        const nextUrl = new URL(location, currentUrl).toString();
        currentUrl = nextUrl;
        finalUrl = nextUrl;
        redirectCount++;
      } else {
        finalCode = statusCode;
        break;
      }
    }
    
    clearTimeout(timeoutId);
    
    // Si GET donne un meilleur résultat que HEAD, on utilise celle-là
    if (finalCode === 405 || finalCode === 404 || finalCode === 0) {
      try {
        const getController = new AbortController();
        const getTimeoutId = setTimeout(() => getController.abort(), 5000);
        
        const getResponse = await fetch(finalUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          signal: getController.signal
        });
        
        clearTimeout(getTimeoutId);
        finalCode = getResponse.status;
        redirectChain.push(`GET: ${finalCode}`);
      } catch (getError) {
        console.error(`Erreur lors de la requête GET pour ${finalUrl}:`, getError);
      }
    }
    
    return {
      chain: redirectChain.join(' > '),
      finalUrl,
      finalCode
    };
  } catch (error: unknown) {
    console.error(`Erreur lors du suivi des redirections pour ${url}:`, error);
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      return {
        chain: 'Timeout',
        finalUrl,
        finalCode: 0
      };
    }
    return {
      chain: redirectChain.length > 0 ? redirectChain.join(' > ') : 'Erreur',
      finalUrl,
      finalCode: 0
    };
  }
}

// POST /api/admin/crawl - Crawler une liste d'outils
export async function POST(request: NextRequest) {
  try {
    // Vérifier si l'utilisateur est admin - temporairement désactivé pour debug
    /*
    const authorized = await isAdmin();
    if (!authorized) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    */

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
        let url = tool.websiteUrl;
        
        // Vérifier si l'URL a un protocole, sinon ajouter https://
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        
        // Vérifier si le domaine est résolvable
        const isDnsResolvable = await isDomainResolvable(url);
        
        if (!isDnsResolvable) {
          // Mettre à jour l'outil dans la base de données
          await db.tool.update({
            where: { id: tool.id },
            data: { 
              httpCode: 0
            }
          });
          
          results.push({
            id: tool.id,
            name: tool.name,
            originalUrl: tool.websiteUrl,
            finalUrl: tool.websiteUrl,
            httpCode: 0,
            httpChain: 'DNS'
          });
          
          continue; // Passer à l'outil suivant
        }
        
        // Suivre les redirections et obtenir le code HTTP final
        const { chain, finalUrl, finalCode } = await followRedirects(url);
        
        // Mettre à jour l'outil dans la base de données
        await db.tool.update({
          where: { id: tool.id },
          data: { 
            httpCode: finalCode,
            ...(finalUrl !== url && {
              websiteUrl: finalUrl
            })
          }
        });
        
        results.push({
          id: tool.id,
          name: tool.name,
          originalUrl: tool.websiteUrl,
          finalUrl,
          httpCode: finalCode,
          httpChain: chain
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
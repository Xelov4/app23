import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { cookies } from 'next/headers';
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

// POST /api/admin/crawl
export async function POST(request: NextRequest) {
  try {
    // Vérification de la présence du cookie de session
    const cookiesStore = cookies();
    const adminSessionCookie = cookiesStore.get('admin_session');
    
    // Vérification simplifiée de l'authentification
    if (!adminSessionCookie) {
      console.log("Accès non autorisé: cookie admin_session manquant");
      return NextResponse.json(
        { message: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url, depth = 1, toolIds } = body;

    // Gestion du cas avec toolIds (API utilisée par le composant WebsiteCrawlerPage)
    if (toolIds && Array.isArray(toolIds)) {
      // Récupérer les informations sur les outils depuis la base de données
      const db = await import('@/lib/db').then(module => module.db);
      const tools = await db.tool.findMany({
        where: {
          id: {
            in: toolIds
          }
        },
        select: {
          id: true,
          websiteUrl: true
        }
      });
      
      // Résultats pour chaque outil
      const results = [];
      
      // Crawler chaque outil un par un
      for (const tool of tools) {
        if (!tool.websiteUrl) {
          results.push({
            id: tool.id,
            httpCode: 0,
            httpChain: 'NO_URL',
            finalUrl: '',
            error: 'URL manquante'
          });
          continue;
        }
        
        try {
          // Vérifier si le domaine est résolvable
          const isResolvable = await isDomainResolvable(tool.websiteUrl);
          if (!isResolvable) {
            results.push({
              id: tool.id,
              httpCode: 0,
              httpChain: 'DNS',
              finalUrl: tool.websiteUrl,
              error: 'Domaine non résolvable'
            });
            continue;
          }
          
          // Tester l'URL avec Puppeteer
          const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          });
          
          try {
            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(10000);
            
            // Naviguer vers l'URL
            const response = await page.goto(tool.websiteUrl, { 
              waitUntil: 'networkidle2' 
            });
            
            // Récupérer la chaîne de redirection
            const chain = response?.request().redirectChain() || [];
            const redirectUrls = chain.map(req => req.url());
            const finalUrl = response ? response.url() : tool.websiteUrl;
            
            // Construire la chaîne HTTP
            let httpChain = '';
            if (response) {
              httpChain = `HTTP/${response.httpVersion()} ${response.status()} ${response.statusText()}`;
              if (redirectUrls.length > 0) {
                httpChain += ` (${redirectUrls.length} redirections)`;
              }
            } else {
              httpChain = 'ERROR';
            }
            
            results.push({
              id: tool.id,
              httpCode: response ? response.status() : 0,
              httpChain,
              finalUrl,
              error: response && response.status() >= 400 ? 'Erreur HTTP' : undefined
            });
            
            await page.close();
          } finally {
            await browser.close();
          }
        } catch (error) {
          console.error(`Erreur lors du crawling de ${tool.websiteUrl}:`, error);
          results.push({
            id: tool.id,
            httpCode: 0,
            httpChain: 'ERROR',
            finalUrl: tool.websiteUrl,
            error: (error as Error).message
          });
        }
      }
      
      return NextResponse.json({ results });
    }

    // Cas simple avec une URL
    if (!url) {
      return NextResponse.json(
        { message: 'URL requise' },
        { status: 400 }
      );
    }

    // Vérifier si le domaine est résolvable
    const isResolvable = await isDomainResolvable(url);
    if (!isResolvable) {
      return NextResponse.json(
        { 
          message: 'Le domaine n\'est pas résolvable',
          error: 'DNS_ERROR',
          content: ''
        },
        { status: 200 }
      );
    }

    // Lancer le crawler
    const content = await crawlWebsite(url, depth);

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Erreur lors du crawling:', error);
    return NextResponse.json(
      { 
        message: 'Erreur lors du crawling: ' + (error as Error).message,
        error: 'CRAWL_ERROR',
        content: ''
      },
      { status: 200 }
    );
  }
}

// Fonction pour crawler un site web
async function crawlWebsite(url: string, depth: number): Promise<string> {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    console.log(`Démarrage du crawling: ${url} (profondeur: ${depth})`);
    const visitedUrls = new Set<string>();
    let allContent = '';

    // Extraire le domaine de base
    const urlObj = new URL(url);
    const baseDomain = `${urlObj.protocol}//${urlObj.hostname}`;
    
    // Crawler récursif
    async function crawl(currentUrl: string, currentDepth: number) {
      if (currentDepth > depth || visitedUrls.has(currentUrl)) {
        return;
      }

      visitedUrls.add(currentUrl);
      console.log(`Crawling: ${currentUrl} (profondeur: ${currentDepth})`);

      const page = await browser.newPage();
      
      try {
        // Configuration du timeout et attente de navigation
        await page.setDefaultNavigationTimeout(30000);
        const response = await page.goto(currentUrl, {
          waitUntil: 'networkidle2',
        });

        if (!response || response.status() !== 200) {
          console.log(`Échec lors de l'accès à ${currentUrl}: ${response?.status()}`);
          await page.close();
          return;
        }

        // Récupérer le contenu textuel de la page
        const pageContent = await page.evaluate(() => {
          // Fonction pour extraire tout le texte visible
          function extractVisibleText() {
            const elements = document.querySelectorAll('body *');
            let text = '';
            
            for (const element of Array.from(elements)) {
              // Vérifier si l'élément est visible
              const style = window.getComputedStyle(element);
              const isVisible = style.display !== 'none' && 
                               style.visibility !== 'hidden' && 
                               style.opacity !== '0';
              
              if (isVisible && element.textContent?.trim()) {
                text += element.textContent.trim() + ' ';
              }
            }
            
            return text;
          }
          
          // Extraire le titre
          const title = document.title || '';
          
          // Extraire la méta description
          let metaDescription = '';
          const metaDescElement = document.querySelector('meta[name="description"]');
          if (metaDescElement && metaDescElement.getAttribute('content')) {
            metaDescription = metaDescElement.getAttribute('content') || '';
          }
          
          // Extraire le contenu principal
          const visibleText = extractVisibleText();
          
          return {
            title,
            metaDescription,
            visibleText
          };
        });

        // Ajouter le contenu de la page
        allContent += `
=== Page: ${currentUrl} ===
Titre: ${pageContent.title}
Description: ${pageContent.metaDescription}
Contenu:
${pageContent.visibleText}

`;

        // Si nous sommes à la profondeur maximale, ne pas récupérer les liens
        if (currentDepth === depth) {
          await page.close();
          return;
        }

        // Récupérer tous les liens de la page
        const links = await page.evaluate((baseDomain) => {
          const anchors = Array.from(document.querySelectorAll('a[href]'));
          return anchors
            .map(anchor => anchor.getAttribute('href'))
            .filter(href => href && 
                   !href.startsWith('#') && 
                   !href.startsWith('mailto:') && 
                   !href.startsWith('tel:') &&
                   !href.includes('javascript:'))
            .map(href => {
              try {
                // Convertir les chemins relatifs en URLs absolues
                if (href?.startsWith('/')) {
                  return `${baseDomain}${href}`;
                } else if (href && !href.startsWith('http')) {
                  return `${baseDomain}/${href}`;
                }
                return href;
              } catch (e) {
                return null;
              }
            })
            .filter(href => href && 
                   // Rester sur le même domaine
                   href.startsWith(baseDomain));
        }, baseDomain);

        await page.close();

        // Crawler les liens trouvés
        const uniqueLinks = Array.from(new Set(links));
        
        // Limiter le nombre de liens à crawler (pour éviter des crawls trop longs)
        const limitedLinks = uniqueLinks.slice(0, 5);
        
        for (const link of limitedLinks) {
          if (link && !visitedUrls.has(link)) {
            await crawl(link, currentDepth + 1);
          }
        }
      } catch (error) {
        console.error(`Erreur lors du crawling de ${currentUrl}:`, error);
        await page.close();
      }
    }

    // Démarrer le crawling à partir de l'URL de base
    await crawl(url, 0);
    
    return allContent;
  } finally {
    await browser.close();
  }
} 
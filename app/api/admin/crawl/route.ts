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
    const adminSessionCookie = await cookiesStore.get('admin_session');
    
    // Vérification simplifiée de l'authentification
    if (!adminSessionCookie) {
      console.log("Accès non autorisé: cookie admin_session manquant");
      return NextResponse.json(
        { message: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url, depth = 2, toolIds } = body;

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
              const httpVersion = response.request().response()?.httpVersion || '1.1';
              httpChain = `HTTP/${httpVersion} ${response.status()} ${response.statusText()}`;
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
          content: '',
          externalLinks: []
        },
        { status: 200 }
      );
    }

    // Lancer le crawler
    const result = await crawlWebsite(url, depth);

    return NextResponse.json({
      content: result.content,
      externalLinks: result.externalLinks
    });
  } catch (error) {
    console.error('Erreur lors du crawling:', error);
    return NextResponse.json(
      { 
        message: 'Erreur lors du crawling: ' + (error as Error).message,
        error: 'CRAWL_ERROR',
        content: '',
        externalLinks: []
      },
      { status: 200 }
    );
  }
}

// Fonction pour crawler un site web
async function crawlWebsite(url: string, depth: number): Promise<{content: string, externalLinks: string[]}> {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    console.log(`Démarrage du crawling: ${url} (profondeur: ${depth})`);
    const visitedUrls = new Set<string>();
    const externalLinks = new Set<string>();
    const socialMediaDomains = [
      'twitter.com', 'x.com',
      'facebook.com', 'fb.com',
      'instagram.com',
      'linkedin.com',
      'github.com',
      'youtube.com',
      'tiktok.com',
      'pinterest.com',
      'discord.com', 'discord.gg',
      'medium.com',
      'reddit.com'
    ];
    
    let allContent = '';
    let processDetails = `Processus de crawling pour ${url}\n`;
    processDetails += `========================================\n`;

    // Extraire le domaine de base
    const urlObj = new URL(url);
    const baseDomain = `${urlObj.protocol}//${urlObj.hostname}`;
    
    // Crawler récursif
    async function crawl(currentUrl: string, currentDepth: number, isExternalLink: boolean = false) {
      if (currentDepth > depth) {
        return;
      }

      // Si on a déjà visité cette URL, on saute
      if (visitedUrls.has(currentUrl)) {
        return;
      }

      // Marquer comme visitée et ajouter aux détails du processus
      visitedUrls.add(currentUrl);
      processDetails += `[Profondeur ${currentDepth}] Crawling: ${currentUrl}\n`;

      const page = await browser.newPage();
      
      try {
        // Ignorer les ressources inutiles pour accélérer le crawling
        await page.setRequestInterception(true);
        page.on('request', (req) => {
          const resourceType = req.resourceType();
          if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
            req.abort();
          } else {
            req.continue();
          }
        });
        
        // Configuration du timeout et attente de navigation
        await page.setDefaultNavigationTimeout(20000);
        const response = await page.goto(currentUrl, {
          waitUntil: 'domcontentloaded',
        });

        if (!response) {
          processDetails += `  ✘ Pas de réponse pour ${currentUrl}\n`;
          await page.close();
          return;
        }

        const status = response.status();
        if (status !== 200) {
          processDetails += `  ✘ Échec d'accès (${status}) pour ${currentUrl}\n`;
          await page.close();
          return;
        }

        processDetails += `  ✓ Accès réussi (${status}) pour ${currentUrl}\n`;

        // N'extraire le contenu que si ce n'est pas un lien externe ou si c'est un réseau social
        let pageContent = { title: '', metaDescription: '', visibleText: '' };
        const currentUrlObj = new URL(currentUrl);
        const isSocialMedia = socialMediaDomains.some(domain => currentUrlObj.hostname.includes(domain));
        
        if (!isExternalLink || isSocialMedia) {
          // Récupérer le contenu textuel de la page
          pageContent = await page.evaluate(() => {
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
          if (!isExternalLink) {
            allContent += `
=== Page: ${currentUrl} ===
Titre: ${pageContent.title}
Description: ${pageContent.metaDescription}
Contenu:
${pageContent.visibleText}

`;
            processDetails += `  ✓ Contenu extrait (${pageContent.visibleText.length} caractères)\n`;
          } else if (isSocialMedia) {
            allContent += `
=== Réseau social: ${currentUrl} ===
Titre: ${pageContent.title}
Description: ${pageContent.metaDescription}
Contenu partiel:
${pageContent.visibleText.substring(0, 200)}...

`;
            processDetails += `  ✓ Contenu social extrait\n`;
          }
        }

        // Récupérer tous les liens de la page
        const links = await page.evaluate(() => {
          const anchors = Array.from(document.querySelectorAll('a[href]'));
          return anchors
            .map(anchor => {
              const href = anchor.getAttribute('href');
              // Récupérer aussi le texte du lien pour aider à identifier les liens sociaux
              const linkText = anchor.textContent?.trim() || '';
              return { href, linkText };
            })
            .filter(link => link.href && 
                   !link.href.startsWith('#') && 
                   !link.href.startsWith('mailto:') && 
                   !link.href.startsWith('tel:') &&
                   !link.href.includes('javascript:'))
            .map(link => {
              try {
                return {
                  href: link.href,
                  text: link.linkText
                };
              } catch (e) {
                return null;
              }
            })
            .filter(link => link !== null);
        });

        await page.close();

        const internalLinks = [];
        const newExternalLinks = [];

        // Traiter chaque lien récupéré
        for (const link of links) {
          try {
            let fullUrl = link.href;
            
            // Convertir les chemins relatifs en URLs absolues
            if (fullUrl.startsWith('/')) {
              fullUrl = `${baseDomain}${fullUrl}`;
            } else if (!fullUrl.startsWith('http')) {
              fullUrl = `${baseDomain}/${fullUrl}`;
            }
            
            const linkUrl = new URL(fullUrl);
            const isSameDomain = linkUrl.hostname === urlObj.hostname;
            const isSocialMedia = socialMediaDomains.some(domain => linkUrl.hostname.includes(domain));
            
            // Si c'est un lien interne et qu'on ne l'a pas encore visité
            if (isSameDomain && !visitedUrls.has(fullUrl)) {
              internalLinks.push(fullUrl);
            } 
            // Si c'est un lien externe (en particulier un réseau social)
            else if (!isSameDomain) {
              // Identifier les liens sociaux basés sur le domaine ou le texte du lien
              const linkTextLower = link.text.toLowerCase();
              const isSocialLink = isSocialMedia || 
                                  linkTextLower.includes('twitter') || 
                                  linkTextLower.includes('facebook') || 
                                  linkTextLower.includes('instagram') || 
                                  linkTextLower.includes('linkedin') || 
                                  linkTextLower.includes('github') ||
                                  linkTextLower.includes('youtube') ||
                                  linkTextLower.includes('follow us') ||
                                  linkTextLower.includes('suivez-nous');
              
              if (isSocialLink && !visitedUrls.has(fullUrl)) {
                newExternalLinks.push(fullUrl);
                // Ajouter aux liens externes trouvés
                externalLinks.add(fullUrl);
                processDetails += `  ↗ Lien social trouvé: ${fullUrl}\n`;
              }
            }
          } catch (error) {
            // Ignorer les liens invalides
            continue;
          }
        }

        // Si nous sommes à la profondeur maximale, arrêter l'exploration
        if (currentDepth === depth) {
          return;
        }

        // Limiter le nombre de liens à crawler pour éviter des crawls trop longs
        const limitedInternalLinks = internalLinks.slice(0, 10);
        processDetails += `  → ${limitedInternalLinks.length} liens internes retenus sur ${internalLinks.length} trouvés\n`;
        
        // Crawler les liens internes
        for (const link of limitedInternalLinks) {
          if (!visitedUrls.has(link)) {
            await crawl(link, currentDepth + 1);
          }
        }
        
        // Crawler les nouveaux liens externes (réseaux sociaux) avec une profondeur limitée
        // Uniquement si nous sommes encore à une faible profondeur
        if (currentDepth <= 1) {
          const limitedExternalLinks = newExternalLinks.slice(0, 5);
          for (const link of limitedExternalLinks) {
            if (!visitedUrls.has(link)) {
              await crawl(link, depth, true); // Pour les liens externes, on utilise la profondeur maximale directement
            }
          }
        }
      } catch (error) {
        console.error(`Erreur lors du crawling de ${currentUrl}:`, error);
        processDetails += `  ✘ Erreur: ${(error as Error).message}\n`;
        await page.close();
      }
    }

    // Démarrer le crawling à partir de l'URL de base
    await crawl(url, 0);
    
    processDetails += `\nCrawling terminé. ${visitedUrls.size} URLs visitées.\n`;
    processDetails += `${externalLinks.size} liens sociaux/externes trouvés.\n`;
    
    // Ajouter les détails du processus au contenu
    allContent = processDetails + "\n\n" + allContent;
    
    return {
      content: allContent,
      externalLinks: Array.from(externalLinks)
    };
  } finally {
    await browser.close();
  }
} 
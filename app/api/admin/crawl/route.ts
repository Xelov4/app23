import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { cookies } from 'next/headers';
import dns from 'dns';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dnsLookup = promisify(dns.lookup);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);

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
    const { url, depth = 2, toolIds, slug } = body;

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

    // Capturer un screenshot si un slug est fourni
    let screenshotPath = '';
    if (slug) {
      try {
        screenshotPath = await captureScreenshot(url, slug);
      } catch (error) {
        console.error('Erreur lors de la capture du screenshot:', error);
      }
    }

    // Lancer le crawler
    const result = await crawlWebsite(url, depth);

    return NextResponse.json({
      content: result.content,
      externalLinks: result.externalLinks,
      screenshotPath
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

// Fonction pour capturer un screenshot d'un site web
async function captureScreenshot(url: string, slug: string): Promise<string> {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-notifications']
  });

  try {
    console.log(`Capture de screenshot pour: ${url} (slug: ${slug})`);
    
    // Créer le dossier screenshots s'il n'existe pas
    const screenshotsDir = path.join(process.cwd(), 'public', 'images', 'tools', 'screenshots');
    if (!await exists(screenshotsDir)) {
      await mkdir(screenshotsDir, { recursive: true });
    }
    
    const tempPath = path.join(screenshotsDir, `${slug}_temp.png`);
    const outputPath = path.join(screenshotsDir, `${slug}.png`);
    const relativePath = `/images/tools/screenshots/${slug}.png`;
    
    // Supprimer un fichier existant avec le même nom
    if (await exists(outputPath)) {
      await unlink(outputPath);
    }
    
    if (await exists(tempPath)) {
      await unlink(tempPath);
    }
    
    const page = await browser.newPage();
    // Définir un agent utilisateur de bureau
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Configurer la taille de la fenêtre
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
    await page.setDefaultNavigationTimeout(30000);
    
    // Intercepter et bloquer les requêtes de types trackers, analytics, etc.
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      const url = req.url().toLowerCase();
      
      // Bloquer analytics, trackers, et certains types de contenus
      if (
        url.includes('google-analytics') || 
        url.includes('analytics') ||
        url.includes('facebook.com') ||
        url.includes('twitter.com') ||
        url.includes('doubleclick.net') ||
        url.includes('googleadservices') ||
        url.includes('ads') ||
        url.includes('pixel') ||
        url.includes('tracker')
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Naviguer vers l'URL
    await page.goto(url, { 
      waitUntil: 'networkidle2' 
    });
    
    // Essayer de fermer les bannières de cookies et popups
    try {
      // Sélecteurs courants pour les bannières de cookies et popups
      const possibleSelectors = [
        // Boutons de cookies
        'button[data-testid="cookie-policy-dialog-accept-button"]',
        'button[aria-label="Accepter les cookies"]',
        'button[id*="cookie"]',
        '.cookie-banner button',
        '.cookies button',
        // Textes génériques dans les boutons
        'button:not([aria-hidden="true"]):not([disabled]):not(.disabled):not(.hidden)', 
        // Pour essayer de cliquer sur les boutons avec des textes spécifiques
        'button, a[role="button"]',
      ];

      for (const selector of possibleSelectors) {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const buttonText = await page.evaluate(el => el.innerText?.toLowerCase() || '', element);
          if (
            buttonText.includes('accept') || 
            buttonText.includes('agree') || 
            buttonText.includes('close') || 
            buttonText.includes('got it') ||
            buttonText.includes('accepter') ||
            buttonText.includes('fermer') ||
            buttonText.includes('accepte') ||
            buttonText.includes('ok')
          ) {
            await element.click().catch(() => {});
          }
        }
      }
    } catch (e) {
      // Ignorer les erreurs liées à la fermeture des popups
      console.log('Attention: Erreur lors de la tentative de fermeture des popups:', e);
    }
    
    // Attendre un peu pour que les éléments se chargent correctement
    await page.waitForTimeout(3000);
    
    // Prendre le screenshot
    await page.screenshot({ 
      path: tempPath,
      fullPage: false,
      type: 'png'
    });
    
    // Traiter l'image pour la rendre plus adaptée comme logo
    try {
      // Charger l'image avec sharp
      await sharp(tempPath)
        // Recadrer l'image pour qu'elle soit adaptée à un logo
        .resize({
          width: 500,
          height: 300,
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Fond transparent
        })
        // Améliorer la qualité
        .png({ quality: 100 })
        // Enregistrer dans le dossier final
        .toFile(outputPath);
      
      // Supprimer le fichier temporaire
      await unlink(tempPath);
    } catch (error) {
      console.error("Erreur lors du traitement de l'image:", error);
      // Si l'opération échoue, utiliser l'image originale
      fs.renameSync(tempPath, outputPath);
    }
    
    console.log(`Screenshot enregistré: ${outputPath}`);
    
    await page.close();
    return relativePath;
  } finally {
    await browser.close();
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
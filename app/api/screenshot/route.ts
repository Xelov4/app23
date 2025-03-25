import { NextRequest, NextResponse } from 'next/server';
import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';
import { db } from '@/lib/db';
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
    } catch (e) {
      if (e.name === 'AbortError') {
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
async function followRedirects(url: string, maxRedirects = 5): Promise<{ chain: string, finalCode: number }> {
  let currentUrl = url;
  let redirectChain: string[] = [];
  let finalCode = 0;
  let redirectCount = 0;
  
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
        redirectCount++;
      } else {
        finalCode = statusCode;
        break;
      }
    }
    
    clearTimeout(timeoutId);
    return {
      chain: redirectChain.join(' > '),
      finalCode: finalCode
    };
  } catch (error) {
    console.error(`Erreur lors du suivi des redirections pour ${url}:`, error);
    if (error.name === 'AbortError') {
      return {
        chain: 'Timeout',
        finalCode: 0
      };
    }
    return {
      chain: redirectChain.length > 0 ? redirectChain.join(' > ') : 'Erreur',
      finalCode: 0
    };
  }
}

export async function POST(request: NextRequest) {
  let browser = null;
  let originalFilePath = '';
  let resizedFilePath = '';
  let httpStatusCode = null;
  let httpRedirectChain = '';
  let slug = '';
  
  try {
    console.log('API de capture d\'écran appelée');
    const { url, slug: requestSlug } = await request.json();
    slug = requestSlug;
    
    if (!url) {
      return NextResponse.json({ 
        error: 'URL requise',
        success: false
      }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ 
        error: 'Slug requis',
        success: false
      }, { status: 400 });
    }

    console.log('URL reçue:', url);
    console.log('Slug reçu:', slug);

    // Vérifier si c'est un chemin relatif
    if (url.startsWith('/')) {
      const imageUrl = url;
      return NextResponse.json({ 
        success: true, 
        imageUrl,
        httpCode: 200,
        httpChain: '200'
      });
    }

    // Vérifier si c'est une URL valide
    try {
      new URL(url);
    } catch (urlError) {
      return NextResponse.json({ 
        error: 'URL invalide',
        success: false,
        httpCode: 0,
        httpChain: 'URL invalide'
      }, { status: 400 });
    }

    // Créer le répertoire s'il n'existe pas
    const screenshotsDir = path.join(process.cwd(), 'public', 'images', 'tools', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      console.log('Création du répertoire de captures d\'écran');
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Utiliser le slug comme nom de fichier
    const fileName = `${slug}.png`;
    originalFilePath = path.join(screenshotsDir, `original_${fileName}`);
    resizedFilePath = path.join(screenshotsDir, fileName);

    // Vérifier RAPIDEMENT si le domaine est résolvable (timeout court)
    const isDnsResolvable = await isDomainResolvable(url);
    
    if (!isDnsResolvable) {
      httpStatusCode = 0;
      httpRedirectChain = 'DNS';
      
      // Mise à jour dans la base de données
      if (slug) {
        await db.tool.update({
          where: { slug },
          data: { 
            httpCode: 0,
            httpChain: 'DNS'
          }
        });
      }
      
      // Retourner une image d'erreur
      const errorImagePath = path.join(process.cwd(), 'public', 'images', 'error.png');
      if (fs.existsSync(errorImagePath)) {
        fs.copyFileSync(errorImagePath, resizedFilePath);
        const imageUrl = `/images/tools/screenshots/${fileName}`;
        
        return NextResponse.json({
          success: true,
          imageUrl,
          httpCode: 0,
          httpChain: 'DNS',
          isErrorImage: true
        });
      }
      
      return NextResponse.json({
        success: false,
        error: 'DNS non résolu',
        httpCode: 0,
        httpChain: 'DNS'
      });
    }

    // Vérifier l'accessibilité de l'URL et suivre les redirections
    try {
      const { chain, finalCode } = await followRedirects(url);
      httpStatusCode = finalCode;
      httpRedirectChain = chain;
      
      // Mise à jour dans la base de données
      if (slug) {
        await db.tool.update({
          where: { slug },
          data: { 
            httpCode: httpStatusCode,
            httpChain: httpRedirectChain
          }
        });
      }
      
      // Si erreur HTTP, on peut s'arrêter là et renvoyer une image d'erreur
      if (httpStatusCode >= 400 || httpStatusCode === 0) {
        const errorImagePath = path.join(process.cwd(), 'public', 'images', 'error.png');
        if (fs.existsSync(errorImagePath)) {
          fs.copyFileSync(errorImagePath, resizedFilePath);
          const imageUrl = `/images/tools/screenshots/${fileName}`;
          
          return NextResponse.json({
            success: true,
            imageUrl,
            httpCode: httpStatusCode,
            httpChain: httpRedirectChain,
            isErrorImage: true
          });
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'URL ${url}:`, error);
      httpStatusCode = 0;
      httpRedirectChain = 'Erreur';
      
      if (slug) {
        await db.tool.update({
          where: { slug },
          data: { 
            httpCode: 0,
            httpChain: 'Erreur'
          }
        });
      }
    }

    // Supprimer les fichiers existants s'ils existent
    [originalFilePath, resizedFilePath].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Fichier existant supprimé: ${filePath}`);
        } catch (error) {
          console.error(`Erreur lors de la suppression du fichier existant: ${filePath}`, error);
        }
      }
    });
    
    console.log('Lancement du navigateur');
    
    // Lancer le navigateur headless avec des options optimisées
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--window-size=1920,1080'
        ]
      });
    } catch (browserError) {
      console.error('Erreur lors du lancement du navigateur:', browserError);
      
      // Enregistrer l'erreur dans la base de données
      if (slug) {
        try {
          await db.tool.update({
            where: { slug },
            data: { 
              httpCode: httpStatusCode || 0,
              httpChain: httpRedirectChain || 'Erreur Puppeteer'
            }
          });
        } catch (dbError) {
          console.error('Erreur lors de la mise à jour du code HTTP dans la base de données:', dbError);
        }
      }
      
      // Retourner une réponse claire
      return NextResponse.json({ 
        error: browserError instanceof Error ? browserError.message : 'Erreur lors du lancement du navigateur',
        success: false,
        httpCode: httpStatusCode || 0,
        httpChain: httpRedirectChain || 'Erreur Puppeteer',
        errorType: 'BROWSER_LAUNCH_ERROR'
      }, { status: 500 });
    }
    
    const page = await browser.newPage();
    // Viewport haute résolution
    await page.setViewport({ width: 1920, height: 1080 });

    // Définir un timeout plus long pour les ressources
    await page.setDefaultNavigationTimeout(100000); // 100 secondes comme demandé
    await page.setDefaultTimeout(100000);

    // Intercepter les requêtes pour optimiser
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      // Bloquer les ressources non essentielles pour accélérer le chargement
      const resourceType = request.resourceType();
      if (['media', 'font', 'websocket', 'manifest'].includes(resourceType)) {
        request.abort();
      } else if (resourceType === 'image' && request.url().match(/\.(svg|gif|webp)$/i)) {
        // Bloquer certains types d'images qui ne sont pas critiques
        request.abort();
      } else {
        request.continue();
      }
    });
    
    // Navigation avec gestion des erreurs et interception des redirections
    console.log('Navigation vers:', url);
    
    // Collecter les redirections pendant la navigation
    const responseChain: number[] = [];
    page.on('response', response => {
      const status = response.status();
      if (status >= 300 && status < 400) {
        responseChain.push(status);
      }
    });
    
    const response = await page.goto(url, { 
      waitUntil: 'domcontentloaded', // Plus rapide que 'networkidle0'
      timeout: 100000 // 100 secondes comme demandé
    });

    // Capturer le code HTTP de la réponse puppeteer
    if (response) {
      const finalStatus = response.status();
      responseChain.push(finalStatus);
      
      // Si une chaîne n'a pas déjà été enregistrée avec followRedirects
      if (!httpRedirectChain || httpRedirectChain === 'Erreur') {
        httpRedirectChain = responseChain.join(' > ');
      }
      
      // Mise à jour du code HTTP dans la base de données
      if (slug) {
        await db.tool.update({
          where: { slug },
          data: { 
            httpCode: finalStatus,
            httpChain: httpRedirectChain
          }
        });
      }
    }

    // Attente pour le chargement minimal (éviter de longues attentes)
    console.log('Attente pour chargement');
    await Promise.race([
      new Promise(resolve => setTimeout(resolve, 3000)), // 3 secondes max
      page.waitForSelector('body', { timeout: 5000 })
    ]);
    
    // Faire défiler la page pour forcer le chargement des éléments visibles
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
      window.scrollTo(0, 0);
    });
    
    // Capture en haute résolution
    console.log('Capture d\'écran');
    await page.screenshot({ 
      path: originalFilePath,
      type: 'png',
      fullPage: false,
      timeout: 10000
    });
    
    // Fermeture du navigateur
    if (browser) {
      await browser.close();
      browser = null;
    }
    
    // Optimiser l'image sans perdre de qualité
    console.log('Traitement de l\'image');
    await sharp(originalFilePath)
      .resize(1280, 720, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png()
      .toFile(resizedFilePath);
      
    // Supprimer l'image originale après le redimensionnement
    try {
      fs.unlinkSync(originalFilePath);
      console.log('Image originale supprimée');
    } catch (unlinkError) {
      console.error('Erreur lors de la suppression de l\'image originale:', unlinkError);
    }
    
    const imageUrl = `/images/tools/screenshots/${fileName}`;
    console.log('Capture d\'écran réussie:', imageUrl);
    
    return NextResponse.json({
      success: true,
      imageUrl,
      httpCode: httpStatusCode,
      httpChain: httpRedirectChain
    });
    
  } catch (error) {
    console.error('Erreur lors de la capture d\'écran:', error);
    
    // Fermer le navigateur en cas d'erreur
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Erreur lors de la fermeture du navigateur:', closeError);
      }
    }
    
    // Mise à jour de la base de données en cas d'erreur
    if (slug) {
      try {
        await db.tool.update({
          where: { slug },
          data: { 
            httpCode: httpStatusCode || 0,
            httpChain: httpRedirectChain || 'Erreur'
          }
        });
      } catch (dbError) {
        console.error('Erreur lors de la mise à jour du code HTTP dans la base de données:', dbError);
      }
    }
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      success: false,
      httpCode: httpStatusCode,
      httpChain: httpRedirectChain || 'Erreur'
    }, { status: 500 });
  }
} 
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
  } catch (error: unknown) {
    console.error(`Erreur lors du suivi des redirections pour ${url}:`, error);
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
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
  let browser: puppeteer.Browser | null = null;
  let page: puppeteer.Page | null = null;
  let originalFilePath = '';
  let resizedFilePath = '';
  let httpStatusCode = null;
  let httpRedirectChain = '';
  let slug = '';
  
  try {
    console.log('API de capture d\'écran appelée');
    
    // S'assurer que la requête est bien du JSON
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      return new NextResponse(
        JSON.stringify({
          error: 'Format de requête invalide',
          success: false
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const { url, slug: requestSlug } = requestData;
    slug = requestSlug;
    
    if (!url) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'URL requise',
          success: false
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (!slug) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Slug requis',
          success: false
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log('URL reçue:', url);
    console.log('Slug reçu:', slug);

    // Vérifier si c'est un chemin relatif
    if (url.startsWith('/')) {
      const imageUrl = url;
      return new NextResponse(
        JSON.stringify({ 
          success: true, 
          imageUrl,
          httpCode: 200,
          httpChain: '200'
        }), 
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Vérifier si c'est une URL valide
    try {
      new URL(url);
    } catch (urlError) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'URL invalide',
          success: false,
          httpCode: 0,
          httpChain: 'URL invalide'
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
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
        
        return new NextResponse(
          JSON.stringify({
            success: true,
            imageUrl,
            httpCode: 0,
            httpChain: 'DNS',
            isErrorImage: true
          }), 
          { 
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'DNS non résolu',
          httpCode: 0,
          httpChain: 'DNS'
        }), 
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
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
          
          return new NextResponse(
            JSON.stringify({
              success: true,
              imageUrl,
              httpCode: httpStatusCode,
              httpChain: httpRedirectChain,
              isErrorImage: true
            }), 
            { 
              status: 200,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
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
      // Lancement du navigateur avec plus de configurations pour la stabilité
      browser = await puppeteer.launch({
        headless: true, // Utiliser le mode headless standard
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        timeout: 30000, // Réduit le timeout pour lancer le navigateur plus rapidement
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=IsolateOrigins',
          '--disable-extensions',
          '--no-first-run',
          '--disable-notifications',
          '--window-size=1280,720', // Taille de fenêtre plus petite pour plus de stabilité
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-component-extensions-with-background-pages',
          '--disable-ipc-flooding-protection',
          '--mute-audio'
        ],
        ignoreHTTPSErrors: true, // Ignorer les erreurs HTTPS
        pipe: true // Utiliser pipe au lieu de WebSocket pour plus de stabilité
      });

      // Vérifier que le navigateur est bien lancé
      if (!browser) {
        throw new Error('Échec de lancement du navigateur');
      }
      
      // Créer une page dans un contexte par défaut
      page = await browser.newPage();

      // Configuration du viewport
      await page.setViewport({ width: 1280, height: 720 });
      
      // Des timeouts plus courts
      await page.setDefaultNavigationTimeout(15000);
      await page.setDefaultTimeout(15000);

      // Bloquer les ressources non essentielles
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        // Bloquer les ressources non essentielles pour accélérer le chargement
        if (['media', 'font', 'websocket', 'manifest', 'other'].includes(resourceType) ||
            (resourceType === 'image' && !request.url().includes(url))) {
          request.abort();
        } else {
          request.continue();
        }
      });

      // Capturer les erreurs
      page.on('error', (error) => {
        console.error('Erreur de page:', error);
      });

      // Navigation vers l'URL
      console.log(`Navigation vers: ${url}`);
      
      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded', // Attendre uniquement le chargement du DOM
        timeout: 15000 // Timeout plus court
      });
      
      if (!response) {
        throw new Error('Pas de réponse reçue');
      }
      
      // Mettre à jour le code HTTP si on a une réponse
      const responseStatus = response.status();
      if (responseStatus) {
        httpStatusCode = responseStatus;
        httpRedirectChain = responseStatus.toString();
      }
      
      // Mettre à jour dans la base de données avec le vrai statut de la page
      if (slug) {
        await db.tool.update({
          where: { slug },
          data: { 
            httpCode: httpStatusCode,
            httpChain: httpRedirectChain
          }
        });
      }
      
      // Capture uniquement les sites qui retournent 200 (succès)
      if (httpStatusCode !== 200) {
        await browser.close();
        
        // Retourner une image d'erreur pour les sites non 200
        const errorImagePath = path.join(process.cwd(), 'public', 'images', 'error.png');
        if (fs.existsSync(errorImagePath)) {
          fs.copyFileSync(errorImagePath, resizedFilePath);
          const imageUrl = `/images/tools/screenshots/${fileName}`;
          
          return new NextResponse(
            JSON.stringify({
              success: true,
              imageUrl,
              httpCode: httpStatusCode,
              httpChain: httpRedirectChain,
              isErrorImage: true
            }), 
            { 
              status: 200,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }
      
      // Attendre un peu pour que la page se stabilise
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Capture d'écran
      console.log('Capture d\'écran en cours...');
      await page.screenshot({ 
        path: originalFilePath,
        type: 'png',
        fullPage: false
      });
      
      // Fermer proprement les ressources du navigateur
      await browser.close();
      
      // Redimensionner l'image
      console.log('Traitement de l\'image...');
      await sharp(originalFilePath)
        .resize(1280, 720, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png()
        .toFile(resizedFilePath);
      
      // Nettoyage
      try {
        fs.unlinkSync(originalFilePath);
        console.log('Image originale supprimée');
      } catch (unlinkError) {
        console.error('Erreur lors de la suppression de l\'image originale:', unlinkError);
      }

      const imageUrl = `/images/tools/screenshots/${fileName}`;
      console.log('Capture d\'écran réussie:', imageUrl);

      return new NextResponse(
        JSON.stringify({
          success: true,
          imageUrl,
          httpCode: httpStatusCode,
          httpChain: httpRedirectChain
        }), 
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

    } catch (browserError) {
      console.error('Erreur lors de la capture d\'écran:', browserError);
      
      // Fermeture du navigateur en cas d'erreur
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.error('Erreur lors de la fermeture de la page:', closeError);
        }
      }
      
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
      
      return new NextResponse(
        JSON.stringify({
          error: browserError instanceof Error ? browserError.message : 'Erreur lors du lancement du navigateur',
          success: false,
          httpCode: httpStatusCode || 0,
          httpChain: httpRedirectChain || 'Erreur Puppeteer',
          errorType: 'BROWSER_LAUNCH_ERROR'
        }), 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  } catch (error) {
    console.error('Erreur générale lors de la capture d\'écran:', error);
    
    // Fermer le navigateur en cas d'erreur
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        console.error('Erreur lors de la fermeture de la page:', closeError);
      }
    }
    
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
    
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        success: false,
        httpCode: httpStatusCode || 0,
        httpChain: httpRedirectChain || 'Erreur'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 
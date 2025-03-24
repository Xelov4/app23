import { NextRequest, NextResponse } from 'next/server';
import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  let browser = null;
  let originalFilePath = '';
  let resizedFilePath = '';
  
  try {
    console.log('API de capture d\'écran appelée');
    const { url, slug } = await request.json();
    
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
        imageUrl 
      });
    }

    // Vérifier si c'est une URL valide
    try {
      new URL(url);
    } catch (urlError) {
      return NextResponse.json({ 
        error: 'URL invalide',
        success: false
      }, { status: 400 });
    }

    // Vérifier l'accessibilité de l'URL
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`URL inaccessible: ${response.status}`);
      }
    } catch (error) {
      return NextResponse.json({ 
        error: 'URL inaccessible',
        success: false
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
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Définir un timeout plus court pour les ressources
    await page.setDefaultNavigationTimeout(30000);
    await page.setDefaultTimeout(30000);

    // Navigation avec gestion des erreurs
    console.log('Navigation vers:', url);
    const response = await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    if (!response.ok()) {
      throw new Error(`Navigation failed: ${response.status()}`);
    }

    // Attente pour le chargement complet avec timeout
    console.log('Attente pour chargement');
    await Promise.race([
      new Promise(resolve => setTimeout(resolve, 2000)),
      page.waitForSelector('body', { timeout: 5000 })
    ]);
    
    // Capture avec timeout
    console.log('Capture d\'écran');
    await page.screenshot({ 
      path: originalFilePath,
      timeout: 5000
    });
    
    // Fermeture du navigateur
    if (browser) {
      await browser.close();
      browser = null;
    }
    
    // Redimensionnement avec gestion d'erreur
    console.log('Redimensionnement de l\'image');
    await sharp(originalFilePath)
      .resize(200, 200, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(resizedFilePath);
    
    // Suppression du fichier original
    try {
      fs.unlinkSync(originalFilePath);
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier original:', error);
    }
    
    // URL pour le frontend
    const imageUrl = `/images/tools/screenshots/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      imageUrl 
    });
    
  } catch (error) {
    console.error('Erreur lors de la capture d\'écran:', error);
    
    // Nettoyage en cas d'erreur
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Erreur lors de la fermeture du navigateur:', closeError);
      }
    }
    
    // Suppression des fichiers temporaires en cas d'erreur
    [originalFilePath, resizedFilePath].forEach(filePath => {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error('Erreur lors de la suppression du fichier:', unlinkError);
        }
      }
    });

    return NextResponse.json({ 
      error: error.message || 'Erreur lors de la capture d\'écran',
      success: false
    }, { status: 500 });
  }
} 
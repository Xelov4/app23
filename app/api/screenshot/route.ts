import { NextRequest, NextResponse } from 'next/server';
import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  let browser = null;
  
  try {
    console.log('API de capture d\'écran appelée');
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ 
        error: 'URL requise' 
      }, { status: 400 });
    }

    console.log('URL reçue:', url);

    // Vérifier l'URL
    try {
      new URL(url);
    } catch (urlError) {
      return NextResponse.json({ 
        error: 'URL invalide' 
      }, { status: 400 });
    }

    // Créer le répertoire s'il n'existe pas
    const screenshotsDir = path.join(process.cwd(), 'public', 'images', 'tools', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      console.log('Création du répertoire de captures d\'écran');
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Créer un identifiant unique pour l'image
    const id = uuidv4();
    const fileName = `${id}.png`;
    const originalFilePath = path.join(screenshotsDir, `original_${fileName}`);
    const resizedFilePath = path.join(screenshotsDir, fileName);
    
    console.log('Lancement du navigateur');
    
    // Lancer le navigateur headless
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Navigation
    console.log('Navigation vers:', url);
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 15000 
    });
    
    // Attente pour le chargement complet
    console.log('Attente pour chargement');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Capture
    console.log('Capture d\'écran');
    await page.screenshot({ path: originalFilePath });
    
    // Fermeture du navigateur
    await browser.close();
    browser = null;
    
    // Redimensionnement
    console.log('Redimensionnement de l\'image');
    await sharp(originalFilePath)
      .resize(200, 200, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(resizedFilePath);
    
    // URL pour le frontend
    const imageUrl = `/images/tools/screenshots/${fileName}`;
    
    console.log('Capture d\'écran réussie');
    return NextResponse.json({ 
      success: true, 
      imageUrl 
    });
    
  } catch (error) {
    // Fermer le navigateur en cas d'erreur
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Erreur lors de la fermeture du navigateur');
      }
    }
    
    console.error('Erreur lors de la capture d\'écran:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la capture d\'écran' 
    }, { status: 500 });
  }
} 
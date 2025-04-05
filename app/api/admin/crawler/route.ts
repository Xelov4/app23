import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import puppeteer from 'puppeteer';
import { Page } from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Regex pour les liens sociaux
const SOCIAL_REGEX = {
  twitter: /twitter\.com\/([^\/\?]+)/i,
  instagram: /instagram\.com\/([^\/\?]+)/i,
  facebook: /facebook\.com\/([^\/\?]+)/i,
  linkedin: /linkedin\.com\/(?:company|in)\/([^\/\?]+)/i,
  github: /github\.com\/([^\/\?]+)/i,
  youtube: /youtube\.com\/(?:channel|user|c)\/([^\/\?]+)/i,
  appStore: /apps\.apple\.com\/[^\/]+\/app\/([^\/]+)/i,
  playStore: /play\.google\.com\/store\/apps\/details\?id=([^&]+)/i,
  affiliate: /(?:affili(?:ate|é)|partenaire|refer(?:ral)?)/i
};

// Type pour les liens sociaux
interface SocialLinks {
  twitter: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  github: string | null;
  youtube: string | null;
  appStore: string | null;
  playStore: string | null;
  affiliate: string | null;
}

// Extraire le nom d'outil à partir de l'URL
function extractToolName(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '').split('.')[0];
  } catch (e) {
    // Si l'URL n'est pas valide, générer un nom aléatoire
    return `tool-${Date.now()}`;
  }
}

export async function POST(req: Request) {
  try {
    // Vérifier l'authentification - mais ne pas bloquer si pas de session
    // Cette API peut être utilisée sans authentification stricte
    const session = await getServerSession(authOptions);

    // Extraire les données de la requête
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL manquante" },
        { status: 400 }
      );
    }

    // Normaliser l'URL si nécessaire
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Créer le dossier public/images/tools s'il n'existe pas
    const imageDir = path.join(process.cwd(), 'public', 'images', 'tools');
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    console.log(`[${new Date().toLocaleTimeString()}] Démarrage du crawler pour screenshot et liens sociaux...`);
    
    // Initialiser le navigateur
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log(`[${new Date().toLocaleTimeString()}] Initialisation de Puppeteer...`);
    
    // Initialiser les variables de crawl
    const socialLinks = {
      twitter: null,
      instagram: null,
      facebook: null,
      linkedin: null,
      github: null,
      youtube: null,
      appStore: null,
      playStore: null,
      affiliate: null
    } as SocialLinks;

    // Variables pour les résultats
    let finalUrl = normalizedUrl;
    let title = '';
    let screenshotTaken = false;
    let imagePath = null as string | null;
    let hasAffiliateProgram = false;
    const socialLinksFound: string[] = [];
    
    // Déterminer le nom de l'outil et le nom du fichier de capture d'écran
    const toolName = extractToolName(normalizedUrl);
    const screenshotFilename = `${toolName}-${uuidv4().substring(0, 8)}.png`;
    const screenshotFilePath = path.join(imageDir, screenshotFilename);
    const relativePath = `/images/tools/${screenshotFilename}`;
    imagePath = relativePath; // Stocker le chemin relatif pour l'affichage
      
    try {
      // Naviguer vers la page d'accueil
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Naviguer vers l'URL
      await page.goto(normalizedUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      finalUrl = page.url(); // URL finale après redirections
      
      // Récupérer le titre
      title = await page.title();
      
      // Attendre que la page soit chargée
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));
      
      // Prendre une capture d'écran de la page d'accueil
      await page.screenshot({ path: screenshotFilePath });
      screenshotTaken = true;
      console.log(`[${new Date().toLocaleTimeString()}] Capture d'écran prise avec succès: ${relativePath}`);
      
      // Extraire tous les liens de la page
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.getAttribute('href'))
          .filter(Boolean);
      }) as string[];
      
      // Analyser les liens pour trouver les réseaux sociaux
      for (const link of links) {
        try {
          // URL complète du lien
          const fullUrl = new URL(link, finalUrl).href;
          
          // Vérifier chaque type de lien social
          for (const [platform, regex] of Object.entries(SOCIAL_REGEX)) {
            if (regex.test(fullUrl) && !socialLinks[platform as keyof SocialLinks]) {
              socialLinks[platform as keyof SocialLinks] = fullUrl;
              
              // Ajouter à la liste des liens sociaux
              if (!socialLinksFound.includes(fullUrl)) {
                socialLinksFound.push(fullUrl);
              }
            }
          }
          
          // Vérifier si c'est un lien d'affiliation
          if (
            SOCIAL_REGEX.affiliate.test(fullUrl) && 
            !fullUrl.includes(new URL(normalizedUrl).hostname)
          ) {
            socialLinks.affiliate = fullUrl;
            hasAffiliateProgram = true;
            
            // Ajouter aux liens sociaux
            if (!socialLinksFound.some(link => link === fullUrl)) {
              socialLinksFound.push(fullUrl);
            }
          }
        } catch (e) {
          // Ignorer les erreurs de parsing d'URL
          continue;
        }
      }
      
      // Fermer la page
      await page.close();
    } catch (error) {
      console.error(`Erreur lors du traitement de la page:`, error);
    }
    
    // Fermer le navigateur
    await browser.close();
    
    // Compter les liens sociaux trouvés
    const socialLinksCount = Object.values(socialLinks).filter(Boolean).length;
    console.log(`[${new Date().toLocaleTimeString()}] Trouvé ${socialLinksCount} liens vers des réseaux sociaux`);
    
    // Construire le résultat
    const result = {
      finalUrl,
      title,
      socialLinks,
      socialLinksFound,
      imageUrl: imagePath,
      screenshotPath: relativePath,
      screenshotTaken,
      hasAffiliateProgram
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors du crawling:', error);
    return NextResponse.json(
      { error: 'Erreur lors du crawling: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 
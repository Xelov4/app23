import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import puppeteer from 'puppeteer';
import { Page } from 'puppeteer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

// API Gemini
const API_KEY = 'AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA';

// Fonction pour extraire le texte visible
async function extractVisibleText(page: Page): Promise<string> {
  return page.evaluate(() => {
    return document.body.innerText;
  });
}

// Fonction pour analyser le contenu avec l'API Gemini
async function analyzeWithGemini(url: string, title: string, content: string, socialLinks: string[]): Promise<any> {
  try {
    // Construire le prompt pour Gemini en utilisant du texte brut plutôt que du JSON
    const prompt = `Analyse ce site web d'un outil technologique et extrait les informations pour remplir un formulaire.

URL analysée: ${url}
Titre de la page: ${title}

Liens sociaux trouvés:
${socialLinks.join('\n')}

CONTENU DU SITE:
${content.substring(0, 50000)}

Basé sur ce contenu, remplis ces champs pour notre base de données:
1. Nom de l'outil (court et précis, max 50 caractères)
2. Description détaillée (500-1000 caractères)
3. Résumé concis (max 150 caractères)
4. Titre SEO (max 60 caractères)
5. Description SEO (max 155 caractères)
6. Avantages (liste de 3-5 points)
7. Inconvénients (liste de 2-3 points)
8. A-t-il un programme d'affiliation? (oui/non)
9. Détails du programme d'affiliation (si applicable)
10. URL d'affiliation (si applicable)
11. A-t-il une version gratuite? (oui/non)
12. Détails des prix
13. Fonctionnalités principales (liste de 3-5 points)
14. Description résumée (1-2 phrases)
15. Catégories (2-3 parmi: AI, Productivity, Design, Development, Marketing, Analytics, Communication, Content Creation, Social Media, Education, Finance, Security)
16. Types d'utilisateurs recommandés (1-2 parmi: Developers, Designers, Marketers, Content Creators, Entrepreneurs, Students, Professionals, Teams, Enterprise)`;

    console.log(`[${new Date().toLocaleTimeString()}] Envoi de la requête à l'API Gemini avec le modèle gemini-2.0-flash...`);

    // Appeler l'API Gemini 2.0 Flash
    const geminiResponse = await axios({
      method: 'post',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      }
    });
    
    // Vérifier si la réponse est valide
    if (!geminiResponse.data || !geminiResponse.data.candidates || geminiResponse.data.candidates.length === 0) {
      console.error(`[${new Date().toLocaleTimeString()}] Réponse Gemini vide ou invalide:`, geminiResponse.data);
      return null;
    }
    
    const responseText = geminiResponse.data.candidates[0].content.parts[0].text;
    console.log(`[${new Date().toLocaleTimeString()}] Réponse reçue de Gemini`);
    
    return {
      rawResponse: responseText
    };
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] Erreur lors de l'analyse avec Gemini:`, error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    // Vérifier l'authentification - mais ne pas bloquer si pas de session
    // Cette API peut être utilisée sans authentification stricte
    const session = await getServerSession(authOptions);

    // Extraire les données de la requête
    const { url, imageUrl, socialLinks } = await req.json();

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

    console.log(`[${new Date().toLocaleTimeString()}] Démarrage du crawler pour extraction de contenu...`);
    
    // Initialiser le navigateur
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log(`[${new Date().toLocaleTimeString()}] Initialisation de Puppeteer...`);
    
    // Initialiser les variables de crawl
    const visitedUrls = new Set<string>();
    const pageQueue: { url: string; depth: number }[] = [{ url: normalizedUrl, depth: 0 }];
    const crawlResults = {
      finalUrl: normalizedUrl,
      content: '',
      title: '',
      imageUrl: imageUrl || null,
      socialLinks: socialLinks || [],
      pagesDiscovered: 1,
      pagesProcessed: 0,
      contentLength: 0,
      geminiAnalysis: null as any
    };

    // Définir la profondeur maximale de crawl à 2 (niveau accueil + 1 niveau en dessous)
    const MAX_DEPTH = 2;
    console.log(`[${new Date().toLocaleTimeString()}] Profondeur maximale de crawl définie à ${MAX_DEPTH}`);
    
    // Limiter le nombre de pages à explorer pour éviter un crawl trop intensif
    const MAX_PAGES = 20;
    console.log(`[${new Date().toLocaleTimeString()}] Nombre maximum de pages à explorer: ${MAX_PAGES}`);

    while (pageQueue.length > 0 && crawlResults.pagesProcessed < MAX_PAGES) {
      const { url: currentUrl, depth } = pageQueue.shift()!;
      
      if (visitedUrls.has(currentUrl) || depth > MAX_DEPTH) {
        continue;
      }
      
      visitedUrls.add(currentUrl);
      crawlResults.pagesProcessed++;
      
      try {
        console.log(`[${new Date().toLocaleTimeString()}] Exploration de ${currentUrl} (profondeur: ${depth}/${MAX_DEPTH})`);
        
        // Naviguer vers la page
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Naviguer vers l'URL
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Enregistrer les informations de la page d'accueil
        if (crawlResults.pagesProcessed === 1) {
          crawlResults.finalUrl = page.url();
          crawlResults.title = await page.title();
        }
        
        // Extraire le contenu de la page
        const bodyText = await extractVisibleText(page);
        
        // Ajouter le texte du contenu directement, sans formatage JSON
        crawlResults.content += `\n--- PAGE: ${currentUrl} ---\n`;
        crawlResults.content += bodyText + "\n\n";
        crawlResults.contentLength += bodyText.length;
        
        // Extraire tous les liens de la page
        const links = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('a[href]'))
            .map(a => a.getAttribute('href'))
            .filter(Boolean);
        }) as string[];
        
        // Ajouter les liens trouvés sur la page à la file d'attente
        for (const link of links) {
          try {
            // URL complète du lien
            const fullUrl = new URL(link, currentUrl).href;
            
            // Ajouter les liens trouvés sur la page à la file d'attente (seulement si on est à une profondeur inférieure à MAX_DEPTH)
            if (depth < MAX_DEPTH && 
                fullUrl.includes(new URL(normalizedUrl).hostname) && 
                !visitedUrls.has(fullUrl) && 
                !pageQueue.some(item => item.url === fullUrl)) {
              pageQueue.push({ url: fullUrl, depth: depth + 1 });
              crawlResults.pagesDiscovered++;
            }
          } catch (e) {
            // Ignorer les erreurs de parsing d'URL
            continue;
          }
        }
        
        await page.close();
      } catch (error) {
        console.error(`Erreur lors du traitement de ${currentUrl}:`, error);
      }
    }
    
    console.log(`[${new Date().toLocaleTimeString()}] Site exploré avec succès. Trouvé ${crawlResults.pagesDiscovered} pages, traité ${crawlResults.pagesProcessed} pages.`);
    
    // Fermer le navigateur
    await browser.close();
    
    // Limiter la taille du contenu pour éviter des payloads trop grands
    if (crawlResults.content.length > 100000) {
      crawlResults.content = crawlResults.content.substring(0, 100000);
      console.log(`[${new Date().toLocaleTimeString()}] Contenu tronqué à 100000 caractères pour réduire la taille de la payload`);
    }
    
    // Analyser le contenu avec Gemini
    console.log(`[${new Date().toLocaleTimeString()}] Envoi des données à l'API Gemini pour analyse...`);
    try {
      crawlResults.geminiAnalysis = await analyzeWithGemini(
        crawlResults.finalUrl,
        crawlResults.title,
        crawlResults.content,
        crawlResults.socialLinks
      );
      
      if (crawlResults.geminiAnalysis) {
        console.log(`[${new Date().toLocaleTimeString()}] Analyse avec Gemini terminée avec succès`);
      } else {
        console.log(`[${new Date().toLocaleTimeString()}] L'analyse avec Gemini n'a pas pu être effectuée`);
      }
    } catch (error) {
      console.error(`[${new Date().toLocaleTimeString()}] Erreur lors de l'analyse avec Gemini:`, error);
    }
    
    return NextResponse.json(crawlResults);
  } catch (error) {
    console.error('Erreur lors du crawling de contenu:', error);
    return NextResponse.json(
      { error: 'Erreur lors du crawling de contenu: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 
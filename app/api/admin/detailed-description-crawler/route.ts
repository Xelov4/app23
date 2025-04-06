import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import puppeteer from 'puppeteer';
import axios from 'axios';

// Configuration de l'API Gemini
const API_KEY = 'AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA';

// Fonction pour extraire le contenu principal d'une page web
async function extractMainContent(page: puppeteer.Page): Promise<string> {
  return await page.evaluate(() => {
    // Rechercher d'abord des éléments de contenu spécifiques
    let mainContent = document.querySelector('main');
    if (!mainContent) {
      // Essayer de trouver d'autres conteneurs courants
      mainContent = document.querySelector('article') || 
                    document.querySelector('.content') || 
                    document.querySelector('#content') ||
                    document.querySelector('.main-content');
    }
    
    // Si toujours pas trouvé, essayer de deviner le contenu principal
    if (!mainContent) {
      // Vérifier s'il y a un header et un footer
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      
      if (header && footer) {
        // Récupérer tous les éléments entre le header et le footer
        const elements = [];
        let element = header.nextElementSibling;
        
        while (element && element !== footer) {
          elements.push(element.textContent || '');
          element = element.nextElementSibling;
        }
        
        return elements.join('\n');
      }
      
      // Si on ne peut pas identifier clairement, prendre le body complet
      return document.body.textContent || '';
    }
    
    return mainContent.textContent || '';
  });
}

// Fonction pour générer une description détaillée à partir du contenu extrait
async function generateDetailedDescription(content: string, url: string): Promise<{
  detailedDescription: string;
  rawResponse: string;
  error?: string;
}> {
  try {
    // Limiter la taille du contenu pour éviter les erreurs d'API
    const truncatedContent = content.substring(0, 100000);
    
    // Construire le prompt pour Gemini
    const prompt = `Tu es un expert en rédaction SEO avec une excellente compréhension des outils et services d'intelligence artificielle.

Je vais te fournir le contenu d'une page web décrivant un outil d'IA, et j'ai besoin que tu génères une description détaillée et optimisée pour le SEO, en français.

URL: ${url}

CONTENU DE LA PAGE WEB:
${truncatedContent}

DIRECTIVES:
1. Crée une description détaillée, factuelle et informative de l'outil (600-800 caractères).
2. La description doit être bien structurée, engageante et optimisée pour le référencement.
3. Inclus les fonctionnalités principales, les cas d'utilisation et les avantages de l'outil.
4. Adapte le ton pour qu'il soit professionnel mais accessible.
5. Évite le jargon technique excessif.
6. N'invente pas de fonctionnalités qui ne sont pas mentionnées dans le contenu.
7. Ne répète pas simplement le contenu; synthétise et organise l'information de manière cohérente.
8. Fournis uniquement la description, sans introduction ni conclusion.

Ta réponse doit être un texte cohérent qui pourrait être utilisé directement comme description détaillée pour une fiche produit.`;

    console.log(`[${new Date().toLocaleTimeString()}] Envoi de la requête à l'API Gemini pour générer une description détaillée...`);
    
    // Appeler l'API Gemini
    const response = await axios({
      method: 'post',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
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
          maxOutputTokens: 1024,
        }
      }
    });
    
    // Vérifier si la réponse est valide
    if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
      console.error(`[${new Date().toLocaleTimeString()}] Réponse Gemini vide ou invalide:`, response.data);
      return {
        detailedDescription: "",
        rawResponse: "",
        error: "Réponse invalide de l'API Gemini"
      };
    }
    
    const responseText = response.data.candidates[0].content.parts[0].text;
    console.log(`[${new Date().toLocaleTimeString()}] Réponse reçue de Gemini`);
    console.log(`[${new Date().toLocaleTimeString()}] Description détaillée générée (${responseText.length} mots)`);
    
    return {
      detailedDescription: responseText,
      rawResponse: responseText
    };
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] Erreur lors de la génération de la description détaillée:`, error);
    return {
      detailedDescription: "",
      rawResponse: "",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Route API pour le crawling de description détaillée
export async function POST(req: Request) {
  try {
    // Vérifier l'authentification - facultative en développement
    const session = await getServerSession(authOptions);
    if (!session && process.env.NODE_ENV !== 'development') {
      console.log(`[${new Date().toLocaleTimeString()}] Tentative d'accès non autorisée à l'API detailed-description-crawler`);
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log(`[${new Date().toLocaleTimeString()}] Démarrage du crawler pour extraction du contenu principal...`);
    
    // Extraire l'URL de la requête
    const data = await req.json();
    const url = data.url;
    
    if (!url) {
      console.error(`[${new Date().toLocaleTimeString()}] URL manquante dans la requête`);
      return NextResponse.json({ error: 'URL requise' }, { status: 400 });
    }
    
    // Paramètres de crawling
    const maxDepth = 2; // Profondeur maximale de crawl
    const maxPages = 10; // Nombre maximum de pages à explorer
    
    console.log(`[${new Date().toLocaleTimeString()}] Initialisation de Puppeteer...`);
    console.log(`[${new Date().toLocaleTimeString()}] Profondeur maximale de crawl définie à ${maxDepth}`);
    console.log(`[${new Date().toLocaleTimeString()}] Nombre maximum de pages à explorer: ${maxPages}`);
    
    // Lancer Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Set de pages déjà visitées
      const visitedUrls = new Set<string>();
      // Ensemble des nouvelles URLs à explorer
      const urlsToVisit: Array<{url: string; depth: number}> = [{url, depth: 0}];
      // Compteur de pages explorées
      let pagesProcessed = 0;
      // Contenu accumulé
      let accumulatedContent = '';
      
      // Fonction pour normaliser les URLs
      const normalizeUrl = (url: string, baseUrl: string): string => {
        if (url.startsWith('/')) {
          const parsedBase = new URL(baseUrl);
          return `${parsedBase.origin}${url}`;
        }
        if (!url.startsWith('http')) {
          return new URL(url, baseUrl).href;
        }
        return url;
      };
      
      // Parcourir les URLs jusqu'à atteindre la profondeur maximale ou le nombre maximum de pages
      while (urlsToVisit.length > 0 && pagesProcessed < maxPages) {
        const {url: currentUrl, depth} = urlsToVisit.shift()!;
        
        // Vérifier si l'URL a déjà été visitée
        if (visitedUrls.has(currentUrl)) continue;
        visitedUrls.add(currentUrl);
        
        // Explorer la page
        console.log(`[${new Date().toLocaleTimeString()}] Exploration de ${currentUrl} (profondeur: ${depth}/${maxDepth})`);
        
        try {
          await page.goto(currentUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
          });
          
          // Extraire le contenu principal
          const content = await extractMainContent(page);
          accumulatedContent += `\n\n--- Page: ${currentUrl} ---\n${content}`;
          
          pagesProcessed++;
          
          // Si nous n'avons pas atteint la profondeur maximale, explorer les liens
          if (depth < maxDepth) {
            // Récupérer tous les liens de la page
            const links = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('a[href]'))
                .map(link => link.getAttribute('href'))
                .filter(href => href && !href.startsWith('#') && !href.startsWith('javascript:'));
            });
            
            // Ajouter les nouveaux liens à explorer
            for (const link of links) {
              if (!link) continue;
              const normalizedLink = normalizeUrl(link, currentUrl);
              
              // Vérifier si l'URL est du même domaine que l'URL d'origine
              const originalDomain = new URL(url).hostname;
              const linkDomain = new URL(normalizedLink).hostname;
              
              if (linkDomain === originalDomain && !visitedUrls.has(normalizedLink)) {
                urlsToVisit.push({url: normalizedLink, depth: depth + 1});
              }
            }
          }
        } catch (error) {
          console.error(`[${new Date().toLocaleTimeString()}] Erreur lors de l'exploration de ${currentUrl}:`, error);
        }
      }
      
      console.log(`[${new Date().toLocaleTimeString()}] Site exploré avec succès. Trouvé ${visitedUrls.size} pages, traité ${pagesProcessed} pages.`);
      
      // Envoyer le contenu à l'API Gemini pour générer une description détaillée
      console.log(`[${new Date().toLocaleTimeString()}] Envoi des données à l'API Gemini pour génération de description détaillée...`);
      const geminiAnalysis = await generateDetailedDescription(accumulatedContent, url);
      
      if (geminiAnalysis.error) {
        console.warn(`[${new Date().toLocaleTimeString()}] Avertissement lors de l'analyse avec Gemini: ${geminiAnalysis.error}`);
      } else {
        console.log(`[${new Date().toLocaleTimeString()}] Génération de description détaillée terminée avec succès`);
      }
      
      // Renvoyer les résultats
      return NextResponse.json({
        status: 'success',
        pagesProcessed,
        contentLength: accumulatedContent.length,
        geminiAnalysis
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] Erreur globale dans l'API detailed-description-crawler:`, error);
    return NextResponse.json(
      { error: 'Erreur lors du crawling: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 
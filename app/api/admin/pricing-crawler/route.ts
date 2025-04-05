import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import puppeteer from 'puppeteer';
import { Page } from 'puppeteer';
import axios from 'axios';

// API Gemini
const API_KEY = 'AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA';

// Fonction pour extraire le texte visible
async function extractVisibleText(page: Page): Promise<string> {
  return page.evaluate(() => {
    return document.body.innerText;
  });
}

// Liste des mots-clés liés aux prix à rechercher dans les URLs
const PRICING_KEYWORDS = [
  'pricing',
  'price',
  'prices',
  'tarif',
  'tarifs',
  'tarification',
  'prix',
  'abonnement',
  'abonnements',
  'subscribe',
  'subscription',
  'subscriptions',
  'plan',
  'plans',
  'buy',
  'purchase',
  'acheter',
  'signup',
  'sign-up',
  'register',
  'inscription',
  'offer',
  'offers',
  'offre',
  'offres'
];

// Fonction pour vérifier si une URL est liée aux prix
function isPricingRelatedUrl(url: string): boolean {
  const lowercaseUrl = url.toLowerCase();
  return PRICING_KEYWORDS.some(keyword => lowercaseUrl.includes(keyword));
}

// Fonction pour analyser le contenu avec l'API Gemini
async function analyzeWithGemini(content: string, websiteUrl: string): Promise<any> {
  try {
    // Construire le prompt pour Gemini
    const prompt = `Analyse cette page de tarification d'un outil technologique et rédige un contenu pour le site vidéo-ia.net.

URL analysée: ${websiteUrl}

CONTENU DES PAGES DE TARIFICATION:
${content.substring(0, 50000)}

Tu es un expert en IA et technologies qui rédige pour le site vidéo-ia.net. Tu as testé personnellement cet outil et tu partages ton expérience concrète avec ton lectorat. Tu t'adresses directement à eux en utilisant un ton conversationnel, avec des "je" et des "vous". N'écris pas "Détails de tarification:" ou des formules du genre.

Ton analyse de tarification doit:
- Être structurée en HTML avec h2, h3, p, ul, li, strong et em
- Comparer les offres entre elles et avec d'autres solutions du marché
- Indiquer ton avis personnel sur le rapport qualité/prix
- Être honnête sur la valeur réelle vs le prix demandé
- Mentionner des cas d'usage spécifiques pour chaque niveau de prix
- Partager des astuces pour maximiser la valeur de son abonnement
- Recommander le meilleur plan selon différents profils d'utilisateurs

Inclus les éléments suivants en HTML structuré:

<h2>Vue d'ensemble des tarifs</h2>
<p>Ton analyse du modèle de tarification (gratuit, freemium, payant) ainsi que ton opinion personnelle sur cette stratégie de prix.</p>

<h3>Comparaison des différents plans</h3>
<ul>
  <li><strong>Avantages du plan X</strong>: Pourquoi ce plan est intéressant et pour qui...</li>
  <li><strong>Rapport qualité/prix</strong>: Ton évaluation honnête...</li>
  <li><strong>Fonctionnalités exclusives</strong>: Ce qui justifie ou non le prix supplémentaire...</li>
</ul>

<h2>Analyse détaillée par plan</h2>
<h3>Nom du premier plan</h3>
<p>Prix (mensuel et annuel), description détaillée de ce que tu obtiens, et surtout ton expérience personnelle avec ce plan.</p>

<h3>Nom du deuxième plan</h3>
<p>Même structure pour chaque plan disponible...</p>

<h2>Comment tirer le maximum de son abonnement</h2>
<p>Tes conseils d'expert pour optimiser son utilisation selon le plan choisi.</p>

IMPORTANT: Ne générez PAS de code \`\`\`html au début ou à la fin. Écrivez directement le HTML sans l'entourer de backticks.

Écris directement en français avec le balisage HTML.`;

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
          temperature: 0.3,
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
    
    // Extraire le type de tarification de la réponse (FREE, FREEMIUM ou PAID)
    let pricingType = 'PAID'; // Par défaut
    if (responseText.toLowerCase().includes('gratuit') && !responseText.toLowerCase().includes('version gratuite')) {
      pricingType = 'FREE';
    } else if (responseText.toLowerCase().includes('version gratuite') || 
               responseText.toLowerCase().includes('freemium') || 
               responseText.toLowerCase().includes('offre gratuite')) {
      pricingType = 'FREEMIUM';
    }
    
    return {
      rawResponse: responseText,
      pricingDetails: responseText,
      pricingType: pricingType
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

    console.log(`[${new Date().toLocaleTimeString()}] Démarrage du crawler pour extraction des informations de prix...`);
    
    // Initialiser le navigateur
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log(`[${new Date().toLocaleTimeString()}] Initialisation de Puppeteer...`);
    
    // Initialiser les variables de crawl
    const visitedUrls = new Set<string>();
    const pageQueue: { url: string; depth: number }[] = [{ url: normalizedUrl, depth: 0 }];
    const pricingPages: { url: string; content: string }[] = [];
    const crawlResults = {
      finalUrl: normalizedUrl,
      content: '',
      title: '',
      pagesDiscovered: 1,
      pagesProcessed: 0,
      contentLength: 0,
      pricingPagesFound: 0,
      geminiAnalysis: null as any
    };

    // Définir la profondeur maximale de crawl à 2 (niveau accueil + 1 niveau en dessous)
    const MAX_DEPTH = 2;
    console.log(`[${new Date().toLocaleTimeString()}] Profondeur maximale de crawl définie à ${MAX_DEPTH}`);
    
    // Limiter le nombre de pages à explorer pour éviter un crawl trop intensif
    const MAX_PAGES = 20;
    console.log(`[${new Date().toLocaleTimeString()}] Nombre maximum de pages à explorer: ${MAX_PAGES}`);

    let pricingPageFound = false;

    // Première passe : explorer rapidement le site pour trouver les pages liées aux prix
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
        
        // Vérifier si c'est la page d'accueil
        if (crawlResults.pagesProcessed === 1) {
          crawlResults.finalUrl = page.url();
          crawlResults.title = await page.title();
        }
        
        // Vérifier si la page actuelle est liée aux prix
        const currentUrlLower = currentUrl.toLowerCase();
        if (isPricingRelatedUrl(currentUrlLower) || isPricingRelatedUrl(await page.title())) {
          console.log(`[${new Date().toLocaleTimeString()}] Page de tarification trouvée: ${currentUrl}`);
          pricingPageFound = true;
          
          // Extraire le contenu de la page
          const bodyText = await extractVisibleText(page);
          pricingPages.push({
            url: currentUrl,
            content: bodyText
          });
          
          // Ajouter le texte du contenu
          crawlResults.content += `\n--- PAGE DE TARIFICATION: ${currentUrl} ---\n`;
          crawlResults.content += bodyText + "\n\n";
          crawlResults.contentLength += bodyText.length;
          crawlResults.pricingPagesFound++;
        }
        
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
            
            // Donner la priorité aux liens qui semblent liés aux prix
            if (isPricingRelatedUrl(fullUrl)) {
              if (!visitedUrls.has(fullUrl) && !pageQueue.some(item => item.url === fullUrl)) {
                // Insérer au début de la file pour explorer en priorité
                pageQueue.unshift({ url: fullUrl, depth: depth + 1 });
                crawlResults.pagesDiscovered++;
              }
            } 
            // Ajouter les autres liens
            else if (depth < MAX_DEPTH && 
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
    
    // Si aucune page de tarification n'a été trouvée, utiliser le contenu de la page d'accueil comme fallback
    if (!pricingPageFound) {
      console.log(`[${new Date().toLocaleTimeString()}] Aucune page de tarification trouvée. Utilisation de la page d'accueil comme fallback.`);
      
      try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto(normalizedUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        const bodyText = await extractVisibleText(page);
        crawlResults.content = `\n--- PAGE D'ACCUEIL (FALLBACK): ${normalizedUrl} ---\n` + bodyText;
        crawlResults.contentLength = bodyText.length;
        
        await page.close();
      } catch (error) {
        console.error(`Erreur lors du traitement de la page d'accueil (fallback):`, error);
      }
    }
    
    console.log(`[${new Date().toLocaleTimeString()}] Site exploré avec succès. Trouvé ${crawlResults.pagesDiscovered} pages, traité ${crawlResults.pagesProcessed} pages, dont ${crawlResults.pricingPagesFound} pages de tarification.`);
    
    // Fermer le navigateur
    await browser.close();
    
    // Limiter la taille du contenu pour éviter des payloads trop grands
    if (crawlResults.content.length > 100000) {
      crawlResults.content = crawlResults.content.substring(0, 100000);
      console.log(`[${new Date().toLocaleTimeString()}] Contenu tronqué à 100000 caractères pour réduire la taille de la payload`);
    }
    
    // Analyser le contenu avec Gemini
    console.log(`[${new Date().toLocaleTimeString()}] Envoi des données à l'API Gemini pour analyse des prix...`);
    try {
      crawlResults.geminiAnalysis = await analyzeWithGemini(
        crawlResults.content,
        crawlResults.finalUrl
      );
      
      if (crawlResults.geminiAnalysis) {
        console.log(`[${new Date().toLocaleTimeString()}] Analyse des prix avec Gemini terminée avec succès`);
      } else {
        console.log(`[${new Date().toLocaleTimeString()}] L'analyse des prix avec Gemini n'a pas pu être effectuée`);
      }
    } catch (error) {
      console.error(`[${new Date().toLocaleTimeString()}] Erreur lors de l'analyse avec Gemini:`, error);
    }
    
    return NextResponse.json(crawlResults);
  } catch (error) {
    console.error('Erreur lors du crawling des prix:', error);
    return NextResponse.json(
      { error: 'Erreur lors du crawling des prix: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 
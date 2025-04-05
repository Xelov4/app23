import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import puppeteer from 'puppeteer';
import { Page } from 'puppeteer';
import axios from 'axios';

// API Gemini
const API_KEY = 'AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA';

// Fonction pour extraire le contenu principal (texte) d'une page
async function extractMainContent(page: Page): Promise<string> {
  return page.evaluate(() => {
    // Fonction pour déterminer si un élément est probablement dans le header ou footer
    function isHeaderOrFooter(element: Element): boolean {
      const tag = element.tagName.toLowerCase();
      if (tag === 'header' || tag === 'footer' || tag === 'nav') return true;
      
      const classes = element.className.toString().toLowerCase();
      const id = element.id.toLowerCase();
      
      const headerFooterKeywords = ['header', 'footer', 'menu', 'navigation', 'nav', 'toolbar', 'sidebar'];
      
      return headerFooterKeywords.some(keyword => 
        classes.includes(keyword) || id.includes(keyword)
      );
    }
    
    // Fonction pour déterminer si un élément est probablement du contenu principal
    function isMainContent(element: Element): boolean {
      const tag = element.tagName.toLowerCase();
      if (tag === 'main' || tag === 'article' || tag === 'section') return true;
      
      const classes = element.className.toString().toLowerCase();
      const id = element.id.toLowerCase();
      
      const contentKeywords = ['content', 'main', 'article', 'post', 'entry', 'body'];
      
      return contentKeywords.some(keyword => 
        classes.includes(keyword) || id.includes(keyword)
      );
    }
    
    // Essayer de trouver le contenu principal
    let mainContent = '';
    
    // D'abord essayer de trouver des éléments explicitement marqués comme contenu principal
    const mainElements = Array.from(document.querySelectorAll('main, article, [role="main"], .content, .main-content, #content, #main'));
    
    if (mainElements.length > 0) {
      // Prendre le contenu de tous les éléments principaux
      mainContent = mainElements.map(el => el.textContent || '').join('\n\n');
    } else {
      // Si aucun élément principal n'est trouvé, prendre tout le contenu du body
      // et essayer d'exclure les headers et footers
      const allElements = Array.from(document.body.querySelectorAll('*'));
      
      for (const element of allElements) {
        if (!isHeaderOrFooter(element) && element.textContent && element.textContent.trim().length > 50) {
          mainContent += element.textContent.trim() + '\n\n';
        }
      }
    }
    
    return mainContent.trim();
  });
}

// Fonction pour analyser le contenu avec l'API Gemini et générer une description détaillée
async function generateDetailedDescription(content: string, websiteUrl: string, title: string): Promise<any> {
  try {
    // Construire le prompt pour Gemini
    const prompt = `Rédige une description détaillée et optimisée pour le SEO pour le site vidéo-ia.net qui se comporte comme une véritable review d'expert.

URL du site à décrire: ${websiteUrl}
Titre: ${title}

CONTENU EXTRAIT DU SITE:
${content.substring(0, 50000)}

INSTRUCTIONS:
Tu es un expert en IA et technologies qui rédige pour le site vidéo-ia.net. Tu as testé personnellement cet outil et tu partages ton expérience concrète avec ton lectorat. Tu t'adresses directement à eux en utilisant un ton conversationnel, avec des "je" et des "vous". N'écris pas "Description détaillée:" ou des formules du genre.

Rôle à adopter: Tu es un professionnel qui utilise régulièrement des outils d'IA et qui donne un avis authentique et nuancé, basé sur ton expérience.

Ton contenu doit:
- Être structuré en HTML avec h2, h3, p, ul, li, strong et em
- Comparer cet outil avec d'autres solutions similaires sur le marché
- Faire des analogies concrètes (ex: "aussi simple à utiliser qu'un smartphone pour un enfant")
- Commenter le rapport qualité/prix et la tarification
- Inclure des remarques sur les performances et les besoins en ressources (matériel, etc.)
- Mentionner des cas d'usage spécifiques où tu as utilisé l'outil
- Partager des astuces personnelles que tu as découvertes
- Utiliser un ton légèrement informel mais professionnel
- Inclure au moins 3 sections distinctes avec des titres pertinents
- Pour les listes à puces (ul/li), NE PAS utiliser de symboles comme "*" ou "-" au début du texte

Structure requise:
<h2>Titre de section captivant</h2>
<p>Ton expérience personnelle avec l'outil, incluant des analogies et des exemples concrets tirés de ton utilisation quotidienne. Utilise "je" et "vous" pour créer une connexion avec le lecteur.</p>

<h3>Sous-section spécifique</h3>
<p>Détails précis avec des <strong>points importants</strong> et des comparaisons avec d'autres outils (ex: "Contrairement à [outil concurrent], celui-ci excelle dans...").</p>

<h2>Une autre section majeure</h2>
<p>Plus d'analyse personnelle, incluant des critiques constructives (aucun outil n'est parfait!), accompagnées de solutions ou contournements que tu as trouvés.</p>

<ul>
  <li>Point spécifique basé sur ton expérience réelle</li>
  <li>Astuce ou hack que tu as découvert</li>
  <li>Conseil pour maximiser la valeur de l'outil</li>
</ul>

IMPORTANT: Ne générez PAS de code \`\`\`html au début ou à la fin. Écrivez directement le HTML sans l'entourer de backticks.

Écris directement en français avec le balisage HTML.`;

    console.log(`[${new Date().toLocaleTimeString()}] Envoi de la requête à l'API Gemini pour générer une description détaillée...`);

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
    
    // Vérifier que la réponse est en HTML et supprimer tout préfixe "Description détaillée:" si présent
    let cleanedResponse = responseText;
    
    // Supprimer les préfixes courants comme "Description détaillée:" ou "Voici une description..."
    cleanedResponse = cleanedResponse.replace(/^(Description détaillée\s*:?\s*|Voici une description .*?:\s*)/i, '');
    
    // Si la réponse ne contient pas de balises HTML, essayer de la formater
    if (!cleanedResponse.includes('<h2>') && !cleanedResponse.includes('<p>')) {
      cleanedResponse = `<p>${cleanedResponse.replace(/\n\n/g, '</p>\n<p>')}</p>`;
    }
    
    return {
      rawResponse: responseText,
      detailedDescription: cleanedResponse
    };
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] Erreur lors de la génération de la description détaillée:`, error);
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

    console.log(`[${new Date().toLocaleTimeString()}] Démarrage du crawler pour extraction du contenu principal...`);
    
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
      pagesDiscovered: 1,
      pagesProcessed: 0,
      contentLength: 0,
      geminiAnalysis: null as any
    };

    // Définir la profondeur maximale de crawl
    const MAX_DEPTH = 2;
    console.log(`[${new Date().toLocaleTimeString()}] Profondeur maximale de crawl définie à ${MAX_DEPTH}`);
    
    // Limiter le nombre de pages à explorer
    const MAX_PAGES = 10;
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
        
        // Naviguer vers l'URL avec un timeout plus long pour les pages lourdes
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
        
        // Enregistrer les informations de la page d'accueil
        if (crawlResults.pagesProcessed === 1) {
          crawlResults.finalUrl = page.url();
          crawlResults.title = await page.title();
        }
        
        // Extraire le contenu principal de la page
        const mainContent = await extractMainContent(page);
        
        // Ajouter le contenu principal
        crawlResults.content += `\n--- CONTENU PRINCIPAL DE: ${currentUrl} ---\n`;
        crawlResults.content += mainContent + "\n\n";
        crawlResults.contentLength += mainContent.length;
        
        // Extraire tous les liens de la page
        const links = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('a[href]'))
            .map(a => a.getAttribute('href'))
            .filter(Boolean);
        }) as string[];
        
        // Ajouter les liens trouvés sur la page à la file d'attente
        if (depth < MAX_DEPTH) {
          for (const link of links) {
            try {
              // URL complète du lien
              const fullUrl = new URL(link, currentUrl).href;
              
              // N'ajouter que les liens internes du même domaine et qui ne sont pas déjà visités
              if (fullUrl.includes(new URL(normalizedUrl).hostname) && 
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
    
    // Générer une description détaillée avec Gemini
    console.log(`[${new Date().toLocaleTimeString()}] Envoi des données à l'API Gemini pour génération de description détaillée...`);
    try {
      crawlResults.geminiAnalysis = await generateDetailedDescription(
        crawlResults.content,
        crawlResults.finalUrl,
        crawlResults.title
      );
      
      if (crawlResults.geminiAnalysis) {
        console.log(`[${new Date().toLocaleTimeString()}] Génération de description détaillée terminée avec succès`);
        
        // Vérifier la longueur de la description en mots
        const description = crawlResults.geminiAnalysis.detailedDescription || '';
        const wordCount = description.split(/\s+/).length;
        console.log(`[${new Date().toLocaleTimeString()}] Description détaillée générée (${wordCount} mots)`);
        
        if (wordCount < 300) {
          console.log(`[${new Date().toLocaleTimeString()}] Attention: La description générée contient moins de 300 mots`);
        }
      } else {
        console.log(`[${new Date().toLocaleTimeString()}] La génération de description détaillée n'a pas pu être effectuée`);
      }
    } catch (error) {
      console.error(`[${new Date().toLocaleTimeString()}] Erreur lors de la génération avec Gemini:`, error);
    }
    
    return NextResponse.json(crawlResults);
  } catch (error) {
    console.error('Erreur lors du crawling et de la génération de description:', error);
    return NextResponse.json(
      { error: 'Erreur lors du crawling: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 
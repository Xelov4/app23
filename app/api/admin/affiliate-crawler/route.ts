import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import puppeteer from 'puppeteer';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

// Configuration de l'API Gemini
const API_KEY = 'AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA';

// Types pour l'analyse
interface FooterLink {
  url: string;
  text: string;
  content: string;
}

interface AffiliateAnalysisResult {
  mostProbableAffiliateUrl: string | null;
  allAnalyzedLinks: FooterLink[];
  confidence: number;
}

export async function POST(req: Request) {
  try {
    // Vérifier l'authentification - mais ne pas bloquer si pas de session
    const session = await getServerSession(authOptions);

    // Extraire les données de la requête
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL manquante" },
        { status: 400 }
      );
    }

    console.log(`[${new Date().toLocaleTimeString()}] Démarrage de l'analyse des liens d'affiliation pour: ${url}`);

    // Normaliser l'URL si nécessaire
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Initialiser le navigateur
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log(`[${new Date().toLocaleTimeString()}] Initialisation de Puppeteer...`);

    // Variables pour les résultats
    const footerLinks: FooterLink[] = [];
    
    try {
      // Naviguer vers la page principale
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Naviguer vers l'URL
      await page.goto(normalizedUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Attendre un peu pour laisser charger le contenu dynamique
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));
      
      console.log(`[${new Date().toLocaleTimeString()}] Recherche des liens dans le footer...`);
      
      // Extraction des liens dans le footer ou pied de page
      const footerLinkElements = await page.evaluate(() => {
        // Sélecteurs potentiels pour les zones de footer
        const footerSelectors = [
          'footer',
          '.footer',
          '#footer',
          '[data-testid="footer"]',
          '.site-footer',
          '.page-footer',
          '.main-footer',
          '.global-footer',
          '.base-footer',
          // Sélecteurs pour la partie basse de la page si pas de footer spécifique
          'body > div:last-child',
          'body > section:last-child',
          'body > div:nth-last-child(2)'
        ];
        
        // Trouver le premier élément de footer existant
        let footerElement = null;
        for (const selector of footerSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            footerElement = element;
            break;
          }
        }
        
        // Si aucun footer trouvé, prendre les 30% du bas de la page
        if (!footerElement) {
          const bodyHeight = document.body.scrollHeight;
          const elements = document.querySelectorAll('body *');
          footerElement = Array.from(elements).find(el => {
            const rect = el.getBoundingClientRect();
            const elTop = rect.top + window.scrollY;
            return elTop > bodyHeight * 0.7;
          });
        }
        
        // Si toujours rien, prendre tous les liens de la page
        const links = footerElement 
          ? Array.from(footerElement.querySelectorAll('a[href]'))
          : Array.from(document.querySelectorAll('a[href]'));
        
        // Transformer les éléments en données
        return links.map(a => {
          return {
            url: a.href,
            text: a.textContent?.trim() || ""
          };
        });
      });
      
      // Filtrer les liens pour éliminer les duplications et liens externes
      const uniqueLinks = new Map();
      const mainUrlHostname = new URL(normalizedUrl).hostname;
      
      console.log(`[${new Date().toLocaleTimeString()}] Trouvé ${footerLinkElements.length} liens potentiels`);
      
      // Filtrer les liens à explorer
      const linksToVisit = footerLinkElements.filter(link => {
        try {
          const linkUrl = new URL(link.url);
          // Vérifier que c'est dans le même domaine et ce n'est pas la page principale
          return (
            linkUrl.hostname === mainUrlHostname &&
            linkUrl.pathname !== '/' && 
            linkUrl.pathname !== '' &&
            !uniqueLinks.has(link.url) && // Pas de doublons
            !link.url.includes('#') && // Pas de liens d'ancrage
            !link.url.endsWith('.jpg') && // Pas de liens directs vers des médias
            !link.url.endsWith('.png') &&
            !link.url.endsWith('.pdf')
          );
        } catch (e) {
          return false;
        }
      }).slice(0, 10); // Limiter à 10 liens au maximum pour éviter trop de requêtes
      
      console.log(`[${new Date().toLocaleTimeString()}] Visite des ${linksToVisit.length} liens pertinents...`);
      
      // Visiter chaque lien et extraire le contenu
      for (const link of linksToVisit) {
        try {
          uniqueLinks.set(link.url, true);
          
          console.log(`[${new Date().toLocaleTimeString()}] Visite de: ${link.url}`);
          
          // Ouvrir une nouvelle page pour le lien
          const linkPage = await browser.newPage();
          await linkPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          
          // Naviguer vers l'URL du lien
          await linkPage.goto(link.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
          
          // Attendre que la page charge
          await linkPage.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));
          
          // Extraire le contenu textuel
          const pageContent = await linkPage.evaluate(() => {
            // Supprimer les éléments qui ne contiennent pas de contenu utile
            const elementsToRemove = document.querySelectorAll(
              'script, style, noscript, iframe, img, svg, canvas, video, audio, button, input, select, textarea'
            );
            for (const el of Array.from(elementsToRemove)) {
              el.remove();
            }
            
            // Extraire le titre
            const title = document.title || '';
            
            // Extraire le texte principal
            const body = document.body;
            let mainContent = '';
            
            if (body) {
              mainContent = body.innerText || body.textContent || '';
              // Limiter la taille du contenu
              mainContent = mainContent.replace(/\s+/g, ' ').trim().substring(0, 10000);
            }
            
            return {
              title: title,
              content: mainContent
            };
          });
          
          footerLinks.push({
            url: link.url,
            text: link.text,
            content: `TITRE: ${pageContent.title}\n\nCONTENU:\n${pageContent.content}`
          });
          
          // Fermer la page
          await linkPage.close();
        } catch (error) {
          console.error(`[${new Date().toLocaleTimeString()}] Erreur lors de la visite de ${link.url}:`, error);
        }
      }
      
      // Fermer la page principale
      await page.close();
    } catch (error) {
      console.error(`[${new Date().toLocaleTimeString()}] Erreur lors du traitement des liens:`, error);
    }
    
    // Fermer le navigateur
    await browser.close();
    
    console.log(`[${new Date().toLocaleTimeString()}] Analyse de ${footerLinks.length} pages terminée`);
    
    // Si aucun lien n'a été trouvé ou analysé
    if (footerLinks.length === 0) {
      return NextResponse.json({
        mostProbableAffiliateUrl: null,
        allAnalyzedLinks: [],
        confidence: 0
      });
    }
    
    // Construire le prompt pour Gemini
    const linkDetailsText = footerLinks.map((link, index) => 
      `LIEN ${index + 1}:\nURL: ${link.url}\nTEXTE DU LIEN: ${link.text}\nCONTENU:\n${link.content.substring(0, 1500)}\n\n`
    ).join('---\n\n');
    
    const prompt = `Tu es un expert en analyse de sites web, spécialisé dans la détection de programmes d'affiliation.

J'ai extrait ${footerLinks.length} liens depuis le site web ${normalizedUrl} et visité chacun pour obtenir leur contenu.

Analyse chaque lien et détermine lequel est le plus susceptible de représenter un programme d'affiliation, partenariat ou référencement. Les pages de programme d'affiliation contiennent généralement des termes comme "affiliate", "affiliation", "partenaire", "référer", "commission", "reward", "earn", "partner program", etc.

LISTE DES LIENS ANALYSÉS:
${linkDetailsText}

Réponds UNIQUEMENT au format JSON exact suivant:
{
  "mostProbableAffiliateUrl": "URL complète du lien le plus probable d'être une page d'affiliation, ou null si aucun n'est pertinent",
  "confidence": note de 0 à 10 indiquant ton niveau de confiance (0 = aucune confiance, 10 = certitude absolue),
  "explanation": "Une explication brève (max 150 caractères) justifiant ton choix"
}

N'inclus AUCUN autre texte en dehors de ce JSON.`;
    
    console.log(`[${new Date().toLocaleTimeString()}] Envoi du prompt à Gemini pour analyse...`);
    
    try {
      // Appel de l'API Gemini
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
            maxOutputTokens: 1024,
          }
        }
      });
      
      // Vérifier si la réponse est valide
      if (!geminiResponse.data || !geminiResponse.data.candidates || geminiResponse.data.candidates.length === 0) {
        console.error(`[${new Date().toLocaleTimeString()}] Réponse Gemini vide ou invalide:`, geminiResponse.data);
        return NextResponse.json(
          { error: "Réponse invalide de l'API Gemini" },
          { status: 500 }
        );
      }
      
      const responseText = geminiResponse.data.candidates[0].content.parts[0].text;
      console.log(`[${new Date().toLocaleTimeString()}] Réponse reçue de Gemini`);
      
      // Extraire le JSON de la réponse de Gemini
      const jsonResponseMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                               responseText.match(/```\n([\s\S]*?)\n```/) || 
                               responseText.match(/\{[\s\S]*\}/);
      
      let analysisResult;
      
      if (jsonResponseMatch) {
        try {
          analysisResult = JSON.parse(jsonResponseMatch[1] || jsonResponseMatch[0]);
          console.log(`[${new Date().toLocaleTimeString()}] Analyse JSON extraite avec succès: ${analysisResult.mostProbableAffiliateUrl || "Aucun lien trouvé"}`);
        } catch (e) {
          console.error(`[${new Date().toLocaleTimeString()}] Erreur lors du parsing JSON:`, e);
          console.error(`[${new Date().toLocaleTimeString()}] Texte JSON problématique:`, jsonResponseMatch[0].substring(0, 200) + "...");
          analysisResult = { 
            mostProbableAffiliateUrl: null, 
            confidence: 0,
            explanation: "Erreur d'analyse" 
          };
        }
      } else {
        console.error(`[${new Date().toLocaleTimeString()}] Format de réponse non reconnu:`, responseText.substring(0, 200) + "...");
        analysisResult = { 
          mostProbableAffiliateUrl: null, 
          confidence: 0,
          explanation: "Format de réponse non reconnu" 
        };
      }
      
      // Construire le résultat final
      const finalResult = {
        mostProbableAffiliateUrl: analysisResult.mostProbableAffiliateUrl,
        allAnalyzedLinks: footerLinks.map(link => ({ url: link.url, text: link.text })),
        confidence: analysisResult.confidence || 0,
        explanation: analysisResult.explanation || ""
      };
      
      console.log(`[${new Date().toLocaleTimeString()}] Analyse terminée. URL d'affiliation trouvée: ${finalResult.mostProbableAffiliateUrl || "Aucune"}`);
      return NextResponse.json(finalResult);
      
    } catch (error) {
      console.error(`[${new Date().toLocaleTimeString()}] Erreur lors de l'analyse avec Gemini:`, error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'analyse: ' + (error instanceof Error ? error.message : String(error)) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur globale:', error);
    return NextResponse.json(
      { error: 'Erreur serveur: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 
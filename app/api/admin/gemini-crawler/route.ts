import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import axios from 'axios';

// Configuration de l'API Gemini
const API_KEY = 'AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA';

// Types pour l'analyse 
interface GeminiAnalysisRequest {
  content: string;
  title: string;
  url: string;
  socialLinks: string[];
  affiliateLinks: any[];
}

interface GeminiAnalysisResult {
  url: string;
  title: string;
  analysis: {
    name: string;
    description: string;
    summary: string;
    seoTitle: string;
    seoDescription: string;
    pros: string[];
    cons: string[];
    hasAffiliateProgram: boolean;
    affiliateDetails?: string;
    affiliateUrl?: string;
    pricing?: {
      hasFreeVersion: boolean;
      pricingDetails: string;
    };
    features: string[];
    summarizedDescription: string;
    categories: string[];
    recommendedUserTypes: string[];
  };
}

export async function POST(req: Request) {
  try {
    // Vérifier l'authentification - mais ne pas bloquer si pas de session
    // Cette API peut être utilisée sans authentification stricte
    await getServerSession(authOptions);

    // Extraire les données de la requête
    // On s'attend à recevoir directement les données du crawler, pas juste une URL
    const crawlerData: GeminiAnalysisRequest = await req.json();

    if (!crawlerData || !crawlerData.content) {
      console.error(`[${new Date().toLocaleTimeString()}] Données de crawl manquantes:`, crawlerData);
      return NextResponse.json(
        { error: "Données de crawl manquantes" },
        { status: 400 }
      );
    }

    try {
      console.log(`[${new Date().toLocaleTimeString()}] Réception de données à analyser pour le site: ${crawlerData.url}`);
      
      // Construire le prompt pour Gemini
      const prompt = `Analyse soigneusement le contenu de ce site web d'un outil ou service technologique et extrait les informations suivantes au format JSON.

URL: ${crawlerData.url}
Titre: ${crawlerData.title}

CONTENU DU SITE WEB:
${crawlerData.content.substring(0, 25000)}

LIENS DE RÉSEAUX SOCIAUX POTENTIELS:
${crawlerData.socialLinks.join('\n')}

LIENS D'AFFILIATION POTENTIELS:
${JSON.stringify(crawlerData.affiliateLinks, null, 2)}

Basé sur ces informations, fournis les détails suivants dans cette structure JSON exacte:
{
  "analysis": {
    "name": "Nom court et précis de l'outil (max 50 caractères)",
    "description": "Description détaillée et factuelle de l'outil, ses fonctionnalités principales, son utilité (500-1000 caractères)",
    "summary": "Un résumé concis de l'outil en 1-2 phrases (max 150 caractères)",
    "seoTitle": "Un titre SEO optimisé (max 60 caractères)",
    "seoDescription": "Une meta description SEO optimisée (max 155 caractères)",
    "pros": ["Avantage 1", "Avantage 2", "Avantage 3", "Avantage 4", "Avantage 5"],
    "cons": ["Inconvénient 1", "Inconvénient 2", "Inconvénient 3"],
    "hasAffiliateProgram": true ou false,
    "affiliateDetails": "Description brève du programme d'affiliation si trouvé",
    "affiliateUrl": "URL vers la page du programme d'affiliation si trouvée",
    "pricing": {
      "hasFreeVersion": true ou false,
      "pricingDetails": "Résumé bref des niveaux de prix"
    },
    "features": ["Fonctionnalité clé 1", "Fonctionnalité clé 2", "Fonctionnalité clé 3", "Fonctionnalité clé 4", "Fonctionnalité clé 5"],
    "summarizedDescription": "Une description concise en 1-2 phrases de ce que fait cet outil",
    "categories": ["Sélectionne 2-3 catégories parmi: AI, Productivity, Design, Development, Marketing, Analytics, Communication, Content Creation, Social Media, Education, Finance, Security"],
    "recommendedUserTypes": ["Sélectionne 1-2 types d'utilisateurs parmi: Developers, Designers, Marketers, Content Creators, Entrepreneurs, Students, Professionals, Teams, Enterprise"]
  }
}

IMPORTANT: 
- Si tu n'es pas sûr d'un champ, fournis ta meilleure estimation mais fais-la précise.
- S'il n'y a pas de programme d'affiliation, définis hasAffiliateProgram sur false.
- Extrait toujours les liens réels directement à partir du contenu fourni, ne les invente pas.
- Tous les champs doivent être remplis avec des informations pertinentes et factuelles.
- Assure-toi que le résumé et la description soient informatifs et professionnels.`;
      
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
      
      let analysisData;
      
      if (jsonResponseMatch) {
        try {
          analysisData = JSON.parse(jsonResponseMatch[1] || jsonResponseMatch[0]);
          console.log(`[${new Date().toLocaleTimeString()}] Analyse JSON extraite avec succès`);
        } catch (e) {
          console.error(`[${new Date().toLocaleTimeString()}] Erreur lors du parsing JSON:`, e);
          console.error(`[${new Date().toLocaleTimeString()}] Texte JSON problématique:`, jsonResponseMatch[0].substring(0, 200) + "...");
          analysisData = { error: 'Impossible de parser la réponse JSON' };
        }
      } else {
        console.error(`[${new Date().toLocaleTimeString()}] Format de réponse non reconnu:`, responseText.substring(0, 200) + "...");
        analysisData = { error: 'Format de réponse non reconnu' };
      }
      
      // Construire le résultat final
      const analysisResult: GeminiAnalysisResult = {
        url: crawlerData.url,
        title: crawlerData.title,
        analysis: analysisData.analysis || {
          name: crawlerData.title || "",
          description: `Cet outil est disponible sur ${crawlerData.url}`,
          summary: `Outil disponible sur ${crawlerData.url}`,
          seoTitle: crawlerData.title || "",
          seoDescription: `Découvrez cet outil sur ${crawlerData.url}`,
          pros: ["Outil accessible en ligne"],
          cons: ["Information limitée disponible"],
          hasAffiliateProgram: false,
          pricing: {
            hasFreeVersion: true,
            pricingDetails: "Information sur les prix non disponible"
          },
          features: [],
          summarizedDescription: `Outil disponible sur ${crawlerData.url}`,
          categories: [],
          recommendedUserTypes: []
        }
      };
      
      console.log(`[${new Date().toLocaleTimeString()}] Analyse terminée et résultats préparés avec succès`);
      return NextResponse.json(analysisResult);
    } catch (error) {
      console.error(`[${new Date().toLocaleTimeString()}] Erreur lors de l'analyse avec Gemini:`, error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'analyse: ' + (error instanceof Error ? error.message : String(error)) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] Erreur générale:`, error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 
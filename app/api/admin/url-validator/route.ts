import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  originalUrl: string;
  finalUrl: string;
  statusCode: number;
  isRedirected: boolean;
  chainOfRedirects: string[];
  isValid: boolean;
  message: string;
}

// Support both with and without trailing slash
export async function POST(req: Request) {
  try {
    // Vérifier l'authentification - mais ne pas bloquer si pas de session
    const session = await getServerSession(authOptions);

    // Extraire les données de la requête
    const { url, toolId, slug } = await req.json();

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

    console.log(`[${new Date().toLocaleTimeString()}] Vérification de l'URL: ${normalizedUrl}`);
    
    // Initialiser le navigateur
    let browser;
    try {
      console.log(`[${new Date().toLocaleTimeString()}] Lancement de Puppeteer...`);
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      console.log(`[${new Date().toLocaleTimeString()}] Puppeteer lancé avec succès`);
    } catch (browserError) {
      console.error(`[${new Date().toLocaleTimeString()}] Erreur lors du lancement de Puppeteer:`, browserError);
      return NextResponse.json(
        { 
          error: 'Erreur serveur: Impossible de lancer le navigateur: ' + (browserError instanceof Error ? browserError.message : String(browserError)),
          isValid: false
        },
        { status: 500 }
      );
    }
    
    // Résultat de validation
    const validationResult: ValidationResult = {
      originalUrl: normalizedUrl,
      finalUrl: normalizedUrl,
      statusCode: 0,
      isRedirected: false,
      chainOfRedirects: [normalizedUrl],
      isValid: false,
      message: ""
    };
    
    try {
      // Ouvrir une nouvelle page
      const page = await browser.newPage();
      
      // Configurer l'interception de requêtes pour suivre les redirections
      await page.setRequestInterception(true);
      
      page.on('request', request => {
        request.continue();
      });
      
      page.on('response', response => {
        const status = response.status();
        const url = response.url();
        
        // Enregistrer le code de statut HTTP
        validationResult.statusCode = status;
        
        // Si c'est une redirection, ajouter à la chaîne
        if (status >= 300 && status < 400) {
          validationResult.isRedirected = true;
          
          // Ajouter l'URL de redirection si elle n'est pas déjà dans la chaîne
          const redirectUrl = response.headers()['location'];
          if (redirectUrl && !validationResult.chainOfRedirects.includes(redirectUrl)) {
            validationResult.chainOfRedirects.push(redirectUrl);
          }
        }
      });
      
      // Naviguer vers l'URL avec un timeout généreux
      await page.goto(normalizedUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // L'URL finale après toutes les redirections
      validationResult.finalUrl = page.url();
      
      // Vérifier si l'URL finale est différente de l'URL d'origine
      if (validationResult.finalUrl !== normalizedUrl) {
        validationResult.isRedirected = true;
        
        // S'assurer que l'URL finale est dans la chaîne de redirections
        if (!validationResult.chainOfRedirects.includes(validationResult.finalUrl)) {
          validationResult.chainOfRedirects.push(validationResult.finalUrl);
        }
      }
      
      // Vérification supplémentaire: le fait d'atteindre ce point ne garantit pas que la page soit réellement chargée
      // Certaines erreurs DNS peuvent être silencieuses ou donner un faux 200
      try {
        // Tenter d'exécuter un script simple sur la page pour vérifier qu'elle est réellement chargée
        await page.evaluate(() => document.title);
      } catch (evalError) {
        // Si l'évaluation échoue, c'est que la page n'est pas correctement chargée
        const errorMessage = evalError instanceof Error ? evalError.message : String(evalError);
        throw new Error(`Impossible d'interagir avec la page: ${errorMessage}`);
      }
      
      // Déterminer si l'URL est valide
      // Considérer 2xx comme réussi, y compris 206 Partial Content
      if (validationResult.statusCode >= 200 && validationResult.statusCode < 300) {
        validationResult.isValid = true;
        validationResult.message = "L'URL est valide et accessible.";
        
        // Si le code est 206, forcer à 200 pour éviter des problèmes avec l'état actif
        if (validationResult.statusCode === 206) {
          validationResult.statusCode = 200;
          validationResult.message += " (Code 206 Partial Content traité comme 200 OK)";
        }
        
        if (validationResult.isRedirected) {
          validationResult.message += ` Redirection vers ${validationResult.finalUrl}`;
        }
      } else if (validationResult.statusCode >= 300 && validationResult.statusCode < 400) {
        // Si nous avons reçu une redirection mais qu'elle n'a pas été suivie jusqu'à une URL finale valide
        validationResult.isValid = false;
        validationResult.message = `L'URL a répondu avec un code de redirection ${validationResult.statusCode}, mais la redirection n'a pas abouti à une URL valide.`;
      } else if (validationResult.statusCode >= 400 && validationResult.statusCode < 500) {
        validationResult.isValid = false;
        validationResult.message = `L'URL a répondu avec une erreur client ${validationResult.statusCode}.`;
      } else if (validationResult.statusCode >= 500) {
        validationResult.isValid = false;
        validationResult.message = `L'URL a répondu avec une erreur serveur ${validationResult.statusCode}.`;
      } else {
        validationResult.isValid = false;
        validationResult.message = "Impossible de déterminer la validité de l'URL.";
      }
      
      // Fermer la page
      await page.close();
      
    } catch (error) {
      console.error(`[${new Date().toLocaleTimeString()}] Erreur lors de la vérification de l'URL:`, error);
      
      // En cas d'erreur, marquer l'URL comme invalide
      validationResult.isValid = false;
      
      // Déterminer le type d'erreur
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Détecter les erreurs de résolution DNS et de connexion
      if (errorMessage.includes('ERR_NAME_NOT_RESOLVED') || 
          errorMessage.includes('DNS_PROBE') ||
          errorMessage.includes('getaddrinfo') || 
          errorMessage.includes('ENOTFOUND') ||
          errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('ERR_CONNECTION_RESET') ||
          errorMessage.includes('ERR_CONNECTION_TIMED_OUT') ||
          errorMessage.includes('ERR_CONNECTION_CLOSED') ||
          errorMessage.includes('ERR_SSL_PROTOCOL_ERROR') ||
          errorMessage.includes('ERR_FAILED') ||
          errorMessage.includes('Impossible d\'interagir avec la page')) {
        
        validationResult.message = `Erreur de connexion: Le domaine ne peut pas être résolu ou le serveur n'est pas accessible (${errorMessage})`;
        validationResult.statusCode = -1; // Code spécial pour les erreurs DNS/connexion
      } else {
        validationResult.message = `Erreur lors de la vérification: ${errorMessage}`;
      }
      
    } finally {
      // Fermer le navigateur
      await browser.close();
    }
    
    console.log(`[${new Date().toLocaleTimeString()}] Résultat de validation:`, {
      url: validationResult.originalUrl,
      finalUrl: validationResult.finalUrl,
      statusCode: validationResult.statusCode,
      isValid: validationResult.isValid,
      message: validationResult.message
    });
    
    // Si un toolId ou slug a été fourni, mettre à jour l'entrée dans la base de données
    if ((toolId || slug) && (validationResult.statusCode !== 0)) {
      try {
        let tool;
        
        if (toolId) {
          tool = await prisma.tool.findUnique({
            where: { id: toolId }
          });
        } else if (slug) {
          tool = await prisma.tool.findUnique({
            where: { slug: slug }
          });
        }
        
        if (tool) {
          // Mettre à jour l'outil en fonction du résultat
          const updateData: any = {
            websiteUrl: validationResult.isValid && validationResult.isRedirected ? 
                         validationResult.finalUrl : tool.websiteUrl,
            httpCode: validationResult.statusCode,
            httpChain: validationResult.chainOfRedirects.join(' -> ')
          };
          
          // Si l'URL n'est pas valide (erreur 4xx, 5xx ou problème de DNS/connexion), désactiver l'outil
          if (!validationResult.isValid && (validationResult.statusCode >= 400 || validationResult.statusCode === -1)) {
            updateData.isActive = false;
          } else if (validationResult.isValid) {
            // Activer l'outil seulement si l'URL est vraiment valide avec un code 200-299
            updateData.isActive = true;
          }
          
          // Mettre à jour l'outil dans la base de données
          await prisma.tool.update({
            where: { id: tool.id },
            data: updateData
          });
          
          console.log(`[${new Date().toLocaleTimeString()}] Outil mis à jour - ID: ${tool.id}, Slug: ${tool.slug}, isActive: ${updateData.isActive}`);
          validationResult.message += ` Outil ${validationResult.isValid ? 'activé' : 'désactivé'}.`;
        } else {
          console.log(`[${new Date().toLocaleTimeString()}] Outil non trouvé - ID: ${toolId}, Slug: ${slug}`);
        }
      } catch (dbError) {
        console.error(`[${new Date().toLocaleTimeString()}] Erreur lors de la mise à jour de l'outil:`, dbError);
        validationResult.message += ` Erreur lors de la mise à jour de l'outil dans la base de données.`;
      } finally {
        await prisma.$disconnect();
      }
    }
    
    return NextResponse.json(validationResult);
    
  } catch (error) {
    console.error('Erreur globale:', error);
    return NextResponse.json(
      { 
        error: 'Erreur serveur: ' + (error instanceof Error ? error.message : String(error)),
        isValid: false
      },
      { status: 500 }
    );
  }
} 
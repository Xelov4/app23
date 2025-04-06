// Services pour le séquençage des outils
// Ce service orchestre l'appel aux différentes API pour le traitement complet des outils

// Types
export type ProcessStatus = 'idle' | 'pending' | 'running' | 'success' | 'error' | 'warning';

export interface ProcessResult {
  status: ProcessStatus;
  message: string;
  data?: any;
}

export interface ToolSequenceResult {
  toolId: string;
  processResults: Record<number, ProcessResult>;
  startTime: Date;
  endTime?: Date;
  success: boolean;
}

// Fonctions pour les processus individuels
async function validateUrl(toolId: string, websiteUrl: string): Promise<ProcessResult> {
  try {
    const response = await fetch('/api/admin/url-validator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl,
        toolId: toolId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Réponse de validation URL:', data);
    
    // Si l'URL n'est pas valide selon la réponse
    if (!data.isValid) {
      // Mise à jour de l'outil pour le désactiver - même si l'API url-validator l'a déjà fait
      // C'est une sécurité supplémentaire
      const updateResponse = await fetch(`/api/tools/${toolId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: false,
          httpCode: data.statusCode || 0,
          httpChain: data.chainOfRedirects?.join(' -> ') || '',
        }),
      });

      if (!updateResponse.ok) {
        console.error(`Échec de la mise à jour de l'outil ${toolId} après validation URL:`, await updateResponse.text());
        return {
          status: 'error',
          message: `URL invalide (${data.statusCode || 'erreur'}) - Échec de désactivation de l'outil`,
          data
        };
      }

      return {
        status: 'error',
        message: `URL invalide (${data.statusCode || 'erreur'}) - Outil désactivé`,
        data
      };
    }
    
    // Si l'URL est valide, s'assurer que l'outil est bien actif
    const updateResponse = await fetch(`/api/tools/${toolId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        httpCode: data.statusCode,
        httpChain: data.chainOfRedirects?.join(' -> ') || '',
        isActive: true,
      }),
    });

    if (!updateResponse.ok) {
      console.error(`Échec de la mise à jour de l'outil ${toolId} après validation URL valide:`, await updateResponse.text());
      return {
        status: 'warning',
        message: `URL valide (${data.statusCode}) - Échec de mise à jour de l'outil`,
        data
      };
    }
    
    return {
      status: 'success',
      message: `URL valide (${data.statusCode})${data.isRedirected ? ` - Redirection vers ${data.finalUrl}` : ''}`,
      data
    };
  } catch (error) {
    console.error('Erreur dans validateUrl:', error);
    return {
      status: 'error',
      message: `Erreur lors de la validation d'URL: ${(error as Error).message}`,
    };
  }
}

async function crawlImageAndSocialLinks(toolId: string, websiteUrl: string): Promise<ProcessResult> {
  try {
    console.log(`Démarrage de la capture d'écran et des liens sociaux pour l'outil ${toolId} (URL: ${websiteUrl})`);
    
    const response = await fetch('/api/admin/crawler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Réponse du crawler:', data);
    
    // Préparation des données pour la mise à jour
    const updateData: Record<string, any> = {};
    
    // Mise à jour de l'image si disponible
    if (data.imageUrl || data.screenshotPath) {
      updateData.logoUrl = data.imageUrl || data.screenshotPath;
      console.log(`Logo URL trouvé: ${updateData.logoUrl}`);
    }
    
    // Mise à jour des liens sociaux si disponibles
    if (data.socialLinks) {
      if (data.socialLinks.twitter) updateData.twitterUrl = data.socialLinks.twitter;
      if (data.socialLinks.instagram) updateData.instagramUrl = data.socialLinks.instagram;
      if (data.socialLinks.facebook) updateData.facebookUrl = data.socialLinks.facebook;
      if (data.socialLinks.linkedin) updateData.linkedinUrl = data.socialLinks.linkedin;
      if (data.socialLinks.github) updateData.githubUrl = data.socialLinks.github;
      if (data.socialLinks.youtube) updateData.youtubeUrl = data.socialLinks.youtube;
      if (data.socialLinks.appStore) updateData.appStoreUrl = data.socialLinks.appStore;
      if (data.socialLinks.playStore) updateData.playStoreUrl = data.socialLinks.playStore;
      
      // Compter les liens sociaux trouvés pour le message de retour
      const socialLinksCount = Object.values(data.socialLinks).filter(Boolean).length;
      console.log(`${socialLinksCount} liens sociaux trouvés`);
    }
    
    // Mise à jour du statut d'affiliation si détecté
    if (data.hasAffiliateProgram !== undefined) {
      updateData.hasAffiliateProgram = data.hasAffiliateProgram;
      if (data.socialLinks && data.socialLinks.affiliate) {
        updateData.affiliateUrl = data.socialLinks.affiliate;
      }
    }
    
    // Ne mettre à jour que si on a des données
    if (Object.keys(updateData).length > 0) {
      console.log(`Mise à jour de l'outil ${toolId} avec les données:`, updateData);
      
      const updateResponse = await fetch(`/api/tools/${toolId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error(`Échec de la mise à jour des liens sociaux pour ${toolId}:`, errorText);
        return {
          status: 'warning',
          message: 'Liens sociaux extraits mais non sauvegardés',
          data
        };
      }
      
      return {
        status: 'success',
        message: `${Object.keys(updateData).length - (updateData.logoUrl ? 1 : 0) - (updateData.hasAffiliateProgram ? 1 : 0)} liens sociaux trouvés et sauvegardés`,
        data
      };
    }
    
    return {
      status: 'warning',
      message: 'Aucun lien social trouvé',
      data
    };
  } catch (error) {
    console.error('Erreur dans crawlImageAndSocialLinks:', error);
    return {
      status: 'error',
      message: `Erreur lors de l'extraction d'image et liens sociaux: ${(error as Error).message}`,
    };
  }
}

async function extractContent(toolId: string, websiteUrl: string, socialLinks: string[] = []): Promise<ProcessResult> {
  try {
    console.log(`Démarrage de l'extraction de contenu pour l'outil ${toolId} (URL: ${websiteUrl})`);
    
    const response = await fetch('/api/admin/content-crawler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl,
        socialLinks
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Réponse du content crawler:', {
      pagesProcessed: data.pagesProcessed,
      hasGeminiAnalysis: !!data.geminiAnalysis,
      contentLength: data.geminiAnalysis?.rawResponse?.length || 0
    });
    
    // Extraire les données
    let description = '';
    if (data.geminiAnalysis && data.geminiAnalysis.rawResponse) {
      const rawResponse = data.geminiAnalysis.rawResponse;
      
      // On extrait la description (ligne qui commence par "2.")
      const descMatch = rawResponse.match(/2\.\s*([\s\S]*?)(?=3\.|\n\d+\.|\Z)/);
      description = descMatch ? descMatch[1].trim() : '';
      
      console.log(`Description extraite: ${description.length} caractères`);
    }
    
    if (description && description.length > 100) {
      // Mise à jour de l'outil avec la description détaillée
      console.log(`Mise à jour de la description détaillée pour ${toolId}`);
      
      const updateResponse = await fetch(`/api/tools/${toolId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          detailedDescription: description,
        }),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error(`Échec de la mise à jour de la description détaillée pour ${toolId}:`, errorText);
        return {
          status: 'warning',
          message: 'Contenu extrait mais description détaillée non sauvegardée',
          data
        };
      }
      
      return {
        status: 'success',
        message: `Contenu extrait et description détaillée sauvegardée (${data.pagesProcessed || 0} pages)`,
        data: {
          ...data,
          description
        }
      };
    }
    
    return {
      status: 'warning',
      message: 'Contenu extrait mais sans description détaillée',
      data
    };
  } catch (error) {
    console.error('Erreur dans extractContent:', error);
    return {
      status: 'error',
      message: `Erreur lors de l'extraction de contenu: ${(error as Error).message}`,
    };
  }
}

async function extractPricing(toolId: string, websiteUrl: string): Promise<ProcessResult> {
  try {
    const response = await fetch('/api/admin/pricing-crawler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Préparation des données pour la mise à jour
    const updateData: Record<string, any> = {};
    
    if (data.pricingType) {
      updateData.pricingType = data.pricingType;
    } else {
      updateData.pricingType = 'FREE';  // Valeur par défaut
    }
    
    if (data.pricingDetails) {
      updateData.pricingDetails = data.pricingDetails;
    }
    
    // Mise à jour de l'outil avec les informations de tarification
    const updateResponse = await fetch(`/api/tools/${toolId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!updateResponse.ok) {
      console.error('Échec de la mise à jour des tarifs:', await updateResponse.text());
      return {
        status: 'warning',
        message: 'Tarifs extraits mais non sauvegardés',
        data
      };
    }
    
    return {
      status: 'success',
      message: `Type de tarification détecté et sauvegardé: ${updateData.pricingType}`,
      data
    };
  } catch (error) {
    console.error('Erreur dans extractPricing:', error);
    return {
      status: 'error',
      message: `Erreur lors de l'extraction des tarifs: ${(error as Error).message}`,
    };
  }
}

async function generateSeoDescription(toolId: string, websiteUrl: string, description: string = ''): Promise<ProcessResult> {
  try {
    console.log(`Démarrage de la génération de description détaillée SEO pour l'outil ${toolId} (URL: ${websiteUrl})`);
    
    // S'assurer que l'URL se termine par un slash
    const endpoint = '/api/admin/detailed-description-crawler';
    
    console.log(`Utilisation de l'endpoint: ${endpoint}`);
    
    // Utiliser le même endpoint que celui utilisé dans DetailedDescriptionCrawler
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorStatus = response.status;
      console.error(`Échec de la requête à l'API detailed-description-crawler (${errorStatus}):`, errorText);
      
      // Si l'erreur est 404, essayer avec l'endpoint alternatif
      if (errorStatus === 404) {
        console.log("Tentative avec l'endpoint alternatif: /api/admin/gemini-crawler");
        const alternativeResponse = await fetch('/api/admin/gemini-crawler', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: websiteUrl,
            content: description,
            title: '',
            socialLinks: [],
            affiliateLinks: []
          }),
        });
        
        if (!alternativeResponse.ok) {
          const altErrorText = await alternativeResponse.text();
          console.error(`Échec de la requête à l'API alternative gemini-crawler (${alternativeResponse.status}):`, altErrorText);
          throw new Error(`Erreur ${alternativeResponse.status}: ${alternativeResponse.statusText}`);
        }
        
        const alternativeData = await alternativeResponse.json();
        console.log('Réponse de l\'API gemini-crawler alternative:', {
          status: alternativeResponse.status,
          hasAnalysis: !!alternativeData.analysis
        });
        
        // Préparation des données pour la mise à jour
        const updateData: Record<string, any> = {};
        
        if (alternativeData.analysis && alternativeData.analysis.description) {
          updateData.detailedDescription = alternativeData.analysis.description;
          console.log(`Description générée par l'API alternative (${alternativeData.analysis.description.length} caractères)`);
        }
        
        // Ne mettre à jour que si on a des données
        if (Object.keys(updateData).length > 0) {
          console.log(`Mise à jour de l'outil ${toolId} avec la description détaillée générée par l'API alternative`);
          
          const updateResponse = await fetch(`/api/tools/${toolId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          });
    
          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error(`Échec de la mise à jour de la description détaillée pour ${toolId}:`, errorText);
            return {
              status: 'warning',
              message: 'Description détaillée SEO générée mais non sauvegardée',
              data: alternativeData
            };
          }
          
          return {
            status: 'success',
            message: `Description détaillée SEO générée par l'API alternative et sauvegardée (${updateData.detailedDescription.length} caractères)`,
            data: alternativeData
          };
        }
        
        return {
          status: 'warning',
          message: 'Aucune description détaillée SEO générée par l\'API alternative',
          data: alternativeData
        };
      }
      
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Réponse de l\'API detailed-description-crawler:', {
      status: response.status,
      pagesProcessed: data.pagesProcessed,
      contentLength: data.contentLength,
      hasGeminiAnalysis: !!data.geminiAnalysis,
      detailedDescriptionLength: data.geminiAnalysis?.detailedDescription?.length || 0
    });
    
    // Préparation des données pour la mise à jour
    const updateData: Record<string, any> = {};
    
    // Si nous avons une description détaillée optimisée SEO
    if (data.geminiAnalysis && data.geminiAnalysis.detailedDescription) {
      updateData.detailedDescription = data.geminiAnalysis.detailedDescription;
      console.log(`Description détaillée générée (${data.geminiAnalysis.detailedDescription.length} caractères)`);
    } 
    // Si nous avons juste une réponse brute
    else if (data.geminiAnalysis && data.geminiAnalysis.rawResponse) {
      updateData.detailedDescription = data.geminiAnalysis.rawResponse;
      console.log(`Description détaillée brute générée (${data.geminiAnalysis.rawResponse.length} caractères)`);
    }
    
    // Ne mettre à jour que si on a des données
    if (Object.keys(updateData).length > 0) {
      console.log(`Mise à jour de l'outil ${toolId} avec la description détaillée`);
      
      const updateResponse = await fetch(`/api/tools/${toolId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error(`Échec de la mise à jour de la description détaillée pour ${toolId}:`, errorText);
        return {
          status: 'warning',
          message: 'Description détaillée SEO générée mais non sauvegardée',
          data
        };
      }
      
      return {
        status: 'success',
        message: `Description détaillée SEO générée et sauvegardée avec succès (${updateData.detailedDescription.length} caractères)`,
        data
      };
    }
    
    return {
      status: 'warning',
      message: 'Aucune description détaillée SEO générée',
      data
    };
  } catch (error) {
    console.error('Erreur dans generateSeoDescription:', error);
    return {
      status: 'error',
      message: `Erreur lors de la génération de la description détaillée SEO: ${(error as Error).message}`,
    };
  }
}

// Fonction principale pour exécuter la séquence complète
export async function sequenceTool(toolId: string, websiteUrl: string): Promise<ToolSequenceResult> {
  const result: ToolSequenceResult = {
    toolId,
    processResults: {},
    startTime: new Date(),
    success: false
  };
  
  try {
    console.log(`[${new Date().toLocaleTimeString()}] Début de la séquence pour l'outil ${toolId}`);
    
    // Récupérer le nom de l'outil pour l'historique
    let toolName = "";
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries && !toolName) {
      try {
        console.log(`[${new Date().toLocaleTimeString()}] Tentative de récupération du nom de l'outil ${toolId} (essai ${retryCount + 1}/${maxRetries})`);
        const toolResponse = await fetch(`/api/tools/${toolId}`);
        
        if (toolResponse.ok) {
          const toolData = await toolResponse.json();
          if (toolData && toolData.name) {
            toolName = toolData.name;
            console.log(`[${new Date().toLocaleTimeString()}] Nom de l'outil récupéré avec succès: "${toolName}"`);
          } else {
            console.error(`[${new Date().toLocaleTimeString()}] La réponse de l'API est OK mais ne contient pas de nom pour l'outil ${toolId}:`, toolData);
            retryCount++;
            if (retryCount < maxRetries) await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde avant de réessayer
          }
        } else {
          const errorText = await toolResponse.text();
          console.error(`[${new Date().toLocaleTimeString()}] Échec de la récupération de l'outil ${toolId} (${toolResponse.status}):`, errorText);
          retryCount++;
          if (retryCount < maxRetries) await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde avant de réessayer
        }
      } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] Erreur lors de la récupération du nom de l'outil ${toolId}:`, error);
        retryCount++;
        if (retryCount < maxRetries) await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde avant de réessayer
      }
    }

    // Si après toutes les tentatives, on n'a toujours pas de nom, utiliser un nom par défaut
    if (!toolName) {
      toolName = "Outil " + toolId.substring(0, 8);
      console.warn(`[${new Date().toLocaleTimeString()}] Impossible de récupérer le nom de l'outil après ${maxRetries} tentatives. Utilisation d'un nom par défaut: ${toolName}`);
    }
    
    // Processus 1: Validation d'URL
    console.log(`[${new Date().toLocaleTimeString()}] Démarrage du processus 1: Validation d'URL pour ${toolId}`);
    result.processResults[1] = await validateUrl(toolId, websiteUrl);
    console.log(`[${new Date().toLocaleTimeString()}] Fin du processus 1: Validation d'URL - Statut: ${result.processResults[1].status}`);
    
    if (result.processResults[1].status === 'error') {
      // Si la validation d'URL échoue, marquer les autres processus comme annulés
      console.log(`[${new Date().toLocaleTimeString()}] La validation d'URL a échoué. Annulation des processus suivants.`);
      
      // Marquer les processus 2 à 5 comme annulés
      for (let i = 2; i <= 5; i++) {
        result.processResults[i] = {
          status: 'error',
          message: 'Processus annulé - La validation d\'URL a échoué'
        };
      }
      
      result.endTime = new Date();
      result.success = false;
      
      // Enregistrer l'historique
      await saveSequenceHistory(toolId, toolName, result);
      
      return result; // Arrêter si l'URL n'est pas valide
    }
    
    // Processus 2: Capture d'écran et liens sociaux
    console.log(`[${new Date().toLocaleTimeString()}] Démarrage du processus 2: Capture & Social pour ${toolId}`);
    result.processResults[2] = await crawlImageAndSocialLinks(toolId, websiteUrl);
    console.log(`[${new Date().toLocaleTimeString()}] Fin du processus 2: Capture & Social - Statut: ${result.processResults[2].status}`);
    
    // Extraire les liens sociaux pour les passer au processus suivant
    const socialLinks = result.processResults[2].data?.socialLinksFound || [];
    
    // Processus 3: Extraction de contenu
    console.log(`[${new Date().toLocaleTimeString()}] Démarrage du processus 3: Extraction de contenu pour ${toolId}`);
    result.processResults[3] = await extractContent(toolId, websiteUrl, socialLinks);
    console.log(`[${new Date().toLocaleTimeString()}] Fin du processus 3: Extraction de contenu - Statut: ${result.processResults[3].status}`);
    
    // Processus 4: Extraction des tarifs
    console.log(`[${new Date().toLocaleTimeString()}] Démarrage du processus 4: Extraction des tarifs pour ${toolId}`);
    result.processResults[4] = await extractPricing(toolId, websiteUrl);
    console.log(`[${new Date().toLocaleTimeString()}] Fin du processus 4: Extraction des tarifs - Statut: ${result.processResults[4].status}`);
    
    // Processus 5: Génération de description détaillée SEO
    console.log(`[${new Date().toLocaleTimeString()}] Démarrage du processus 5: Génération de description détaillée pour ${toolId}`);
    const description = result.processResults[3].data?.description || '';
    result.processResults[5] = await generateSeoDescription(toolId, websiteUrl, description);
    console.log(`[${new Date().toLocaleTimeString()}] Fin du processus 5: Génération de description détaillée - Statut: ${result.processResults[5].status}`);
    
    // Déterminer si la séquence est un succès (au moins 3 processus réussis)
    const successCount = Object.values(result.processResults).filter(
      r => r.status === 'success'
    ).length;
    
    result.success = successCount >= 3;
    result.endTime = new Date();
    
    // Enregistrer l'historique
    await saveSequenceHistory(toolId, toolName, result);
    
    console.log(`[${new Date().toLocaleTimeString()}] Fin de la séquence pour l'outil ${toolId} - Succès: ${result.success}`);
    
    return result;
  } catch (error) {
    console.error('Erreur dans sequenceTool:', error);
    result.endTime = new Date();
    result.success = false;
    
    // Enregistrer l'historique même en cas d'erreur
    try {
      await saveSequenceHistory(toolId, "Outil inconnu", result);
    } catch (historyError) {
      console.error('Erreur lors de l\'enregistrement de l\'historique:', historyError);
    }
    
    return result;
  }
}

// Fonction pour enregistrer l'historique du séquençage
async function saveSequenceHistory(toolId: string, toolName: string, result: ToolSequenceResult): Promise<void> {
  try {
    // Si le nom de l'outil est vide ou "Outil sans nom", essayer de le récupérer à nouveau
    if (!toolName || toolName === "Outil sans nom" || toolName === "Outil inconnu") {
      try {
        console.log(`[${new Date().toLocaleTimeString()}] Tentative de récupération du nom de l'outil ${toolId} avant enregistrement de l'historique`);
        const toolResponse = await fetch(`/api/tools/${toolId}`);
        if (toolResponse.ok) {
          const toolData = await toolResponse.json();
          if (toolData && toolData.name) {
            toolName = toolData.name;
            console.log(`[${new Date().toLocaleTimeString()}] Nom de l'outil récupéré avec succès pour l'historique: "${toolName}"`);
          }
        }
      } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] Erreur lors de la récupération du nom de l'outil pour l'historique:`, error);
      }
    }
    
    console.log(`[${new Date().toLocaleTimeString()}] Enregistrement de l'historique pour ${toolId} (${toolName})`);
    
    // Simplifier les résultats pour le stockage
    const simplifiedProcessResults = Object.entries(result.processResults).reduce((acc, [processId, processResult]) => {
      acc[processId] = {
        status: processResult.status,
        message: processResult.message
      };
      return acc;
    }, {} as Record<string, { status: string; message: string }>);
    
    const response = await fetch('/api/admin/sequence-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolId,
        toolName,
        startTime: result.startTime,
        endTime: result.endTime,
        success: result.success,
        processResults: JSON.stringify(simplifiedProcessResults)
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    console.log(`[${new Date().toLocaleTimeString()}] Historique enregistré avec succès pour ${toolId}`);
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement de l'historique pour ${toolId}:`, error);
    // Ne pas propager l'erreur pour ne pas bloquer le reste du processus
  }
} 
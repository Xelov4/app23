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
    console.log(`Validation URL pour l'outil ${toolId}: ${websiteUrl}`);
    
    // S'assurer que l'URL est correctement formatée
    let normalizedUrl = websiteUrl;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
      console.log(`URL normalisée: ${normalizedUrl}`);
    }
    
    const response = await fetch('/api/admin/url-validator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: normalizedUrl,
        toolId: toolId,
      }),
    });

    if (!response.ok) {
      console.error(`Erreur de réponse API: ${response.status} ${response.statusText}`);
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Réponse de validation URL:', data);
    
    // Si l'URL n'est pas valide selon la réponse
    if (!data.isValid) {
      // Mise à jour de l'outil pour le désactiver - même si l'API url-validator l'a déjà fait
      // C'est une sécurité supplémentaire
      try {
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
      } catch (updateError) {
        console.error('Erreur lors de la mise à jour de l\'outil après validation URL:', updateError);
        return {
          status: 'error',
          message: `URL invalide (${data.statusCode || 'erreur'}) - Erreur lors de la mise à jour de l'outil: ${(updateError as Error).message}`,
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
    try {
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
    } catch (updateError) {
      console.error('Erreur lors de la mise à jour de l\'outil après validation URL valide:', updateError);
      return {
        status: 'warning',
        message: `URL valide (${data.statusCode}) - Erreur lors de la mise à jour de l'outil: ${(updateError as Error).message}`,
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
  console.log(`Démarrage du séquençage pour l'outil ${toolId} (URL: ${websiteUrl})`);
  
  // Récupérer les informations de l'outil pour avoir son nom
  let toolName = "Outil inconnu";
  try {
    const toolResponse = await fetch(`/api/tools/${toolId}`);
    if (toolResponse.ok) {
      const toolData = await toolResponse.json();
      toolName = toolData.name || toolName;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de l\'outil:', error);
  }
  
  const startTime = new Date();
  const result: ToolSequenceResult = {
    toolId,
    processResults: {},
    startTime,
    success: false
  };
  
  let isSuccess = true;
  let contentDescription = '';
  
  // Processus 1: Validation de l'URL
  result.processResults[1] = await validateUrl(toolId, websiteUrl);
  console.log(`Processus 1 (Validation URL) terminé avec statut: ${result.processResults[1].status}`);
  
  // Si l'URL n'est pas valide, on ne continue pas
  if (result.processResults[1].status === 'error') {
    console.log(`URL invalide, arrêt du séquençage pour l'outil ${toolId}`);
    result.endTime = new Date();
    result.success = false;
    
    // Sauvegarder l'historique avant de terminer
    await saveSequenceHistory(toolId, toolName, result);
    
    return result;
  }
  
  // Processus 2: Extraction d'image et des liens sociaux
  result.processResults[2] = await crawlImageAndSocialLinks(toolId, websiteUrl);
  console.log(`Processus 2 (Image & Social) terminé avec statut: ${result.processResults[2].status}`);
  
  // Construire la liste des liens sociaux si disponible
  let socialLinks: string[] = [];
  if (result.processResults[2].data && result.processResults[2].data.socialLinks) {
    socialLinks = Object.values(result.processResults[2].data.socialLinks).filter(Boolean) as string[];
  }
  
  // Processus 3: Extraction du contenu
  result.processResults[3] = await extractContent(toolId, websiteUrl, socialLinks);
  console.log(`Processus 3 (Extraction contenu) terminé avec statut: ${result.processResults[3].status}`);
  
  // Récupérer la description si disponible pour les processus suivants
  if (result.processResults[3].data && result.processResults[3].data.description) {
    contentDescription = result.processResults[3].data.description;
  }
  
  // Processus 4: Extraction des informations de tarification
  result.processResults[4] = await extractPricing(toolId, websiteUrl);
  console.log(`Processus 4 (Tarification) terminé avec statut: ${result.processResults[4].status}`);
  
  // Processus 5: Génération de la description SEO
  result.processResults[5] = await generateSeoDescription(toolId, websiteUrl, contentDescription);
  console.log(`Processus 5 (SEO) terminé avec statut: ${result.processResults[5].status}`);
  
  // Vérifier si au moins un processus a échoué
  for (const processId in result.processResults) {
    if (result.processResults[processId].status === 'error') {
      isSuccess = false;
      break;
    }
  }
  
  result.endTime = new Date();
  result.success = isSuccess;
  
  // Sauvegarder l'historique à la fin du séquençage
  await saveSequenceHistory(toolId, toolName, result);
  
  return result;
}

// Fonction pour enregistrer l'historique du séquençage
async function saveSequenceHistory(toolId: string, toolName: string, result: ToolSequenceResult): Promise<void> {
  try {
    console.log(`Sauvegarde de l'historique de séquençage pour l'outil ${toolId} (${toolName})`);
    
    // Préparer les données pour l'API
    const historyData = {
      toolId,
      toolName,
      startTime: result.startTime.toISOString(),
      endTime: result.endTime ? result.endTime.toISOString() : new Date().toISOString(),
      success: result.success,
      processResults: JSON.stringify(result.processResults)
    };
    
    // Appeler l'API pour sauvegarder l'historique
    const response = await fetch('/api/admin/sequence-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historyData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    console.log(`Historique de séquençage sauvegardé avec succès pour l'outil ${toolId}`);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'historique de séquençage:', error);
    // On ne fait pas échouer le séquençage si l'historique ne peut pas être sauvegardé
  }
} 
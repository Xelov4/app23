"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  websiteUrl: string;
  logoUrl: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorCode?: string;
  dbUpdated?: boolean;
  slug: string;
  httpCode?: number | null;
  httpChain?: string | null;
}

// Options pour le nombre d'éléments par page
const PAGE_SIZE_OPTIONS = [10, 50, 100, 250, 500];
const BATCH_SIZE = 5; // Traiter 5 outils à la fois
const MAX_PROCESSING_ITEMS = 50; // Limite de 50 outils par session (au lieu de 10)

export default function BulkPage() {
  const router = useRouter();
  
  // États généraux
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // État pour le processing
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(0);
  const [selectedTools, setSelectedTools] = useState<Set<number>>(new Set());
  
  // Nouveaux états pour les filtres et options
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Nouveaux états pour le tri
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [httpFilters, setHttpFilters] = useState<{
    dns: boolean;
    success: boolean;
    redirect: boolean;
    clientError: boolean;
    serverError: boolean;
    none: boolean;
  }>({
    dns: true,
    success: true,
    redirect: true,
    clientError: true,
    serverError: true,
    none: true
  });

  // Nouveau filtre pour le statut d'image
  const [imageFilters, setImageFilters] = useState<{
    exists: boolean;
    missing: boolean;
  }>({
    exists: true,
    missing: true
  });

  useEffect(() => {
    // Charger les outils depuis l'API
    const fetchTools = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tools');
        const data = await response.json();
        setTools(data.map((tool: any) => ({ ...tool, status: 'idle', dbUpdated: false })));
      } catch (error) {
        console.error('Erreur lors du chargement des outils:', error);
        setError('Erreur lors du chargement des outils');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Réinitialiser la page courante lors du changement d'items par page
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Fonction mémorisée pour filtrer les outils
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      // Filtre par statut HTTP
      let matchesHttpFilter = false;
      
      if ((!tool.httpCode && !tool.httpChain)) {
        matchesHttpFilter = httpFilters.none;
      } else if (tool.httpChain === 'DNS') {
        matchesHttpFilter = httpFilters.dns;
      } else if (tool.httpCode && tool.httpCode >= 200 && tool.httpCode < 300) {
        matchesHttpFilter = httpFilters.success;
      } else if (tool.httpCode && tool.httpCode >= 300 && tool.httpCode < 400) {
        matchesHttpFilter = httpFilters.redirect;
      } else if (tool.httpCode && tool.httpCode >= 400 && tool.httpCode < 500) {
        matchesHttpFilter = httpFilters.clientError;
      } else if (tool.httpCode && tool.httpCode >= 500) {
        matchesHttpFilter = httpFilters.serverError;
      }
      
      // Filtre par statut d'image
      let matchesImageFilter = false;
      
      if (tool.logoUrl) {
        matchesImageFilter = imageFilters.exists;
      } else {
        matchesImageFilter = imageFilters.missing;
      }
      
      // L'outil doit correspondre aux deux filtres
      return matchesHttpFilter && matchesImageFilter;
    });
  }, [tools, httpFilters, imageFilters]);

  // Fonction mémorisée pour traiter un outil
  const processOneTool = useCallback(async (index: number): Promise<boolean> => {
    const tool = tools[index];
    if (!tool || tool.status !== 'idle') return false;

            setTools(prevTools => {
              const newTools = [...prevTools];
      if (newTools[index]) {
              newTools[index].status = 'loading';
      }
              return newTools;
            });

    setActiveProcesses(prev => prev + 1);

            try {
              const response = await fetch('/api/screenshot', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  url: tool.websiteUrl,
                  slug: tool.slug 
                }),
              });

      // Vérifier le type de contenu de la réponse
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Type de contenu invalide: ${contentType || 'inconnu'}`);
      }

      let responseData;
      try {
        const text = await response.text();
        try {
          responseData = JSON.parse(text);
        } catch (jsonError) {
          throw new Error(`Erreur de format JSON: ${text.substring(0, 100)}...`);
        }
      } catch (error) {
        throw new Error(`Erreur lors de la lecture de la réponse: ${error instanceof Error ? error.message : String(error)}`);
      }

      if (responseData.errorType === 'BROWSER_LAUNCH_ERROR') {
        throw new Error(`Erreur Puppeteer: ${responseData.error || 'Impossible de lancer le navigateur'}`);
      }

              if (!response.ok || !responseData.success || !responseData.imageUrl) {
        throw new Error(responseData.error || `Erreur lors de la capture d'écran (${response.status})`);
              }

              setTools(prevTools => {
                const newTools = [...prevTools];
        if (newTools[index]) {
                newTools[index].status = 'success';
          newTools[index].logoUrl = responseData.imageUrl;
          newTools[index].httpCode = responseData.httpCode;
          newTools[index].httpChain = responseData.httpChain;
        }
                return newTools;
              });

      return true;
            } catch (error) {
      console.error(`Erreur pour ${tool.name}:`, error);
              setTools(prevTools => {
                const newTools = [...prevTools];
        if (newTools[index]) {
                newTools[index].status = 'error';
          newTools[index].errorCode = error instanceof Error ? error.message : 'Erreur inconnue';
          if (error instanceof Error) {
            if ('httpCode' in error) {
              newTools[index].httpCode = (error as any).httpCode;
            }
            if ('httpChain' in error) {
              newTools[index].httpChain = (error as any).httpChain;
            }
          }
        }
        return newTools;
      });

      return false;
    } finally {
      setActiveProcesses(prev => Math.max(0, prev - 1));
    }
  }, [tools]);

  // Effet pour gérer le traitement par lots
  useEffect(() => {
    if (!isRunning || processingQueue.length === 0) {
      if (isRunning) {
          setIsRunning(false);
          setIsCompleted(true);
          
          // Si tous les éléments de la session ont été traités
          if (sessionCompleted >= totalToProcess) {
            // Session terminée
            console.log('Session terminée');
          }
      }
      return;
    }

    // Vérifier si on a atteint la limite d'éléments pour cette session
    if (sessionCompleted >= MAX_PROCESSING_ITEMS) {
      setIsRunning(false);
      setIsCompleted(true);
      alert(`Limite de ${MAX_PROCESSING_ITEMS} éléments atteinte pour cette session. Sauvegardez les résultats et relancez pour traiter les éléments restants.`);
      return;
    }

    const processBatch = async () => {
      // Ne traiter qu'un nombre limité d'éléments à la fois
      const remainingInSession = MAX_PROCESSING_ITEMS - sessionCompleted;
      const batchSizeForThisRun = Math.min(BATCH_SIZE, remainingInSession, processingQueue.length);
      
      if (batchSizeForThisRun <= 0) {
        setIsRunning(false);
        setIsCompleted(true);
        return;
      }
      
      const currentBatch = processingQueue.slice(0, batchSizeForThisRun);
      setProcessingQueue(prev => prev.slice(batchSizeForThisRun));

      const results = await Promise.all(
        currentBatch.map(index => processOneTool(index))
      );
      
      // Incrémenter le compteur d'éléments traités dans cette session
      setSessionCompleted(prev => prev + results.length);
    };

    const timeoutId = setTimeout(processBatch, 1000);
    return () => clearTimeout(timeoutId);
  }, [isRunning, processingQueue, processOneTool, sessionCompleted, totalToProcess]);

  // Fonction pour gérer le changement d'état des cases à cocher individuelles
  const handleToolSelection = (toolId: string) => {
    setSelectedTools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toolId)) {
        newSet.delete(toolId);
      } else {
        newSet.add(toolId);
      }
      return newSet;
    });
  };

  // Fonction pour cocher/décocher tous les outils affichés
  const handleSelectAllTools = () => {
    if (paginatedTools.every(tool => selectedTools.has(tool.id))) {
      // Si tous sont cochés, on décoche tout
      setSelectedTools(prev => {
        const newSet = new Set(prev);
        paginatedTools.forEach(tool => {
          newSet.delete(tool.id);
        });
        return newSet;
      });
    } else {
      // Sinon on coche tout
      setSelectedTools(prev => {
        const newSet = new Set(prev);
        paginatedTools.forEach(tool => {
          newSet.add(tool.id);
        });
        return newSet;
      });
    }
  };

  const handleStart = useCallback(() => {
    let toolIndicesToProcess: number[] = [];
    
    // Déterminer quels outils doivent être traités en fonction des sélections et filtres
    if (selectedTools.size > 0) {
      // Logique existante pour les outils sélectionnés
      const anyFilterActive = Object.values(httpFilters).some(value => value);
      
      tools.forEach((tool, index) => {
        if (selectedTools.has(tool.id)) {
          // Si aucun filtre n'est actif OU si l'outil correspond aux filtres actifs
          if (!anyFilterActive || (
            (tool.httpChain === 'DNS' && httpFilters.dns) ||
            (tool.httpCode && tool.httpCode >= 200 && tool.httpCode < 300 && httpFilters.success) ||
            (tool.httpCode && tool.httpCode >= 300 && tool.httpCode < 400 && httpFilters.redirect) ||
            (tool.httpCode && tool.httpCode >= 400 && tool.httpCode < 500 && httpFilters.clientError) ||
            (tool.httpCode && tool.httpCode >= 500 && httpFilters.serverError) ||
            ((!tool.httpCode && !tool.httpChain) && httpFilters.none)
          )) {
            toolIndicesToProcess.push(index);
          }
        }
      });
    } else {
      // Logique existante pour les filtres
      tools.forEach((tool, index) => {
        if (
          (tool.httpChain === 'DNS' && httpFilters.dns) ||
          (tool.httpCode && tool.httpCode >= 200 && tool.httpCode < 300 && httpFilters.success) ||
          (tool.httpCode && tool.httpCode >= 300 && tool.httpCode < 400 && httpFilters.redirect) ||
          (tool.httpCode && tool.httpCode >= 400 && tool.httpCode < 500 && httpFilters.clientError) ||
          (tool.httpCode && tool.httpCode >= 500 && httpFilters.serverError) ||
          ((!tool.httpCode && !tool.httpChain) && httpFilters.none)
        ) {
          toolIndicesToProcess.push(index);
        }
      });
    }

    // Réinitialiser uniquement les outils sélectionnés
    setTools(prevTools => 
      prevTools.map((tool, index) => 
        toolIndicesToProcess.includes(index) 
          ? { ...tool, status: 'idle', dbUpdated: false }
          : tool
      )
    );

    // Enregistrer le nombre total d'outils à traiter
    setTotalToProcess(toolIndicesToProcess.length);
    
    // Limiter la file d'attente initiale au nombre maximum d'éléments autorisés
    const initialQueue = toolIndicesToProcess.slice(0, MAX_PROCESSING_ITEMS);
    
    setProcessingQueue(initialQueue);
    setSessionCompleted(0);
    setIsRunning(true);
    setIsCompleted(false);
  }, [tools, httpFilters, selectedTools]);

  // Fonction pour continuer le traitement après la sauvegarde
  const handleContinueProcessing = useCallback(() => {
    if (!isCompleted) return;
    
    // Trouver les outils qui n'ont pas encore été traités
    let remainingIndices: number[] = [];
    
    tools.forEach((tool, index) => {
      if (tool.status === 'idle' && (
        (selectedTools.size > 0 && selectedTools.has(tool.id)) || 
        (selectedTools.size === 0 && (
          (tool.httpChain === 'DNS' && httpFilters.dns) ||
          (tool.httpCode && tool.httpCode >= 200 && tool.httpCode < 300 && httpFilters.success) ||
          (tool.httpCode && tool.httpCode >= 300 && tool.httpCode < 400 && httpFilters.redirect) ||
          (tool.httpCode && tool.httpCode >= 400 && tool.httpCode < 500 && httpFilters.clientError) ||
          (tool.httpCode && tool.httpCode >= 500 && httpFilters.serverError) ||
          ((!tool.httpCode && !tool.httpChain) && httpFilters.none)
        ))
      )) {
        remainingIndices.push(index);
      }
    });
    
    if (remainingIndices.length === 0) {
      alert('Tous les outils ont été traités.');
      return;
    }
    
    // Limiter la nouvelle file d'attente au maximum autorisé
    const newQueue = remainingIndices.slice(0, MAX_PROCESSING_ITEMS);
    setProcessingQueue(newQueue);
    setSessionCompleted(0);
    setTotalToProcess(newQueue.length);
    setIsRunning(true);
    setIsCompleted(false);
  }, [tools, httpFilters, selectedTools, isCompleted]);

  const handleUpdateDatabase = async () => {
    try {
      const successfulTools = tools.filter(tool => tool.status === 'success' && !tool.dbUpdated);
      
      for (const tool of successfulTools) {
          try {
            const updateResponse = await fetch(`/api/tools/${tool.slug}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: tool.name,
                logoUrl: tool.logoUrl,
              websiteUrl: tool.websiteUrl,
              httpCode: tool.httpCode,
              httpChain: tool.httpChain
              }),
            });

            if (!updateResponse.ok) {
              const errorData = await updateResponse.json();
              console.error(`Erreur lors de la mise à jour de ${tool.name}:`, errorData);
              continue;
            }

            setTools(prevTools => {
              const newTools = [...prevTools];
              const index = newTools.findIndex(t => t.id === tool.id);
              if (index !== -1) {
                newTools[index].dbUpdated = true;
              }
              return newTools;
            });
          } catch (toolError) {
            console.error(`Erreur lors de la mise à jour de ${tool.name}:`, toolError);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la base de données:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Applique la pagination après le filtrage
  const paginatedTools = filteredTools.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredTools.length / itemsPerPage);

  const totalTools = tools.length;
  const filteredToolsCount = filteredTools.length;
  const successfulScreenshots = tools.filter(tool => tool.status === 'success').length;
  const failedScreenshots = tools.filter(tool => tool.status === 'error').length;
  const pendingScreenshots = tools.filter(tool => tool.status === 'idle').length;

  // Calculer le nombre d'outils sélectionnés
  const selectedToolsCount = useMemo(() => {
    if (selectedTools.size === 0) {
      return filteredToolsCount; // Si aucun outil n'est sélectionné, afficher le nombre d'outils filtrés
    }
    
    // Si des outils sont sélectionnés, compter combien correspondent également aux filtres actifs
    const anyHttpFilterActive = Object.values(httpFilters).some(value => value);
    const anyImageFilterActive = Object.values(imageFilters).some(value => value);
    
    return tools.filter((tool) => {
      if (!selectedTools.has(tool.id)) return false;
      
      // Vérifier les filtres HTTP si au moins un est actif
      const matchesHttpFilter = !anyHttpFilterActive || (
        (tool.httpChain === 'DNS' && httpFilters.dns) ||
        (tool.httpCode && tool.httpCode >= 200 && tool.httpCode < 300 && httpFilters.success) ||
        (tool.httpCode && tool.httpCode >= 300 && tool.httpCode < 400 && httpFilters.redirect) ||
        (tool.httpCode && tool.httpCode >= 400 && tool.httpCode < 500 && httpFilters.clientError) ||
        (tool.httpCode && tool.httpCode >= 500 && httpFilters.serverError) ||
        ((!tool.httpCode && !tool.httpChain) && httpFilters.none)
      );
      
      // Vérifier les filtres d'image si au moins un est actif
      const matchesImageFilter = !anyImageFilterActive || (
        (tool.logoUrl && imageFilters.exists) ||
        (!tool.logoUrl && imageFilters.missing)
      );
      
      return matchesHttpFilter && matchesImageFilter;
    }).length;
  }, [tools, selectedTools, httpFilters, imageFilters, filteredToolsCount]);

  // Fonction pour le rendu des statuts HTTP avec couleurs
  const renderHttpStatus = (code: number | null | undefined, chain: string | null | undefined) => {
    if (chain === 'DNS') {
      return <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 font-mono">DNS non résolu</span>;
    }
    
    if (!code && !chain) return <span className="text-gray-400">-</span>;
    
    const chainDisplay = chain || (code ? code.toString() : '');
    
    let bgColor = '';
    if (chain && chain.includes(' > ')) {
      // Cas d'une redirection
      bgColor = 'bg-blue-100 text-blue-800';
    } else if (code) {
      if (code === 200) {
        bgColor = 'bg-green-100 text-green-800';
      } else if (code >= 300 && code < 400) {
        bgColor = 'bg-blue-100 text-blue-800';
      } else if (code >= 400 && code < 500) {
        bgColor = 'bg-orange-100 text-orange-800';
      } else if (code >= 500) {
        bgColor = 'bg-red-100 text-red-800';
      }
    }
    
    return (
      <span className={`px-2 py-1 rounded ${bgColor} font-mono text-xs`}>
        {chainDisplay}
      </span>
    );
  };

  // Gestion de la déconnexion
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/admin');
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  };

  // Calcul des pages à afficher pour la pagination simplifiée
  const getPaginationItems = () => {
    // Toujours montrer la page courante
    const items = [currentPage];
    
    // Ajouter une page avant si possible
    if (currentPage > 1) {
      items.unshift(currentPage - 1);
    }
    
    // Ajouter une page après si possible
    if (currentPage < totalPages) {
      items.push(currentPage + 1);
    }
    
    // Si on a moins de 3 pages et qu'il y a plus de pages disponibles, en ajouter d'autres
    if (items.length < 3) {
      if (items[0] > 1) {
        items.unshift(items[0] - 1);
      } else if (items[items.length - 1] < totalPages) {
        items.push(items[items.length - 1] + 1);
      }
    }
    
    return items;
  };

  // Pages à afficher
  const paginationItems = getPaginationItems();

  // Fonction pour purger les images sélectionnées
  const handlePurgeImages = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer les images sélectionnées ? Cette action est irréversible.')) {
      return;
    }
    
    setIsPurging(true);
    
    try {
      // Déterminer quels outils sont concernés (sélectionnés ou filtrés)
      let toolsToPurge: Tool[] = [];
      
      if (selectedTools.size > 0) {
        // Si des outils sont sélectionnés manuellement
        toolsToPurge = tools.filter(tool => 
          selectedTools.has(tool.id) && 
          tool.logoUrl && 
          ((tool.httpChain === 'DNS' && httpFilters.dns) ||
          (tool.httpCode && tool.httpCode >= 200 && tool.httpCode < 300 && httpFilters.success) ||
          (tool.httpCode && tool.httpCode >= 300 && tool.httpCode < 400 && httpFilters.redirect) ||
          (tool.httpCode && tool.httpCode >= 400 && tool.httpCode < 500 && httpFilters.clientError) ||
          (tool.httpCode && tool.httpCode >= 500 && httpFilters.serverError) ||
          ((!tool.httpCode && !tool.httpChain) && httpFilters.none))
        );
      } else {
        // Sinon, utiliser les outils filtrés qui ont une image
        toolsToPurge = filteredTools.filter(tool => tool.logoUrl);
      }
      
      if (toolsToPurge.length === 0) {
        alert('Aucune image à purger.');
        setIsPurging(false);
        return;
      }
      
      // Supprimer les images une par une
      for (const tool of toolsToPurge) {
        try {
          const response = await fetch(`/api/tools/${tool.slug}/purge-image`, {
            method: 'POST',
          });
          
          if (!response.ok) {
            console.error(`Erreur lors de la purge de l'image pour ${tool.name}:`, await response.text());
            continue;
          }
          
          // Mettre à jour l'état local
          setTools(prevTools => {
            const newTools = [...prevTools];
            const index = newTools.findIndex(t => t.id === tool.id);
            if (index !== -1) {
              newTools[index].logoUrl = '';
            }
            return newTools;
          });
        } catch (error) {
          console.error(`Erreur lors de la purge de l'image pour ${tool.name}:`, error);
        }
      }
      
      alert(`${toolsToPurge.length} image(s) purgée(s) avec succès.`);
    } catch (error) {
      console.error('Erreur lors de la purge des images:', error);
      alert('Une erreur est survenue lors de la purge des images.');
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Traitement par lot</h1>
          <p className="text-gray-500">Traitez plusieurs outils en même temps pour mettre à jour leur statut ou générer des captures d'écran.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleStartProcessing}
            disabled={isRunning || isCompleted || selectedTools.size === 0}
            className={`px-4 py-2 rounded-md ${
              isRunning || isCompleted || selectedTools.size === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRunning 
              ? `Traitement en cours... (${sessionCompleted}/${selectedTools.size})` 
              : 'Lancer le traitement'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Chargement des outils...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : (
        <div>
          <p className="text-lg text-gray-600 mb-6">
            Sélectionnez les outils à traiter et cliquez sur "Lancer le traitement".
          </p>

          {/* Tableau des outils */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedTools.size === tools.length && tools.length > 0}
                      onChange={handleSelectAll}
                      className="mr-2"
                    />
                    Nom
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tools.map((tool) => (
                  <tr key={tool.id} className={tool.status === 'success' ? 'bg-green-50' : tool.status === 'error' ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTools.has(tool.id)}
                          onChange={() => handleToolSelection(tool.id)}
                          disabled={isRunning}
                          className="mr-2"
                        />
                        <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                          {tool.websiteUrl}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tool.status === 'pending' && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          En cours...
                        </span>
                      )}
                      {tool.status === 'success' && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Succès
                        </span>
                      )}
                      {tool.status === 'error' && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Erreur: {tool.errorMessage}
                        </span>
                      )}
                      {!tool.status && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          En attente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {tools.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      Aucun outil disponible.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Sommaire */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Résumé du traitement</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">Total</p>
                <p className="text-2xl font-bold text-blue-800">{tools.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700 mb-1">Sélectionnés</p>
                <p className="text-2xl font-bold text-purple-800">{selectedTools.size}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700 mb-1">Traités avec succès</p>
                <p className="text-2xl font-bold text-green-800">
                  {tools.filter(t => t.status === 'success').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
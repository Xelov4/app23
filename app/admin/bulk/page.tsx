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

export default function BulkActionsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeProcesses, setActiveProcesses] = useState(0);
  const [processingQueue, setProcessingQueue] = useState<number[]>([]);
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [isPurging, setIsPurging] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState<number>(0);
  const [totalToProcess, setTotalToProcess] = useState<number>(0);
  
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
    // Vérifier si l'utilisateur est connecté
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session');
        const data = await response.json();
        
        if (!data.authenticated) {
          router.push('/admin');
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de session:', err);
        router.push('/admin');
      }
    };
    
    checkSession();

    // Charger les outils depuis l'API
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/tools');
        const data = await response.json();
        setTools(data.map((tool: any) => ({ ...tool, status: 'idle', dbUpdated: false })));
      } catch (error) {
        console.error('Erreur lors du chargement des outils:', error);
      }
    };

    fetchTools();
  }, [router]);

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-10 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-4 font-bold text-xl border-b border-gray-700">
          Administration
        </div>

        <div className="p-4">
          {/* Menu Content */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3 text-gray-300">Contenu</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center py-2 px-3 rounded hover:bg-gray-700"
                >
                  <span className="mr-2">🛠️</span>
                  <span>Outils</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center py-2 px-3 rounded hover:bg-gray-700"
                >
                  <span className="mr-2">📂</span>
                  <span>Catégories</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center py-2 px-3 rounded hover:bg-gray-700"
                >
                  <span className="mr-2">🏷️</span>
                  <span>Tags</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Menu Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3 text-gray-300">Actions</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/admin/bulk"
                  className="flex items-center py-2 px-3 rounded bg-blue-600"
                >
                  <span className="mr-2">📷</span>
                  <span>Détection HTTP</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-sm text-gray-300 hover:text-white">
              Voir le site
            </Link>
          <button
              onClick={handleLogout}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Déconnexion
          </button>
          </div>
        </div>
      </aside>

      {/* Toggle sidebar button for mobile */}
          <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-4 z-50 p-2 bg-gray-800 text-white rounded-r-md md:hidden ${sidebarOpen ? 'left-64' : 'left-0'}`}
          >
        {sidebarOpen ? '←' : '→'}
          </button>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Administration Video-IA.net</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Détection HTTP & Capture d'écran</h1>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Total d'outils</h3>
                <p className="text-3xl font-bold text-gray-800">{totalTools}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Captures réussies</h3>
                <p className="text-3xl font-bold text-green-600">{successfulScreenshots}</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Captures échouées</h3>
                <p className="text-3xl font-bold text-red-600">{failedScreenshots}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">En cours / En attente</h3>
                <p className="text-3xl font-bold text-blue-600">{activeProcesses} / {pendingScreenshots}</p>
              </div>
            </div>

            {/* Filtres et options */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Filtre par statut HTTP */}
                <div>
                  <h3 className="text-md font-semibold mb-3">Filtrer par statut HTTP:</h3>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={httpFilters.dns} 
                        onChange={() => setHttpFilters({...httpFilters, dns: !httpFilters.dns})}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">DNS non résolu</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={httpFilters.success} 
                        onChange={() => setHttpFilters({...httpFilters, success: !httpFilters.success})}
                        className="form-checkbox h-4 w-4 text-green-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Succès (2xx)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={httpFilters.redirect} 
                        onChange={() => setHttpFilters({...httpFilters, redirect: !httpFilters.redirect})}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Redirection (3xx)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={httpFilters.clientError} 
                        onChange={() => setHttpFilters({...httpFilters, clientError: !httpFilters.clientError})}
                        className="form-checkbox h-4 w-4 text-orange-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Erreur client (4xx)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={httpFilters.serverError} 
                        onChange={() => setHttpFilters({...httpFilters, serverError: !httpFilters.serverError})}
                        className="form-checkbox h-4 w-4 text-red-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Erreur serveur (5xx)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={httpFilters.none} 
                        onChange={() => setHttpFilters({...httpFilters, none: !httpFilters.none})}
                        className="form-checkbox h-4 w-4 text-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Non vérifiés</span>
                    </label>
                  </div>
                  
                  <h3 className="text-md font-semibold mb-3 mt-4">Filtrer par statut image:</h3>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={imageFilters.exists} 
                        onChange={() => setImageFilters({...imageFilters, exists: !imageFilters.exists})}
                        className="form-checkbox h-4 w-4 text-green-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Image existante</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={imageFilters.missing} 
                        onChange={() => setImageFilters({...imageFilters, missing: !imageFilters.missing})}
                        className="form-checkbox h-4 w-4 text-red-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Image non existante</span>
                    </label>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    Outils filtrés: <span className="font-semibold">{filteredToolsCount}</span> sur {totalTools}
                  </div>
                </div>
                
                {/* Options de pagination */}
                <div>
                  <h3 className="text-md font-semibold mb-3">Éléments par page:</h3>
                  <select 
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="block w-full md:w-48 p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>{size} outils par page</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="space-x-2">
                <button
                  onClick={handleStart}
                  disabled={isRunning}
                  className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${
                    isRunning ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isRunning 
                    ? `Traitement en cours... (${sessionCompleted}/${totalToProcess})` 
                    : `Lancer la détection pour ${selectedToolsCount > MAX_PROCESSING_ITEMS ? MAX_PROCESSING_ITEMS + '/' + selectedToolsCount : selectedToolsCount} outils`}
                </button>
                
                <button
                  onClick={handlePurgeImages}
                  disabled={isRunning || isPurging}
                  className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 ${
                    isRunning || isPurging ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isPurging ? 'Purge en cours...' : 'Purger les images'}
                </button>
                
                {isCompleted && (
                  <button
                    onClick={handleContinueProcessing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Continuer le traitement
                  </button>
                )}
              </div>

              {isCompleted && (
                <button
                  onClick={handleUpdateDatabase}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Mettre à jour la base de données
                </button>
              )}
            </div>

            {/* Indicateur de progression pour la session */}
            {isRunning && (
              <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Progression de la session actuelle:</span>
                  <span>{sessionCompleted} sur {Math.min(totalToProcess, MAX_PROCESSING_ITEMS)} outils</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full" 
                    style={{ 
                      width: `${totalToProcess > 0 ? (sessionCompleted / Math.min(totalToProcess, MAX_PROCESSING_ITEMS)) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Limite de {MAX_PROCESSING_ITEMS} outils par session. 
                  {totalToProcess > MAX_PROCESSING_ITEMS && 
                    ` Il restera ${totalToProcess - MAX_PROCESSING_ITEMS} outils à traiter.`
                  }
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="mb-2 grid grid-cols-13 gap-2 font-bold text-sm">
                <div className="col-span-1">
                  <label className="inline-flex items-center">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAllTools}
                      checked={paginatedTools.length > 0 && paginatedTools.every(tool => selectedTools.has(tool.id))}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                  </label>
                </div>
                <div className="col-span-3">Nom</div>
                <div className="col-span-4">URL</div>
                <div className="col-span-2">Statut HTTP</div>
                <div className="col-span-2">Capture</div>
                <div className="col-span-1">Actions</div>
              </div>
              
          {paginatedTools.map(tool => (
                <div key={tool.id} className="grid grid-cols-13 gap-2 mb-2 p-2 border rounded-lg items-center">
                  <div className="col-span-1">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedTools.has(tool.id)}
                        onChange={() => handleToolSelection(tool.id)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                    </label>
                  </div>
                  <div className="col-span-3">
                    <p className="font-medium text-sm">{tool.name}</p>
                    <p className="text-xs text-gray-500">{tool.slug}</p>
                  </div>
                  <div className="col-span-4">
                    <a 
                      href={tool.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-600 hover:underline break-all"
                    >
                      {tool.websiteUrl}
                    </a>
                  </div>
                  <div className="col-span-2">
                    {renderHttpStatus(tool.httpCode, tool.httpChain)}
                  </div>
                  <div className="col-span-2">
                    {tool.status === 'loading' ? (
                      <div className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-blue-500">Chargement...</span>
                      </div>
                    ) : tool.status === 'success' ? (
                      <div className="flex flex-col items-start space-y-2">
                        <span className={`px-2 py-1 rounded ${tool.httpCode === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {tool.httpCode === 200 ? 'success' : 'failed'}
                        </span>
                        <div className="text-xs text-gray-600 mt-1">
                          Status HTTP: {renderHttpStatus(tool.httpCode, tool.httpChain)}
                        </div>
                        <img 
                          src={tool.logoUrl} 
                          alt={tool.name} 
                          className="max-h-16 max-w-full object-contain"
                        />
                      </div>
                    ) : tool.status === 'error' ? (
                      <div className="flex flex-col items-start space-y-2">
                        <span className="px-2 py-1 rounded bg-red-100 text-red-800">failed</span>
                        <div className="text-xs text-gray-600 mt-1">
                          Status HTTP: {renderHttpStatus(tool.httpCode, tool.httpChain)}
                        </div>
                        <span className="text-red-500 text-sm">{tool.errorCode}</span>
                      </div>
                    ) : tool.logoUrl ? (
                      <div className="flex flex-col items-start space-y-2">
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">Image existante</span>
                        <div className="text-xs text-gray-600 mt-1">
                          Status HTTP: {renderHttpStatus(tool.httpCode, tool.httpChain)}
                        </div>
                        <img 
                          src={tool.logoUrl} 
                          alt={tool.name} 
                          className="max-h-16 max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-start space-y-2">
                        <span className="text-gray-400">Aucune image</span>
                        <div className="text-xs text-gray-600 mt-1">
                          Status HTTP: {renderHttpStatus(tool.httpCode, tool.httpChain)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="col-span-1">
                    {tool.logoUrl && (
                      <Link 
                        href={`/admin/modify/tools/${tool.slug}`}
                        className="text-blue-600 hover:text-blue-900 text-xl"
                        title="Modifier"
                      >
                        ✏️
                      </Link>
                    )}
              </div>
            </div>
          ))}
        </div>

            {/* Pagination simplifiée */}
            <div className="mt-6 flex justify-center items-center space-x-2">
              <button
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ←
              </button>
              
              {paginationItems.map(page => (
            <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
            </button>
          ))}
              
              <button
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                →
              </button>
            </div>
            
            <div className="mt-2 text-center text-xs text-gray-500">
              Page {currentPage} sur {totalPages}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
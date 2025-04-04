'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, Globe, Trash2, Save } from 'lucide-react';

// Interface pour les outils
interface Tool {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  logoUrl: string | null;
  httpCode?: number | null;
  httpChain?: string | null;
  isActive: boolean;
  status?: 'idle' | 'pending' | 'success' | 'error';
  toggleStatus?: 'idle' | 'pending' | 'success' | 'error';
  dbUpdated?: boolean;
  errorCode?: string;
}

// Interface pour les résultats du crawl
interface CrawlResult {
  id: string;
  httpCode: number;
  httpChain: string;
  finalUrl: string;
  error?: string;
}

// Constantes
const BATCH_SIZE = 5; // Traiter 5 outils à la fois
const MAX_PROCESSING_ITEMS = 50; // Limite de 50 outils par session
const PAGE_SIZE_OPTIONS = [10, 50, 100, 250, 500];

export default function ToolV2Page() {
  const router = useRouter();
  
  // États généraux
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la pagination et le tri
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // États pour le traitement par lots
  const [isRunning, setIsRunning] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeProcesses, setActiveProcesses] = useState(0);
  const [processingQueue, setProcessingQueue] = useState<number[]>([]);
  const [sessionCompleted, setSessionCompleted] = useState<number>(0);
  const [totalToProcess, setTotalToProcess] = useState<number>(0);
  const [isPurging, setIsPurging] = useState(false);
  
  // États pour la sélection
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
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
  
  // Filtre pour les images
  const [imageFilters, setImageFilters] = useState<{
    exists: boolean;
    missing: boolean;
  }>({
    exists: true,
    missing: true
  });

  // Vérifier la session utilisateur et charger les outils
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tools');
        if (!response.ok) throw new Error('Erreur lors du chargement des outils');
        
        const data = await response.json();
        setTools(data.map((tool: any) => ({
          ...tool,
          status: 'idle',
          toggleStatus: 'idle',
          dbUpdated: false
        })));
      } catch (err) {
        setError((err as Error).message);
        console.error('Erreur de récupération des outils:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Réinitialiser la page courante lors du changement d'items par page
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Fonction pour filtrer les outils
  const filteredTools = useMemo(() => {
    return tools
      .filter(tool => {
        // Filtre par terme de recherche
        const matchesSearch = searchTerm === '' || 
          tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.websiteUrl.toLowerCase().includes(searchTerm.toLowerCase());
        
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
        
        // Filtre par statut actif/inactif
        let matchesActiveFilter = true;
        if (activeFilter === 'active') {
          matchesActiveFilter = tool.isActive === true;
        } else if (activeFilter === 'inactive') {
          matchesActiveFilter = tool.isActive === false;
        }
        
        return matchesSearch && matchesHttpFilter && matchesImageFilter && matchesActiveFilter;
      })
      .sort((a, b) => {
        // Tri des outils
        if (sortColumn === 'name') {
          return sortDirection === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } 
        else if (sortColumn === 'websiteUrl') {
          return sortDirection === 'asc'
            ? a.websiteUrl.localeCompare(b.websiteUrl)
            : b.websiteUrl.localeCompare(a.websiteUrl);
        }
        else if (sortColumn === 'httpCode') {
          const codeA = a.httpCode || 0;
          const codeB = b.httpCode || 0;
          return sortDirection === 'asc'
            ? codeA - codeB
            : codeB - codeA;
        }
        else if (sortColumn === 'status') {
          // Trier par statut d'activation
          if (sortDirection === 'asc') {
            return a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1;
          } else {
            return a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1;
          }
        }
        return 0;
      });
  }, [
    tools, 
    searchTerm, 
    httpFilters, 
    imageFilters,
    activeFilter,
    sortColumn,
    sortDirection
  ]);

  // Fonction pour paginer les outils
  const paginatedTools = useMemo(() => {
    return filteredTools.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredTools, currentPage, itemsPerPage]);
  
  const totalPages = Math.ceil(filteredTools.length / itemsPerPage);

  // Gérer la sélection/désélection de tous les outils
  useEffect(() => {
    if (selectAll) {
      // Sélectionner uniquement les outils affichés sur la page actuelle
      setSelectedTools(new Set(paginatedTools.map(tool => tool.id)));
    } else {
      setSelectedTools(new Set());
    }
  }, [selectAll, paginatedTools]);

  // Fonction pour basculer la sélection d'un outil
  const toggleToolSelection = (toolId: string) => {
    const newSelectedTools = new Set(selectedTools);
    if (newSelectedTools.has(toolId)) {
      newSelectedTools.delete(toolId);
    } else {
      newSelectedTools.add(toolId);
    }
    setSelectedTools(newSelectedTools);
    // Vérifier si tous les éléments de la page actuelle sont sélectionnés
    const allCurrentPageSelected = paginatedTools.every(tool => 
      newSelectedTools.has(tool.id)
    );
    setSelectAll(allCurrentPageSelected);
  };

  // Fonction pour changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  // Fonction pour afficher le statut du processus
  const getProcessStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Fonction pour afficher le statut d'activation
  const getToggleStatusClass = (isActive: boolean, toggleStatus: string | undefined) => {
    if (toggleStatus === 'pending') return 'bg-blue-100 text-blue-800';
    if (toggleStatus === 'error') return 'bg-red-100 text-red-800';
    
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
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

  // Fonction pour mettre à jour le statut actif/inactif d'un outil
  const toggleToolStatus = async (toolSlug: string, currentStatus: boolean) => {
    try {
      // Marquer l'outil comme "en cours de traitement"
      setTools(prev => 
        prev.map(tool => 
          tool.slug === toolSlug 
            ? { ...tool, toggleStatus: 'pending' } 
            : tool
        )
      );
      
      const response = await fetch(`/api/tools/${toolSlug}/toggle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }
      
      // Mettre à jour l'état local
      setTools(prevTools => 
        prevTools.map(tool => 
          tool.slug === toolSlug 
            ? { ...tool, isActive: !tool.isActive, toggleStatus: 'success' } 
            : tool
        )
      );
      
      // Remettre le statut du toggle à idle après 2 secondes
      setTimeout(() => {
        setTools(prevTools => 
          prevTools.map(tool => 
            tool.slug === toolSlug 
              ? { ...tool, toggleStatus: 'idle' } 
              : tool
          )
        );
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      
      // Marquer l'outil comme en erreur
      setTools(prevTools => 
        prevTools.map(tool => 
          tool.slug === toolSlug 
            ? { ...tool, toggleStatus: 'error' } 
            : tool
        )
      );
      
      // Remettre le statut du toggle à idle après 2 secondes
      setTimeout(() => {
        setTools(prevTools => 
          prevTools.map(tool => 
            tool.slug === toolSlug 
              ? { ...tool, toggleStatus: 'idle' } 
              : tool
          )
        );
      }, 2000);
    }
  };

  // Fonction pour traiter un lot d'outils (crawl)
  const processBatch = async (batch: Tool[]) => {
    try {
      // Marquer les outils comme "en cours de traitement"
      setTools(prev => 
        prev.map(tool => 
          batch.some(b => b.id === tool.id) 
            ? { ...tool, status: 'pending' } 
            : tool
        )
      );
      
      // Appeler l'API pour crawler ce lot
      const response = await fetch('/api/admin/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolIds: batch.map(tool => tool.id)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors du crawl: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Mettre à jour les outils avec les nouveaux codes HTTP
      setTools(prevTools => {
        const updatedTools = [...prevTools];
        
        result.results.forEach((crawlResult: CrawlResult) => {
          const index = updatedTools.findIndex(tool => tool.id === crawlResult.id);
          if (index !== -1) {
            updatedTools[index] = {
              ...updatedTools[index],
              httpCode: crawlResult.httpCode,
              httpChain: crawlResult.httpChain,
              websiteUrl: crawlResult.finalUrl || updatedTools[index].websiteUrl,
              status: crawlResult.error ? 'error' : 'success'
            };
          }
        });
        
        return updatedTools;
      });
      
      // Mettre à jour la base de données pour chaque outil traité
      for (const crawlResult of result.results) {
        try {
          const tool = tools.find(t => t.id === crawlResult.id);
          if (!tool) continue;
          
          const updateResponse = await fetch(`/api/tools/${tool.slug}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              httpCode: crawlResult.httpCode,
              httpChain: crawlResult.httpChain,
              websiteUrl: crawlResult.finalUrl || tool.websiteUrl
            }),
          });
          
          if (updateResponse.ok) {
            setTools(prevTools => {
              const newTools = [...prevTools];
              const index = newTools.findIndex(t => t.id === crawlResult.id);
              if (index !== -1) {
                newTools[index].dbUpdated = true;
              }
              return newTools;
            });
          } else {
            console.error(`Erreur lors de la mise à jour de la base de données pour ${tool.name}`);
          }
        } catch (error) {
          console.error(`Erreur lors de la mise à jour de la base de données:`, error);
        }
      }
      
      // Incrémenter le compteur de traitement
      setSessionCompleted(prev => prev + batch.length);
      
      return true;
    } catch (err) {
      console.error('Erreur lors du traitement du lot:', err);
      
      // Marquer les outils du lot comme en erreur
      setTools(prev => 
        prev.map(tool => 
          batch.some(b => b.id === tool.id) 
            ? { ...tool, status: 'error' } 
            : tool
        )
      );
      
      // Incrémenter le compteur de traitement (même si erreur)
      setSessionCompleted(prev => prev + batch.length);
      
      return false;
    }
  };

  // Fonction pour traiter un outil (screenshot)
  const processOneTool = useCallback(async (index: number): Promise<boolean> => {
    const tool = tools[index];
    if (!tool || tool.status !== 'idle') return false;

    setTools(prevTools => {
      const newTools = [...prevTools];
      if (newTools[index]) {
        newTools[index].status = 'pending';
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

      // Mettre à jour l'état local
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
      
      // Mettre à jour la base de données
      try {
        const updateResponse = await fetch(`/api/tools/${tool.slug}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            logoUrl: responseData.imageUrl,
            httpCode: responseData.httpCode,
            httpChain: responseData.httpChain
          }),
        });
        
        if (updateResponse.ok) {
          setTools(prevTools => {
            const newTools = [...prevTools];
            const toolIndex = newTools.findIndex(t => t.id === tool.id);
            if (toolIndex !== -1) {
              newTools[toolIndex].dbUpdated = true;
            }
            return newTools;
          });
        } else {
          console.error(`Erreur lors de la mise à jour de la base de données pour ${tool.name}`);
        }
      } catch (dbError) {
        console.error(`Erreur lors de la mise à jour de la base de données:`, dbError);
      }

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

  // Effet pour gérer le traitement par lots (screenshots)
  useEffect(() => {
    if (!isRunning || processingQueue.length === 0) {
      if (isRunning && processingQueue.length === 0) {
        setIsRunning(false);
        setIsCompleted(true);
        
        // Si tous les éléments de la session ont été traités
        if (sessionCompleted >= totalToProcess) {
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

    // Ne pas dépasser le nombre maximal de processus parallèles
    if (activeProcesses >= BATCH_SIZE) {
      return;
    }

    // Traiter le prochain outil dans la file d'attente
    const nextIndex = processingQueue[0];
    setProcessingQueue(prev => prev.slice(1));
    
    processOneTool(nextIndex).then(() => {
      setSessionCompleted(prev => prev + 1);
    });
  }, [
    isRunning, 
    processingQueue, 
    activeProcesses, 
    processOneTool, 
    sessionCompleted, 
    totalToProcess, 
    isCompleted
  ]);

  // Démarrer le traitement de screenshots
  const handleStartScreenshots = () => {
    // Reset des compteurs
    setSessionCompleted(0);
    setIsCompleted(false);
    
    // Déterminer quels outils doivent être traités
    let toolsToProcess: number[] = [];
    
    if (selectedTools.size > 0) {
      // Utiliser les outils sélectionnés
      toolsToProcess = tools
        .map((tool, index) => ({ tool, index }))
        .filter(({ tool }) => 
          selectedTools.has(tool.id) && 
          tool.status === 'idle' && 
          ((tool.httpChain === 'DNS' && httpFilters.dns) ||
          (tool.httpCode && tool.httpCode >= 200 && tool.httpCode < 300 && httpFilters.success) ||
          (tool.httpCode && tool.httpCode >= 300 && tool.httpCode < 400 && httpFilters.redirect) ||
          (tool.httpCode && tool.httpCode >= 400 && tool.httpCode < 500 && httpFilters.clientError) ||
          (tool.httpCode && tool.httpCode >= 500 && httpFilters.serverError) ||
          ((!tool.httpCode && !tool.httpChain) && httpFilters.none))
        )
        .map(({ index }) => index);
    } else {
      // Utiliser tous les outils filtrés
      toolsToProcess = filteredTools
        .map(filtered => tools.findIndex(tool => tool.id === filtered.id))
        .filter(index => index !== -1 && tools[index].status === 'idle');
    }
    
    // Limiter au nombre maximum d'éléments par session
    const limitedTools = toolsToProcess.slice(0, MAX_PROCESSING_ITEMS);
    
    // Si aucun outil à traiter, sortir
    if (limitedTools.length === 0) {
      alert('Aucun outil à traiter.');
      return;
    }
    
    // Définir le nombre total d'outils à traiter
    setTotalToProcess(limitedTools.length);
    
    // Démarrer le traitement
    setProcessingQueue(limitedTools);
    setIsRunning(true);
  };

  // Démarrer le crawl
  const handleStartCrawl = async () => {
    if (isCrawling) return;
    
    setIsCrawling(true);
    setSessionCompleted(0);
    
    try {
      // Déterminer quels outils doivent être traités
      let toolsToProcess: Tool[] = [];
      
      if (selectedTools.size > 0) {
        // Utiliser les outils sélectionnés
        toolsToProcess = tools.filter(tool => 
          selectedTools.has(tool.id) && 
          ((tool.httpChain === 'DNS' && httpFilters.dns) ||
          (tool.httpCode && tool.httpCode >= 200 && tool.httpCode < 300 && httpFilters.success) ||
          (tool.httpCode && tool.httpCode >= 300 && tool.httpCode < 400 && httpFilters.redirect) ||
          (tool.httpCode && tool.httpCode >= 400 && tool.httpCode < 500 && httpFilters.clientError) ||
          (tool.httpCode && tool.httpCode >= 500 && httpFilters.serverError) ||
          ((!tool.httpCode && !tool.httpChain) && httpFilters.none))
        );
      } else {
        // Utiliser tous les outils filtrés
        toolsToProcess = [...filteredTools];
      }
      
      // Si aucun outil à traiter, sortir
      if (toolsToProcess.length === 0) {
        alert('Aucun outil à crawler.');
        return;
      }
      
      // Limiter au nombre maximum d'éléments
      const limitedTools = toolsToProcess.slice(0, MAX_PROCESSING_ITEMS);
      setTotalToProcess(limitedTools.length);
      
      // Traiter par lots de BATCH_SIZE
      for (let i = 0; i < limitedTools.length; i += BATCH_SIZE) {
        const batch = limitedTools.slice(i, i + BATCH_SIZE);
        await processBatch(batch);
        
        // Pause entre les lots pour ne pas surcharger le serveur
        if (i + BATCH_SIZE < limitedTools.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Terminer
      alert(`Traitement terminé pour ${limitedTools.length} outils.`);
    } catch (error) {
      console.error('Erreur lors du crawl:', error);
      alert('Une erreur est survenue lors du crawl.');
    } finally {
      setIsCrawling(false);
    }
  };

  // Fonction pour purger les images
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

  // Mettre à jour la base de données
  const handleUpdateDatabase = async () => {
    try {
      const successfulTools = tools.filter(tool => 
        (tool.status === 'success' || tool.httpCode) && !tool.dbUpdated
      );
      
      if (successfulTools.length === 0) {
        alert('Aucun outil à mettre à jour dans la base de données.');
        return;
      }
      
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
      
      alert(`${successfulTools.length} outil(s) mis à jour dans la base de données.`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la base de données:', error);
      alert('Une erreur est survenue lors de la mise à jour de la base de données.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des outils</h1>
          <p className="text-gray-500">Gérez tous les outils de la plateforme dans une interface avancée.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleStartScreenshots}
            disabled={isRunning || isCompleted || selectedTools.size === 0}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              isRunning || isCompleted || selectedTools.size === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Capturer</span>
          </button>
          
          <button
            onClick={handleStartCrawl}
            disabled={isCrawling || selectedTools.size === 0}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              isCrawling || selectedTools.size === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Tester URLs</span>
          </button>
          
          <button
            onClick={handlePurgeImages}
            disabled={isPurging}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              isPurging
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <Trash2 className="h-4 w-4" />
            <span>Purger</span>
          </button>
          
          <button
            onClick={handleUpdateDatabase}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Chargement des outils...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          {error}
        </div>
      ) : (
        <div>
          <p className="text-lg text-gray-600 mb-8">
            Cette page combine les fonctionnalités de crawl et de bulk actions pour une gestion plus efficace des outils.
          </p>
          
          {/* Section des filtres et des options */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Filtres et Options</h2>
            
            <div className="flex flex-col space-y-6">
              {/* Recherche et filtres basiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Recherche */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Rechercher par nom ou URL..."
                      className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Filtre par statut d'activation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut d'activation</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveFilter('all')}
                      className={`px-3 py-2 text-sm rounded-md flex-1 ${
                        activeFilter === 'all' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setActiveFilter('active')}
                      className={`px-3 py-2 text-sm rounded-md flex-1 ${
                        activeFilter === 'active' 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      Actifs
                    </button>
                    <button
                      onClick={() => setActiveFilter('inactive')}
                      className={`px-3 py-2 text-sm rounded-md flex-1 ${
                        activeFilter === 'inactive' 
                          ? 'bg-red-100 text-red-800 border border-red-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      Inactifs
                    </button>
                  </div>
                </div>
                
                {/* Éléments par page */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Éléments par page</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>{size} outils</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Filtres avancés */}
              <div>
                <div className="flex items-center mb-2">
                  <h3 className="text-md font-semibold">Filtres avancés</h3>
                  <div className="ml-4 flex">
                    <button
                      onClick={() => {
                        setHttpFilters({
                          dns: true,
                          success: true,
                          redirect: true,
                          clientError: true,
                          serverError: true,
                          none: true
                        });
                        setImageFilters({
                          exists: true,
                          missing: true
                        });
                      }}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      Tout sélectionner
                    </button>
                    <button
                      onClick={() => {
                        setHttpFilters({
                          dns: false,
                          success: false,
                          redirect: false,
                          clientError: false,
                          serverError: false,
                          none: false
                        });
                        setImageFilters({
                          exists: false,
                          missing: false
                        });
                      }}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 ml-2"
                    >
                      Tout désélectionner
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                  {/* Filtres HTTP */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 text-gray-700">Statut HTTP</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center bg-white p-2 rounded border border-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={httpFilters.dns}
                          onChange={() => setHttpFilters(prev => ({ ...prev, dns: !prev.dns }))}
                          className="mr-2"
                        />
                        <span className="text-sm">DNS non résolu</span>
                      </label>
                      <label className="flex items-center bg-white p-2 rounded border border-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={httpFilters.success}
                          onChange={() => setHttpFilters(prev => ({ ...prev, success: !prev.success }))}
                          className="mr-2"
                        />
                        <span className="text-sm">2xx (Succès)</span>
                      </label>
                      <label className="flex items-center bg-white p-2 rounded border border-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={httpFilters.redirect}
                          onChange={() => setHttpFilters(prev => ({ ...prev, redirect: !prev.redirect }))}
                          className="mr-2"
                        />
                        <span className="text-sm">3xx (Redirection)</span>
                      </label>
                      <label className="flex items-center bg-white p-2 rounded border border-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={httpFilters.clientError}
                          onChange={() => setHttpFilters(prev => ({ ...prev, clientError: !prev.clientError }))}
                          className="mr-2"
                        />
                        <span className="text-sm">4xx (Erreur client)</span>
                      </label>
                      <label className="flex items-center bg-white p-2 rounded border border-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={httpFilters.serverError}
                          onChange={() => setHttpFilters(prev => ({ ...prev, serverError: !prev.serverError }))}
                          className="mr-2"
                        />
                        <span className="text-sm">5xx (Erreur serveur)</span>
                      </label>
                      <label className="flex items-center bg-white p-2 rounded border border-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={httpFilters.none}
                          onChange={() => setHttpFilters(prev => ({ ...prev, none: !prev.none }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Non vérifié</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Filtres d'image */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 text-gray-700">Statut d'image</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center bg-white p-2 rounded border border-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={imageFilters.exists}
                          onChange={() => setImageFilters(prev => ({ ...prev, exists: !prev.exists }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Avec image</span>
                      </label>
                      <label className="flex items-center bg-white p-2 rounded border border-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={imageFilters.missing}
                          onChange={() => setImageFilters(prev => ({ ...prev, missing: !prev.missing }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Sans image</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sommaire */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Sommaire</h2>
            <div className="flex flex-wrap gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">Total des outils</p>
                <p className="text-2xl font-bold text-blue-800">{tools.length}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700">Outils filtrés</p>
                <p className="text-2xl font-bold text-green-800">{filteredTools.length}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-700">Outils sélectionnés</p>
                <p className="text-2xl font-bold text-purple-800">{selectedTools.size}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-sm text-amber-700">Page actuelle</p>
                <p className="text-2xl font-bold text-amber-800">{currentPage} / {totalPages}</p>
              </div>
            </div>
          </div>
          
          {/* Tableau des outils */}
          <div className="bg-white shadow-md rounded-lg mb-8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={() => setSelectAll(!selectAll)}
                            className="mr-2"
                            title="Sélectionner tous les éléments affichés"
                          />
                          <button 
                            onClick={() => {
                              setSortColumn('name');
                              setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                            }}
                            className="hover:text-gray-700 flex items-center"
                          >
                            Nom 
                            {sortColumn === 'name' && (
                              <span className="ml-1">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </div>
                        <span className="ml-2 text-xs text-gray-400 font-normal hidden md:inline">
                          (sélectionne la page courante)
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => {
                          setSortColumn('websiteUrl');
                          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                        }}
                        className="hover:text-gray-700 flex items-center"
                      >
                        URL 
                        {sortColumn === 'websiteUrl' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => {
                          setSortColumn('httpCode');
                          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                        }}
                        className="hover:text-gray-700 flex items-center"
                      >
                        HTTP 
                        {sortColumn === 'httpCode' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Logo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button 
                        onClick={() => {
                          setSortColumn('status');
                          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                        }}
                        className="hover:text-gray-700 flex items-center"
                      >
                        Statut 
                        {sortColumn === 'status' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTools.map((tool) => (
                    <tr key={tool.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedTools.has(tool.id)}
                            onChange={() => toggleToolSelection(tool.id)}
                            className="mr-2"
                          />
                          <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 max-w-[250px] truncate">
                          <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                            {tool.websiteUrl}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderHttpStatus(tool.httpCode, tool.httpChain)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tool.logoUrl ? (
                          <div className="w-10 h-10 rounded-md overflow-hidden">
                            <img 
                              src={tool.logoUrl} 
                              alt={`Logo de ${tool.name}`} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded ${getToggleStatusClass(tool.isActive, tool.toggleStatus)}`}>
                          {tool.toggleStatus === 'pending' 
                            ? 'En cours...' 
                            : (tool.isActive ? 'Actif' : 'Inactif')}
                        </span>
                        
                        {tool.status && tool.status !== 'idle' && (
                          <span className={`ml-2 px-2 py-1 rounded ${getProcessStatusClass(tool.status)}`}>
                            {tool.status === 'pending' ? 'En cours' : 
                             tool.status === 'success' ? 'Succès' : 
                             tool.status === 'error' ? 'Erreur' : ''}
                          </span>
                        )}
                        
                        {tool.dbUpdated && (
                          <span className="ml-2 px-2 py-1 rounded bg-purple-100 text-purple-800">
                            DB mise à jour
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleToolStatus(tool.slug, tool.isActive)}
                            className="text-blue-600 hover:text-blue-800"
                            disabled={tool.toggleStatus === 'pending'}
                          >
                            {tool.isActive ? 'Désactiver' : 'Activer'}
                          </button>
                          <Link
                            href={`/admin/modify/tools/${tool.slug}`}
                            className="text-green-600 hover:text-green-800"
                          >
                            Éditer
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {paginatedTools.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        Aucun outil trouvé avec les filtres actuels.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-l-md border ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-gray-50'
                }`}
              >
                &laquo;
              </button>
              
              {paginationItems.map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border-t border-b ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-r-md border ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-gray-50'
                }`}
              >
                &raquo;
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
} 
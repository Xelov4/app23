'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  httpCode?: number | null;
  httpChain?: string | null;
  isActive: boolean;
  status?: 'idle' | 'pending' | 'success' | 'error';
  toggleStatus?: 'idle' | 'pending' | 'success' | 'error';
  pricingDetails?: string;
}

interface CrawlResult {
  id: string;
  httpCode: number;
  httpChain: string;
  finalUrl: string;
  error?: string;
}

export default function WebsiteCrawlerPage() {
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCrawling, setIsCrawling] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [batchSize, setBatchSize] = useState(10);
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [dbUpdated, setDbUpdated] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session');
        const data = await response.json();
        
        if (!data.authenticated) {
          router.push('/admin');
        } else {
          fetchTools();
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de session:', err);
        router.push('/admin');
      }
    };
    
    checkSession();
  }, [router]);

  // Récupérer les outils
  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tools');
      if (!response.ok) throw new Error('Erreur lors du chargement des outils');
      const data = await response.json();
      
      // Transformer les données pour extraire les informations HTTP
      const formattedTools = data.map((tool: Tool) => {
        let httpChain = tool.httpChain;
        
        // Si httpChain n'existe pas mais que pricingDetails contient des infos HTTP, les extraire
        if (!httpChain && tool.pricingDetails && tool.pricingDetails.startsWith('HTTP Chain:')) {
          httpChain = tool.pricingDetails.replace('HTTP Chain:', '').trim();
        }
        
        return {
          ...tool,
          httpChain,
          status: 'idle',
          toggleStatus: 'idle'
        };
      });
      
      setTools(formattedTools);
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur de récupération des outils:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les outils selon les critères
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      // Filtre par terme de recherche
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.websiteUrl.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre par statut HTTP
      let matchesStatus = true;
      if (statusFilter === 'error') {
        matchesStatus = !tool.httpCode || tool.httpCode >= 400 || tool.httpCode < 200;
      } else if (statusFilter === 'success') {
        matchesStatus = !!tool.httpCode && tool.httpCode >= 200 && tool.httpCode < 300;
      } else if (statusFilter === 'redirect') {
        matchesStatus = !!tool.httpCode && tool.httpCode >= 300 && tool.httpCode < 400;
      } else if (statusFilter === 'dns') {
        matchesStatus = tool.httpChain === 'DNS';
      } else if (statusFilter === 'notcrawled') {
        matchesStatus = !tool.httpCode && (!tool.httpChain || tool.httpChain === '' || tool.httpChain === 'undefined');
      }
      
      // Filtre par statut actif/inactif
      let matchesActive = true;
      if (activeFilter === 'active') {
        matchesActive = tool.isActive === true;
      } else if (activeFilter === 'inactive') {
        matchesActive = tool.isActive === false;
      }
      
      return matchesSearch && matchesStatus && matchesActive;
    });
  }, [tools, searchTerm, statusFilter, activeFilter]);

  // Gérer la sélection/désélection de tous les outils
  useEffect(() => {
    if (selectAll) {
      setSelectedTools(filteredTools.map(tool => tool.id));
    } else {
      setSelectedTools([]);
    }
  }, [selectAll, filteredTools]);

  // Basculer le statut actif/inactif d'un outil
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

  // Traiter un lot d'outils
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
      
      // Vérifier si les données ont été mises à jour dans la base de données
      if (result.dbUpdated) {
        setDbUpdated(true);
      }
      
      // Mettre à jour les outils avec les nouveaux codes HTTP
      setTools(prevTools => {
        const updatedTools = [...prevTools];
        
        result.results.forEach((crawlResult: CrawlResult) => {
          const index = updatedTools.findIndex(tool => tool.id === crawlResult.id);
          if (index !== -1) {
            // Le résultat contient toutes les informations HTTP à jour
            updatedTools[index] = {
              ...updatedTools[index],
              httpCode: crawlResult.httpCode,
              httpChain: crawlResult.httpChain,
              // Stocker également dans pricingDetails pour conserver la cohérence
              pricingDetails: `HTTP Chain: ${crawlResult.httpChain}`,
              websiteUrl: crawlResult.finalUrl || updatedTools[index].websiteUrl,
              status: crawlResult.error ? 'error' : 'success'
            };
          }
        });
        
        return updatedTools;
      });
      
      // Incrémenter le compteur de traitement
      setProcessedCount(prev => prev + batch.length);
      
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
      
      setError((err as Error).message);
      return false;
    }
  };

  // Lancer le crawl
  const startCrawl = async () => {
    if (selectedTools.length === 0) {
      setError('Veuillez sélectionner au moins un outil');
      return;
    }

    setIsCrawling(true);
    setIsCompleted(false);
    setCrawlProgress(0);
    setProcessedCount(0);
    setError(null);
    setDbUpdated(false);

    try {
      // Préparer les outils à crawler
      const toolsToCrawl = tools.filter(tool => selectedTools.includes(tool.id));
      setTotalToProcess(toolsToCrawl.length);
      
      // Diviser en lots selon la taille configurée
      for (let i = 0; i < toolsToCrawl.length; i += batchSize) {
        const batch = toolsToCrawl.slice(i, i + batchSize);
        
        // Traiter ce lot
        await processBatch(batch);
        
        // Mettre à jour la progression
        const progress = Math.min(100, Math.round(((i + batch.length) / toolsToCrawl.length) * 100));
        setCrawlProgress(progress);
        
        // Attendre un peu pour éviter de surcharger le serveur
        if (i + batchSize < toolsToCrawl.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setCrawlProgress(100);
      setIsCompleted(true);
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur lors du crawl:', err);
    } finally {
      setIsCrawling(false);
    }
  };

  // Toggle la sélection d'un outil
  const toggleToolSelection = (toolId: string) => {
    setSelectedTools(prev => {
      if (prev.includes(toolId)) {
        return prev.filter(id => id !== toolId);
      } else {
        return [...prev, toolId];
      }
    });
  };

  // Obtenir la classe CSS pour le code HTTP
  const getHttpStatusClass = (httpCode: number | null | undefined, httpChain: string | null | undefined) => {
    if (httpChain === 'DNS') return 'bg-purple-100 text-purple-800';
    if (httpCode === null || httpCode === undefined) return 'bg-gray-200 text-gray-800';
    if (httpCode >= 200 && httpCode < 300) return 'bg-green-100 text-green-800';
    if (httpCode >= 300 && httpCode < 400) return 'bg-yellow-100 text-yellow-800';
    if (httpCode >= 400) return 'bg-red-100 text-red-800';
    return 'bg-gray-200 text-gray-800';
  };

  // Obtenir le texte pour le code HTTP
  const getHttpStatusText = (httpCode: number | null | undefined, httpChain: string | null | undefined) => {
    if (httpChain === 'DNS') return 'Erreur DNS';
    if (httpCode === null || httpCode === undefined) return 'Non vérifié';
    if (httpCode === 0) return `Erreur de connexion`;
    if (httpCode >= 200 && httpCode < 300) return `${httpCode} - OK`;
    if (httpCode >= 300 && httpCode < 400) return `${httpCode} - Redirection`;
    if (httpCode >= 400 && httpCode < 500) return `${httpCode} - Erreur client`;
    if (httpCode >= 500) return `${httpCode} - Erreur serveur`;
    return `${httpCode} - Inconnu`;
  };

  // Obtenir la classe CSS pour le statut de traitement
  const getProcessStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'pending': return 'animate-pulse bg-blue-50';
      case 'success': return 'bg-green-50';
      case 'error': return 'bg-red-50';
      default: return '';
    }
  };

  // Obtenir la classe CSS pour le bouton toggle
  const getToggleStatusClass = (isActive: boolean, toggleStatus: string | undefined) => {
    if (toggleStatus === 'pending') return 'animate-pulse opacity-50 cursor-wait';
    if (toggleStatus === 'error') return 'opacity-50';
    return '';
  };

  // Fonction pour afficher les détails d'un outil
  const showToolDetails = (toolId: string) => {
    if (selectedToolId === toolId) {
      setSelectedToolId(null); // Fermer le détail si déjà ouvert
    } else {
      setSelectedToolId(toolId); // Ouvrir le détail
    }
  };

  // Ajouter un composant pour afficher les détails HTTP complets
  const HttpDetailCard = ({ tool }: { tool: any }) => {
    return (
      <div className="p-4 mb-4 bg-white border rounded-md shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">{tool.name}</h3>
          <button 
            onClick={() => setSelectedToolId(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            Fermer
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">URL du site</h4>
            <a 
              href={tool.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {tool.websiteUrl}
            </a>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Code HTTP</h4>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getHttpStatusClass(tool.httpCode, tool.httpChain)}`}>
              {tool.httpCode || 'Non disponible'}
            </span>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Chaîne de redirection</h4>
            <div className="bg-gray-50 p-3 rounded font-mono text-sm overflow-x-auto">
              {tool.httpChain || (tool.pricingDetails?.startsWith('HTTP Chain:') 
                ? tool.pricingDetails.replace('HTTP Chain:', '').trim() 
                : 'Non disponible')}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Statut de mise à jour</h4>
            <div className="flex items-center">
              {tool.status === 'success' ? (
                <span className="text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mis à jour avec succès
                </span>
              ) : tool.status === 'error' ? (
                <span className="text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Erreur lors de la mise à jour
                </span>
              ) : (
                <span className="text-gray-500">Non traité</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md h-screen p-4">
          <h2 className="text-xl font-bold mb-6">Administration</h2>
          <nav>
            <Link href="/admin/dashboard" className="block py-2 px-4 mb-1 rounded hover:bg-gray-100">
              Tableau de bord
            </Link>
            <Link href="/admin/crawl" className="block py-2 px-4 mb-1 rounded bg-blue-100 text-blue-800">
              Vérificateur d'URLs
            </Link>
            <Link href="/admin/add/tool" className="block py-2 px-4 mb-1 rounded hover:bg-gray-100">
              Ajouter un outil
            </Link>
            <Link href="/admin/bulk" className="block py-2 px-4 mb-1 rounded hover:bg-gray-100">
              Import en masse
            </Link>
          </nav>
        </div>
        
        {/* Contenu principal */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Vérificateur d'URLs des outils</h1>
          
          {error && (
            <div className="mb-4 bg-red-100 p-3 rounded text-red-700">
              {error}
            </div>
          )}
          
          {/* Options de configuration */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taille du lot
                </label>
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                  disabled={isCrawling}
                >
                  <option value="5">5 outils par lot</option>
                  <option value="10">10 outils par lot</option>
                  <option value="20">20 outils par lot</option>
                  <option value="50">50 outils par lot</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer par statut HTTP
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                  disabled={isCrawling}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="success">Succès (200-299)</option>
                  <option value="redirect">Redirections (300-399)</option>
                  <option value="error">Erreurs (400+)</option>
                  <option value="dns">Erreurs DNS</option>
                  <option value="notcrawled">URLs non vérifiées</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer par état
                </label>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                  disabled={isCrawling}
                >
                  <option value="all">Tous les états</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recherche
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom ou URL..."
                  className="w-full p-2 border rounded"
                  disabled={isCrawling}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={startCrawl}
                disabled={isCrawling || selectedTools.length === 0}
                className={`px-4 py-2 rounded ${
                  isCrawling || selectedTools.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCrawling ? 'Vérification en cours...' : 'Vérifier les URLs sélectionnées'}
              </button>
              
              <span className="ml-4 text-gray-700">
                {selectedTools.length} outil(s) sélectionné(s) sur {filteredTools.length}
              </span>
            </div>
            
            {isCrawling && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{ width: `${crawlProgress}%` }}
                  ></div>
                </div>
                <p className="text-center mt-1 text-sm text-gray-600">
                  {processedCount} sur {totalToProcess} ({crawlProgress}% complété)
                </p>
              </div>
            )}
          </div>
          
          {/* Tableau des outils */}
          <div className="bg-white shadow rounded">
            {isLoading ? (
              <div className="p-8 text-center">Chargement des outils...</div>
            ) : filteredTools.length === 0 ? (
              <div className="p-8 text-center">Aucun outil ne correspond aux critères</div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-2 px-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={() => setSelectAll(!selectAll)}
                        disabled={isCrawling}
                        className="mr-2"
                      />
                    </th>
                    <th className="py-2 px-4 text-left">Nom</th>
                    <th className="py-2 px-4 text-left">URL du site</th>
                    <th className="py-2 px-4 text-left">Statut HTTP</th>
                    <th className="py-2 px-4 text-left">Chaîne</th>
                    <th className="py-2 px-4 text-center">État</th>
                    <th className="py-2 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTools.map((tool) => (
                    <tr key={tool.id} className={`border-b hover:bg-gray-50 ${getProcessStatusClass(tool.status)}`}>
                      <td className="py-2 px-4">
                        <input
                          type="checkbox"
                          checked={selectedTools.includes(tool.id)}
                          onChange={() => toggleToolSelection(tool.id)}
                          disabled={isCrawling}
                        />
                      </td>
                      <td className="py-2 px-4 font-medium">{tool.name}</td>
                      <td className="py-2 px-4">
                        <a
                          href={tool.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {tool.websiteUrl}
                        </a>
                      </td>
                      <td className="py-2 px-4">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getHttpStatusClass(tool.httpCode, tool.httpChain)} cursor-pointer hover:opacity-80`}
                          onClick={() => showToolDetails(tool.id)}
                        >
                          {getHttpStatusText(tool.httpCode, tool.httpChain)}
                        </span>
                        {tool.status === 'success' && (
                          <span className="ml-1 text-xs text-green-600">
                            ✓ Mis à jour
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-xs">
                        {tool.status === 'pending' ? (
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full">En cours...</span>
                        ) : (
                          <span className="font-mono">
                            {tool.httpChain || (tool.pricingDetails?.startsWith('HTTP Chain:') 
                              ? tool.pricingDetails.replace('HTTP Chain:', '').trim() 
                              : '-')}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tool.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tool.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-center">
                        <button
                          onClick={() => toggleToolStatus(tool.slug, tool.isActive)}
                          disabled={tool.toggleStatus === 'pending'}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            tool.isActive 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'bg-green-500 text-white hover:bg-green-600'
                          } ${getToggleStatusClass(tool.isActive, tool.toggleStatus)}`}
                        >
                          {tool.toggleStatus === 'pending'
                            ? 'En cours...'
                            : tool.isActive
                            ? 'Désactiver'
                            : 'Activer'
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {!isCrawling && isCompleted && dbUpdated && (
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-green-100 text-green-800 rounded-md">
                ✓ Les statuts HTTP ont été automatiquement mis à jour dans la base de données. 
                Ces informations sont désormais disponibles pour tous les outils.
              </div>
              <div className="p-3 bg-blue-100 text-blue-800 rounded-md">
                <h3 className="font-medium">Résumé des modifications:</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Codes HTTP mis à jour: {tools.filter(t => t.status === 'success').length}</li>
                  <li>• URLs avec erreurs: {tools.filter(t => t.status === 'error').length}</li>
                  <li>• Total des outils traités: {processedCount}</li>
                </ul>
              </div>
            </div>
          )}
          
          {selectedToolId && (
            <div className="mt-6">
              <HttpDetailCard tool={tools.find(t => t.id === selectedToolId)!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
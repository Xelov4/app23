"use client";

import { useState, useEffect } from 'react';
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

const ITEMS_PER_PAGE = 10;
const BATCH_SIZE = 5; // Traiter 5 outils à la fois

export default function BulkActionsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeProcesses, setActiveProcesses] = useState(0);

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

  useEffect(() => {
    if (isRunning) {
      // Fonction pour traiter un outil individuellement
      const processOneTool = async (tool: Tool, index: number): Promise<boolean> => {
        if (tool.status !== 'idle') return false;
          
        setTools(prevTools => {
          const newTools = [...prevTools];
          newTools[index].status = 'loading';
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

          let responseData;
          try {
            responseData = await response.json();
          } catch (jsonError) {
            console.error(`Erreur lors de l'analyse JSON pour ${tool.name}:`, jsonError);
            throw new Error(`Erreur de format: ${jsonError instanceof Error ? jsonError.message : 'Unexpected end of JSON input'}`);
          }

          // Même si le statut est 200, il peut y avoir une erreur dans le payload
          if (responseData.errorType === 'BROWSER_LAUNCH_ERROR') {
            throw new Error(`Erreur Puppeteer: ${responseData.error || 'Impossible de lancer le navigateur'}`);
          }

          if (!response.ok || !responseData.success || !responseData.imageUrl) {
            throw new Error(responseData.error || `Erreur lors de la capture d'écran (${response.status})`);
          }

          const imageUrl = responseData.imageUrl;
          setTools(prevTools => {
            const newTools = [...prevTools];
            newTools[index].status = 'success';
            newTools[index].logoUrl = imageUrl;
            newTools[index].httpCode = responseData.httpCode;
            newTools[index].httpChain = responseData.httpChain;
            return newTools;
          });
          
          return true;
        } catch (error) {
          console.error(`Erreur pour ${tool.name}:`, error);
          setTools(prevTools => {
            const newTools = [...prevTools];
            newTools[index].status = 'error';
            newTools[index].errorCode = error instanceof Error ? 
              (error.message.includes('Puppeteer') ? 
                'Erreur Puppeteer' : error.message) : 'Erreur inconnue';
            // Conserver le code HTTP et la chaîne même en cas d'erreur si disponible
            if (error instanceof Error) {
              if ('httpCode' in error) {
                newTools[index].httpCode = (error as any).httpCode;
              }
              if ('httpChain' in error) {
                newTools[index].httpChain = (error as any).httpChain;
              }
            }
            return newTools;
          });
          
          return false;
        } finally {
          setActiveProcesses(prev => Math.max(0, prev - 1));
        }
      };

      // Fonction pour traiter un lot d'outils
      const processBatch = async () => {
        // Trouver les outils en attente
        const toolsToProcess = tools
          .map((tool, index) => ({ tool, index }))
          .filter(item => item.tool.status === 'idle')
          .slice(0, BATCH_SIZE);
        
        // Si plus d'outils à traiter, arrêter le processus
        if (toolsToProcess.length === 0) {
          setIsRunning(false);
          setIsCompleted(true);
          return;
        }
        
        // Traiter les outils en parallèle
        await Promise.all(
          toolsToProcess.map(item => processOneTool(item.tool, item.index))
        );
        
        // Vérifier s'il reste des outils à traiter
        const remainingTools = tools.filter(tool => tool.status === 'idle');
        if (remainingTools.length === 0) {
          setIsRunning(false);
          setIsCompleted(true);
        } else {
          // Planifier le prochain lot
          setTimeout(processBatch, 1000);
        }
      };
      
      // Lancer le traitement par lots
      processBatch();
    }
  }, [isRunning, tools]);

  const handleStart = () => {
    setIsRunning(true);
    setIsCompleted(false);
    // Réinitialiser les statuts au démarrage
    setTools(prevTools => 
      prevTools.map(tool => ({ ...tool, status: 'idle', dbUpdated: false }))
    );
  };

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

  const paginatedTools = tools.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(tools.length / ITEMS_PER_PAGE);

  const totalTools = tools.length;
  const successfulScreenshots = tools.filter(tool => tool.status === 'success').length;
  const failedScreenshots = tools.filter(tool => tool.status === 'error').length;
  const pendingScreenshots = tools.filter(tool => tool.status === 'idle').length;

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

            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleStart}
                disabled={isRunning}
                className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${
                  isRunning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isRunning ? 'Traitement en cours...' : 'Lancer la détection HTTP & capture d\'écran'}
              </button>

              {isCompleted && (
                <button
                  onClick={handleUpdateDatabase}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Mettre à jour la base de données
                </button>
              )}
            </div>

            <div className="mt-4">
              <div className="mb-2 grid grid-cols-12 gap-2 font-bold text-sm">
                <div className="col-span-3">Nom</div>
                <div className="col-span-4">URL</div>
                <div className="col-span-2">Statut HTTP</div>
                <div className="col-span-2">Capture</div>
                <div className="col-span-1">Actions</div>
              </div>
              
              {paginatedTools.map(tool => (
                <div key={tool.id} className="grid grid-cols-12 gap-2 mb-2 p-2 border rounded-lg items-center">
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
                    {tool.status === 'idle' && (
                      <span className="text-gray-400">En attente</span>
                    )}
                    {tool.status === 'loading' && (
                      <div className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-blue-500">Chargement...</span>
                      </div>
                    )}
                    {tool.status === 'success' && (
                      <img 
                        src={tool.logoUrl} 
                        alt={tool.name} 
                        className="max-h-16 max-w-full object-contain"
                      />
                    )}
                    {tool.status === 'error' && (
                      <span className="text-red-500">{tool.errorCode}</span>
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
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Types pour les données
interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  pricingType: string;
  category: string;
  categoryId: string;
  websiteUrl: string;
  isActive: boolean;
  httpCode?: number;
  selected?: boolean; // Pour la sélection multiple
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  toolCount: number;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  toolCount: number;
}

type SortField = 'name' | 'category' | 'pricingType' | 'httpCode' | 'isActive';
type SortDirection = 'asc' | 'desc';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('outils');
  const router = useRouter();
  
  // Données depuis l'API
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // État pour le tri et la sélection
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [confirmAction, setConfirmAction] = useState(false);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
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
  }, [router]);

  // Fonction pour charger les données
  const fetchData = async (activeTab: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (activeTab === 'outils') {
        const response = await fetch('/api/tools');
        if (!response.ok) throw new Error('Erreur lors du chargement des outils');
        const data = await response.json();
        // Ajouter la propriété selected à chaque outil
        setTools(data.map((tool: Tool) => ({ ...tool, selected: false })));
      } 
      else if (activeTab === 'categories') {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Erreur lors du chargement des catégories');
        const data = await response.json();
        setCategories(data);
      } 
      else if (activeTab === 'tags') {
        const response = await fetch('/api/tags');
        if (!response.ok) throw new Error('Erreur lors du chargement des tags');
        const data = await response.json();
        setTags(data);
      }
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur de récupération des données:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour basculer le statut d'un outil (ON/OFF)
  const toggleToolStatus = async (toolSlug: string, currentStatus: boolean) => {
    setIsLoading(true);
    try {
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
          tool.slug === toolSlug ? { ...tool, isActive: !tool.isActive } : tool
        )
      );
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur lors de la mise à jour du statut:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour trier les outils
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Inverser la direction si on clique sur la même colonne
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouvelle colonne, trier par défaut en ascendant
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Fonction pour sélectionner/désélectionner tous les outils
  const toggleSelectAll = () => {
    setTools(prevTools => 
      prevTools.map(tool => ({ ...tool, selected: !prevTools.some(t => t.selected) }))
    );
  };

  // Fonction pour sélectionner/désélectionner un outil
  const toggleSelectTool = (toolId: string) => {
    setTools(prevTools => 
      prevTools.map(tool => 
        tool.id === toolId ? { ...tool, selected: !tool.selected } : tool
      )
    );
  };

  // Fonction pour exécuter l'action sélectionnée
  const executeAction = async () => {
    const selectedTools = tools.filter(tool => tool.selected);
    if (selectedTools.length === 0) {
      setError('Veuillez sélectionner au moins un outil');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (selectedAction === 'delete') {
        // Suppression des outils sélectionnés
        for (const tool of selectedTools) {
          await fetch(`/api/tools/${tool.slug}`, {
            method: 'DELETE',
          });
        }
        // Recharger les données après suppression
        await fetchData('outils');
      } else if (selectedAction === 'activate' || selectedAction === 'deactivate') {
        // Activation ou désactivation des outils sélectionnés
        const isActive = selectedAction === 'activate';
        for (const tool of selectedTools) {
          if (tool.isActive !== isActive) {
            await fetch(`/api/tools/${tool.slug}/toggle-status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isActive }),
            });
          }
        }
        // Mettre à jour l'état local
        setTools(prevTools => 
          prevTools.map(tool => {
            if (tool.selected) {
              return { ...tool, isActive: selectedAction === 'activate', selected: false };
            }
            return tool;
          })
        );
      }
      
      setSelectedAction('');
      setConfirmAction(false);
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur lors de l\'exécution de l\'action:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement initial des données et lorsque l'onglet change
  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  // Trier les outils selon le champ et la direction
  const sortedTools = [...tools].sort((a, b) => {
    let compareA, compareB;
    
    // Extraire les valeurs à comparer
    switch (sortField) {
      case 'name':
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
        break;
      case 'category':
        compareA = a.category.toLowerCase();
        compareB = b.category.toLowerCase();
        break;
      case 'pricingType':
        compareA = a.pricingType;
        compareB = b.pricingType;
        break;
      case 'httpCode':
        compareA = a.httpCode || 0;
        compareB = b.httpCode || 0;
        break;
      case 'isActive':
        compareA = a.isActive ? 1 : 0;
        compareB = b.isActive ? 1 : 0;
        break;
      default:
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
    }
    
    // Comparer les valeurs selon la direction
    if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Nombre d'outils sélectionnés
  const selectedToolsCount = tools.filter(tool => tool.selected).length;

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

  // Rendu de l'interface d'administration
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-md h-screen p-4 fixed top-0 left-0 bottom-0 transition-all ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${!sidebarOpen && 'hidden'}`}>Administration</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav>
          <Link
            href="/admin/dashboard"
            className={`block py-2 px-4 mb-1 rounded bg-blue-100 text-blue-800 ${
              !sidebarOpen && 'px-2 text-center'
            }`}
          >
            {sidebarOpen ? 'Tableau de bord' : '📊'}
          </Link>
          
          <Link
            href="/admin/crawl"
            className={`block py-2 px-4 mb-1 rounded hover:bg-gray-100 ${
              !sidebarOpen && 'px-2 text-center'
            }`}
          >
            {sidebarOpen ? 'Vérificateur d\'URLs' : '🔗'}
          </Link>
          
          <Link
            href="/admin/add/tool"
            className={`block py-2 px-4 mb-1 rounded hover:bg-gray-100 ${
              !sidebarOpen && 'px-2 text-center'
            }`}
          >
            {sidebarOpen ? 'Ajouter un outil' : '➕'}
          </Link>
          <Link
            href="/admin/add/category"
            className={`block py-2 px-4 mb-1 rounded hover:bg-gray-100 ${
              !sidebarOpen && 'px-2 text-center'
            }`}
          >
            {sidebarOpen ? 'Ajouter une catégorie' : '🗂️'}
          </Link>
          <Link
            href="/admin/add/tag"
            className={`block py-2 px-4 mb-1 rounded hover:bg-gray-100 ${
              !sidebarOpen && 'px-2 text-center'
            }`}
          >
            {sidebarOpen ? 'Ajouter un tag' : '🏷️'}
          </Link>
          <Link
            href="/admin/bulk"
            className={`block py-2 px-4 mb-1 rounded hover:bg-gray-100 ${
              !sidebarOpen && 'px-2 text-center'
            }`}
          >
            {sidebarOpen ? 'Import en masse' : '📥'}
          </Link>
          
          <button
            onClick={handleLogout}
            className={`block w-full text-left py-2 px-4 mt-4 rounded hover:bg-red-100 hover:text-red-800 ${
              !sidebarOpen && 'px-2 text-center'
            }`}
          >
            {sidebarOpen ? 'Déconnexion' : '🚪'}
          </button>
        </nav>
      </div>
      
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
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Affichage du message d'erreur */}
            {error && (
              <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
                Erreur: {error}
              </div>
            )}

            {/* Affichage du chargement */}
            {isLoading && (
              <div className="p-6 text-center">
                <p className="text-gray-600">Chargement des données...</p>
              </div>
            )}

            {/* Onglet Outils */}
            {activeTab === 'outils' && !isLoading && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Gestion des outils</h2>
                  <Link 
                    href="/admin/add/tools" 
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    + Ajouter un outil
                  </Link>
                </div>

                {/* Actions en masse pour les outils */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-sm text-gray-600">
                    {selectedToolsCount > 0 ? `${selectedToolsCount} outil(s) sélectionné(s)` : 'Aucun outil sélectionné'}
                  </div>
                  
                  <select
                    value={selectedAction}
                    onChange={e => setSelectedAction(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    disabled={selectedToolsCount === 0}
                  >
                    <option value="">-- Choisir une action --</option>
                    <option value="activate">Activer</option>
                    <option value="deactivate">Désactiver</option>
                    <option value="delete">Supprimer</option>
                  </select>
                  
                  <button
                    onClick={() => selectedAction ? setConfirmAction(true) : null}
                    className={`bg-blue-600 text-white px-3 py-1 rounded text-sm ${
                      !selectedAction || selectedToolsCount === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                    disabled={!selectedAction || selectedToolsCount === 0}
                  >
                    Appliquer
                  </button>
                </div>

                {/* Confirmation pour l'action en masse */}
                {confirmAction && (
                  <div className="mb-4 p-4 border border-yellow-400 bg-yellow-50 rounded-lg">
                    <p className="text-sm mb-2">
                      {selectedAction === 'delete' 
                        ? `Êtes-vous sûr de vouloir supprimer ${selectedToolsCount} outil(s) ?` 
                        : selectedAction === 'activate'
                        ? `Êtes-vous sûr de vouloir activer ${selectedToolsCount} outil(s) ?`
                        : `Êtes-vous sûr de vouloir désactiver ${selectedToolsCount} outil(s) ?`
                      }
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={executeAction}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setConfirmAction(false)}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={tools.length > 0 && tools.every(tool => tool.selected)}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('name')}
                        >
                          Nom
                          {sortField === 'name' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('category')}
                        >
                          Catégorie
                          {sortField === 'category' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('pricingType')}
                        >
                          Tarification
                          {sortField === 'pricingType' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('httpCode')}
                        >
                          HTTP
                          {sortField === 'httpCode' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('isActive')}
                        >
                          Statut
                          {sortField === 'isActive' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedTools.length > 0 ? (
                        sortedTools.map(tool => (
                          <tr key={tool.id} className={tool.selected ? 'bg-blue-50' : ''}>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={tool.selected || false}
                                onChange={() => toggleSelectTool(tool.id)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{tool.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{tool.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                tool.pricingType === 'FREE' ? 'bg-green-100 text-green-800' :
                                tool.pricingType === 'PAID' ? 'bg-red-100 text-red-800' : 
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {tool.pricingType === 'FREE' ? 'Gratuit' : 
                                tool.pricingType === 'PAID' ? 'Payant' : 
                                tool.pricingType === 'FREEMIUM' ? 'Freemium' : 
                                'Abonnement'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {tool.httpCode ? (
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  tool.httpCode === 200 ? 'bg-green-100 text-green-800' :
                                  tool.httpCode >= 300 && tool.httpCode < 400 ? 'bg-blue-100 text-blue-800' :
                                  tool.httpCode >= 400 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {tool.httpCode}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mr-2 ${
                                  tool.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {tool.isActive ? 'ON' : 'OFF'}
                                </span>
                                {/* Toggle Switch */}
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={tool.isActive}
                                    onChange={() => toggleToolStatus(tool.slug, tool.isActive)}
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Link 
                                href={`/admin/modify/tools/${tool.slug}`}
                                className="text-blue-600 hover:text-blue-900 text-xl"
                                title="Modifier"
                              >
                                ✏️
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                            Aucun outil trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Onglet Catégories */}
            {activeTab === 'categories' && !isLoading && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Gestion des catégories</h2>
                  <Link 
                    href="/admin/add/categories" 
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    + Ajouter une catégorie
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Slug
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nb. Outils
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.length > 0 ? (
                        categories.map(category => (
                          <tr key={category.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{category.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{category.slug}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{category.toolCount}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Link 
                                href={`/admin/modify/categories/${category.slug}`}
                                className="text-blue-600 hover:text-blue-900 text-xl"
                                title="Modifier"
                              >
                                ✏️
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                            Aucune catégorie trouvée
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Onglet Tags */}
            {activeTab === 'tags' && !isLoading && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Gestion des tags</h2>
                  <Link 
                    href="/admin/add/tags" 
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    + Ajouter un tag
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Slug
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nb. Outils
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tags.length > 0 ? (
                        tags.map(tag => (
                          <tr key={tag.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{tag.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{tag.slug}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{tag.toolCount}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Link 
                                href={`/admin/modify/tags/${tag.slug}`}
                                className="text-blue-600 hover:text-blue-900 text-xl"
                                title="Modifier"
                              >
                                ✏️
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                            Aucun tag trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
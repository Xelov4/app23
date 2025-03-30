'use client';

import { useState, useEffect } from 'react';
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
  
  // Données depuis l'API
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // État pour le tri et la sélection
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [confirmAction, setConfirmAction] = useState(false);

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
    
    // Comparer selon la direction
    if (sortDirection === 'asc') {
      return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
    } else {
      return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tableau de bord d'administration</h1>
        <div className="flex gap-2">
          <Link href="/admin/bulk" className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Traitement par lots
          </Link>
          <Link href="/admin/add/tools" className="btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            Ajouter un outil
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6 border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('outils')}
              className={`pb-2 px-1 ${activeTab === 'outils' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Outils
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-2 px-1 ${activeTab === 'categories' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Catégories
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`pb-2 px-1 ${activeTab === 'tags' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Tags
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-500">Chargement en cours...</p>
          </div>
        ) : (
          <>
            {activeTab === 'outils' && (
              <div>
                {tools.length > 0 ? (
                  <>
                    <div className="flex justify-between mb-4">
                      <div className="flex items-center">
                        <select
                          value={selectedAction}
                          onChange={(e) => setSelectedAction(e.target.value)}
                          className="border rounded p-2 mr-2"
                        >
                          <option value="">Action groupée...</option>
                          <option value="activate">Activer</option>
                          <option value="deactivate">Désactiver</option>
                          <option value="delete">Supprimer</option>
                        </select>
                        <button
                          onClick={() => setConfirmAction(true)}
                          disabled={!selectedAction}
                          className={`px-3 py-1 rounded ${!selectedAction ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                          Appliquer
                        </button>
                        
                        {confirmAction && (
                          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                              <h3 className="text-lg font-medium mb-4">Confirmation</h3>
                              <p className="mb-4">
                                Êtes-vous sûr de vouloir {selectedAction === 'delete' ? 'supprimer' : selectedAction === 'activate' ? 'activer' : 'désactiver'} les {tools.filter(t => t.selected).length} outils sélectionnés ?
                              </p>
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setConfirmAction(false)}
                                  className="px-4 py-2 border rounded hover:bg-gray-100"
                                >
                                  Annuler
                                </button>
                                <button
                                  onClick={executeAction}
                                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                                >
                                  Confirmer
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">{tools.length} outils</span>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                onChange={toggleSelectAll}
                                checked={tools.length > 0 && tools.every(t => t.selected)}
                                className="h-4 w-4 border-gray-300 rounded"
                              />
                            </th>
                            <th 
                              scope="col" 
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('name')}
                            >
                              Nom {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                              scope="col" 
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('category')}
                            >
                              Catégorie {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                              scope="col" 
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('pricingType')}
                            >
                              Prix {sortField === 'pricingType' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                              scope="col" 
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('httpCode')}
                            >
                              État {sortField === 'httpCode' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                              scope="col" 
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('isActive')}
                            >
                              Status {sortField === 'isActive' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortedTools.map((tool) => (
                            <tr key={tool.id} className="hover:bg-gray-50">
                              <td className="px-3 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={tool.selected || false}
                                  onChange={() => toggleSelectTool(tool.id)}
                                  className="h-4 w-4 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 flex-shrink-0 mr-3 bg-gray-100 rounded-full overflow-hidden">
                                    {tool.logoUrl ? (
                                      <img src={tool.logoUrl} alt={tool.name} className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-500">
                                        {tool.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <a 
                                      href={`/tools/${tool.slug}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                    >
                                      {tool.name}
                                    </a>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">
                                      {tool.description.substring(0, 60)}...
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">{tool.category || 'Non classé'}</span>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  tool.pricingType === 'FREE' ? 'bg-green-100 text-green-800' :
                                  tool.pricingType === 'FREEMIUM' ? 'bg-blue-100 text-blue-800' :
                                  tool.pricingType === 'PAID' ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {tool.pricingType}
                                </span>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  !tool.httpCode ? 'bg-gray-100 text-gray-800' :
                                  tool.httpCode >= 200 && tool.httpCode < 300 ? 'bg-green-100 text-green-800' :
                                  tool.httpCode >= 300 && tool.httpCode < 400 ? 'bg-yellow-100 text-yellow-800' :
                                  tool.httpCode >= 400 ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {tool.httpCode || 'N/A'}
                                </span>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => toggleToolStatus(tool.slug, tool.isActive)}
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    tool.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {tool.isActive ? 'Actif' : 'Inactif'}
                                </button>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex space-x-2 justify-end">
                                  <Link
                                    href={`/admin/modify/tools/${tool.slug}`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    Modifier
                                  </Link>
                                  <Link
                                    href={`/admin/enrichir/${tool.slug}`}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Enrichir
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-8 text-gray-500">Aucun outil trouvé.</p>
                )}
              </div>
            )}
            
            {activeTab === 'categories' && (
              <div>
                {categories.length > 0 ? (
                  <>
                    <div className="flex justify-between mb-4">
                      <Link href="/admin/add/categories" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Ajouter une catégorie
                      </Link>
                      <div>
                        <span className="text-gray-500">{categories.length} catégories</span>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nom
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Outils
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 flex-shrink-0 mr-3 bg-gray-100 rounded-full overflow-hidden">
                                    {category.imageUrl ? (
                                      <img src={category.imageUrl} alt={category.name} className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-500">
                                        {category.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <a 
                                      href={`/categories/${category.slug}`} 
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                    >
                                      {category.name}
                                    </a>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 truncate max-w-xs">
                                  {category.description.substring(0, 100)}...
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">{category.toolCount}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link
                                  href={`/admin/modify/categories/${category.slug}`}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Modifier
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-8 text-gray-500">Aucune catégorie trouvée.</p>
                )}
              </div>
            )}
            
            {activeTab === 'tags' && (
              <div>
                {tags.length > 0 ? (
                  <>
                    <div className="flex justify-between mb-4">
                      <Link href="/admin/add/tags" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Ajouter un tag
                      </Link>
                      <div>
                        <span className="text-gray-500">{tags.length} tags</span>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nom
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Outils
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tags.map((tag) => (
                            <tr key={tag.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  #{tag.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">{tag.toolCount}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link
                                  href={`/admin/modify/tags/${tag.slug}`}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Modifier
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-8 text-gray-500">Aucun tag trouvé.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, Filter, Plus, Settings, Eye, EyeOff, Edit, Trash } from 'lucide-react';

// Types pour les données
interface Tool {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  logoUrl: string | null;
  httpCode: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardV2Page() {
  // États
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'status' | 'httpCode'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [retryCount, setRetryCount] = useState(0);

  // Charger les outils
  useEffect(() => {
    const fetchTools = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Utilisation de l'option no-cache pour éviter les problèmes de mise en cache
        const response = await fetch('/api/tools', { 
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des outils. Code: ' + response.status);
        }
        
        const data = await response.json();
        setTools(data);
        setFilteredTools(data);
      } catch (err) {
        console.error('Erreur de récupération des outils:', err);
        setError((err as Error).message);
        
        // Implémenter une stratégie de retry (3 tentatives maximum) avec délai croissant
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Délai exponentiel: 1s, 2s, 4s
          console.log(`Nouvelle tentative dans ${delay/1000}s...`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, [retryCount]);

  // Filtrer les outils en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredTools(tools);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = tools.filter(tool => 
        tool.name.toLowerCase().includes(lowercaseSearch) || 
        tool.websiteUrl.toLowerCase().includes(lowercaseSearch) ||
        tool.slug.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredTools(filtered);
    }
  }, [searchTerm, tools]);

  // Fonction pour trier les outils
  const handleSort = (field: 'name' | 'status' | 'httpCode') => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Trier les outils
  const sortedTools = [...filteredTools].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortField === 'status') {
      // Trier par statut (actif ou inactif)
      if (sortDirection === 'asc') {
        return a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1;
      } else {
        return a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1;
      }
    } else if (sortField === 'httpCode') {
      // Trier par code HTTP
      const codeA = a.httpCode || 0;
      const codeB = b.httpCode || 0;
      return sortDirection === 'asc' ? codeA - codeB : codeB - codeA;
    }
    return 0;
  });

  // Toggler le statut d'un outil
  const toggleToolStatus = async (toolSlug: string, currentStatus: boolean) => {
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
    }
  };

  // Formater le code HTTP pour affichage
  const formatHttpCode = (code: number | null) => {
    if (!code) return 'N/A';
    
    if (code >= 200 && code < 300) {
      return <span className="text-green-600">{code}</span>;
    } else if (code >= 300 && code < 400) {
      return <span className="text-yellow-600">{code}</span>;
    } else {
      return <span className="text-red-600">{code}</span>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard (v2)</h1>
        <Link href="/admin/tool-v2/new">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <Plus size={18} /> Ajouter un outil
          </button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          <p>Erreur: {error}</p>
          <button 
            onClick={() => setRetryCount(prev => prev + 1)}
            className="text-red-700 underline mt-1"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un outil..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <Link href="/admin/tool-v2">
            <button className="flex items-center gap-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              <Settings size={18} /> Gestion avancée
            </button>
          </Link>
          <Link href="/admin/bulk">
            <button className="flex items-center gap-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              <Filter size={18} /> Traitement par lots
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Nom
                      {sortField === 'name' && (
                        <ChevronDown size={16} className={`ml-1 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('httpCode')}
                  >
                    <div className="flex items-center">
                      HTTP
                      {sortField === 'httpCode' && (
                        <ChevronDown size={16} className={`ml-1 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Statut
                      {sortField === 'status' && (
                        <ChevronDown size={16} className={`ml-1 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTools.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? "Aucun résultat pour votre recherche" : "Aucun outil n'a été trouvé"}
                    </td>
                  </tr>
                ) : (
                  sortedTools.map(tool => (
                    <tr key={tool.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {tool.logoUrl && (
                            <img 
                              src={tool.logoUrl} 
                              alt={tool.name} 
                              className="h-10 w-10 rounded-full mr-3 object-cover bg-gray-100"
                            />
                          )}
                          {!tool.logoUrl && (
                            <div className="h-10 w-10 rounded-full mr-3 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">N/A</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{tool.name}</div>
                            <div className="text-gray-500 text-sm">{tool.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a 
                          href={tool.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {tool.websiteUrl}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatHttpCode(tool.httpCode)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tool.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {tool.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => toggleToolStatus(tool.slug, tool.isActive)}
                            className={`p-1 rounded ${
                              tool.isActive 
                                ? 'text-gray-600 hover:text-red-600' 
                                : 'text-gray-600 hover:text-green-600'
                            }`}
                            title={tool.isActive ? 'Désactiver' : 'Activer'}
                          >
                            {tool.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <Link 
                            href={`/admin/tool-v2/edit/${tool.slug}`}
                            className="p-1 rounded text-gray-600 hover:text-blue-600"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm(`Êtes-vous sûr de vouloir supprimer l'outil "${tool.name}" ?`)) {
                                // Implémenter la suppression ici
                                console.log('Supprimer', tool.slug);
                              }
                            }}
                            className="p-1 rounded text-gray-600 hover:text-red-600"
                            title="Supprimer"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-600">
        Total: {filteredTools.length} outil(s)
      </div>
    </div>
  );
} 
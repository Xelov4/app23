'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Download, Search, BarChart3 } from 'lucide-react';

interface SearchData {
  id: string;
  term: string;
  count: number;
  lastSearchedAt: string;
  createdAt: string;
}

export default function SearchDataPage() {
  const router = useRouter();
  const [searchData, setSearchData] = useState<SearchData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('count');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session');
        const data = await response.json();
        
        if (!data.authenticated) {
          router.push('/admin');
        } else {
          fetchSearchData();
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de session:', err);
        router.push('/admin');
      }
    };
    
    checkSession();
  }, [router]);

  // Récupérer les données de recherche
  const fetchSearchData = async () => {
    setIsLoading(true);
    try {
      let url = '/api/admin/search/data';
      if (timeRange !== 'all') {
        url += `?timeRange=${timeRange}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur lors du chargement des données de recherche: ${response.status}`);
      }
      
      const data = await response.json();
      setSearchData(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur de récupération des données de recherche:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer et trier les données
  const filteredAndSortedData = searchData
    .filter(item => 
      item.term.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'count') {
        return sortOrder === 'asc' ? a.count - b.count : b.count - a.count;
      } else if (sortBy === 'term') {
        return sortOrder === 'asc' 
          ? a.term.localeCompare(b.term)
          : b.term.localeCompare(a.term);
      } else if (sortBy === 'lastSearched') {
        return sortOrder === 'asc'
          ? new Date(a.lastSearchedAt).getTime() - new Date(b.lastSearchedAt).getTime()
          : new Date(b.lastSearchedAt).getTime() - new Date(a.lastSearchedAt).getTime();
      }
      return 0;
    });

  // Exporter les données au format CSV
  const exportToCsv = async () => {
    setIsExporting(true);
    
    try {
      let url = '/api/admin/search/data/export';
      if (timeRange !== 'all') {
        url += `?timeRange=${timeRange}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de l'exportation: ${response.status}`);
      }
      
      // Récupérer le contenu du CSV
      const blob = await response.blob();
      
      // Créer un lien pour télécharger le fichier
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Nom du fichier avec date
      const date = new Date().toISOString().split('T')[0];
      link.download = `recherches-${date}.csv`;
      
      // Cliquer sur le lien pour télécharger
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur lors de l\'exportation:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Appliquer le filtre de temps
  useEffect(() => {
    fetchSearchData();
  }, [timeRange]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Données de recherche</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un terme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 px-4 py-2 border rounded w-full"
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border rounded"
            >
              <option value="all">Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
            
            <button
              onClick={exportToCsv}
              disabled={isExporting || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isExporting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Exportation...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Exporter CSV
                </>
              )}
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : (
          <>
            {/* Graphique des termes les plus recherchés */}
            {filteredAndSortedData.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                  Top 10 des recherches
                </h2>
                <div className="h-64 w-full">
                  {filteredAndSortedData.slice(0, 10).map((item, index) => (
                    <div key={item.id} className="flex items-center mb-2">
                      <div className="w-32 text-sm truncate pr-2">{item.term}</div>
                      <div className="flex-grow">
                        <div className="relative h-6 bg-gray-200 rounded">
                          <div
                            className="absolute top-0 left-0 h-6 bg-blue-500 rounded"
                            style={{
                              width: `${(item.count / filteredAndSortedData[0].count) * 100}%`,
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-end pr-2 text-sm font-medium">
                            {item.count} recherche{item.count > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tableau de données */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th 
                      className="py-2 px-4 text-left cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        if (sortBy === 'term') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('term');
                          setSortOrder('asc');
                        }
                      }}
                    >
                      Terme de recherche
                      {sortBy === 'term' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="py-2 px-4 text-center cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        if (sortBy === 'count') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('count');
                          setSortOrder('desc');
                        }
                      }}
                    >
                      Nombre de recherches
                      {sortBy === 'count' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="py-2 px-4 text-left cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        if (sortBy === 'lastSearched') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('lastSearched');
                          setSortOrder('desc');
                        }
                      }}
                    >
                      Dernière recherche
                      {sortBy === 'lastSearched' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedData.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="py-2 px-4 font-medium">{item.term}</td>
                      <td className="py-2 px-4 text-center">{item.count}</td>
                      <td className="py-2 px-4 text-sm text-gray-600">
                        {new Date(item.lastSearchedAt).toLocaleString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                  
                  {filteredAndSortedData.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-500">
                        Aucune donnée de recherche trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 
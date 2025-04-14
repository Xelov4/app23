'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Edit, 
  Search, 
  Plus, 
  RefreshCw,
  Info,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type StatCard = {
  title: string;
  value: number | string;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  icon?: React.ReactNode;
};

type Column<T> = {
  header: string;
  accessorKey: string;
  enableSorting?: boolean;
  renderCell?: (item: T) => React.ReactNode;
};

type ActionButton<T> = {
  label: string;
  icon: React.ReactNode;
  onClick: (item: T) => void;
  variant?: 'default' | 'outline' | 'link';
  condition?: (item: T) => boolean;
};

type AdminTableProps<T> = {
  title: string;
  icon: React.ReactNode;
  description: string;
  fetchItems: () => Promise<T[]>;
  columns: Column<T>[];
  actions?: ActionButton<T>[];
  searchFields?: string[];
  statCards?: StatCard[];
  createLink?: string;
  createLabel?: string;
  itemsPerPage?: number;
  onRefresh?: () => void;
};

export default function AdminTable<T extends { id: string }>({
  title,
  icon,
  description,
  fetchItems,
  columns,
  actions = [],
  searchFields = [],
  statCards = [],
  createLink,
  createLabel = 'Nouveau',
  itemsPerPage = 10,
  onRefresh
}: AdminTableProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Charger les données
  const loadItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchItems();
      setItems(data);
      setFilteredItems(data);
    } catch (err: any) {
      setError(`Erreur lors du chargement des données: ${err.message || 'Une erreur est survenue'}`);
      console.error('Erreur lors du chargement des données:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadItems();
  }, []);

  // Filtrer les éléments selon le terme de recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = items.filter(item => {
      return searchFields.some(field => {
        const value = getNestedValue(item, field);
        return value && String(value).toLowerCase().includes(searchTermLower);
      });
    });

    setFilteredItems(filtered);
    setCurrentPage(1); // Réinitialiser la pagination lors d'une recherche
  }, [searchTerm, items, searchFields]);

  // Trier les éléments
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig?.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
    
    const sorted = [...filteredItems].sort((a, b) => {
      const aValue = getNestedValue(a, key);
      const bValue = getNestedValue(b, key);
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return direction === 'asc' ? comparison : -comparison;
    });
    
    setFilteredItems(sorted);
  };
  
  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  // Utilitaire pour accéder aux propriétés imbriquées (ex: "user.profile.name")
  function getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    return keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : null), obj);
  }

  // Gérer la pagination
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Rafraîchir les données
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    loadItems();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            {icon}
            {title}
          </h1>
          <p className="text-gray-500 mt-1">
            {description}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          
          {createLink && (
            <Button asChild>
              <Link href={createLink} className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                {createLabel}
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Barre de recherche */}
      {searchFields.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      )}
      
      {/* Affichage du statut */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 flex items-start">
          <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-500">Aucun élément trouvé</p>
        </div>
      ) : (
        <>
          {/* Statistiques */}
          {statCards.length > 0 && (
            <div className={`grid grid-cols-1 md:grid-cols-${Math.min(statCards.length, 4)} gap-4 mb-6`}>
              {statCards.map((card, index) => (
                <div 
                  key={index} 
                  className={`bg-white shadow rounded-md p-4 border-l-4 border-${card.color}-500`}
                >
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <div className="flex items-center">
                    {card.icon && <div className="mr-2">{card.icon}</div>}
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tableau des éléments */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column, index) => (
                      <th 
                        key={index} 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => column.enableSorting && handleSort(column.accessorKey)}
                      >
                        <div className="flex items-center">
                          {column.header}
                          {column.enableSorting && (
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                    ))}
                    {actions.length > 0 && (
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      {columns.map((column, cellIndex) => (
                        <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                          {column.renderCell 
                            ? column.renderCell(item)
                            : getNestedValue(item, column.accessorKey)
                          }
                        </td>
                      ))}
                      {actions.length > 0 && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            {actions
                              .filter(action => !action.condition || action.condition(item))
                              .map((action, actionIndex) => (
                                <Button
                                  key={actionIndex}
                                  variant={action.variant || "default"}
                                  size="sm"
                                  onClick={() => action.onClick(item)}
                                  className="flex items-center"
                                >
                                  {action.icon}
                                  <span className="ml-1">{action.label}</span>
                                </Button>
                              ))}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                      <span className="font-medium">
                        {Math.min(startIndex + itemsPerPage, filteredItems.length)}
                      </span>{' '}
                      sur <span className="font-medium">{filteredItems.length}</span> résultats
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Calculer les pages à afficher autour de la page actuelle
                      const maxPages = Math.min(5, totalPages);
                      let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
                      const endPage = Math.min(totalPages, startPage + maxPages - 1);
                      
                      // Ajuster la page de départ si nécessaire
                      if (endPage - startPage + 1 < maxPages) {
                        startPage = Math.max(1, endPage - maxPages + 1);
                      }
                      
                      const page = startPage + i;
                      if (page <= endPage) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      }
                      return null;
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Database, Download, Filter, RefreshCw, Search, Table, X } from 'lucide-react';

interface TableInfo {
  tableName: string;
  rowCount: number;
}

interface ColumnInfo {
  name: string;
  type: string;
  isNullable: boolean;
}

type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greater' | 'less' | 'between';

interface FilterCondition {
  column: string;
  operator: FilterOperator;
  value: string;
  value2?: string; // Pour 'between'
}

export default function DatabaseExplorer() {
  // États pour gérer l'interface
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [newFilter, setNewFilter] = useState<FilterCondition>({
    column: '',
    operator: 'equals',
    value: ''
  });

  // Charger les tables au chargement initial
  useEffect(() => {
    fetchTables();
  }, []);

  // Charger les colonnes quand une table est sélectionnée
  useEffect(() => {
    if (selectedTable) {
      fetchColumns();
      setSelectedColumns([]);
      setFilters([]);
      setPage(1);
    }
  }, [selectedTable]);

  // Charger les données quand les colonnes, la table, la page ou les filtres changent
  useEffect(() => {
    if (selectedTable && selectedColumns.length > 0) {
      fetchData();
    }
  }, [selectedTable, selectedColumns, page, pageSize, filters]);

  // Fetch les tables disponibles
  const fetchTables = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/database/tables');
      if (!response.ok) throw new Error("Impossible de récupérer les tables");
      const data = await response.json();
      setTables(data);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch les colonnes d'une table
  const fetchColumns = async () => {
    if (!selectedTable) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/database/columns?table=${selectedTable}`);
      if (!response.ok) throw new Error("Impossible de récupérer les colonnes");
      const data = await response.json();
      setColumns(data);
      
      // Par défaut, sélectionner toutes les colonnes
      setSelectedColumns(data.map((col: ColumnInfo) => col.name));
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch les données selon les colonnes et filtres sélectionnés
  const fetchData = async () => {
    if (!selectedTable || selectedColumns.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        table: selectedTable,
        columns: selectedColumns.join(','),
        page: page.toString(),
        pageSize: pageSize.toString(),
        filters: JSON.stringify(filters)
      });
      
      const response = await fetch(`/api/admin/database/data?${queryParams}`);
      if (!response.ok) throw new Error("Impossible de récupérer les données");
      const result = await response.json();
      setData(result.data);
      setTotalRows(result.totalRows);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Exporter les données en CSV
  const exportToCsv = async () => {
    if (!selectedTable || selectedColumns.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        table: selectedTable,
        columns: selectedColumns.join(','),
        filters: JSON.stringify(filters),
        export: 'true'
      });
      
      const response = await fetch(`/api/admin/database/export?${queryParams}`);
      if (!response.ok) throw new Error("Impossible d'exporter les données");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTable}_export.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'export");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la sélection des colonnes
  const toggleColumnSelection = (columnName: string) => {
    setSelectedColumns(prev => {
      if (prev.includes(columnName)) {
        return prev.filter(col => col !== columnName);
      } else {
        return [...prev, columnName];
      }
    });
  };

  // Sélectionner ou désélectionner toutes les colonnes
  const toggleAllColumns = () => {
    if (selectedColumns.length === columns.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(columns.map(col => col.name));
    }
  };

  // Ajouter un nouveau filtre
  const addFilter = () => {
    if (newFilter.column && newFilter.operator) {
      // Vérifier si la valeur est requise et présente
      if (newFilter.value || newFilter.operator === 'between' && newFilter.value2) {
        setFilters([...filters, { ...newFilter }]);
        setNewFilter({ column: '', operator: 'equals', value: '' });
        setShowFilterModal(false);
      }
    }
  };

  // Supprimer un filtre
  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  // Formater l'affichage de l'opérateur de filtre
  const formatOperator = (operator: FilterOperator): string => {
    switch (operator) {
      case 'equals': return '=';
      case 'contains': return 'contient';
      case 'startsWith': return 'commence par';
      case 'endsWith': return 'termine par';
      case 'greater': return '>';
      case 'less': return '<';
      case 'between': return 'entre';
      default: return operator;
    }
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(totalRows / pageSize);

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href="/admin"
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Database className="mr-2 h-6 w-6 text-blue-500" />
            Explorateur de base de données
          </h1>
        </div>
        
        <button
          onClick={fetchTables}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          title="Rafraîchir les tables"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      {/* Sélecteurs et filtres en haut */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sélection de table */}
        <div className="p-4 bg-white border border-gray-200 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Table className="mr-2 h-5 w-5 text-blue-500" />
            Tables disponibles
          </h2>
          
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner une table</option>
            {tables.map((table) => (
              <option key={table.tableName} value={table.tableName}>
                {table.tableName} ({table.rowCount} lignes)
              </option>
            ))}
          </select>
        </div>
        
        {/* Sélection des colonnes */}
        <div className="p-4 bg-white border border-gray-200 rounded-md shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Table className="mr-2 h-5 w-5 text-blue-500" />
              Colonnes
            </h2>
            
            <button
              onClick={toggleAllColumns}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedColumns.length === columns.length ? "Désélectionner tout" : "Sélectionner tout"}
            </button>
          </div>
          
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
            {columns.map((column) => (
              <div key={column.name} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`col-${column.name}`}
                  checked={selectedColumns.includes(column.name)}
                  onChange={() => toggleColumnSelection(column.name)}
                  className="mr-2"
                />
                <label htmlFor={`col-${column.name}`} className="flex-1 cursor-pointer">
                  <span className="font-medium">{column.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({column.type})</span>
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Gestion des filtres */}
        <div className="p-4 bg-white border border-gray-200 rounded-md shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Filter className="mr-2 h-5 w-5 text-blue-500" />
              Filtres
            </h2>
            
            <button
              onClick={() => setShowFilterModal(true)}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm flex items-center"
              disabled={!selectedTable || columns.length === 0}
            >
              <Filter className="mr-1 h-4 w-4" />
              Ajouter un filtre
            </button>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filters.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun filtre appliqué</p>
            ) : (
              <div className="space-y-2">
                {filters.map((filter, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="text-sm">
                      <span className="font-medium">{filter.column}</span>
                      <span className="mx-1">{formatOperator(filter.operator)}</span>
                      <span className="italic">
                        {filter.operator === 'between' ? `${filter.value} - ${filter.value2}` : filter.value}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFilter(index)}
                      className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Contenu principal - tableau de données */}
      <div className="bg-white border border-gray-200 rounded-md shadow">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedTable ? `Données: ${selectedTable}` : 'Sélectionnez une table pour afficher les données'}
            </h2>
            {selectedTable && (
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                {totalRows} lignes au total
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            {selectedTable && selectedColumns.length > 0 && (
              <button
                onClick={exportToCsv}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm flex items-center"
              >
                <Download className="mr-1 h-4 w-4" />
                Exporter en CSV
              </button>
            )}
          </div>
        </div>
        
        {/* Table des données */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : selectedTable && selectedColumns.length > 0 && data.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {selectedColumns.map((column) => (
                    <th
                      key={column}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {selectedColumns.map((column) => (
                      <td key={`${rowIndex}-${column}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCellValue(row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : selectedTable && selectedColumns.length > 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucune donnée trouvée
            </div>
          ) : selectedTable ? (
            <div className="p-6 text-center text-gray-500">
              Sélectionnez au moins une colonne pour afficher les données
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Sélectionnez une table pour afficher les données
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {selectedTable && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`px-4 py-2 text-sm rounded-md ${page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Précédent
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className={`ml-3 px-4 py-2 text-sm rounded-md ${page === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{page}</span> sur <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Première page</span>
                    <span className="h-5">&laquo;</span>
                  </button>
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Page précédente</span>
                    <span className="h-5">&lsaquo;</span>
                  </button>
                  
                  {/* Afficher les numéros de page avec ellipsis si nécessaire */}
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    
                    // Afficher seulement les pages proches de la page actuelle
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            page === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    
                    // Ajouter des ellipsis pour indiquer les pages omises
                    if (pageNum === page - 2 || pageNum === page + 2) {
                      return (
                        <span
                          key={pageNum}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Page suivante</span>
                    <span className="h-5">&rsaquo;</span>
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Dernière page</span>
                    <span className="h-5">&raquo;</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de filtre */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Ajouter un filtre</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colonne
                </label>
                <select
                  value={newFilter.column}
                  onChange={(e) => setNewFilter({ ...newFilter, column: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une colonne</option>
                  {columns.map(column => (
                    <option key={column.name} value={column.name}>
                      {column.name} ({column.type})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opérateur
                </label>
                <select
                  value={newFilter.operator}
                  onChange={(e) => setNewFilter({ ...newFilter, operator: e.target.value as FilterOperator })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="equals">Égal à (=)</option>
                  <option value="contains">Contient</option>
                  <option value="startsWith">Commence par</option>
                  <option value="endsWith">Termine par</option>
                  <option value="greater">Supérieur à (&gt;)</option>
                  <option value="less">Inférieur à (&lt;)</option>
                  <option value="between">Entre</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur
                </label>
                <input
                  type="text"
                  value={newFilter.value}
                  onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez une valeur"
                />
              </div>
              
              {newFilter.operator === 'between' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valeur maximale
                  </label>
                  <input
                    type="text"
                    value={newFilter.value2 || ''}
                    onChange={(e) => setNewFilter({ ...newFilter, value2: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Entrez une valeur maximale"
                  />
                </div>
              )}
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={addFilter}
                  disabled={!newFilter.column || (!newFilter.value && newFilter.operator !== 'between') || (newFilter.operator === 'between' && (!newFilter.value || !newFilter.value2))}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter le filtre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fonction pour formater les valeurs des cellules
function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '—';
  
  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non';
  }
  
  if (value instanceof Date) {
    return value.toLocaleString('fr-FR');
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return String(value);
    }
  }
  
  return String(value);
} 
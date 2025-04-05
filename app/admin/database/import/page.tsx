'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Database, FileText, Upload, Check, AlertTriangle, X } from 'lucide-react';

interface TableInfo {
  tableName: string;
  rowCount: number;
}

interface ImportResult {
  success: boolean;
  message: string;
  inserted: number;
  errors: string[];
  errorRows: Array<{
    row: number;
    data: Record<string, any>;
    error: string;
  }>;
}

export default function DatabaseImport() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showErroneousData, setShowErroneousData] = useState<boolean>(false);
  const [delimiter, setDelimiter] = useState<string>(',');
  const [hasHeaderRow, setHasHeaderRow] = useState<boolean>(true);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Charger les tables au chargement initial
  useState(() => {
    fetchTables();
  });

  // Gérer le changement de fichier
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setImportResult(null);
    
    // Lire le fichier pour prévisualisation
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        try {
          const content = event.target.result as string;
          const rows = parseCSV(content, delimiter);
          
          if (rows.length > 0) {
            // Prévisualiser max 10 lignes
            const previewRows = rows.slice(0, 10);
            setPreview(previewRows);
            
            // Définir les en-têtes
            if (hasHeaderRow && rows.length > 0) {
              const fileHeaders = rows[0];
              setHeaders(fileHeaders);
              
              // Initialiser le mapping des colonnes (correspondance automatique par nom)
              const initialMapping: Record<string, string> = {};
              fileHeaders.forEach(header => {
                initialMapping[header] = header;
              });
              setColumnMapping(initialMapping);
            } else {
              // Générer des en-têtes numériques si pas de ligne d'en-tête
              const numColumns = rows[0]?.length || 0;
              const generatedHeaders = Array.from({ length: numColumns }, (_, i) => `Column${i + 1}`);
              setHeaders(generatedHeaders);
              
              // Initialiser le mapping vide
              const initialMapping: Record<string, string> = {};
              generatedHeaders.forEach(header => {
                initialMapping[header] = '';
              });
              setColumnMapping(initialMapping);
            }
          } else {
            setError("Le fichier semble être vide");
          }
        } catch (err: any) {
          setError(`Erreur de lecture du fichier : ${err.message}`);
          console.error(err);
        }
      }
    };
    reader.onerror = () => {
      setError("Erreur lors de la lecture du fichier");
    };
    reader.readAsText(selectedFile);
  };

  // Parser le contenu CSV
  const parseCSV = (content: string, delim: string): string[][] => {
    const lines = content.split(/\r\n|\n/);
    return lines
      .filter(line => line.trim() !== '')
      .map(line => {
        // Gestion basique du CSV (ne gère pas les guillemets correctement)
        const values = line.split(delim);
        return values.map(val => val.trim());
      });
  };

  // Mettre à jour le mapping des colonnes
  const updateColumnMapping = (csvColumn: string, dbColumn: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [csvColumn]: dbColumn
    }));
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFile(null);
    setPreview([]);
    setHeaders([]);
    setImportResult(null);
    setError(null);
    setColumnMapping({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Soumettre les données pour importation
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedTable) {
      setError("Veuillez sélectionner une table");
      return;
    }
    
    if (!file) {
      setError("Veuillez sélectionner un fichier CSV");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('table', selectedTable);
      formData.append('delimiter', delimiter);
      formData.append('hasHeaderRow', hasHeaderRow.toString());
      formData.append('columnMapping', JSON.stringify(columnMapping));
      
      const response = await fetch('/api/admin/database/import', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de l'importation");
      }
      
      const result = await response.json();
      setImportResult(result);
      
      if (result.success) {
        resetForm();
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'importation");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href="/admin"
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Upload className="mr-2 h-6 w-6 text-blue-500" />
            Importation de données
          </h1>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}
      
      {importResult && (
        <div className={`mb-6 p-4 border rounded-md flex items-start ${
          importResult.success 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          {importResult.success 
            ? <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /> 
            : <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />}
          <div>
            <p className="font-medium">{importResult.message}</p>
            <p className="mt-1">Lignes importées avec succès : {importResult.inserted}</p>
            
            {importResult.errors.length > 0 && (
              <div className="mt-2">
                <p>Erreurs rencontrées : {importResult.errors.length}</p>
                <button
                  onClick={() => setShowErroneousData(!showErroneousData)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
                >
                  {showErroneousData ? "Masquer les détails" : "Afficher les détails"}
                </button>
                
                {showErroneousData && (
                  <div className="mt-3 max-h-48 overflow-y-auto border border-yellow-200 bg-yellow-50 rounded-md p-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="text-left p-1">Ligne</th>
                          <th className="text-left p-1">Erreur</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.errorRows.map((row, idx) => (
                          <tr key={idx} className="border-t border-yellow-200">
                            <td className="p-1">{row.row}</td>
                            <td className="p-1">{row.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Importer des données depuis un CSV</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection de la table */}
          <div>
            <label htmlFor="table" className="block text-sm font-medium text-gray-700 mb-1">
              Table de destination
            </label>
            <div className="relative">
              <select
                id="table"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner une table</option>
                {tables.map(table => (
                  <option key={table.tableName} value={table.tableName}>
                    {table.tableName} ({table.rowCount} enregistrements)
                  </option>
                ))}
              </select>
              {isLoading && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
          
          {/* Paramètres d'importation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="delimiter" className="block text-sm font-medium text-gray-700 mb-1">
                Délimiteur
              </label>
              <select
                id="delimiter"
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value=",">Virgule (,)</option>
                <option value=";">Point-virgule (;)</option>
                <option value="\t">Tabulation</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                id="hasHeaderRow"
                type="checkbox"
                checked={hasHeaderRow}
                onChange={(e) => setHasHeaderRow(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="hasHeaderRow" className="ml-2 block text-sm text-gray-700">
                Le fichier contient une ligne d'en-tête
              </label>
            </div>
          </div>
          
          {/* Sélection du fichier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichier CSV
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                  >
                    <span>Sélectionner un fichier</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      ref={fileInputRef}
                      accept=".csv"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">CSV jusqu'à 2MB</p>
              </div>
            </div>
            {file && (
              <div className="mt-2 flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(2)} KB)</span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          
          {/* Prévisualisation et mapping */}
          {preview.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Prévisualisation et mapping des colonnes</h3>
              
              {/* Table de mapping */}
              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Colonne CSV
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Colonne dans la base de données
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exemple de données
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {headers.map((header, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {header}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="text"
                            value={columnMapping[header] || ''}
                            onChange={(e) => updateColumnMapping(header, e.target.value)}
                            className="border border-gray-300 rounded-md p-1 w-full"
                            placeholder="Nom de colonne DB"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {preview.slice(hasHeaderRow ? 1 : 0).map((row, i) => (
                            <span key={i} className={i > 0 ? 'hidden' : ''}>
                              {row[idx] || ''}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Prévisualisation des données */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu des données</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {headers.map((header, idx) => (
                          <th 
                            key={idx}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.slice(hasHeaderRow ? 1 : 0, 6).map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {row.map((cell, cellIdx) => (
                            <td 
                              key={cellIdx}
                              className="px-4 py-2 whitespace-nowrap text-sm text-gray-500"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.length > 6 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Affichage de {Math.min(5, preview.length - (hasHeaderRow ? 1 : 0))} lignes sur {preview.length - (hasHeaderRow ? 1 : 0)}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Bouton d'importation */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !file || !selectedTable}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                  Importation en cours...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importer les données
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
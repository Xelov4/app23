'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  RefreshCw, 
  Info, 
  Check, 
  Clock, 
  AlertTriangle,
  XCircle,
  PlayCircle,
  PauseCircle,
  Loader2,
  ExternalLink,
  BadgeCheck,
  BadgeX,
  Filter,
  History,
  Tag,
  CheckSquare,
  Calendar,
  Search,
  SlidersHorizontal,
  List
} from 'lucide-react';
import { sequenceTool, ProcessStatus } from '@/app/services/sequencer';
import ImageWithFallback from '@/app/components/common/ImageWithFallback';

// Types
interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  websiteUrl: string;
  isActive: boolean;
  httpCode?: number | null;
  createdAt: string;
  updatedAt: string;
  category?: string;
  tags?: string[];
  lastProcessed?: string | null;
}

interface Process {
  id: number;
  name: string;
  description: string;
  icon: React.ElementType;
}

interface ToolProcess {
  toolId: string;
  processId: number;
  status: ProcessStatus;
  message: string;
  startTime?: Date;
  endTime?: Date;
}

// Ajout du type pour l'historique
interface SequenceHistory {
  id: string;
  toolId: string;
  toolName: string;
  startTime: string;
  endTime: string | null;
  success: boolean;
  processResults: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

// Types pour les filtres
interface ToolFilters {
  search: string;
  categories: string[];
  tags: string[];
  status: "all" | "active" | "inactive" | "processed" | "unprocessed";
  dateRange: {
    start: string | null;
    end: string | null;
  }
}

export default function SequencagePage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(-1);
  const [currentProcessId, setCurrentProcessId] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [toolProcesses, setToolProcesses] = useState<ToolProcess[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [showInactiveTools, setShowInactiveTools] = useState(false);
  const [testedTools, setTestedTools] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<SequenceHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Gestion des filtres
  const [showFilters, setShowFilters] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filters, setFilters] = useState<ToolFilters>({
    search: "",
    categories: [],
    tags: [],
    status: "active",
    dateRange: {
      start: null,
      end: null
    }
  });
  
  // Options d'affichage
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Définition des processus
  const processes: Process[] = [
    { id: 1, name: 'Validation URL', description: 'Vérifie si l\'URL est accessible et suit les redirections', icon: ExternalLink },
    { id: 2, name: 'Capture & Social', description: 'Extrait l\'image et les liens vers les réseaux sociaux', icon: Settings },
    { id: 3, name: 'Extraction texte', description: 'Explore le site pour extraire le contenu textuel', icon: Info },
    { id: 4, name: 'Tarification', description: 'Analyse les informations de tarification', icon: Settings },
    { id: 5, name: 'SEO', description: 'Génère des descriptions optimisées pour le référencement', icon: Settings }
  ];

  // Charger les outils au chargement de la page
  useEffect(() => {
    fetchTools();
  }, []);

  // Appliquer les filtres lorsqu'ils changent
  useEffect(() => {
    applyFilters();
  }, [filters]);

  // Charger l'historique des séquençages
  const fetchSequenceHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/admin/sequence-history');
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }
      const data = await response.json();
      setHistory(data);
      
      // Mettre à jour la propriété lastProcessed des outils
      if (data.length > 0) {
        const processedTools = new Map<string, string>();
        data.forEach((item: SequenceHistory) => {
          if (!processedTools.has(item.toolId) || new Date(item.startTime) > new Date(processedTools.get(item.toolId) || '')) {
            processedTools.set(item.toolId, item.startTime);
          }
        });
        
        setTools(prevTools => prevTools.map(tool => ({
          ...tool,
          lastProcessed: processedTools.get(tool.id) || null
        })));
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Charger l'historique au chargement de la page
  useEffect(() => {
    fetchSequenceHistory();
  }, []);

  // Ajouter un log
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, `[${timestamp}] ${message}`]);
  };

  // Mettre à jour le statut d'un processus pour un outil
  const updateToolProcessStatus = (toolId: string, processId: number, status: ProcessStatus, message: string) => {
    setToolProcesses(prevProcesses => 
      prevProcesses.map(tp => 
        tp.toolId === toolId && tp.processId === processId
          ? { 
              ...tp, 
              status, 
              message,
              ...(status === 'running' ? { startTime: new Date() } : {}),
              ...(status === 'success' || status === 'error' || status === 'warning' ? { endTime: new Date() } : {})
            }
          : tp
      )
    );
    
    // Mettre à jour le processus actuel pour l'affichage
    if (status === 'running') {
      setCurrentProcessId(processId);
    }
    
    // Marquer cet outil comme testé
    if (status !== 'idle' && status !== 'pending') {
      setTestedTools(prev => {
        const newSet = new Set(prev);
        newSet.add(toolId);
        return newSet;
      });
    }
  };

  // Lancer le séquençage pour les outils sélectionnés
  const startSequencing = async () => {
    if (selectedTools.length === 0) {
      setError('Veuillez sélectionner au moins un outil');
      return;
    }

    setIsProcessing(true);
    setError(null);
    addLog(`Démarrage du séquençage pour ${selectedTools.length} outil(s)`);

    // Traiter chaque outil sélectionné séquentiellement
    for (let i = 0; i < selectedTools.length; i++) {
      const toolId = selectedTools[i];
      const tool = tools.find(t => t.id === toolId);
      
      if (!tool) continue;
      
      setProcessingIndex(i);
      addLog(`Traitement de l'outil : ${tool.name} (${i + 1}/${selectedTools.length})`);

      try {
        // Initialiser tous les processus pour cet outil à "pending"
        processes.forEach(process => {
          updateToolProcessStatus(toolId, process.id, 'pending', 'En attente...');
        });

        // Mettre à jour le premier processus à "running"
        updateToolProcessStatus(toolId, 1, 'running', 'En cours...');
        
        // Appeler le service de séquençage
        const result = await sequenceTool(toolId, tool.websiteUrl);
        
        // Mettre à jour les statuts de tous les processus d'après les résultats
        Object.entries(result.processResults).forEach(([processIdStr, processResult]) => {
          const processId = parseInt(processIdStr);
          updateToolProcessStatus(
            toolId, 
            processId, 
            processResult.status, 
            processResult.message
          );

          const processName = processes.find(p => p.id === processId)?.name || `Processus ${processId}`;
          const statusIcon = 
            processResult.status === 'success' ? '✅' : 
            processResult.status === 'warning' ? '⚠️' : 
            processResult.status === 'error' ? '❌' : 
            '🔄';
          
          addLog(`  ${statusIcon} ${processName}: ${processResult.message}`);
        });

        // Si le processus est terminé, mettre à jour la date de dernier traitement
        setTools(prevTools => prevTools.map(t => 
          t.id === toolId 
            ? {...t, lastProcessed: new Date().toISOString()} 
            : t
        ));
        
        // Recharger l'historique
        await fetchSequenceHistory();

        addLog(`Traitement ${result.success ? 'réussi' : 'terminé avec des avertissements'} pour l'outil : ${tool.name}`);
      } catch (err) {
        console.error('Erreur lors du séquençage:', err);
        addLog(`❌ Erreur lors du traitement de l'outil ${tool.name}: ${(err as Error).message}`);
        
        // Mettre à jour les processus restants à "error"
        processes.forEach(process => {
          const tp = toolProcesses.find(tp => tp.toolId === toolId && tp.processId === process.id);
          if (tp && (tp.status === 'pending' || tp.status === 'running')) {
            updateToolProcessStatus(toolId, process.id, 'error', 'Échec du processus');
          }
        });
      }
    }

    setIsProcessing(false);
    setProcessingIndex(-1);
    setCurrentProcessId(-1);
    addLog('Séquençage terminé pour tous les outils sélectionnés');
  };

  // Sélectionner/Désélectionner tous les outils
  const toggleSelectAll = () => {
    if (selectedTools.length === filteredTools.length) {
      setSelectedTools([]);
    } else {
      setSelectedTools(filteredTools.map(tool => tool.id));
    }
  };

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (status: ProcessStatus, size = 5) => {
    switch (status) {
      case 'idle': return <Clock className={`h-${size} w-${size} text-gray-400`} />;
      case 'pending': return <Clock className={`h-${size} w-${size} text-blue-400`} />;
      case 'running': return <Loader2 className={`h-${size} w-${size} text-blue-500 animate-spin`} />;
      case 'success': return <Check className={`h-${size} w-${size} text-green-500`} />;
      case 'warning': return <AlertTriangle className={`h-${size} w-${size} text-yellow-500`} />;
      case 'error': return <XCircle className={`h-${size} w-${size} text-red-500`} />;
      default: return <Clock className={`h-${size} w-${size} text-gray-400`} />;
    }
  };

  // Fonction pour déterminer le statut global d'un outil
  const getToolStatus = (toolId: string) => {
    const toolProcs = toolProcesses.filter(tp => tp.toolId === toolId);
    if (toolProcs.some(tp => tp.status === 'error')) return 'error';
    if (toolProcs.some(tp => tp.status === 'warning')) return 'warning';
    if (toolProcs.every(tp => tp.status === 'success')) return 'success';
    if (toolProcs.some(tp => tp.status === 'running')) return 'running';
    if (toolProcs.some(tp => tp.status === 'pending')) return 'pending';
    return 'idle';
  };

  // Fonction pour formatter les résultats de processus
  const formatProcessResults = (processResultsJson: string) => {
    try {
      const processResults = JSON.parse(processResultsJson);
      return Object.entries(processResults).map(([processId, result]: [string, any]) => {
        const process = processes.find(p => p.id === parseInt(processId));
        const statusClass = 
          result.status === 'success' ? 'text-green-600' :
          result.status === 'error' ? 'text-red-600' :
          result.status === 'warning' ? 'text-yellow-600' : 'text-gray-600';
        
        return (
          <div key={processId} className="mb-1 flex items-start">
            <span className="font-medium mr-2">{process ? process.name : `Processus ${processId}`}:</span>
            <span className={statusClass}>{result.message}</span>
          </div>
        );
      });
    } catch (e) {
      return <div className="text-red-600">Erreur de formatage des résultats</div>;
    }
  };
  
  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Jamais";
    
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Charger les outils et extraire les catégories et tags disponibles
  const fetchTools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tools');
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }
      const data = await response.json();
      
      // Extraire les catégories et tags uniques
      const categories = new Set<string>();
      const tags = new Set<string>();
      
      data.forEach((tool: Tool) => {
        if (tool.category) categories.add(tool.category);
        if (tool.tags) tool.tags.forEach(tag => tags.add(tag));
      });
      
      setAvailableCategories(Array.from(categories));
      setAvailableTags(Array.from(tags));
      setTools(data);
      
      // Appliquer les filtres actuels aux outils chargés
      applyFilters(data, filters);
      
      // Initialiser l'état des processus pour tous les outils
      const initialToolProcesses: ToolProcess[] = [];
      data.forEach((tool: Tool) => {
        processes.forEach(process => {
          initialToolProcesses.push({
            toolId: tool.id,
            processId: process.id,
            status: 'idle',
            message: 'En attente'
          });
        });
      });
      setToolProcesses(initialToolProcesses);
    } catch (err) {
      setError('Erreur lors du chargement des outils');
      console.error('Erreur lors du chargement des outils:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'application des filtres
  const applyFilters = (toolsData: Tool[] = tools, currentFilters: ToolFilters = filters) => {
    let result = [...toolsData];
    
    // Filtre par statut
    if (currentFilters.status === "active") {
      result = result.filter(tool => tool.isActive);
    } else if (currentFilters.status === "inactive") {
      result = result.filter(tool => !tool.isActive);
    } else if (currentFilters.status === "processed") {
      result = result.filter(tool => tool.lastProcessed);
    } else if (currentFilters.status === "unprocessed") {
      result = result.filter(tool => !tool.lastProcessed);
    }
    
    // Filtre par recherche
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      result = result.filter(tool => 
        tool.name.toLowerCase().includes(searchLower) || 
        tool.description.toLowerCase().includes(searchLower) ||
        tool.websiteUrl.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtre par catégories
    if (currentFilters.categories.length > 0) {
      result = result.filter(tool => 
        tool.category && currentFilters.categories.includes(tool.category)
      );
    }
    
    // Filtre par tags
    if (currentFilters.tags.length > 0) {
      result = result.filter(tool => 
        tool.tags && tool.tags.some(tag => currentFilters.tags.includes(tag))
      );
    }
    
    // Filtre par date
    if (currentFilters.dateRange.start || currentFilters.dateRange.end) {
      result = result.filter(tool => {
        if (!tool.lastProcessed) return false;
        
        const processedDate = new Date(tool.lastProcessed);
        let isInRange = true;
        
        if (currentFilters.dateRange.start) {
          const startDate = new Date(currentFilters.dateRange.start);
          isInRange = isInRange && processedDate >= startDate;
        }
        
        if (currentFilters.dateRange.end) {
          const endDate = new Date(currentFilters.dateRange.end);
          isInRange = isInRange && processedDate <= endDate;
        }
        
        return isInRange;
      });
    }
    
    setFilteredTools(result);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-2 h-6 w-6 text-primary" />
            Séquençage d'outils
          </h1>
          <p className="text-gray-500 mt-1">
            Automatisez le traitement de plusieurs outils avec les 5 processus d'extraction
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'bg-gray-50 text-gray-700'}`}
              title="Vue en grille"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'bg-gray-50 text-gray-700'}`}
              title="Vue en liste"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) fetchSequenceHistory();
            }}
            className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            <History className="w-4 h-4 mr-2" />
            {showHistory ? "Masquer l'historique" : "Afficher l'historique"}
          </button>
          
          <button
            onClick={fetchTools}
            disabled={isProcessing}
            className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
          
          <button
            onClick={startSequencing}
            disabled={isProcessing || selectedTools.length === 0}
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <PauseCircle className="w-4 h-4 mr-2" />
                En cours...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                Lancer le traitement
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Section de filtres */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filtres</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recherche */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                    placeholder="Rechercher un outil..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
              </div>
              
              {/* Statut */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  id="status"
                  className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value as any})}
                >
                  <option value="all">Tous les outils</option>
                  <option value="active">Outils actifs</option>
                  <option value="inactive">Outils inactifs</option>
                  <option value="processed">Déjà traités</option>
                  <option value="unprocessed">Jamais traités</option>
                </select>
              </div>
              
              {/* Catégories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégories</label>
                <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                  {availableCategories.length > 0 ? (
                    availableCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => {
                          if (filters.categories.includes(category)) {
                            setFilters({...filters, categories: filters.categories.filter(c => c !== category)});
                          } else {
                            setFilters({...filters, categories: [...filters.categories, category]});
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded-full ${
                          filters.categories.includes(category)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 italic">Aucune catégorie disponible</span>
                  )}
                </div>
              </div>
              
              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                  {availableTags.length > 0 ? (
                    availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (filters.tags.includes(tag)) {
                            setFilters({...filters, tags: filters.tags.filter(t => t !== tag)});
                          } else {
                            setFilters({...filters, tags: [...filters.tags, tag]});
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded-full ${
                          filters.tags.includes(tag)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 italic">Aucun tag disponible</span>
                  )}
                </div>
              </div>
              
              {/* Dates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Période de traitement</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-1"
                    value={filters.dateRange.start || ''}
                    onChange={(e) => setFilters({
                      ...filters, 
                      dateRange: {...filters.dateRange, start: e.target.value || null}
                    })}
                  />
                  <span className="flex items-center text-gray-500">à</span>
                  <input
                    type="date"
                    className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-1"
                    value={filters.dateRange.end || ''}
                    onChange={(e) => setFilters({
                      ...filters, 
                      dateRange: {...filters.dateRange, end: e.target.value || null}
                    })}
                  />
                </div>
              </div>
            </div>
            
            {/* Boutons d'action pour les filtres */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setFilters({
                  search: "",
                  categories: [],
                  tags: [],
                  status: "active",
                  dateRange: { start: null, end: null }
                })}
                className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Affichage du statut */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 flex items-start">
          <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Sélection des outils */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Sélection des outils</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredTools.length} outil(s) trouvé(s) - {selectedTools.length} sélectionné(s)
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center text-sm px-3 py-1 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <CheckSquare className="w-4 h-4 mr-1" />
                    {selectedTools.length === filteredTools.length ? "Tout désélectionner" : "Tout sélectionner"}
                  </button>
                </div>
              </div>
              
              {filteredTools.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Aucun outil ne correspond aux critères de recherche
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {filteredTools.map((tool) => {
                    // Définir le style de la carte en fonction du statut de l'outil et s'il a été testé
                    const isBeingProcessed = processingIndex >= 0 && selectedTools[processingIndex] === tool.id;
                    const isTested = testedTools.has(tool.id);
                    const toolStatus = getToolStatus(tool.id);
                    
                    let statusClasses = "border-gray-300";
                    let bgClasses = "";
                    
                    if (selectedTools.includes(tool.id)) {
                      statusClasses = "border-primary";
                      bgClasses = "bg-primary/10";
                    }
                    
                    if (isTested) {
                      if (toolStatus === 'success') {
                        statusClasses = "border-green-500";
                        bgClasses = "bg-green-50";
                      } else if (toolStatus === 'warning') {
                        statusClasses = "border-yellow-500";
                        bgClasses = "bg-yellow-50";
                      } else if (toolStatus === 'error') {
                        statusClasses = "border-red-500";
                        bgClasses = "bg-red-50";
                      }
                    }
                    
                    if (!tool.isActive) {
                      statusClasses += " opacity-60";
                    }
                    
                    return (
                      <div 
                        key={tool.id}
                        className={`relative border rounded-md p-3 flex items-center space-x-3 hover:border-primary cursor-pointer transition-colors ${statusClasses} ${bgClasses}`}
                        onClick={() => {
                          if (isProcessing) return;
                          
                          setSelectedTools(prevSelected => 
                            prevSelected.includes(tool.id)
                              ? prevSelected.filter(id => id !== tool.id)
                              : [...prevSelected, tool.id]
                          );
                        }}
                      >
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <ImageWithFallback
                            src={tool.logoUrl}
                            alt={tool.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          
                          {!tool.isActive && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center">
                              <XCircle className="h-3 w-3" />
                            </div>
                          )}
                          
                          {isTested && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full h-4 w-4 flex items-center justify-center">
                              {toolStatus === 'success' ? (
                                <BadgeCheck className="h-3 w-3" />
                              ) : toolStatus === 'error' ? (
                                <BadgeX className="h-3 w-3" />
                              ) : (
                                <Info className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {tool.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {tool.websiteUrl}
                          </p>
                          {tool.lastProcessed && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(tool.lastProcessed)}
                            </p>
                          )}
                        </div>
                        {isBeingProcessed && (
                          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-6">
                          <input
                            type="checkbox"
                            checked={selectedTools.length === filteredTools.length && filteredTools.length > 0}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Outil
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          URL
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dernier traitement
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTools.map((tool) => {
                        const isBeingProcessed = processingIndex >= 0 && selectedTools[processingIndex] === tool.id;
                        const isTested = testedTools.has(tool.id);
                        const toolStatus = getToolStatus(tool.id);
                        
                        return (
                          <tr 
                            key={tool.id}
                            className={`hover:bg-gray-50 ${!tool.isActive ? 'opacity-60' : ''} ${selectedTools.includes(tool.id) ? 'bg-primary/5' : ''}`}
                            onClick={() => {
                              if (isProcessing) return;
                              
                              setSelectedTools(prevSelected => 
                                prevSelected.includes(tool.id)
                                  ? prevSelected.filter(id => id !== tool.id)
                                  : [...prevSelected, tool.id]
                              );
                            }}
                          >
                            <td className="px-4 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedTools.includes(tool.id)}
                                onChange={() => {}}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 relative">
                                  <ImageWithFallback
                                    src={tool.logoUrl}
                                    alt={tool.name}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                  {!tool.isActive && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-3 w-3" />
                                  )}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                                  {tool.category && (
                                    <div className="text-xs text-gray-500">{tool.category}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 truncate max-w-[200px]">{tool.websiteUrl}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {isBeingProcessed ? (
                                <div className="flex items-center">
                                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin mr-2" />
                                  <span className="text-sm text-blue-500">En cours</span>
                                </div>
                              ) : isTested ? (
                                <div className={`flex items-center ${
                                  toolStatus === 'success' ? 'text-green-600' :
                                  toolStatus === 'warning' ? 'text-yellow-600' :
                                  toolStatus === 'error' ? 'text-red-600' :
                                  'text-gray-500'
                                }`}>
                                  {getStatusIcon(toolStatus, 4)}
                                  <span className="ml-2 text-sm">
                                    {toolStatus === 'success' ? 'Succès' : 
                                     toolStatus === 'warning' ? 'Avertissement' :
                                     toolStatus === 'error' ? 'Échec' : 'Non traité'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">Non traité</span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {tool.lastProcessed ? formatDate(tool.lastProcessed) : "Jamais"}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* Processus pour les outils sélectionnés */}
          {selectedTools.length > 0 && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Statut des processus</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                          Outil
                        </th>
                        {processes.map((process) => (
                          <th 
                            key={process.id} 
                            scope="col" 
                            className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                            title={process.description}
                          >
                            <div className="flex flex-col items-center justify-center">
                              <process.icon className="h-4 w-4 mb-1" />
                              <span>{process.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedTools.map((toolId) => {
                        const tool = tools.find(t => t.id === toolId);
                        if (!tool) return null;
                        
                        return (
                          <tr key={tool.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 relative">
                                  <ImageWithFallback
                                    src={tool.logoUrl}
                                    alt={tool.name}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                  {!tool.isActive && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-3 w-3" />
                                  )}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                                  <div className="text-xs text-gray-500 truncate max-w-[180px]">{tool.websiteUrl}</div>
                                </div>
                              </div>
                            </td>
                            {processes.map((process) => {
                              const toolProcess = toolProcesses.find(
                                tp => tp.toolId === tool.id && tp.processId === process.id
                              );
                              
                              if (!toolProcess) return (
                                <td key={`${tool.id}-${process.id}`} className="px-3 py-4 whitespace-nowrap text-center">
                                  <span className="text-gray-400">-</span>
                                </td>
                              );
                              
                              // Simplifier l'affichage pour montrer principalement des icônes de statut
                              return (
                                <td key={`${tool.id}-${process.id}`} className="px-3 py-4 whitespace-nowrap text-center">
                                  <div className="flex flex-col items-center" title={toolProcess.message}>
                                    {getStatusIcon(toolProcess.status, 5)}
                                    {toolProcess.status !== 'idle' && (
                                      <span className={`text-xs mt-1 ${
                                        toolProcess.status === 'success' ? 'text-green-600' :
                                        toolProcess.status === 'error' ? 'text-red-600' :
                                        toolProcess.status === 'warning' ? 'text-yellow-600' :
                                        toolProcess.status === 'running' ? 'text-blue-600' :
                                        'text-gray-500'
                                      }`}>
                                        {toolProcess.status === 'success' ? 'OK' : 
                                         toolProcess.status === 'warning' ? 'Partiel' :
                                         toolProcess.status === 'error' ? 'Échec' :
                                         toolProcess.status === 'running' ? 'En cours' :
                                         'En attente'}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Historique des séquençages */}
          {showHistory && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <History className="h-5 w-5 mr-2 text-primary" />
                    Historique des séquençages
                  </h2>
                  <button
                    onClick={fetchSequenceHistory}
                    disabled={isLoadingHistory}
                    className="flex items-center text-sm text-primary hover:text-primary-dark"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                    Actualiser
                  </button>
                </div>
                
                {isLoadingHistory ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun historique de séquençage disponible
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="space-y-4">
                      {history.map((item) => (
                        <div key={item.id} className={`border rounded-md p-4 ${item.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-md font-medium">{item.toolName}</h3>
                              <p className="text-sm text-gray-500">ID: {item.toolId}</p>
                              <p className="text-sm text-gray-500">
                                Date: {formatDate(item.startTime)}
                                {item.endTime && ` - ${formatDate(item.endTime)}`}
                              </p>
                            </div>
                            <div className={`text-sm font-medium px-2 py-1 rounded-full ${item.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.success ? 'Succès' : 'Échec'}
                            </div>
                          </div>
                          
                          <div className="mt-3 text-sm border-t pt-3 border-gray-200">
                            <h4 className="font-medium mb-2">Résultats des processus:</h4>
                            <div className="space-y-1">
                              {formatProcessResults(item.processResults)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Journal d'activité */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Journal d'activité</h2>
              
              <div className="bg-gray-50 rounded-md p-3 max-h-80 overflow-y-auto text-sm">
                {logs.length === 0 ? (
                  <p className="text-gray-500 italic">Aucune activité pour le moment</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1 text-gray-700">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Edit, 
  Trash2, 
  Search, 
  Plus, 
  RefreshCw, 
  Filter, 
  ArrowUpDown,
  Layers,
  Info,
  Video,
  Camera,
  Play,
  Film,
  Youtube,
  MessageSquare,
  Mic,
  Music,
  Headphones,
  Volume2,
  Radio,
  Image,
  ImagePlus,
  FileImage,
  Upload,
  Download,
  Crop,
  Scissors,
  Copy,
  Paintbrush,
  Palette,
  Wand2,
  Pencil,
  Type,
  FileText,
  ListOrdered,
  ListChecks,
  Brain,
  Cpu,
  Code,
  Bot,
  Lightbulb,
  Sparkles,
  GitBranch,
  Github,
  Database,
  Cloud,
  Terminal,
  Settings,
  LayoutGrid
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Définition de toutes les icônes disponibles
const allIcons: Record<string, React.ReactNode> = {
  // Vidéo
  'video': <Video className="h-5 w-5 text-primary" />,
  'camera': <Camera className="h-5 w-5 text-primary" />,
  'play': <Play className="h-5 w-5 text-primary" />,
  'film': <Film className="h-5 w-5 text-primary" />,
  'youtube': <Youtube className="h-5 w-5 text-primary" />,
  'message-square': <MessageSquare className="h-5 w-5 text-primary" />,
  
  // Audio
  'mic': <Mic className="h-5 w-5 text-primary" />,
  'music': <Music className="h-5 w-5 text-primary" />,
  'headphones': <Headphones className="h-5 w-5 text-primary" />,
  'volume2': <Volume2 className="h-5 w-5 text-primary" />,
  'radio': <Radio className="h-5 w-5 text-primary" />,
  
  // Photo
  'image': <Image className="h-5 w-5 text-primary" />,
  'image-plus': <ImagePlus className="h-5 w-5 text-primary" />,
  'file-image': <FileImage className="h-5 w-5 text-primary" />,
  'upload': <Upload className="h-5 w-5 text-primary" />,
  'download': <Download className="h-5 w-5 text-primary" />,
  
  // Édition
  'crop': <Crop className="h-5 w-5 text-primary" />,
  'scissors': <Scissors className="h-5 w-5 text-primary" />,
  'edit': <Edit className="h-5 w-5 text-primary" />,
  'copy': <Copy className="h-5 w-5 text-primary" />,
  'paintbrush': <Paintbrush className="h-5 w-5 text-primary" />,
  'palette': <Palette className="h-5 w-5 text-primary" />,
  'wand2': <Wand2 className="h-5 w-5 text-primary" />,
  'pencil': <Pencil className="h-5 w-5 text-primary" />,
  'type': <Type className="h-5 w-5 text-primary" />,
  'file-text': <FileText className="h-5 w-5 text-primary" />,
  'list-ordered': <ListOrdered className="h-5 w-5 text-primary" />,
  'list-checks': <ListChecks className="h-5 w-5 text-primary" />,
  
  // IA et outils
  'brain': <Brain className="h-5 w-5 text-primary" />,
  'cpu': <Cpu className="h-5 w-5 text-primary" />,
  'code': <Code className="h-5 w-5 text-primary" />,
  'bot': <Bot className="h-5 w-5 text-primary" />,
  'lightbulb': <Lightbulb className="h-5 w-5 text-primary" />,
  'sparkles': <Sparkles className="h-5 w-5 text-primary" />,
  'git-branch': <GitBranch className="h-5 w-5 text-primary" />,
  'github': <Github className="h-5 w-5 text-primary" />,
  'database': <Database className="h-5 w-5 text-primary" />,
  'cloud': <Cloud className="h-5 w-5 text-primary" />,
  'terminal': <Terminal className="h-5 w-5 text-primary" />,
  'settings': <Settings className="h-5 w-5 text-primary" />,
  'layout-grid': <LayoutGrid className="h-5 w-5 text-primary" />
};

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  iconName: string | null;
  toolCount: number;
  createdAt: string;
  updatedAt: string;
}

// Fonction pour afficher l'icône
const DynamicIcon = ({ iconName }: { iconName: string | null }) => {
  if (!iconName || !(iconName in allIcons)) {
    return <Layers className="h-5 w-5 text-gray-500" />;
  }
  
  return allIcons[iconName];
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Charger les catégories
  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
      console.error('Erreur lors du chargement des catégories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les catégories au chargement de la page
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filtrer les catégories selon le terme de recherche
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Layers className="mr-2 h-6 w-6 text-primary" />
            Toutes les catégories
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez les catégories utilisées pour organiser les outils
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={fetchCategories}
            className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
          
          <Link
            href="/admin/categories/new"
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle catégorie
          </Link>
        </div>
      </div>
      
      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>
      
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
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-500">Aucune catégorie trouvée</p>
        </div>
      ) : (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white shadow rounded-md p-4 border-l-4 border-blue-500">
              <p className="text-gray-500 text-sm">Nombre de catégories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
            <div className="bg-white shadow rounded-md p-4 border-l-4 border-green-500">
              <p className="text-gray-500 text-sm">Catégories actives</p>
              <p className="text-2xl font-bold">
                {categories.filter(cat => cat.toolCount > 0).length}
              </p>
            </div>
            <div className="bg-white shadow rounded-md p-4 border-l-4 border-amber-500">
              <p className="text-gray-500 text-sm">Catégories sans outils</p>
              <p className="text-2xl font-bold">
                {categories.filter(cat => cat.toolCount === 0).length}
              </p>
            </div>
          </div>

          {/* Tableau des catégories */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
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
                      Slug
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outils
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière mise à jour
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {category.iconName ? (
                              <DynamicIcon iconName={category.iconName} />
                            ) : (
                              <Layers className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{category.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{category.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          category.toolCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.toolCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(category.updatedAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/categories/edit/${category.slug}`}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-md mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 
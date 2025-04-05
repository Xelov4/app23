'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Search,
  AlertCircle,
  Layers,
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
  Edit,
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

// Définition de toutes les icônes disponibles
const allIcons: Record<string, React.ReactNode> = {
  // Vidéo
  'video': <Video />,
  'camera': <Camera />,
  'play': <Play />,
  'film': <Film />,
  'youtube': <Youtube />,
  'message-square': <MessageSquare />,
  
  // Audio
  'mic': <Mic />,
  'music': <Music />,
  'headphones': <Headphones />,
  'volume2': <Volume2 />,
  'radio': <Radio />,
  
  // Photo
  'image': <Image />,
  'image-plus': <ImagePlus />,
  'file-image': <FileImage />,
  'upload': <Upload />,
  'download': <Download />,
  
  // Édition
  'crop': <Crop />,
  'scissors': <Scissors />,
  'edit': <Edit />,
  'copy': <Copy />,
  'paintbrush': <Paintbrush />,
  'palette': <Palette />,
  'wand2': <Wand2 />,
  'pencil': <Pencil />,
  'type': <Type />,
  'file-text': <FileText />,
  'list-ordered': <ListOrdered />,
  'list-checks': <ListChecks />,
  
  // IA et outils
  'brain': <Brain />,
  'cpu': <Cpu />,
  'code': <Code />,
  'bot': <Bot />,
  'lightbulb': <Lightbulb />,
  'sparkles': <Sparkles />,
  'git-branch': <GitBranch />,
  'github': <Github />,
  'database': <Database />,
  'cloud': <Cloud />,
  'terminal': <Terminal />,
  'settings': <Settings />,
  'layout-grid': <LayoutGrid />
};

// Catégorisation des icônes
const iconCategories: Record<string, string[]> = {
  'vidéo': ['video', 'camera', 'play', 'film', 'youtube', 'message-square'],
  'audio': ['mic', 'music', 'headphones', 'volume2', 'radio'],
  'photo': ['image', 'image-plus', 'file-image', 'upload', 'download'],
  'édition': ['crop', 'scissors', 'edit', 'copy', 'paintbrush', 'palette', 'wand2', 'pencil', 'type', 'file-text', 'list-ordered', 'list-checks'],
  'IA et outils': ['brain', 'cpu', 'code', 'bot', 'lightbulb', 'sparkles', 'git-branch', 'github', 'database', 'cloud', 'terminal', 'settings', 'layout-grid']
};

interface SimpleIconSelectorProps {
  value: string | null;
  onChange: (iconName: string | null) => void;
  usedIcons?: string[]; // Liste des noms d'icônes déjà utilisées
}

export default function SimpleIconSelector({ value, onChange, usedIcons = [] }: SimpleIconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string | 'toutes'>('toutes');
  const [showIconGrid, setShowIconGrid] = useState(false);
  
  // Obtenir l'icône par son nom
  const getIconByName = (name: string | null) => {
    if (!name || !(name in allIcons)) return <Layers />;
    return allIcons[name];
  };
  
  // Filtrer les icônes en fonction du terme de recherche et de la catégorie
  const getFilteredIcons = () => {
    let iconNames = category === 'toutes' 
      ? Object.keys(allIcons)
      : iconCategories[category] || [];
    
    if (searchTerm.trim() !== '') {
      iconNames = iconNames.filter(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return iconNames;
  };
  
  const filteredIcons = getFilteredIcons();
  
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div 
          className={`
            border-2 rounded-md p-4 flex items-center justify-center 
            ${value ? 'border-gray-300' : 'border-dashed border-gray-300'}
            h-20 w-20
          `}
          onClick={() => setShowIconGrid(prev => !prev)}
        >
          {value ? (
            <div className="h-10 w-10 flex items-center justify-center text-primary">
              {getIconByName(value)}
            </div>
          ) : (
            <div className="text-gray-400 text-center text-xs">
              Cliquez pour sélectionner une icône
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800 mb-2"
            onClick={() => setShowIconGrid(prev => !prev)}
          >
            {showIconGrid ? 'Masquer les icônes' : 'Choisir une icône'}
          </button>
          {value && (
            <button
              type="button"
              className="text-sm text-red-600 hover:text-red-800"
              onClick={() => {
                onChange(null);
              }}
            >
              Supprimer l'icône
            </button>
          )}
        </div>
      </div>

      {showIconGrid && (
        <div className="bg-white border rounded-md shadow-sm p-4 space-y-4">
          {/* Filtres de recherche et catégories */}
          <div className="space-y-3">
            <div className="flex items-center border rounded-md px-3 py-2">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Rechercher une icône..."
                className="border-none focus:ring-0 flex-1 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div 
                className={`px-3 py-1.5 text-xs rounded-full cursor-pointer flex items-center gap-1
                  ${category === 'toutes' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setCategory('toutes')}
              >
                <Layers className="h-3 w-3" />
                Toutes
              </div>
              {Object.keys(iconCategories).map((cat) => (
                <div 
                  key={cat}
                  className={`px-3 py-1.5 text-xs rounded-full cursor-pointer
                    ${category === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setCategory(cat as any)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </div>
              ))}
            </div>
          </div>

          {usedIcons.length > 0 && (
            <div className="text-sm text-amber-600 flex items-center mb-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Les icônes grisées sont déjà utilisées par d'autres catégories</span>
            </div>
          )}

          <div className="grid grid-cols-6 gap-3 max-h-60 overflow-y-auto">
            {filteredIcons.map((iconName) => {
              const isUsed = usedIcons.includes(iconName) && iconName !== value;
              
              return (
                <div
                  key={iconName}
                  onClick={() => !isUsed && onChange(iconName)}
                  className={`
                    p-2 border rounded-md flex flex-col items-center justify-center cursor-pointer
                    ${value === iconName ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
                    ${isUsed ? 'opacity-30 cursor-not-allowed' : ''}
                  `}
                  title={isUsed ? 'Cette icône est déjà utilisée' : iconName}
                >
                  <div className="h-8 w-8 flex items-center justify-center">
                    {getIconByName(iconName)}
                  </div>
                  <div className="text-xs text-center mt-1 truncate w-full">
                    {iconName.replace(/-/g, ' ')}
                  </div>
                  {value === iconName && (
                    <div className="absolute top-0 right-0 -mt-1 -mr-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Aucune icône trouvée
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
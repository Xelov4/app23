'use client';

import { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Check } from 'lucide-react';

// Groupements d'icônes par catégorie
const ICON_CATEGORIES = {
  'Vidéo': [
    'Video', 'Camera', 'Play', 'Film', 'Youtube', 'MessageSquare',
    'Clapperboard', 'VideoRecorder', 'Projector', 'ScreenShare'
  ],
  'Audio': [
    'Mic', 'Music', 'Headphones', 'Volume2', 'Radio', 'Speaker',
    'Music2', 'Podcast', 'Microphone', 'VolumeX'
  ],
  'Photo': [
    'Image', 'ImagePlus', 'FileImage', 'Upload', 'Download', 'Camera',
    'Aperture', 'Images', 'Landscape', 'Frame'
  ],
  'Édition': [
    'Crop', 'Scissors', 'Edit', 'Copy', 'Paintbrush', 'Palette',
    'Wand2', 'Pencil', 'Type', 'FileText'
  ],
  'IA': [
    'Brain', 'Cpu', 'Code', 'Bot', 'Lightbulb', 'Sparkles',
    'Zap', 'Monitor', 'GitBranch', 'CpuIcon'
  ],
  'UI': [
    'LayoutGrid', 'Layers', 'Kanban', 'PanelLeft', 'PanelRight', 'PanelTop',
    'Monitor', 'Smartphone', 'Tablet', 'SplitSquareVertical'
  ],
  'Médias Sociaux': [
    'Twitter', 'Facebook', 'Instagram', 'Youtube', 'Linkedin', 'Github',
    'Twitch', 'TikTok', 'Snapchat', 'Slack'
  ],
  'Autre': [
    'Settings', 'Tool', 'FileCode', 'Cloud', 'Database', 'Terminal',
    'ShieldCheck', 'Award', 'Star', 'Heart'
  ]
};

export type IconSelectorMode = 'simple' | 'grid' | 'media';

type IconSelectorProps = {
  selectedIcon: string;
  onChange: (iconName: string) => void;
  mode?: IconSelectorMode;
  className?: string;
};

export default function IconSelector({
  selectedIcon,
  onChange,
  mode = 'simple',
  className = ''
}: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [filteredIcons, setFilteredIcons] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>('Vidéo');
  
  // Récupérer toutes les icônes disponibles
  const allIcons = Object.keys(LucideIcons)
    .filter(key => typeof LucideIcons[key as keyof typeof LucideIcons] === 'function');
    
  // Filtrer les icônes en fonction du terme de recherche
  useEffect(() => {
    if (!searchTerm) {
      // Si pas de recherche, afficher les icônes de la catégorie active
      if (activeCategory) {
        setFilteredIcons(ICON_CATEGORIES[activeCategory as keyof typeof ICON_CATEGORIES] || []);
      } else {
        setFilteredIcons(allIcons.slice(0, 40)); // Limiter à 40 icônes par défaut
      }
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = allIcons.filter(icon => 
      icon.toLowerCase().includes(term)
    );
    
    setFilteredIcons(filtered.slice(0, 40)); // Limiter à 40 résultats
    setActiveCategory(null); // Désactiver la catégorie lors d'une recherche
  }, [searchTerm, activeCategory, allIcons]);
  
  // Composant pour afficher l'icône sélectionnée
  const SelectedIconComponent = selectedIcon
    ? LucideIcons[selectedIcon as keyof typeof LucideIcons] as React.FC<any>
    : null;
    
  // Rendre l'interface en fonction du mode
  const renderIconSelector = () => {
    // Sélecteur simple (juste un dropdown)
    if (mode === 'simple') {
      return (
        <div className={`relative ${className}`}>
          <div 
            className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
            onClick={() => setShowOptions(!showOptions)}
          >
            {SelectedIconComponent ? (
              <SelectedIconComponent className="h-5 w-5 text-primary mr-2" />
            ) : (
              <LucideIcons.Layers className="h-5 w-5 text-gray-400 mr-2" />
            )}
            <span>{selectedIcon || 'Sélectionner une icône'}</span>
          </div>
          
          {showOptions && (
            <div className="absolute z-50 mt-1 w-64 max-h-80 overflow-y-auto bg-white border rounded-md shadow-lg">
              <div className="p-2 border-b">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une icône..."
                  className="w-full"
                />
              </div>
              
              <div className="p-2 grid grid-cols-4 gap-2">
                {filteredIcons.map(icon => {
                  const IconComponent = LucideIcons[icon as keyof typeof LucideIcons] as React.FC<any>;
                  return (
                    <div
                      key={icon}
                      className={`flex flex-col items-center p-2 rounded-md cursor-pointer transition-colors ${
                        selectedIcon === icon ? 'bg-primary/10 border border-primary/20' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        onChange(icon);
                        setShowOptions(false);
                      }}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="text-xs mt-1 text-center truncate w-full">{icon}</span>
                    </div>
                  );
                })}
                
                {filteredIcons.length === 0 && (
                  <div className="col-span-4 py-4 text-center text-gray-500">
                    Aucune icône trouvée
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Sélecteur en grille
    if (mode === 'grid') {
      return (
        <div className={`border rounded-md ${className}`}>
          <div className="p-3 border-b">
            <div className="flex items-center border rounded-md overflow-hidden">
              <Search className="h-4 w-4 text-gray-400 ml-2" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une icône..."
                className="border-0 focus-visible:ring-0"
              />
            </div>
          </div>
          
          <div className="p-2 flex flex-wrap gap-1 border-b overflow-x-auto">
            {Object.keys(ICON_CATEGORIES).map(category => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="p-3 grid grid-cols-6 gap-2 max-h-60 overflow-y-auto">
            {filteredIcons.map(icon => {
              const IconComponent = LucideIcons[icon as keyof typeof LucideIcons] as React.FC<any>;
              return (
                <div
                  key={icon}
                  className={`flex flex-col items-center p-2 rounded-md cursor-pointer transition-colors ${
                    selectedIcon === icon 
                      ? 'bg-primary/10 border border-primary/20 text-primary' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => onChange(icon)}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-xs mt-1 text-center truncate w-full">{icon}</span>
                  {selectedIcon === icon && (
                    <Check className="h-3 w-3 mt-1 text-primary" />
                  )}
                </div>
              );
            })}
            
            {filteredIcons.length === 0 && (
              <div className="col-span-6 py-6 text-center text-gray-500">
                Aucune icône trouvée
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Sélecteur média (grande grille avec prévisualisation)
    return (
      <div className={`border rounded-md ${className}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-medium">Sélectionner une icône</div>
          {SelectedIconComponent && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Icône sélectionnée:</span>
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md">
                <SelectedIconComponent className="h-4 w-4 text-primary" />
                <span className="text-sm">{selectedIcon}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 flex items-center border-b">
          <div className="flex flex-1 items-center border rounded-md overflow-hidden">
            <Search className="h-4 w-4 text-gray-400 ml-2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une icône..."
              className="border-0 focus-visible:ring-0"
            />
          </div>
        </div>
        
        <div className="p-2 flex flex-wrap gap-1 border-b overflow-x-auto">
          {Object.keys(ICON_CATEGORIES).map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        <div className="grid grid-cols-8 gap-0.5 max-h-80 overflow-y-auto">
          {filteredIcons.map(icon => {
            const IconComponent = LucideIcons[icon as keyof typeof LucideIcons] as React.FC<any>;
            const isSelected = selectedIcon === icon;
            
            return (
              <div
                key={icon}
                className={`aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onChange(icon)}
              >
                <IconComponent className="h-6 w-6" />
                <span className="text-xs mt-1 text-center truncate max-w-full px-1">
                  {icon}
                </span>
                {isSelected && (
                  <div className="mt-1 bg-primary rounded-full p-0.5">
                    <Check className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredIcons.length === 0 && (
            <div className="col-span-8 py-10 text-center text-gray-500">
              Aucune icône trouvée
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return renderIconSelector();
} 
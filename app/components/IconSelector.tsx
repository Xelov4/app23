'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Search,
  AlertCircle
} from 'lucide-react';

// Import des icônes Hero solides
import * as SolidIcons from '@heroicons/react/24/solid';

// Définition des types
interface IconSelectorProps {
  value: string | null;
  onChange: (iconName: string | null) => void;
  usedIcons?: string[]; // Liste des noms d'icônes déjà utilisées
}

interface IconOption {
  name: string;
  component: React.ForwardRefExoticComponent<any>;
}

// Composant de sélection d'icônes
export default function IconSelector({ value, onChange, usedIcons = [] }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(value);
  const [iconsLoaded, setIconsLoaded] = useState<IconOption[]>([]);
  const [filteredIcons, setFilteredIcons] = useState<IconOption[]>([]);
  const [showIconGrid, setShowIconGrid] = useState(false);

  // Chargement des icônes
  useEffect(() => {
    // Convertir les icônes importées en tableau
    const icons: IconOption[] = Object.entries(SolidIcons).map(([name, component]) => ({
      name,
      component
    }));
    
    setIconsLoaded(icons);
    setFilteredIcons(icons);
  }, []);

  // Filtrer les icônes en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredIcons(iconsLoaded);
    } else {
      const filtered = iconsLoaded.filter(icon => 
        icon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredIcons(filtered);
    }
  }, [searchTerm, iconsLoaded]);

  // Gestion de la sélection d'icône
  const handleIconSelect = (iconName: string) => {
    // Vérifier si l'icône est déjà utilisée
    if (usedIcons.includes(iconName) && iconName !== value) {
      // Ne rien faire si l'icône est déjà utilisée par une autre catégorie
      return;
    }
    
    setSelectedIcon(iconName);
    onChange(iconName);
    setShowIconGrid(false);
  };

  // Rendu de l'icône sélectionnée
  const renderSelectedIcon = () => {
    if (!selectedIcon) return null;
    
    const icon = iconsLoaded.find(i => i.name === selectedIcon);
    if (!icon) return null;
    
    const IconComponent = icon.component;
    return <IconComponent className="h-10 w-10 text-primary" />;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div 
          className={`
            border-2 rounded-md p-4 flex items-center justify-center 
            ${selectedIcon ? 'border-gray-300' : 'border-dashed border-gray-300'}
            h-20 w-20
          `}
          onClick={() => setShowIconGrid(prev => !prev)}
        >
          {selectedIcon ? (
            renderSelectedIcon()
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
          {selectedIcon && (
            <button
              type="button"
              className="text-sm text-red-600 hover:text-red-800"
              onClick={() => {
                setSelectedIcon(null);
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
          <div className="flex items-center border rounded-md px-3 py-2 mb-4">
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

          {usedIcons.length > 0 && (
            <div className="text-sm text-amber-600 flex items-center mb-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Les icônes grisées sont déjà utilisées par d'autres catégories</span>
            </div>
          )}

          <div className="grid grid-cols-6 gap-3 max-h-60 overflow-y-auto">
            {filteredIcons.map((icon) => {
              const isUsed = usedIcons.includes(icon.name) && icon.name !== value;
              const IconComponent = icon.component;
              
              return (
                <div
                  key={icon.name}
                  onClick={() => !isUsed && handleIconSelect(icon.name)}
                  className={`
                    p-2 border rounded-md flex flex-col items-center justify-center cursor-pointer
                    ${selectedIcon === icon.name ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
                    ${isUsed ? 'opacity-30 cursor-not-allowed' : ''}
                  `}
                  title={isUsed ? 'Cette icône est déjà utilisée' : icon.name}
                >
                  <IconComponent className="h-8 w-8" />
                  <div className="text-xs text-center mt-1 truncate w-full">
                    {icon.name.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  {selectedIcon === icon.name && (
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
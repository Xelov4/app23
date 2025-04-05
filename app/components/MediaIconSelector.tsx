'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { 
  CheckCircle, 
  XCircle, 
  Search,
  AlertCircle,
  Filter,
  Layers
} from 'lucide-react';

// Catégorisation des icônes par thème
const iconCategories = {
  'video': [
    // Tabler
    'tabler:video', 'tabler:camera', 'tabler:movie', 'tabler:video-plus', 
    'tabler:brand-youtube', 'tabler:brand-tiktok', 'tabler:camera-selfie',
    'tabler:video-off', 'tabler:screen-share', 'tabler:device-tv',
    'tabler:film', 'tabler:aspect-ratio', 'tabler:cinema', 'tabler:frame',
    'tabler:camera-plus', 'tabler:camera-minus', 'tabler:video-minus', 
    'tabler:clapperboard', 'tabler:picture-in-picture', 'tabler:camera-rotate',
    'tabler:video-check', 'tabler:camera-check', 'tabler:camera-up', 'tabler:view-360',
    // Material
    'material-symbols:movie', 'material-symbols:slow-motion-video', 
    'material-symbols:video-camera-back', 'material-symbols:video-file',
    'material-symbols:video-call', 'material-symbols:video-settings', 
    'material-symbols:video-library', 'material-symbols:video-stable',
    'material-symbols:subscriptions', 'material-symbols:slideshow',
    'material-symbols:connected-tv', 'material-symbols:switch-video',
    'material-symbols:video-camera-front', 'material-symbols:video-chat',
    'material-symbols:cast', 'material-symbols:cast-for-education',
    // Phosphor
    'ph:video-camera', 'ph:video', 'ph:video-camera-slash',
    'ph:monitor-play', 'ph:film-slate', 'ph:film-strip',
    'ph:youtube-logo', 'ph:television', 'ph:screencast',
    'ph:video-light', 'ph:video-bold', 'ph:camera-light', 'ph:camera-bold',
    // Fluent
    'fluent:video-24-regular', 'fluent:video-clip-24-regular',
    'fluent:camera-video-24-regular', 'fluent:tv-24-regular',
    'fluent:movies-and-tv-24-regular', 'fluent:live-24-regular',
    'fluent:video-360-24-regular', 'fluent:screen-share-24-regular',
    'fluent:video-person-24-regular', 'fluent:video-recording-24-regular'
  ],
  'audio': [
    // Tabler
    'tabler:microphone', 'tabler:volume', 'tabler:music', 'tabler:note',
    'tabler:headphones', 'tabler:volume-2', 'tabler:podcast', 
    'tabler:microphone-2', 'tabler:waveform', 'tabler:vinyl', 'tabler:ear',
    'tabler:audio-description', 'tabler:speakers', 'tabler:tallymarks',
    'tabler:sound-check', 'tabler:player-record', 'tabler:player-pause',
    'tabler:player-play', 'tabler:player-stop', 'tabler:player-eject',
    'tabler:player-track-next', 'tabler:player-track-prev', 'tabler:playlist',
    // Material
    'material-symbols:mic', 'material-symbols:volume-up',
    'material-symbols:audiotrack', 'material-symbols:music-note',
    'material-symbols:headphones', 'material-symbols:headset',
    'material-symbols:podcasts', 'material-symbols:graphic-eq',
    'material-symbols:surround-sound', 'material-symbols:hearing',
    'material-symbols:play-arrow', 'material-symbols:pause',
    'material-symbols:stop', 'material-symbols:record-voice-over',
    // Phosphor
    'ph:microphone', 'ph:speaker-high', 'ph:headphones',
    'ph:music-notes', 'ph:ear', 'ph:waveform', 'ph:radio',
    'ph:vinyl-record', 'ph:play', 'ph:pause', 'ph:stop',
    'ph:microphone-stage', 'ph:soundcloud-logo', 'ph:spotify-logo',
    // Fluent
    'fluent:mic-24-regular', 'fluent:speaker-24-regular',
    'fluent:headphones-24-regular', 'fluent:music-note-24-regular',
    'fluent:music-note-2-24-regular', 'fluent:equalizer-24-regular'
  ],
  'photo': [
    // Tabler
    'tabler:photo', 'tabler:camera', 'tabler:photo-edit', 'tabler:photo-plus',
    'tabler:photo-search', 'tabler:photo-check', 'tabler:photo-down',
    'tabler:photo-search', 'tabler:photo-shield', 'tabler:photo-star',
    'tabler:photo-up', 'tabler:polaroid', 'tabler:camera-selfie',
    'tabler:camera-plus', 'tabler:panorama-horizontal', 'tabler:panorama-vertical',
    'tabler:contrast', 'tabler:exposure', 'tabler:brightness', 'tabler:capture',
    'tabler:image-broken', 'tabler:camera-up', 'tabler:color-picker',
    // Material
    'material-symbols:image', 'material-symbols:camera',
    'material-symbols:camera-enhance', 'material-symbols:photo-album',
    'material-symbols:photo-library', 'material-symbols:photo-camera-back',
    'material-symbols:photo-filter', 'material-symbols:photo-size-select-actual',
    'material-symbols:filter', 'material-symbols:image-search',
    'material-symbols:monochrome-photos', 'material-symbols:photo-camera',
    'material-symbols:filter-vintage', 'material-symbols:filter-hdr',
    // Phosphor
    'ph:image', 'ph:image-square', 'ph:camera',
    'ph:selection', 'ph:paint-brush', 'ph:gallery',
    'ph:photo-album', 'ph:polaroid', 'ph:sticker',
    'ph:photos', 'ph:instagram-logo', 'ph:figma-logo',
    'ph:crop', 'ph:selection-plus', 'ph:selection-all',
    // Fluent
    'fluent:camera-24-regular', 'fluent:image-24-regular',
    'fluent:image-add-24-regular', 'fluent:image-edit-24-regular',
    'fluent:image-multiple-24-regular', 'fluent:text-color-24-regular',
    'fluent:crop-24-regular', 'fluent:shapes-24-regular'
  ],
  'édition': [
    // Tabler
    'tabler:cut', 'tabler:edit', 'tabler:scissors', 'tabler:transform',
    'tabler:artboard', 'tabler:copy', 'tabler:animation', 'tabler:timeline',
    'tabler:layers-intersect', 'tabler:layers-subtract', 'tabler:layers-union',
    'tabler:layout-grid', 'tabler:transform', 'tabler:recycle', 'tabler:replace',
    'tabler:crop', 'tabler:zoom-in', 'tabler:zoom-out', 'tabler:focus',
    'tabler:separator', 'tabler:wand', 'tabler:brush', 'tabler:palette',
    'tabler:versions', 'tabler:text-wrap', 'tabler:clipboard', 'tabler:tools',
    // Material
    'material-symbols:content-cut', 'material-symbols:edit',
    'material-symbols:content-paste', 'material-symbols:brush',
    'material-symbols:palette', 'material-symbols:draw',
    'material-symbols:imagesmode-edit', 'material-symbols:transform',
    'material-symbols:animation', 'material-symbols:published-with-changes',
    'material-symbols:tune', 'material-symbols:auto-fix',
    'material-symbols:highlight-alt', 'material-symbols:enhance-photo-translate',
    // Phosphor
    'ph:scissors', 'ph:crop', 'ph:eraser', 'ph:paint-bucket',
    'ph:pen', 'ph:pencil', 'ph:bezier-curve', 'ph:perspective',
    'ph:infinity', 'ph:align-left', 'ph:sparkle', 'ph:pen-nib',
    'ph:ruler', 'ph:textbox', 'ph:subtract', 'ph:intersect',
    'ph:paint-brush', 'ph:palette', 'ph:gradient', 'ph:magic-wand',
    // Fluent
    'fluent:scissors-24-regular', 'fluent:cut-24-regular',
    'fluent:edit-24-regular', 'fluent:draw-text-24-regular',
    'fluent:draw-image-24-regular', 'fluent:design-ideas-24-regular',
    'fluent:eraser-24-regular', 'fluent:ruler-24-regular',
    'fluent:paint-brush-24-regular', 'fluent:highlight-24-regular'
  ],
  'IA et outils': [
    // Tabler
    'tabler:brain', 'tabler:cpu', 'tabler:robot', 'tabler:code',
    'tabler:code-dots', 'tabler:color-filter', 'tabler:bulb',
    'tabler:deviceai', 'tabler:sparkles', 'tabler:settings-automation',
    'tabler:prompt', 'tabler:brand-openai', 'tabler:chart-arrows', 'tabler:api',
    'tabler:binary', 'tabler:code-circle', 'tabler:code-plus', 'tabler:activity',
    'tabler:engine', 'tabler:tool', 'tabler:brand-github', 'tabler:network',
    // Material
    'material-symbols:smart-toy', 'material-symbols:psychology',
    'material-symbols:lightbulb', 'material-symbols:auto-awesome',
    'material-symbols:generating-tokens', 'material-symbols:code',
    'material-symbols:developer-mode', 'material-symbols:settings-suggest',
    'material-symbols:api', 'material-symbols:model-training',
    // Phosphor
    'ph:brain', 'ph:android-logo', 'ph:robot', 'ph:code',
    'ph:function', 'ph:lightning', 'ph:cube', 'ph:database',
    'ph:chart-line', 'ph:cloud', 'ph:gear', 'ph:cpu',
    'ph:terminal', 'ph:chats', 'ph:figma-logo', 'ph:tensorflow-logo',
    // Fluent
    'fluent:brain-circuit-24-regular', 'fluent:bot-24-regular',
    'fluent:code-24-regular', 'fluent:developer-board-24-regular',
    'fluent:data-trending-24-regular', 'fluent:rocket-24-regular'
  ],
  'marques': [
    // Simple Icons
    'simple-icons:adobe', 'simple-icons:adobepremierepro', 'simple-icons:adobephotoshop',
    'simple-icons:adobeaftereffects', 'simple-icons:adobeillustrator', 'simple-icons:adobelightroom',
    'simple-icons:blender', 'simple-icons:canva', 'simple-icons:davinciresolve',
    'simple-icons:finalcutpro', 'simple-icons:gimp', 'simple-icons:youtube',
    'simple-icons:netflix', 'simple-icons:spotify', 'simple-icons:soundcloud',
    'simple-icons:midjourney', 'simple-icons:openai', 'simple-icons:obs',
    'simple-icons:vimeo', 'simple-icons:audacity', 'simple-icons:figma',
    'simple-icons:tiktok', 'simple-icons:instagram', 'simple-icons:discord'
  ]
};

// Définition des types
interface MediaIconSelectorProps {
  value: string | null;
  onChange: (iconValue: string | null) => void;
  usedIcons?: string[]; // Liste des icônes déjà utilisées
}

// Fonction pour obtenir une représentation visuelle de l'icône
const getIconComponent = (iconValue: string) => {
  return <Icon icon={iconValue} />;
};

// Composant de sélection d'icônes
export default function MediaIconSelector({ value, onChange, usedIcons = [] }: MediaIconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(value);
  const [category, setCategory] = useState<string | 'toutes'>('toutes');
  const [showIconGrid, setShowIconGrid] = useState(false);
  
  // Liste de toutes les icônes
  const allIcons = Object.values(iconCategories).flat();
  
  // Filtrer les icônes en fonction du terme de recherche et de la catégorie
  const getFilteredIcons = () => {
    let filtered = category === 'toutes' 
      ? allIcons
      : iconCategories[category as keyof typeof iconCategories] || [];
    
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(icon => 
        icon.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  const filteredIcons = getFilteredIcons();
  
  // Gestion de la sélection d'icône
  const handleIconSelect = (iconValue: string) => {
    // Vérifier si l'icône est déjà utilisée
    if (usedIcons.includes(iconValue) && iconValue !== value) {
      // Ne rien faire si l'icône est déjà utilisée par une autre catégorie
      return;
    }
    
    setSelectedIcon(iconValue);
    onChange(iconValue);
    setShowIconGrid(false);
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
            <div className="h-12 w-12 flex items-center justify-center text-primary">
              {getIconComponent(selectedIcon)}
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
            {filteredIcons.map((icon) => {
              const isUsed = usedIcons.includes(icon) && icon !== value;
              
              return (
                <div
                  key={icon}
                  onClick={() => !isUsed && handleIconSelect(icon)}
                  className={`
                    p-2 border rounded-md flex flex-col items-center justify-center cursor-pointer
                    ${selectedIcon === icon ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
                    ${isUsed ? 'opacity-30 cursor-not-allowed' : ''}
                  `}
                  title={isUsed ? 'Cette icône est déjà utilisée' : icon}
                >
                  <div className="h-8 w-8 flex items-center justify-center">
                    {getIconComponent(icon)}
                  </div>
                  <div className="text-xs text-center mt-1 truncate w-full">
                    {icon.split(':')[1]}
                  </div>
                  {selectedIcon === icon && (
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
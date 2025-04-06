'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  roundedFull?: boolean;
}

// Cache global pour suivre les images déjà échouées
// Évite de faire plusieurs requêtes pour des images qui n'existent pas
const failedImageCache = new Set<string>();

// Image placeholder en base64 (petit carré gris transparent)
// Cela évite complètement les requêtes 404 pour le placeholder
const PLACEHOLDER_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackIcon = <Settings className="h-5 w-5 text-gray-500" />,
  roundedFull = true
}: ImageWithFallbackProps) {
  const [error, setError] = useState<boolean>(!src || failedImageCache.has(src));
  
  const handleError = () => {
    if (src) {
      failedImageCache.add(src);
    }
    setError(true);
  };
  
  // Si pas de source ou erreur déjà connue, afficher l'icône de fallback
  if (!src || error) {
    return (
      <div className={`flex items-center justify-center ${roundedFull ? 'rounded-full' : 'rounded'} bg-gray-100 ${className}`}>
        {fallbackIcon}
      </div>
    );
  }
  
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
} 
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImagePlus, X, Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  className?: string;
  height?: number;
  width?: number;
}

export default function ImagePreview({
  imageUrl,
  onChange,
  label = 'Logo',
  className = '',
  height = 200,
  width = 200
}: ImagePreviewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(imageUrl);
  }, [imageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5 MB max
      setError('L\'image ne doit pas dépasser 5 MB');
      return;
    }

    // Créer une prévisualisation
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);
    setError(null);

    // Uploader l'image au serveur
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'upload');
      }
      
      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError((err as Error).message || 'Erreur lors de l\'upload');
      // En cas d'erreur, on revient à l'image précédente
      setPreviewUrl(imageUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onChange(null);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      
      <div className="w-full flex items-center justify-center">
        <div 
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 relative"
          style={{ minHeight: height, minWidth: width }}
        >
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          )}
          
          {previewUrl ? (
            <div className="relative">
              <Image 
                src={previewUrl}
                alt={label}
                width={width}
                height={height}
                className="rounded object-contain"
                style={{ maxHeight: '100%', maxWidth: '100%' }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <ImagePlus className="h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-500">Cliquez ou glissez une image ici</p>
              <p className="text-xs text-gray-400">PNG, JPG, GIF (5 MB max)</p>
            </div>
          )}
          
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading}
          />
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 
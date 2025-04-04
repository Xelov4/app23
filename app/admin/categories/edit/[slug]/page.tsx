'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  AlertCircle,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  toolCount?: number;
}

interface PageProps {
  params: {
    slug: string;
  };
}

export default function EditCategoryPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Statistiques
  const [toolCount, setToolCount] = useState(0);
  
  // Charger les données de la catégorie
  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/categories/${slug}`);
        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`);
        }
        const data = await response.json();
        setCategory(data);
        
        // Initialiser les champs du formulaire
        setName(data.name);
        setNewSlug(data.slug);
        setDescription(data.description);
        setImageUrl(data.imageUrl);
        
        // Charger le nombre d'outils associés
        if (data.toolCount !== undefined) {
          setToolCount(data.toolCount);
        } else {
          // Si l'API ne retourne pas le nombre d'outils, on peut faire une requête supplémentaire
          // ou laisser à 0 par défaut
          setToolCount(0);
        }
      } catch (err) {
        setError('Erreur lors du chargement de la catégorie');
        console.error('Erreur lors du chargement de la catégorie:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategory();
  }, [slug]);
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch(`/api/categories/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          imageUrl,
          newSlug: newSlug !== slug ? newSlug : undefined, // Envoyer le nouveau slug uniquement s'il a changé
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Erreur: ${response.status}`);
      }
      
      setSuccessMessage('Catégorie mise à jour avec succès');
      
      // Si le slug a changé, rediriger vers la nouvelle URL
      if (newSlug !== slug) {
        // Attendre un court instant pour montrer le message de succès
        setTimeout(() => {
          router.push(`/admin/categories/edit/${newSlug}`);
        }, 1500);
      }
    } catch (err: any) {
      setSaveError(err.message || 'Erreur lors de la mise à jour de la catégorie');
      console.error('Erreur lors de la mise à jour de la catégorie:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Prévisualisation de la page
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-gray-500">Chargement de la catégorie...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/admin/categories" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux catégories
          </Link>
        </div>
        
        <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erreur</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!category) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/admin/categories" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux catégories
          </Link>
        </div>
        
        <div className="bg-amber-50 text-amber-700 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Catégorie introuvable</p>
            <p>La catégorie que vous recherchez n'existe pas ou a été supprimée.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/admin/categories" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux catégories
        </Link>
      </div>
      
      {/* Titre */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Layers className="mr-2 h-6 w-6 text-primary" />
          Modifier la catégorie
        </h1>
        <p className="text-gray-500">
          Vous modifiez la catégorie <span className="font-medium">{category.name}</span>
        </p>
      </div>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-md p-4">
          <p className="text-gray-500 text-sm">ID de la catégorie</p>
          <p className="text-sm font-mono break-all">{category.id}</p>
        </div>
        <div className="bg-white shadow rounded-md p-4">
          <p className="text-gray-500 text-sm">Date de création</p>
          <p className="text-sm">
            {format(new Date(category.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </p>
        </div>
        <div className="bg-white shadow rounded-md p-4">
          <p className="text-gray-500 text-sm">Outils associés</p>
          <p className="text-sm font-semibold">
            <span className={toolCount > 0 ? 'text-green-600' : 'text-gray-500'}>
              {toolCount} outil{toolCount !== 1 ? 's' : ''}
            </span>
          </p>
        </div>
      </div>
      
      {/* Messages */}
      {saveError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{saveError}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nom de la catégorie
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Nom de la catégorie"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug (URL)
          </label>
          <input
            type="text"
            id="slug"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="slug-de-la-categorie"
          />
          <p className="mt-1 text-xs text-gray-500">
            L'URL de la catégorie sera: <span className="font-mono">/categories/{newSlug}</span>
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Description de la catégorie"
          />
        </div>
        
        <div className="mb-8">
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            URL de l'image
          </label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl || ''}
            onChange={(e) => setImageUrl(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="https://exemple.com/image.jpg"
          />
          <p className="mt-1 text-xs text-gray-500">
            Laissez vide si aucune image n'est associée à cette catégorie
          </p>
          
          {/* Prévisualisation de l'image */}
          {imageUrl && (
            <div className="mt-3 flex items-center">
              <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt="Prévisualisation" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                  }}
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Prévisualisation</p>
                <p className="text-xs text-gray-500">
                  {imageUrl.split('/').pop()}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Link
            href="/admin/categories"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Annuler
          </Link>
          
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:bg-primary/70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 
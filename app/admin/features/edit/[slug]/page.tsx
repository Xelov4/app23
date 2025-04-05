'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Info,
  Loader,
  ListChecks,
  Trash2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import AiOptimizer from '@/app/components/AiOptimizer';

interface Feature {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  toolsCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function EditFeaturePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [feature, setFeature] = useState<Feature | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeature = async () => {
      try {
        const response = await fetch(`/api/features/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Fonctionnalité non trouvée');
          }
          throw new Error('Erreur lors de la récupération des données');
        }
        
        const data = await response.json();
        setFeature(data);
        setName(data.name || '');
        setDescription(data.description || '');
        setSeoTitle(data.seoTitle || '');
        setMetaDescription(data.metaDescription || '');
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeature();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Le nom est requis');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/features/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          seoTitle,
          metaDescription
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Une erreur est survenue lors de la mise à jour');
      }
      
      setSuccessMessage('Fonctionnalité mise à jour avec succès');
      setTimeout(() => {
        router.push('/admin/features');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette fonctionnalité ?')) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/features/${slug}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Une erreur est survenue');
      }
      
      router.push('/admin/features');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFields = (data: {
    description?: string;
    seoTitle?: string;
    metaDescription?: string;
  }) => {
    if (data.description) setDescription(data.description);
    if (data.seoTitle) setSeoTitle(data.seoTitle);
    if (data.metaDescription) setMetaDescription(data.metaDescription);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-gray-500">Chargement de la fonctionnalité...</p>
        </div>
      </div>
    );
  }

  if (!feature && !isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-amber-50 text-amber-700 p-4 rounded-md mb-6 flex items-start">
          <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>Fonctionnalité non trouvée</p>
        </div>
        <Link
          href="/admin/features"
          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ListChecks className="mr-2 h-6 w-6 text-primary" />
          Modifier la fonctionnalité
        </h1>
        
        <Link
          href="/admin/features"
          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 flex items-start">
          <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 flex items-start">
          <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Génération de vidéo, Animation 3D, etc."
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Décrivez cette fonctionnalité..."
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Titre SEO
            </label>
            <input
              type="text"
              id="seoTitle"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Titre optimisé pour le référencement"
              maxLength={70}
            />
            <div className="text-xs text-gray-500 mt-1 flex justify-between">
              <span>{seoTitle.length}/70 caractères</span>
              <span className={seoTitle.length > 60 ? (seoTitle.length > 70 ? "text-red-500" : "text-orange-500") : "text-green-500"}>
                {seoTitle.length > 60 ? (seoTitle.length > 70 ? "Trop long" : "Limite haute") : "Optimal"}
              </span>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Méta-description
            </label>
            <textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Description courte optimisée pour le référencement (150-160 caractères max.)"
              maxLength={160}
            />
            <div className="text-xs text-gray-500 mt-1 flex justify-between">
              <span>{metaDescription.length}/160 caractères</span>
              <span className={metaDescription.length > 145 ? (metaDescription.length > 160 ? "text-red-500" : "text-orange-500") : (metaDescription.length < 120 ? "text-orange-500" : "text-green-500")}>
                {metaDescription.length > 145 ? (metaDescription.length > 160 ? "Trop long" : "Limite haute") : (metaDescription.length < 120 ? "Trop court" : "Optimal")}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={isSubmitting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </button>
            
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
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

        <AiOptimizer 
          type="feature"
          name={name}
          onUpdateFields={handleUpdateFields}
          allowedFields={['description', 'seoTitle', 'metaDescription']}
          additionalContext={`Cette fonctionnalité concerne: ${description ? description.substring(0, 200) : ''}`}
        />
      </div>
    </div>
  );
} 
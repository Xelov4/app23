'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle,
  Tag,
  Info,
  ListChecks,
  Sparkles,
  Trash2
} from 'lucide-react';
import AiOptimizer from '@/app/components/AiOptimizer';

// Types pour le tag
interface TagType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  _count?: {
    TagsOnTools: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export default function EditTagPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { slug } = params;
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // États pour les données du tag
  const [tag, setTag] = useState<TagType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [newSlug, setNewSlug] = useState('');
  
  // Charger les données du tag
  useEffect(() => {
    const fetchTag = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tags/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Tag non trouvé');
          }
          throw new Error(`Erreur ${response.status}`);
        }
        
        const data = await response.json();
        setTag(data);
        
        // Initialiser les états
        setName(data.name || '');
        setDescription(data.description || '');
        setSeoTitle(data.seoTitle || '');
        setMetaDescription(data.metaDescription || '');
        setNewSlug(data.slug || '');
        
      } catch (err) {
        console.error('Erreur lors du chargement du tag:', err);
        setError((err as Error).message || 'Erreur lors du chargement du tag');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTag();
  }, [slug]);
  
  // Mettre à jour automatiquement le slug à partir du nom
  const handleNameChange = (value: string) => {
    setName(value);
    // Générer le slug à partir du nom (uniquement si l'utilisateur n'a pas encore modifié le slug manuellement)
    if (!newSlug || newSlug === slug || newSlug === value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) {
      setNewSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Construire l'objet avec les données à mettre à jour
      const updatedData = {
        name,
        slug: newSlug,
        description,
        seoTitle,
        metaDescription
      };
      
      const response = await fetch(`/api/tags/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Erreur: ${response.status}`);
      }
      
      const updatedTag = await response.json();
      setTag(updatedTag);
      setSuccessMessage('Tag mis à jour avec succès');
      
      // Si le slug a changé, rediriger vers la nouvelle URL après un court délai
      if (newSlug !== slug) {
        setTimeout(() => {
          router.push(`/admin/tags/edit/${newSlug}`);
        }, 1500);
      }
      
    } catch (err) {
      setError((err as Error).message || 'Une erreur est survenue lors de la mise à jour');
      console.error('Erreur de mise à jour:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    // ... existing code ...
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
  
  // Afficher un loading si les données sont en cours de chargement
  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Chargement du tag...</p>
      </div>
    );
  }
  
  // Afficher une erreur si le tag n'a pas été trouvé
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{error}</p>
            <Link href="/admin/tags" className="text-red-700 underline mt-2 inline-block">
              Retour à la liste des tags
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/admin/tags" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux tags
        </Link>
      </div>
      
      {/* Titre */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Tag className="mr-2 h-6 w-6 text-primary" />
          Modifier le tag: {tag?.name}
        </h1>
        <p className="text-gray-500">
          Modifiez les informations du tag
        </p>
      </div>
      
      {/* Messages */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
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
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du tag*
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Nom du tag"
            />
          </div>
          
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL)*
            </label>
            <input
              type="text"
              id="slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="slug-du-tag"
            />
            <p className="mt-1 text-xs text-gray-500">
              L'URL du tag sera: <span className="font-mono">/tags/{newSlug}</span>
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
            </div>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Décrivez ce tag..."
            />
          </div>
          
          <div>
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
          
          <div>
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
          
          {tag?._count && (
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-blue-700">
                Ce tag est utilisé par {tag._count.TagsOnTools} outil(s).
              </p>
            </div>
          )}
          
          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
            <Link
              href="/admin/tags"
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
        </div>
      </form>

      {/* Ajouter le composant AiOptimizer */}
      <AiOptimizer 
        type="tag"
        name={tag?.name || name}
        onUpdateFields={handleUpdateFields}
        allowedFields={['description', 'seoTitle', 'metaDescription']}
        additionalContext={`Ce tag est utilisé pour classer des outils d'IA vidéo. ${description ? 'Description actuelle: ' + description.substring(0, 200) : ''}`}
      />
    </div>
  );
} 
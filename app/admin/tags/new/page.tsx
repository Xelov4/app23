'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle,
  Tag,
  Plus,
  Info,
  ListChecks,
  Sparkles
} from 'lucide-react';
import AiOptimizer from '@/app/components/AiOptimizer';

export default function NewTagPage() {
  const router = useRouter();
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // États pour les données du tag
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mettre à jour automatiquement le slug à partir du nom
  const handleNameChange = (value: string) => {
    setName(value);
    // Générer le slug à partir du nom (uniquement si l'utilisateur n'a pas encore modifié le slug)
    if (!slug || slug === value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) {
      setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Le nom est requis');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
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
        throw new Error(errorData.error || 'Une erreur est survenue lors de la création');
      }
      
      const newTag = await response.json();
      setSuccessMessage('Tag créé avec succès');
      
      // Rediriger vers la page d'édition après un court délai
      setTimeout(() => {
        router.push(`/admin/tags/edit/${newTag.slug}`);
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la création');
    } finally {
      setIsSaving(false);
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
          <Plus className="h-4 w-4 mr-2" />
          Nouveau tag
        </h1>
        <p className="text-gray-500">
          Ajoutez un nouveau tag pour catégoriser les outils
        </p>
      </div>
      
      {/* Messages */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 flex items-start">
          <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 flex items-start">
          <ListChecks className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* Formulaire */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Animation, 3D, Effets spéciaux, etc."
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
              placeholder="Décrivez ce tag..."
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
            />
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
              placeholder="Description courte optimisée pour le référencement (150 caractères max.)"
              maxLength={150}
            />
            <div className="text-xs text-gray-500 mt-1">
              {metaDescription.length}/150 caractères
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Créer
                </>
              )}
            </button>
          </div>
        </form>

        {/* Ajouter le composant AiOptimizer */}
        <AiOptimizer 
          type="tag"
          name={name}
          onUpdateFields={handleUpdateFields}
        />
      </div>
    </div>
  );
} 
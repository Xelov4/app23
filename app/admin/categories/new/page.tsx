'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle,
  Layers,
  Plus
} from 'lucide-react';

// Importation du sélecteur d'icônes
import SimpleIconSelector from '@/app/components/SimpleIconSelector';
// Importation du hook pour les icônes utilisées
import useUsedIcons from '@/app/hooks/useUsedIcons';

export default function NewCategoryPage() {
  const router = useRouter();
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState<string | null>(null);
  
  // Récupérer les icônes déjà utilisées
  const { usedIcons, isLoading: isLoadingIcons } = useUsedIcons();
  
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
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          slug,
          description,
          iconName,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Erreur: ${response.status}`);
      }
      
      setSuccessMessage('Catégorie créée avec succès');
      
      // Rediriger vers la page de la catégorie après un court délai
      setTimeout(() => {
        router.push(`/admin/categories/edit/${slug}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la catégorie');
      console.error('Erreur lors de la création de la catégorie:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
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
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle catégorie
        </h1>
        <p className="text-gray-500">
          Ajoutez une nouvelle catégorie pour organiser vos outils
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
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nom de la catégorie
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
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
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="slug-de-la-categorie"
          />
          <p className="mt-1 text-xs text-gray-500">
            L'URL de la catégorie sera: <span className="font-mono">/categories/{slug}</span>
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
            required
          />
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icône
          </label>
          <SimpleIconSelector 
            value={iconName} 
            onChange={setIconName}
            usedIcons={usedIcons}
          />
          <p className="mt-1 text-xs text-gray-500">
            Choisissez une icône pour représenter cette catégorie. Chaque catégorie doit avoir une icône unique.
          </p>
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
    </div>
  );
} 
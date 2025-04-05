'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle,
  Settings,
  Trash2,
  Plus
} from 'lucide-react';

// Types
type PricingType = 'FREE' | 'FREEMIUM' | 'PAID';

export default function NewToolPage() {
  const router = useRouter();
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // States pour les données de l'outil
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [pricingType, setPricingType] = useState<PricingType>('FREE');
  const [pricingDetails, setPricingDetails] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  
  // Mettre à jour automatiquement le slug à partir du nom
  const handleNameChange = (value: string) => {
    setName(value);
    // Générer le slug à partir du nom (uniquement si l'utilisateur n'a pas encore modifié le slug)
    if (!slug || slug === value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) {
      setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };
  
  // Fonction pour ajouter une fonctionnalité
  const addFeature = () => {
    setFeatures([...features, '']);
  };
  
  // Fonction pour mettre à jour une fonctionnalité
  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...features];
    updatedFeatures[index] = value;
    setFeatures(updatedFeatures);
  };
  
  // Fonction pour supprimer une fonctionnalité
  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Construire l'objet avec les données à envoyer
      const toolData = {
        name,
        slug,
        description,
        websiteUrl,
        pricingType,
        pricingDetails,
        features,
        isActive,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      };
      
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Erreur: ${response.status}`);
      }
      
      const newTool = await response.json();
      setSuccessMessage('Outil créé avec succès');
      
      // Rediriger vers la page d'édition après un court délai
      setTimeout(() => {
        router.push(`/admin/tools/edit/${newTool.slug}`);
      }, 1500);
      
    } catch (err) {
      setError((err as Error).message || 'Une erreur est survenue lors de la création');
      console.error('Erreur de création:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/admin/tools" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux outils
        </Link>
      </div>
      
      {/* Titre */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="mr-2 h-6 w-6 text-primary" />
          <Plus className="h-4 w-4 mr-2" />
          Nouvel outil
        </h1>
        <p className="text-gray-500">
          Ajoutez un nouvel outil d'IA pour la vidéo
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
          {/* Informations générales */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'outil*
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nom de l'outil"
                />
              </div>
              
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)*
                </label>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="slug-de-l-outil"
                />
                <p className="mt-1 text-xs text-gray-500">
                  L'URL de l'outil sera: <span className="font-mono">/tools/{slug}</span>
                </p>
              </div>
              
              <div>
                <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  URL du site web*
                </label>
                <input
                  type="url"
                  id="websiteUrl"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://exemple.com"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Description de l'outil"
                />
              </div>
            </div>
          </div>
          
          {/* Tarification */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tarification</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="pricingType" className="block text-sm font-medium text-gray-700 mb-1">
                  Type de tarification*
                </label>
                <select
                  id="pricingType"
                  value={pricingType}
                  onChange={(e) => setPricingType(e.target.value as PricingType)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="FREE">Gratuit</option>
                  <option value="FREEMIUM">Freemium</option>
                  <option value="PAID">Payant</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="pricingDetails" className="block text-sm font-medium text-gray-700 mb-1">
                  Détails de tarification
                </label>
                <textarea
                  id="pricingDetails"
                  value={pricingDetails}
                  onChange={(e) => setPricingDetails(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Détails sur les plans tarifaires"
                />
              </div>
            </div>
          </div>
          
          {/* Fonctionnalités */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Fonctionnalités</h2>
              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                + Ajouter
              </button>
            </div>
            
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Fonctionnalité"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              
              {features.length === 0 && (
                <p className="text-gray-500 text-sm italic">Aucune fonctionnalité ajoutée.</p>
              )}
            </div>
          </div>
          
          {/* SEO */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">SEO</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre SEO
                </label>
                <input
                  type="text"
                  id="seoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Titre pour les moteurs de recherche"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Laissez vide pour utiliser le nom de l'outil par défaut
                </p>
              </div>
              
              <div>
                <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description SEO
                </label>
                <textarea
                  id="seoDescription"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Description pour les moteurs de recherche"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Laissez vide pour utiliser la description de l'outil par défaut
                </p>
              </div>
            </div>
          </div>
          
          {/* Statut */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Statut</h2>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Actif (visible sur le site)
              </label>
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link
              href="/admin/tools"
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
        </div>
      </form>
    </div>
  );
} 
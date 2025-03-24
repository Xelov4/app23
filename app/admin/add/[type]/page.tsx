'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// Interface pour les données de formulaire
interface FormData {
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  imageUrl?: string;
  websiteUrl?: string;
  pricingType?: string;
  pricingDetails?: string;
  features?: string[];
  categoryId?: string;
}

export default function AddPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as string;
  
  // États
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    imageUrl: '',
    websiteUrl: '',
    pricingType: 'FREE',
    pricingDetails: '',
    features: [],
    categoryId: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [feature, setFeature] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  
  // Variables calculées
  const isScreenshotError = !!screenshotError;

  // Chargement des catégories si on ajoute un outil
  useState(() => {
    const fetchCategories = async () => {
      if (type !== 'tools') return;
      
      setIsLoadingCategories(true);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Erreur lors du chargement des catégories');
        
        const data = await response.json();
        setCategories(data.map((cat: any) => ({ id: cat.id, name: cat.name })));
        
        // Définir la première catégorie comme valeur par défaut
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  });

  // Gestionnaire de changement de champ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Générer automatiquement le slug à partir du nom
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  // Gestionnaire pour les features (uniquement pour les outils)
  const handleAddFeature = () => {
    if (feature.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), feature.trim()]
      }));
      setFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index)
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch(`/api/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur lors de la création (${response.status})`);
      }
      
      setSuccessMessage('Élément créé avec succès');
      
      // Rediriger après 1.5 seconde
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
      
    } catch (err) {
      console.error('Erreur:', err);
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  // Capture d'écran
  const captureScreenshot = async () => {
    if (!formData.websiteUrl) {
      setScreenshotError("L'URL du site web est requise pour la capture d'écran");
      return;
    }
    
    setIsCapturingScreenshot(true);
    setScreenshotError(null);
    
    try {
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: formData.websiteUrl }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Utilisation directe d'un message d'erreur simple sans template literals
        throw new Error(responseData.error || "Erreur lors de la capture d'écran");
      }
      
      if (!responseData.success || !responseData.imageUrl) {
        throw new Error('La capture a échoué: réponse invalide du serveur');
      }
      
      setFormData(prev => ({ ...prev, logoUrl: responseData.imageUrl }));
      
      // Afficher un message de succès temporaire
      const tempMessage = "Logo capturé avec succès";
      setSuccessMessage(tempMessage);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error('Erreur lors de la capture d\'écran:', err);
      setScreenshotError((err as Error).message);
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  const typeName = type === 'tools' ? 'outil' : 
                  type === 'categories' ? 'catégorie' : 'tag';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ajouter un nouveau {typeName}</h1>
          <Link href="/admin" className="text-blue-600 hover:underline">
            Retour à l'administration
          </Link>
        </div>
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="name">
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="slug">
                  Slug (généré automatiquement)
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  required
                />
              </div>
            </div>
            
            <div>
              {/* Champs spécifiques aux outils */}
              {type === 'tools' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="categoryId">
                      Catégorie
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                      disabled={isLoadingCategories}
                    >
                      {isLoadingCategories ? (
                        <option>Chargement des catégories...</option>
                      ) : (
                        categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="websiteUrl">
                      Site web
                    </label>
                    <input
                      type="url"
                      id="websiteUrl"
                      name="websiteUrl"
                      value={formData.websiteUrl || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="pricingType">
                      Type de tarification
                    </label>
                    <select
                      id="pricingType"
                      name="pricingType"
                      value={formData.pricingType || 'FREE'}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="FREE">Gratuit</option>
                      <option value="PAID">Payant</option>
                      <option value="FREEMIUM">Freemium</option>
                      <option value="SUBSCRIPTION">Abonnement</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="pricingDetails">
                      Détails de tarification
                    </label>
                    <input
                      type="text"
                      id="pricingDetails"
                      name="pricingDetails"
                      value={formData.pricingDetails || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </>
              )}
              
              {/* URL de l'image pour tous les types */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="imageUrl">
                  {type === 'tools' ? 'URL du logo' : 'URL de l\'image'}
                </label>
                <div className="flex">
                  <input
                    type="url"
                    id={type === 'tools' ? 'logoUrl' : 'imageUrl'}
                    name={type === 'tools' ? 'logoUrl' : 'imageUrl'}
                    value={type === 'tools' ? (formData.logoUrl || '') : (formData.imageUrl || '')}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border rounded-l-lg"
                  />
                  {type === 'tools' && (
                    <button
                      type="button"
                      onClick={captureScreenshot}
                      disabled={isCapturingScreenshot || !formData.websiteUrl}
                      className={`flex items-center bg-blue-600 text-white px-3 py-2 rounded-r-lg hover:bg-blue-700 transition-colors ${
                        isCapturingScreenshot || !formData.websiteUrl ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title={!formData.websiteUrl ? "L'URL du site web est requise" : "Capturer une image du site web"}
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {isCapturingScreenshot ? 'Capture...' : 'Capturer logo'}
                    </button>
                  )}
                </div>
                {isScreenshotError && (
                  <p className="mt-1 text-sm text-red-600">{screenshotError}</p>
                )}
              </div>
              
              {/* Prévisualisation de l'image si URL fournie */}
              {((type === 'tools' && formData.logoUrl) || (type !== 'tools' && formData.imageUrl)) && (
                <div className="mb-4">
                  <p className="text-gray-700 font-bold mb-2">Prévisualisation</p>
                  <div className="border rounded-lg p-2 bg-gray-50 flex justify-center">
                    <img 
                      src={type === 'tools' ? formData.logoUrl : formData.imageUrl} 
                      alt="Prévisualisation"
                      className="max-h-40 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Fonctionnalités (uniquement pour les outils) */}
          {type === 'tools' && (
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">
                Fonctionnalités
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => setFeature(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-l-lg"
                  placeholder="Ajouter une fonctionnalité"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg border">
                {formData.features && formData.features.length > 0 ? (
                  <ul>
                    {formData.features.map((feat, index) => (
                      <li key={index} className="flex justify-between items-center py-1">
                        <span>{feat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ❌
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-2">Aucune fonctionnalité ajoutée</p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-8">
            <button
              type="submit"
              disabled={isSaving}
              className={`bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Création en cours...' : 'Créer'}
            </button>
            
            <Link
              href="/admin"
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 
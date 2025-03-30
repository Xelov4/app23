'use client';

import { useState, useEffect } from 'react';
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
  twitterUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
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
    categoryId: '',
    twitterUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    linkedinUrl: '',
    githubUrl: ''
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
  useEffect(() => {
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
  }, [type]);

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
        router.push('/admin/dashboard');
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
    setIsCapturingScreenshot(true);
    setScreenshotError(null);
    
    try {
      if (!formData.websiteUrl) {
        throw new Error("L'URL du site web est requise");
      }

      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: formData.websiteUrl
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error || "Erreur lors de la capture d'écran");
      }

      if (!responseData.imageUrl) {
        throw new Error("L'URL de l'image n'a pas été retournée");
      }

      setFormData(prev => ({
        ...prev,
        logoUrl: responseData.imageUrl
      }));

    } catch (error) {
      console.error('Erreur lors de la capture d\'écran:', error);
      setScreenshotError(error instanceof Error ? error.message : "Erreur lors de la capture d'écran");
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  const typeName = type === 'tools' ? 'outil' : 
                  type === 'categories' ? 'catégorie' : 'tag';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ajouter un nouveau {typeName}</h1>
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
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            
            {type === 'tools' && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="websiteUrl">
                    URL du site web
                  </label>
                  <input
                    type="url"
                    id="websiteUrl"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              
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
                      categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="pricingType">
                    Type de tarification
                  </label>
                  <select
                    id="pricingType"
                    name="pricingType"
                    value={formData.pricingType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="FREE">Gratuit</option>
                    <option value="FREEMIUM">Freemium</option>
                    <option value="PAID">Payant</option>
                    <option value="SUBSCRIPTION">Abonnement</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="pricingDetails">
                    Détails de tarification (optionnel)
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

                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">
                    Réseaux sociaux (optionnel)
                  </label>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">Twitter</span>
                      <input
                        type="url"
                        name="twitterUrl"
                        value={formData.twitterUrl || ''}
                        onChange={handleChange}
                        className="flex-1 px-3 py-1 border rounded-lg"
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">Instagram</span>
                      <input
                        type="url"
                        name="instagramUrl"
                        value={formData.instagramUrl || ''}
                        onChange={handleChange}
                        className="flex-1 px-3 py-1 border rounded-lg"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">Facebook</span>
                      <input
                        type="url"
                        name="facebookUrl"
                        value={formData.facebookUrl || ''}
                        onChange={handleChange}
                        className="flex-1 px-3 py-1 border rounded-lg"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">LinkedIn</span>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl || ''}
                        onChange={handleChange}
                        className="flex-1 px-3 py-1 border rounded-lg"
                        placeholder="https://linkedin.com/..."
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">GitHub</span>
                      <input
                        type="url"
                        name="githubUrl"
                        value={formData.githubUrl || ''}
                        onChange={handleChange}
                        className="flex-1 px-3 py-1 border rounded-lg"
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div>
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
                rows={6}
                required
              />
            </div>
            
            {type === 'tools' && (
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Fonctionnalités
                </label>
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={e => setFeature(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-l-lg"
                    placeholder="Ajouter une fonctionnalité"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {formData.features && formData.features.length > 0 ? (
                    <ul className="space-y-1">
                      {formData.features.map((feat, index) => (
                        <li key={index} className="flex justify-between px-3 py-2 bg-gray-50 rounded">
                          <span>{feat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
                            className="text-red-600"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">Aucune fonctionnalité ajoutée</p>
                  )}
                </div>
              </div>
            )}
            
            {type === 'tools' && (
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="logoUrl">
                  URL du logo
                </label>
                <div className="flex flex-col space-y-2">
                  <input
                    type="url"
                    id="logoUrl"
                    name="logoUrl"
                    value={formData.logoUrl || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="URL de l'image"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={captureScreenshot}
                      disabled={isCapturingScreenshot || !formData.websiteUrl}
                      className={`px-4 py-2 rounded-lg ${isCapturingScreenshot || !formData.websiteUrl ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      {isCapturingScreenshot ? 'Capture en cours...' : 'Capturer depuis le site web'}
                    </button>
                    {formData.logoUrl && (
                      <div className="h-10 w-10 border rounded-lg overflow-hidden">
                        <img src={formData.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                  {isScreenshotError && (
                    <p className="text-red-600 text-sm">{screenshotError}</p>
                  )}
                </div>
              </div>
            )}
            
            {type === 'categories' && (
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="imageUrl">
                  URL de l'image (optionnel)
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/dashboard"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
} 
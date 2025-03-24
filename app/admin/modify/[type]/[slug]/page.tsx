'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Interface pour les données de formulaire
interface FormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  imageUrl?: string;
  websiteUrl?: string;
  pricingType?: string;
  pricingDetails?: string;
  features?: string[];
  category?: string;
  categoryId?: string;
}

export default function ModifyPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as string;
  const slug = params.slug as string;
  
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
    features: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feature, setFeature] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const singularType = type === 'tools' ? 'tool' : 
                            type === 'categories' ? 'category' : 'tag';
        
        const response = await fetch(`/api/${type}/${slug}`);
        
        if (!response.ok) {
          throw new Error(`Erreur lors du chargement des données (${response.status})`);
        }
        
        const data = await response.json();
        setFormData({
          id: data.id,
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          logoUrl: data.logoUrl || '',
          imageUrl: data.imageUrl || '',
          websiteUrl: data.websiteUrl || '',
          pricingType: data.pricingType || 'FREE',
          pricingDetails: data.pricingDetails || '',
          features: data.features || [],
          category: data.category || '',
          categoryId: data.categoryId || ''
        });
      } catch (err) {
        console.error('Erreur:', err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [type, slug]);

  // Gestionnaire de changement de champ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  // Amélioration de la description avec Google Gemini
  const enhanceWithGemini = async () => {
    setIsEnhancing(true);
    setError(null);
    
    try {
      const prompt = `enrichie cette description avec le plus d'informations possible, entre 500 et 1000 mots: 
      
      Site: ${formData.websiteUrl || ''}
      
      Description actuelle: ${formData.description}`;
      
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la requête à l'API Gemini (${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        const enhancedDescription = data.candidates[0].content.parts[0].text;
        setFormData(prev => ({ ...prev, description: enhancedDescription }));
        setSuccessMessage('Description améliorée avec Google Gemini');
        
        // Masquer le message après 3 secondes
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        throw new Error('Format de réponse inattendu de l\'API Gemini');
      }
    } catch (err) {
      console.error('Erreur Gemini:', err);
      setError(`Erreur lors de l'amélioration: ${(err as Error).message}`);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch(`/api/${type}/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la sauvegarde (${response.status})`);
      }
      
      setSuccessMessage('Modifications enregistrées avec succès');
      
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

  // Suppression
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/${type}/${slug}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur lors de la suppression (${response.status})`);
      }
      
      // Rediriger vers la page d'admin
      router.push('/admin');
      
    } catch (err) {
      console.error('Erreur:', err);
      setError((err as Error).message);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Chargement...</h1>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Erreur</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/admin" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Retour à l'administration
          </Link>
        </div>
      </div>
    );
  }

  const typeName = type === 'tools' ? 'outil' : 
                  type === 'categories' ? 'catégorie' : 'tag';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Modifier {typeName}: {formData.name}</h1>
          <Link href="/admin" className="text-blue-600 hover:underline">
            Retour à l'administration
          </Link>
        </div>
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
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
                  Slug
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
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700 font-bold" htmlFor="description">
                    Description
                  </label>
                  {type === 'tools' && (
                    <button
                      type="button"
                      onClick={enhanceWithGemini}
                      disabled={isEnhancing}
                      className={`flex items-center text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors ${
                        isEnhancing ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                      </svg>
                      {isEnhancing ? 'Amélioration...' : 'Améliorer avec Google'}
                    </button>
                  )}
                </div>
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
            </div>
            
            <div>
              {/* Champs spécifiques aux outils */}
              {type === 'tools' && (
                <>
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
                <input
                  type="url"
                  id={type === 'tools' ? 'logoUrl' : 'imageUrl'}
                  name={type === 'tools' ? 'logoUrl' : 'imageUrl'}
                  value={type === 'tools' ? (formData.logoUrl || '') : (formData.imageUrl || '')}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
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
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </form>
        
        {/* Modal de confirmation pour la suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
              <h3 className="text-xl font-bold mb-4">Confirmation de suppression</h3>
              <p className="mb-6">
                Êtes-vous sûr de vouloir supprimer {typeName} <strong>{formData.name}</strong> ?
                Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  disabled={isDeleting}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
                </button>
              </div>
              {error && (
                <p className="mt-4 text-red-500">{error}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
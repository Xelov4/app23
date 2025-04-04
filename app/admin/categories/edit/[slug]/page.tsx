'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  AlertCircle,
  Layers,
  Code,
  Eye,
  FileText,
  Search,
  Image,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Import React Quill dynamiquement pour éviter les erreurs SSR
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
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
  const [seoTitle, setSeoTitle] = useState<string | null>(null);
  const [metaDescription, setMetaDescription] = useState<string | null>(null);
  
  // Mode d'édition pour la description
  const [descriptionMode, setDescriptionMode] = useState<'visual' | 'code'>('visual');
  
  // Statistiques
  const [toolCount, setToolCount] = useState(0);
  
  // Configuration des modules Quill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];
  
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
        setSeoTitle(data.seoTitle || '');
        setMetaDescription(data.metaDescription || '');
        
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
          seoTitle,
          metaDescription,
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

  // Toggle entre les modes d'édition de la description
  const toggleDescriptionMode = () => {
    setDescriptionMode(prevMode => prevMode === 'visual' ? 'code' : 'visual');
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
      <form onSubmit={handleSubmit}>
        {/* Section des informations de base */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Informations de base
          </h2>
          
          <div className="mb-4">
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
          
          <div className="mb-0">
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
        </div>
        
        {/* Section de la description */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center text-gray-800">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Description
            </h2>
            <button 
              type="button" 
              onClick={toggleDescriptionMode}
              className="text-sm flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {descriptionMode === 'visual' ? (
                <>
                  <Code className="h-4 w-4 mr-1.5" />
                  Mode code
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1.5" />
                  Mode visuel
                </>
              )}
            </button>
          </div>
          
          {descriptionMode === 'visual' ? (
            <div className="mb-2">
              {typeof document !== 'undefined' && (
                <ReactQuill
                  id="description"
                  value={description}
                  onChange={setDescription}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  placeholder="Description détaillée de la catégorie avec mise en forme riche"
                />
              )}
              <p className="mt-2 text-xs text-gray-500">
                Utilisez l'éditeur pour formater votre texte, ajouter des liens et des listes.
              </p>
            </div>
          ) : (
            <div className="mb-2">
              <textarea
                id="descriptionCode"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="<p>Saisissez votre description avec du code HTML ici...</p>"
              />
              <p className="mt-2 text-xs text-gray-500">
                Éditez le code HTML directement. Utilisez les balises &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;, etc.
              </p>
            </div>
          )}
          
          {/* Prévisualisation du HTML */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Prévisualisation</h3>
            <div 
              className="p-3 border border-gray-200 rounded-md bg-gray-50 prose prose-sm max-w-none overflow-auto"
              style={{ maxHeight: '200px' }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        </div>
        
        {/* Section de l'image */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <Image className="h-5 w-5 mr-2 text-primary" />
            Image
          </h2>
          
          <div>
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
              Dimensions recommandées: 800x600px (ratio 4:3). Format: JPG ou PNG.
              Laissez vide si aucune image n'est associée à cette catégorie.
            </p>
            
            {/* Prévisualisation de l'image */}
            {imageUrl && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Prévisualisation</h3>
                <div className="flex">
                  <div className="h-40 w-40 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt="Prévisualisation" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">Informations</p>
                    <p className="text-xs text-gray-500 mb-1">
                      Nom: {imageUrl.split('/').pop()}
                    </p>
                    <p className="text-xs text-gray-500">
                      URL: <span className="font-mono text-xs break-all">{imageUrl}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Section SEO */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <Search className="h-5 w-5 mr-2 text-primary" />
            Optimisation SEO
          </h2>
          
          <div className="mb-4">
            <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Titre SEO
            </label>
            <input
              type="text"
              id="seoTitle"
              value={seoTitle || ''}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Titre optimisé pour les moteurs de recherche"
              maxLength={60}
            />
            <div className="mt-1 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Le titre qui apparaîtra dans les résultats de recherche (idéalement 50-60 caractères)
              </p>
              <p className={`text-xs font-medium ${seoTitle && seoTitle.length > 55 ? 'text-amber-600' : 'text-gray-500'}`}>
                {seoTitle ? seoTitle.length : 0}/60
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              value={metaDescription || ''}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Description courte pour les moteurs de recherche"
              maxLength={160}
            />
            <div className="mt-1 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Description qui apparaîtra dans les résultats de recherche (idéalement 120-160 caractères)
              </p>
              <p className={`text-xs font-medium ${metaDescription && metaDescription.length > 145 ? 'text-amber-600' : 'text-gray-500'}`}>
                {metaDescription ? metaDescription.length : 0}/160
              </p>
            </div>
          </div>
          
          {/* Recommandations SEO */}
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-sm font-semibold text-blue-700 mb-2">Recommandations SEO</h3>
            <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
              <li>Le titre SEO devrait contenir les mots-clés importants et être accrocheur (50-60 caractères)</li>
              <li>La méta description doit résumer clairement le contenu de la page (120-160 caractères)</li>
              <li>Incluez des mots-clés pertinents dans votre description, mais sans excès</li>
              <li>Utilisez des sous-titres (H2, H3) dans la description pour structurer votre contenu</li>
              <li>Ajoutez des liens internes vers d'autres pages pertinentes du site</li>
            </ul>
          </div>
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
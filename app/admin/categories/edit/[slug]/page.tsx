'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { use } from 'react';
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

// Import du composant AiOptimizer
import AiOptimizer from '@/app/components/AiOptimizer';
// Import du composant IconSelector - Remplacé par SimpleIconSelector
import SimpleIconSelector from '@/app/components/SimpleIconSelector';
// Import du hook pour les icônes utilisées
import useUsedIcons from '@/app/hooks/useUsedIcons';
import CategoryAiOptimizer from '@/app/components/CategoryAiOptimizer';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  iconName: string | null;
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
  // Utiliser React.use pour récupérer les paramètres
  const unwrappedParams = use(params as unknown as Promise<{ slug: string }>);
  const { slug } = unwrappedParams;
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
  const [iconName, setIconName] = useState<string | null>(null);
  const [seoTitle, setSeoTitle] = useState<string | null>(null);
  const [metaDescription, setMetaDescription] = useState<string | null>(null);
  
  // Mode d'édition pour la description
  const [descriptionMode, setDescriptionMode] = useState<'visual' | 'code'>('visual');
  
  // Statistiques
  const [toolCount, setToolCount] = useState(0);
  
  // Récupérer les icônes déjà utilisées
  const { usedIcons, isLoading: isLoadingIcons } = useUsedIcons(category?.id);
  
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
    'list',
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
        setIconName(data.iconName);
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
          iconName,
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
  
  const handleUpdateFields = (data: {
    description?: string;
    seoTitle?: string;
    metaDescription?: string;
    relatedTags?: string[];
  }) => {
    if (data.description) setDescription(data.description);
    if (data.seoTitle) setSeoTitle(data.seoTitle);
    if (data.metaDescription) setMetaDescription(data.metaDescription);
    if (data.relatedTags && data.relatedTags.length > 0) {
      // Ici vous pourriez traiter les tags suggérés
      console.log('Tags associés suggérés:', data.relatedTags);
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
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Informations de base */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Layers className="h-5 w-5 mr-2 text-gray-500" />
              Informations de base
            </h3>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {/* Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom de la catégorie
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug (URL)
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  /categories/
                </span>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                  className="flex-1 block w-full border-gray-300 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                L'identifiant unique de la catégorie dans l'URL
              </p>
            </div>

            {/* Icône (remplaçant l'URL de l'image) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icône
              </label>
              <SimpleIconSelector 
                value={iconName} 
                onChange={setIconName}
                usedIcons={usedIcons}
              />
              <p className="mt-1 text-sm text-gray-500">
                Choisissez une icône pour représenter cette catégorie. Chaque catégorie doit avoir une icône unique.
              </p>
            </div>
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
            {description && !description.trim().startsWith('<') && (
              <p className="mt-2 text-xs text-amber-600">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Le contenu n'est pas au format HTML. Ajoutez des balises HTML (comme &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;) pour améliorer le formatage.
              </p>
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
        
        {/* Composant d'optimisation IA */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <Settings className="h-5 w-5 mr-2 text-primary" />
            Optimisation avec l'IA
          </h2>
          
          <p className="text-sm text-gray-600 mb-4">
            Utilisez l'intelligence artificielle pour optimiser automatiquement le contenu de cette catégorie.
            Sélectionnez les champs à optimiser et laissez l'IA vous proposer des améliorations.
          </p>
          
          <CategoryAiOptimizer 
            name={name}
            onUpdateFields={handleUpdateFields}
            additionalContext={`Cette catégorie concerne les outils d'IA vidéo pour: ${description || ''}`}
          />
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
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle,
  Settings,
  Trash2,
  Sparkles,
  Bot,
  Tag,
  X,
  ListChecks,
  Info,
  Plus,
  Edit,
  ExternalLink,
  ImagePlus,
  Trash,
  Check,
  Globe,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Github,
  Youtube,
  SmartphoneIcon,
  FileText
} from 'lucide-react';
import WebsiteCrawler from '@/app/components/WebsiteCrawler';
import RichTextEditor from '@/app/components/RichTextEditor';
import ImagePreview from '@/app/components/ImagePreview';
import ToolAiOptimizer from '@/app/components/ToolAiOptimizer';
import ImageSocialCrawler from '@/app/components/ImageSocialCrawler';
import ContentCrawler from '@/app/components/ContentCrawler';

// Types
type PricingType = 'FREE' | 'FREEMIUM' | 'PAID';

// Type pour la catégorie
interface CategoryType {
  id: string;
  name: string;
  slug: string;
}

// Types pour le tag
interface TagType {
  id: string;
  name: string;
  slug: string;
}

// Types pour la fonctionnalité
interface FeatureType {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string | null;
}

// Types pour l'utilisateur
interface UserType {
  id: string;
  name: string;
}

// Types pour l'outil
interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  websiteUrl: string;
  features: FeatureType[] | string[] | string;
  pricingType: PricingType;
  pricingDetails: string | null;
  rating: number | null;
  reviewCount: number | null;
  httpCode: number | null;
  httpChain: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  youtubeUrl: string | null;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  affiliateUrl: string | null;
  hasAffiliateProgram: boolean;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  tags?: TagType[];
  userTypes?: UserType[];
  categories?: CategoryType[];
  pros?: string[];
  cons?: string[];
  summary?: string;
  metaDescription?: string;
}

export default function EditToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // States pour les données de l'outil
  const [tool, setTool] = useState<Tool | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [pricingType, setPricingType] = useState<PricingType>('FREE');
  const [pricingDetails, setPricingDetails] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [appStoreUrl, setAppStoreUrl] = useState('');
  const [playStoreUrl, setPlayStoreUrl] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [hasAffiliateProgram, setHasAffiliateProgram] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [summary, setSummary] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [pros, setPros] = useState<string>('');
  const [cons, setCons] = useState<string>('');
  
  // Ajouter ces états:
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [features, setFeatures] = useState<FeatureType[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([]);
  const [customFeatures, setCustomFeatures] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  
  // Charger les données de l'outil
  useEffect(() => {
    const fetchTool = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tools/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Outil non trouvé');
          }
          throw new Error(`Erreur ${response.status}`);
        }
        
        const data = await response.json();
        setTool(data);
        
        // Initialiser les états avec les données de l'outil
        setName(data.name || '');
        setDescription(data.description || '');
        setWebsiteUrl(data.websiteUrl || '');
        setPricingType(data.pricingType || 'FREE');
        setPricingDetails(data.pricingDetails || '');
        
        // Initialiser les URLs des réseaux sociaux
        setTwitterUrl(data.twitterUrl || '');
        setInstagramUrl(data.instagramUrl || '');
        setFacebookUrl(data.facebookUrl || '');
        setLinkedinUrl(data.linkedinUrl || '');
        setGithubUrl(data.githubUrl || '');
        setYoutubeUrl(data.youtubeUrl || '');
        setAppStoreUrl(data.appStoreUrl || '');
        setPlayStoreUrl(data.playStoreUrl || '');
        
        // Informations d'affiliation
        setAffiliateUrl(data.affiliateUrl || '');
        setHasAffiliateProgram(data.hasAffiliateProgram || false);
        
        // Autres champs
        setIsActive(data.isActive || false);
        setSeoTitle(data.seoTitle || '');
        setSeoDescription(data.seoDescription || '');
        setSummary(data.summary || '');
        setMetaDescription(data.metaDescription || '');
        setPros(Array.isArray(data.pros) ? data.pros.join('\n') : '');
        setCons(Array.isArray(data.cons) ? data.cons.join('\n') : '');
        
        // Initialiser les tags sélectionnés
        if (data.tags && Array.isArray(data.tags)) {
          setSelectedTags(data.tags.map((tag: TagType) => tag.id));
        }
        
        // Initialiser les fonctionnalités sélectionnées si elles existent dans la réponse
        if (data.features && Array.isArray(data.features)) {
          setSelectedFeatures(data.features.map((f: FeatureType) => f.id));
        }
        
        // Mettre à jour les types d'utilisateurs sélectionnés
        if (data.userTypes && Array.isArray(data.userTypes)) {
          setSelectedUserTypes(data.userTypes.map((ut: UserType) => ut.id));
        }
        
        // Mettre à jour les catégories sélectionnées
        if (data.categories && Array.isArray(data.categories)) {
          setSelectedCategories(data.categories.map((cat: CategoryType) => cat.id));
        }
        
      } catch (err) {
        console.error('Erreur lors du chargement de l\'outil:', err);
        setError((err as Error).message || 'Erreur lors du chargement de l\'outil');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTool();
  }, [slug]);
  
  // Ajouter un useEffect pour charger toutes les catégories disponibles
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Erreur lors du chargement des catégories:', err);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Ajouter un useEffect pour charger tous les tags disponibles
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }
        
        const data = await response.json();
        setTags(data);
      } catch (err) {
        console.error('Erreur lors du chargement des tags:', err);
      }
    };
    
    fetchTags();
  }, []);
  
  // Remplacer l'useEffect pour charger les fonctionnalités disponibles
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch('/api/features');
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }
        
        const data = await response.json();
        setFeatures(data);
      } catch (err) {
        console.error('Erreur lors du chargement des fonctionnalités:', err);
      }
    };
    
    fetchFeatures();
  }, []);
  
  // Charger les types d'utilisateurs disponibles
  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const response = await fetch('/api/user-types');
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }
        
        const data = await response.json();
        setUserTypes(data);
      } catch (err) {
        console.error('Erreur lors du chargement des types d\'utilisateurs:', err);
      }
    };
    
    fetchUserTypes();
  }, []);
  
  // Adapter les fonctions pour gérer les fonctionnalités de l'outil (simples chaînes)
  const addFeature = () => {
    setCustomFeatures([...customFeatures, '']);
  };
  
  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...customFeatures];
    updatedFeatures[index] = value;
    setCustomFeatures(updatedFeatures);
  };
  
  const removeFeature = (index: number) => {
    setCustomFeatures(customFeatures.filter((_, i: number) => i !== index));
  };
  
  // Fonction pour générer du contenu avec Gemini AI
  const generateWithAI = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      // Construire le prompt en fonction des champs manquants
      let defaultPrompt = `Génère une description complète pour un outil d'IA vidéo appelé "${name}" dont le site est ${websiteUrl}. `;
      
      // Si les champs sont vides, demander à l'IA de les remplir
      const emptyFields = [];
      if (!description) emptyFields.push("description détaillée");
      if (customFeatures.length === 0) emptyFields.push("liste de 5 fonctionnalités principales");
      if (!seoTitle) emptyFields.push("titre SEO optimisé");
      if (!seoDescription) emptyFields.push("méta-description SEO de 155 caractères maximum");
      
      if (emptyFields.length > 0) {
        defaultPrompt += `Fournis : ${emptyFields.join(", ")}. Format JSON.`;
      } else {
        defaultPrompt = `Améliore et optimise la description de l'outil "${name}" : ${description}. Propose également 5 fonctionnalités clés, un titre SEO et une méta-description. Format JSON.`;
      }
      
      // Utiliser le prompt personnalisé s'il est fourni
      const finalPrompt = aiPrompt || defaultPrompt;
      
      // Appel à l'API Gemini (à implémenter côté serveur)
      const response = await fetch('/api/admin/generate-ai-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: finalPrompt,
          toolName: name,
          websiteUrl: websiteUrl
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du contenu');
      }
      
      const data = await response.json();
      
      // Mise à jour des champs avec les données générées
      if (data.description) setDescription(data.description);
      if (data.features && Array.isArray(data.features)) setCustomFeatures(data.features);
      if (data.seoTitle) setSeoTitle(data.seoTitle);
      if (data.seoDescription) setSeoDescription(data.seoDescription);
      
    } catch (err) {
      console.error('Erreur lors de la génération avec l\'IA:', err);
      setGenerationError((err as Error).message || 'Erreur lors de la génération du contenu');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Ajouter ces fonctions pour gérer les tags
  const handleTagSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedTagId = selectedOptions[0]?.value;
    
    if (!selectedTagId) return;
    
    const tagToAdd = tags.find(tag => tag.id === selectedTagId);
    
    if (tagToAdd && !selectedTags.includes(tagToAdd.id)) {
      setSelectedTags([...selectedTags, tagToAdd.id]);
    }
    
    // Réinitialiser la sélection
    e.target.value = '';
  };
  
  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };
  
  // Modifier la fonction handleFeatureSelection pour utiliser availableFeatures
  const handleFeatureSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedFeatureId = selectedOptions[0]?.value;
    
    if (!selectedFeatureId) return;
    
    const featureToAdd = features.find(feature => feature.id === selectedFeatureId);
    
    if (featureToAdd && !selectedFeatures.includes(featureToAdd.id)) {
      setSelectedFeatures([...selectedFeatures, featureToAdd.id]);
    }
    
    // Réinitialiser la sélection
    e.target.value = '';
  };
  
  const removeFeatureFromList = (featureId: string) => {
    setSelectedFeatures(selectedFeatures.filter(id => id !== featureId));
  };
  
  // Gérer la sélection des types d'utilisateurs
  const handleUserTypeSelection = (ut: UserType) => {
    setSelectedUserTypes(prevSelected => {
      if (prevSelected.includes(ut.id)) {
        return prevSelected.filter(id => id !== ut.id);
      } else {
        return [...prevSelected, ut.id];
      }
    });
  };
  
  // Fonction pour sauvegarder les modifications
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Validation des champs obligatoires
      if (!name || !websiteUrl || !description) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      // Formater les pros et cons en tableaux
      const prosArray = pros
        ? pros.split('\n').filter(line => line.trim() !== '')
        : [];
      
      const consArray = cons
        ? cons.split('\n').filter(line => line.trim() !== '')
        : [];
      
      // Ne conserver que les champs qui existent dans le schéma Prisma
      const toolData = {
        name,
        description,
        websiteUrl,
        pricingType,
        pricingDetails,
        twitterUrl: twitterUrl || null,
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
        linkedinUrl: linkedinUrl || null,
        githubUrl: githubUrl || null,
        youtubeUrl: youtubeUrl || null,
        appStoreUrl: appStoreUrl || null,
        playStoreUrl: playStoreUrl || null,
        affiliateUrl: affiliateUrl || null,
        hasAffiliateProgram,
        isActive,
        logoUrl: tool?.logoUrl || null,
        // Nous gardons les champs personnalisés à part pour qu'ils soient traités conditionnellement côté API
        customFields: {
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          summary: summary || null,
          metaDescription: metaDescription || null,
        },
        pros: prosArray,
        cons: consArray,
        tags: selectedTags,
        features: selectedFeatures,
        userTypes: selectedUserTypes,
        categories: selectedCategories
      };
      
      console.log("Données envoyées pour mise à jour:", toolData);
      
      const response = await fetch(`/api/tools/${slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }
      
      const responseData = await response.json();
      setSuccessMessage('Outil mis à jour avec succès');
      
      // Rafraîchir les données
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError((err as Error).message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Gestion de l'enrichissement IA
  const handleAIUpdate = (data: {
    description?: string;
    summary?: string;
    seoTitle?: string;
    metaDescription?: string;
    pros?: string[];
    cons?: string[];
  }) => {
    if (data.description) setDescription(data.description);
    if (data.summary) setSummary(data.summary);
    if (data.seoTitle) setSeoTitle(data.seoTitle);
    if (data.metaDescription) setMetaDescription(data.metaDescription);
    // Traitement des pros et cons si implémentés dans votre modèle
    if (data.pros && Array.isArray(data.pros)) {
      // Implémentez selon votre UI
      console.log('Avantages générés:', data.pros);
    }
    if (data.cons && Array.isArray(data.cons)) {
      // Implémentez selon votre UI
      console.log('Inconvénients générés:', data.cons);
    }
  };
  
  // Fonction pour gérer les données générées par le crawler
  const handleImageSocialCrawlerDataGenerated = (data: any) => {
    // Mise à jour des URLs
    if (data.websiteUrl) setWebsiteUrl(data.websiteUrl);
    if (data.twitterUrl) setTwitterUrl(data.twitterUrl);
    if (data.instagramUrl) setInstagramUrl(data.instagramUrl);
    if (data.facebookUrl) setFacebookUrl(data.facebookUrl);
    if (data.linkedinUrl) setLinkedinUrl(data.linkedinUrl);
    if (data.githubUrl) setGithubUrl(data.githubUrl);
    if (data.youtubeUrl) setYoutubeUrl(data.youtubeUrl);
    if (data.appStoreUrl) setAppStoreUrl(data.appStoreUrl);
    if (data.playStoreUrl) setPlayStoreUrl(data.playStoreUrl);
    if (data.affiliateUrl) setAffiliateUrl(data.affiliateUrl);
    if (data.hasAffiliateProgram !== undefined) setHasAffiliateProgram(data.hasAffiliateProgram);
    
    // Mise à jour du logo URL
    if (data.logoUrl && tool) {
      setTool({
        ...tool,
        logoUrl: data.logoUrl
      });
    }
  };
  
  const handleContentCrawlerDataGenerated = (data: any) => {
    // Ne pas mettre à jour le nom pour conserver l'original
    // if (data.name) setName(data.name);
    
    // Mise à jour des champs textuels
    if (data.description) {
      console.log("Description détaillée reçue du crawler:", data.description);
      // Assigner la description détaillée au champ RichTextEditor
      setDescription(data.description);
    }
    
    if (data.summary) setSummary(data.summary);
    if (data.seoTitle) setSeoTitle(data.seoTitle);
    if (data.seoDescription) setSeoDescription(data.seoDescription);
    
    // Mise à jour des avantages et inconvénients
    if (data.pros && Array.isArray(data.pros)) {
      setPros(data.pros.join('\n'));
    }
    
    if (data.cons && Array.isArray(data.cons)) {
      setCons(data.cons.join('\n'));
    }
  };
  
  // Afficher un loading si les données sont en cours de chargement
  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Chargement de l'outil...</p>
      </div>
    );
  }
  
  // Afficher une erreur si l'outil n'a pas été trouvé
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{error}</p>
            <Link href="/admin/tools" className="text-red-700 underline mt-2 inline-block">
              Retour à la liste des outils
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/admin/tools" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Retour à la liste</span>
        </Link>
        <button
          onClick={handleSaveChanges}
          disabled={isSaving || isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
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
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start mb-4">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start mb-4">
          <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{successMessage}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Modifier l'outil: {name || slug}
          </h1>
          
          <div className="space-y-6">
            <ImageSocialCrawler 
              onDataGenerated={handleImageSocialCrawlerDataGenerated}
              initialUrl={websiteUrl}
            />
            
            <ContentCrawler
              onDataGenerated={handleContentCrawlerDataGenerated}
              initialUrl={websiteUrl}
              socialLinks={[
                twitterUrl,
                instagramUrl,
                facebookUrl,
                linkedinUrl,
                githubUrl,
                youtubeUrl
              ].filter(Boolean) as string[]}
              imageUrl={tool?.logoUrl || ''}
              apiKey={process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''}
            />
          </div>
          
          <div className="bg-white shadow overflow-hidden rounded-lg divide-y divide-gray-200">
            {/* Informations de base */}
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary" />
                Informations de base
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'outil
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                {tool?.logoUrl && (
                  <div>
                    <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Chemin du logo
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        name="logoUrl"
                        id="logoUrl"
                        className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                        value={tool.logoUrl}
                        readOnly
                      />
                      <div className="flex-shrink-0 w-12 h-12 overflow-hidden border border-gray-200 rounded">
                        <img 
                          src={tool.logoUrl} 
                          alt={`Logo de ${name}`} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="websiteUrl"
                      id="websiteUrl"
                      className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="https://example.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                    Résumé court (max 200 caractères)
                  </label>
                  <textarea
                    id="summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={2}
                    maxLength={200}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {summary.length}/200 caractères
                  </p>
                </div>
              </div>
            </div>
            
            {/* Catégorie, tags et fonctionnalités */}
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Catégories, tags et fonctionnalités</h3>
              
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={selectedCategories[0] || ''}
                    onChange={(e) => setSelectedCategories([e.target.value])}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de prix
                  </label>
                  <select
                    value={pricingType}
                    onChange={(e) => setPricingType(e.target.value as PricingType)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option value="FREE">Gratuit</option>
                    <option value="FREEMIUM">Freemium</option>
                    <option value="PAID">Payant</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label htmlFor="pricingDetails" className="block text-sm font-medium text-gray-700">
                  Détails des prix
                </label>
                <textarea
                  id="pricingDetails"
                  value={pricingDetails}
                  onChange={(e) => setPricingDetails(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="ex: 9€/mois, essai gratuit de 7 jours, etc."
                />
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="mt-1 border border-gray-300 rounded-md p-2 h-48 overflow-y-auto">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center mb-2">
                        <input
                          id={`tag-${tag.id}`}
                          type="checkbox"
                          checked={selectedTags.includes(tag.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags([...selectedTags, tag.id]);
                            } else {
                              setSelectedTags(selectedTags.filter(id => id !== tag.id));
                            }
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor={`tag-${tag.id}`} className="ml-2 block text-sm text-gray-700">
                          {tag.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fonctionnalités
                  </label>
                  <div className="mt-1 border border-gray-300 rounded-md p-2 h-48 overflow-y-auto">
                    {features.map((feature) => (
                      <div key={feature.id} className="flex items-center mb-2">
                        <input
                          id={`feature-${feature.id}`}
                          type="checkbox"
                          checked={selectedFeatures.includes(feature.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFeatures([...selectedFeatures, feature.id]);
                            } else {
                              setSelectedFeatures(selectedFeatures.filter(id => id !== feature.id));
                            }
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor={`feature-${feature.id}`} className="ml-2 block text-sm text-gray-700">
                          {feature.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Types d'utilisateurs
                </label>
                <div className="mt-1 border border-gray-300 rounded-md p-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {userTypes.map((userType) => (
                    <div key={userType.id} className="flex items-center mb-2">
                      <input
                        id={`userType-${userType.id}`}
                        type="checkbox"
                        checked={selectedUserTypes.includes(userType.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserTypes([...selectedUserTypes, userType.id]);
                          } else {
                            setSelectedUserTypes(selectedUserTypes.filter(id => id !== userType.id));
                          }
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor={`userType-${userType.id}`} className="ml-2 block text-sm text-gray-700">
                        {userType.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Liens sociaux et affiliation */}
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Réseaux sociaux et liens externes</h3>
              
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-700">
                    Twitter / X
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      <Twitter className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      id="twitterUrl"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      className="flex-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700">
                    Instagram
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      <Instagram className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      id="instagramUrl"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      className="flex-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700">
                    Facebook
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      <Facebook className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      id="facebookUrl"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      className="flex-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
                    LinkedIn
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      <Linkedin className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      id="linkedinUrl"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="flex-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">
                    GitHub
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      <Github className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      id="githubUrl"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="flex-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">
                    YouTube
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      <Youtube className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      id="youtubeUrl"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="flex-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="appStoreUrl" className="block text-sm font-medium text-gray-700">
                    App Store
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      <SmartphoneIcon className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      id="appStoreUrl"
                      value={appStoreUrl}
                      onChange={(e) => setAppStoreUrl(e.target.value)}
                      className="flex-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="https://apps.apple.com/..."
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="playStoreUrl" className="block text-sm font-medium text-gray-700">
                    Google Play Store
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      <SmartphoneIcon className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      id="playStoreUrl"
                      value={playStoreUrl}
                      onChange={(e) => setPlayStoreUrl(e.target.value)}
                      className="flex-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="https://play.google.com/..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center">
                  <input
                    id="hasAffiliateProgram"
                    type="checkbox"
                    checked={hasAffiliateProgram}
                    onChange={(e) => setHasAffiliateProgram(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="hasAffiliateProgram" className="ml-2 block text-sm text-gray-700">
                    Cet outil propose un programme d'affiliation
                  </label>
                </div>
                
                {hasAffiliateProgram && (
                  <div className="mt-4">
                    <label htmlFor="affiliateUrl" className="block text-sm font-medium text-gray-700">
                      URL d'affiliation
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        <ExternalLink className="h-4 w-4" />
                      </span>
                      <input
                        type="url"
                        id="affiliateUrl"
                        value={affiliateUrl}
                        onChange={(e) => setAffiliateUrl(e.target.value)}
                        className="flex-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* SEO et autres paramètres */}
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">SEO et paramètres</h3>
              
              <div className="mt-5 grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">
                    Titre SEO (60-70 caractères)
                  </label>
                  <input
                    type="text"
                    id="seoTitle"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    maxLength={70}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {seoTitle.length}/70 caractères
                  </p>
                </div>
                
                <div>
                  <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
                    Description méta (150-160 caractères)
                  </label>
                  <textarea
                    id="seoDescription"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    rows={2}
                    maxLength={160}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {seoDescription.length}/160 caractères
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Outil actif (visible sur le site)
                  </label>
                </div>
              </div>
            </div>
            
            {/* Description détaillée */}
            <div className="bg-white shadow overflow-hidden rounded-lg mt-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Description détaillée
                </h2>
                
                <div className="mt-1">
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Décrivez l'outil en détail..."
                  />
                </div>
              </div>
            </div>
            
            {/* Avantages et inconvénients */}
            <div className="bg-white shadow overflow-hidden rounded-lg mt-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <ListChecks className="h-5 w-5 mr-2 text-primary" />
                  Avantages et inconvénients
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avantages (un par ligne)
                    </label>
                    <textarea
                      value={pros}
                      onChange={(e) => setPros(e.target.value)}
                      rows={5}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Listez les avantages, un par ligne"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inconvénients (un par ligne)
                    </label>
                    <textarea
                      value={cons}
                      onChange={(e) => setCons(e.target.value)}
                      rows={5}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Listez les inconvénients, un par ligne"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
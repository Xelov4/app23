'use client';

import { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  AlertCircle,
  TextCursorInput,
  Bot,
  Hash,
  FileText,
  Search,
  Settings
} from 'lucide-react';

interface AiOptimizerProps {
  type: 'feature' | 'tag' | 'user-type' | 'category' | 'tool';
  name: string;
  onUpdateFields: (data: {
    description?: string;
    seoTitle?: string;
    metaDescription?: string;
    summary?: string;
    pros?: string[];
    cons?: string[];
    [key: string]: any;
  }) => void;
  allowedFields?: string[];
  additionalContext?: string;
}

export default function AiOptimizer({ 
  type, 
  name, 
  onUpdateFields, 
  allowedFields,
  additionalContext = ''
}: AiOptimizerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  
  // Déterminer les champs autorisés
  const effectiveAllowedFields = allowedFields || ['description', 'seoTitle', 'metaDescription'];
  
  // Prompts par défaut selon le type
  const defaultPrompts = {
    'feature': `Génère une description pour une fonctionnalité d'outil d'IA vidéo nommée "${name}".
La description doit être concise (maximum 100 mots) et expliquer comment cette fonctionnalité est utile pour la création vidéo.
Génère aussi un titre SEO et une méta-description optimisés pour le référencement.
${additionalContext ? 'Contexte supplémentaire: ' + additionalContext : ''}
Format de réponse:
{
  "description": "La description générée",
  "seoTitle": "Titre SEO pour ${name} | Video-IA.net",
  "metaDescription": "La méta-description optimisée de 150 caractères maximum"
}`,
    'tag': `Génère une description pour un tag d'outil d'IA vidéo nommé "${name}".
La description doit être concise (maximum 100 mots) et expliquer ce que ce tag représente dans le contexte des outils d'IA pour la vidéo.
Génère aussi un titre SEO et une méta-description optimisés pour le référencement.
${additionalContext ? 'Contexte supplémentaire: ' + additionalContext : ''}
Format de réponse:
{
  "description": "La description générée",
  "seoTitle": "Titre SEO pour ${name} | Video-IA.net",
  "metaDescription": "La méta-description optimisée de 150 caractères maximum"
}`,
    'user-type': `Génère une description pour un type d'utilisateur d'outils d'IA vidéo nommé "${name}".
La description doit être concise (maximum 100 mots) et expliquer les besoins et cas d'usage de ce type d'utilisateur.
Génère aussi un titre SEO et une méta-description optimisés pour le référencement.
${additionalContext ? 'Contexte supplémentaire: ' + additionalContext : ''}
Format de réponse:
{
  "description": "La description générée",
  "seoTitle": "Titre SEO pour ${name} | Video-IA.net",
  "metaDescription": "La méta-description optimisée de 150 caractères maximum"
}`,
    'category': `Génère une description pour une catégorie d'outils d'IA vidéo nommée "${name}".
La description doit être concise (maximum 100 mots) et expliquer ce que cette catégorie d'outils permet de faire.
Génère aussi un titre SEO et une méta-description optimisés pour le référencement.
${additionalContext ? 'Contexte supplémentaire: ' + additionalContext : ''}
Format de réponse:
{
  "description": "La description générée",
  "seoTitle": "Titre SEO pour ${name} | Video-IA.net",
  "metaDescription": "La méta-description optimisée de 150 caractères maximum"
}`,
    'tool': `Génère une description pour un outil d'IA vidéo nommé "${name}".
La description doit être détaillée (maximum 300 mots) et expliquer les fonctionnalités principales de cet outil, ses avantages et cas d'usage.
Génère aussi un titre SEO, une méta-description optimisés pour le référencement, et une liste de 3 avantages et 2 inconvénients de l'outil.
${additionalContext ? 'Contexte supplémentaire: ' + additionalContext : ''}
Format de réponse:
{
  "description": "La description détaillée",
  "summary": "Une courte description de 50 mots",
  "seoTitle": "Titre SEO pour ${name} | Video-IA.net",
  "metaDescription": "La méta-description optimisée de 150 caractères maximum",
  "pros": ["Avantage 1", "Avantage 2", "Avantage 3"],
  "cons": ["Inconvénient 1", "Inconvénient 2"]
}`
  };

  // Icônes selon le type
  const typeIcons = {
    'feature': <TextCursorInput className="h-5 w-5 text-blue-500" />,
    'tag': <Hash className="h-5 w-5 text-green-500" />,
    'user-type': <Bot className="h-5 w-5 text-purple-500" />,
    'category': <FileText className="h-5 w-5 text-amber-500" />,
    'tool': <Settings className="h-5 w-5 text-red-500" />
  };

  // Textes selon le type
  const typeTexts = {
    'feature': 'fonctionnalité',
    'tag': 'tag',
    'user-type': 'type d\'utilisateur',
    'category': 'catégorie',
    'tool': 'outil'
  };

  // Construction du prompt final
  const buildFinalPrompt = () => {
    if (customPrompt) return customPrompt;
    
    let finalPrompt = defaultPrompts[type];
    
    if (additionalPrompt) {
      finalPrompt += `\n\nConsignes additionnelles: ${additionalPrompt}`;
    }
    
    return finalPrompt;
  };

  const generateContent = async () => {
    if (!name) {
      setError(`Veuillez d'abord entrer un nom pour ce ${typeTexts[type]}`);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const finalPrompt = buildFinalPrompt();
      
      const response = await fetch('/api/admin/gemini-ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          apiKey: 'AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA', // Clé API hardcodée comme demandé
          model: selectedModel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération de contenu');
      }

      const data = await response.json();
      
      // Filtrer les champs autorisés
      const filteredData: Record<string, any> = {};
      
      Object.keys(data).forEach(key => {
        if (effectiveAllowedFields.includes(key)) {
          filteredData[key] = data[key];
        }
      });
      
      // Mettre à jour les champs
      onUpdateFields(filteredData);
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la génération de contenu');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
          <h3 className="text-lg font-medium text-gray-800">
            Optimiser les contenus avec l'IA
          </h3>
        </div>
        <button 
          type="button"
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? (
            <ArrowRight className="w-5 h-5 transform rotate-90" />
          ) : (
            <ArrowRight className="w-5 h-5 transform -rotate-90" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-2">
            {typeIcons[type]}
            <div>
              <p className="text-sm text-gray-600 mb-1">
                L'IA va générer automatiquement {effectiveAllowedFields.includes('description') && "une description"} 
                {effectiveAllowedFields.includes('seoTitle') && effectiveAllowedFields.includes('description') && ", "} 
                {effectiveAllowedFields.includes('seoTitle') && "un titre SEO"} 
                {effectiveAllowedFields.includes('metaDescription') && ((effectiveAllowedFields.includes('description') || effectiveAllowedFields.includes('seoTitle')) ? " et " : "")} 
                {effectiveAllowedFields.includes('metaDescription') && "une méta-description"} 
                {effectiveAllowedFields.includes('summary') && ((effectiveAllowedFields.length > 1) ? ", " : "")} 
                {effectiveAllowedFields.includes('summary') && "un résumé"}
                {effectiveAllowedFields.includes('pros') && ((effectiveAllowedFields.length > 1) ? " et " : "")} 
                {effectiveAllowedFields.includes('pros') && "des avantages et inconvénients"}
                 pour votre {typeTexts[type]} <strong>{name}</strong>.
              </p>
              <p className="text-xs text-gray-500">
                Personnalisez le prompt ou utilisez les paramètres par défaut.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="model-selection" className="block text-sm font-medium text-gray-700 mb-1">
              Modèle IA
            </label>
            <select
              id="model-selection"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
            >
              <optgroup label="Gemini 2.5">
                <option value="gemini-2.5-pro-preview-03-25">Gemini 2.5 Pro Preview</option>
              </optgroup>
              <optgroup label="Gemini 2.0">
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash-Lite</option>
              </optgroup>
              <optgroup label="Gemini 1.5">
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash-8B</option>
              </optgroup>
              <optgroup label="Autres modèles Gemini">
                <option value="gemini-embedding-exp">Embedding Gemini</option>
                <option value="imagen-3.0-generate-002">Image 3</option>
              </optgroup>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="show-system-prompt"
              checked={showSystemPrompt}
              onChange={() => setShowSystemPrompt(!showSystemPrompt)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="show-system-prompt" className="ml-2 block text-sm text-gray-700">
              Modifier le prompt système
            </label>
          </div>

          {showSystemPrompt && (
            <div>
              <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 mb-1">
                Prompt système
              </label>
              <textarea
                id="custom-prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={defaultPrompts[type]}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ce prompt définit les instructions principales pour l'IA.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="additional-prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Instructions supplémentaires (optionnel)
            </label>
            <textarea
              id="additional-prompt"
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              placeholder="Ajoutez des instructions spécifiques, comme le ton, le style, ou des détails particuliers à inclure..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={generateContent}
              disabled={isGenerating}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Générer avec l'IA
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
'use client';

import { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  AlertCircle,
  Settings,
  CheckCircle
} from 'lucide-react';

interface ToolAiOptimizerProps {
  toolName: string;
  toolUrl?: string;
  initialDescription?: string;
  onDataGenerated: (data: {
    description?: string;
    summary?: string;
    seoTitle?: string;
    metaDescription?: string;
    pros?: string[];
    cons?: string[];
  }) => void;
  additionalContext?: string;
}

export default function ToolAiOptimizer({
  toolName,
  toolUrl = '',
  initialDescription = '',
  onDataGenerated,
  additionalContext = ''
}: ToolAiOptimizerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [selectedFields, setSelectedFields] = useState({
    description: true,
    summary: true,
    seoTitle: true,
    metaDescription: true,
    pros: true,
    cons: true
  });

  // Construit le prompt en fonction des champs sélectionnés
  const buildPrompt = () => {
    if (customPrompt) return customPrompt;

    let prompt = `Génère pour un outil d'IA vidéo nommé "${toolName}"${toolUrl ? ` (URL: ${toolUrl})` : ''} les éléments suivants:\n`;
    
    if (selectedFields.description) {
      prompt += `- Une description détaillée (maximum 300 mots) expliquant les fonctionnalités principales de ${toolName}, ses avantages et cas d'usage.\n`;
    }
    
    if (selectedFields.summary) {
      prompt += `- Un résumé court et concis (50 mots maximum) de ${toolName}.\n`;
    }
    
    if (selectedFields.seoTitle) {
      prompt += `- Un titre SEO optimisé pour le référencement (60-70 caractères maximum) pour ${toolName}.\n`;
    }
    
    if (selectedFields.metaDescription) {
      prompt += `- Une méta-description optimisée de 150 caractères maximum pour ${toolName}.\n`;
    }
    
    if (selectedFields.pros) {
      prompt += `- Une liste de 3 avantages principaux de l'outil ${toolName}.\n`;
    }
    
    if (selectedFields.cons) {
      prompt += `- Une liste de 2 inconvénients ou limitations de l'outil ${toolName}.\n`;
    }
    
    if (initialDescription) {
      prompt += `\nDescription actuelle de ${toolName}: ${initialDescription}\n`;
    }
    
    if (additionalContext) {
      prompt += `\nContexte supplémentaire sur ${toolName}: ${additionalContext}\n`;
    }
    
    if (additionalPrompt) {
      prompt += `\nConsignes additionnelles pour ${toolName}: ${additionalPrompt}\n`;
    }
    
    prompt += `\nFormat de réponse:
{
  ${selectedFields.description ? '"description": "La description détaillée de ' + toolName + '",' : ''}
  ${selectedFields.summary ? '"summary": "Un résumé court de ' + toolName + '",' : ''}
  ${selectedFields.seoTitle ? '"seoTitle": "Titre SEO pour ' + toolName + ' | Video-IA.net",' : ''}
  ${selectedFields.metaDescription ? '"metaDescription": "La méta-description optimisée de ' + toolName + '",' : ''}
  ${selectedFields.pros ? '"pros": ["Avantage 1 de ' + toolName + '", "Avantage 2 de ' + toolName + '", "Avantage 3 de ' + toolName + '"],' : ''}
  ${selectedFields.cons ? '"cons": ["Inconvénient 1 de ' + toolName + '", "Inconvénient 2 de ' + toolName + '"]' : ''}
}`;
    
    return prompt;
  };

  const handleCheckboxChange = (field: string) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  const generateContent = async () => {
    if (!toolName) {
      setError(`Veuillez d'abord entrer un nom pour cet outil`);
      return;
    }

    // Vérifier qu'au moins un champ est sélectionné
    if (!Object.values(selectedFields).some(v => v)) {
      setError('Veuillez sélectionner au moins un champ à générer');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const finalPrompt = buildPrompt();
      
      const response = await fetch('/api/admin/gemini-ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          apiKey: 'AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA',
          model: selectedModel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération de contenu');
      }

      const data = await response.json();
      
      // Filtrer les champs en fonction de la sélection
      const filteredData: Record<string, any> = {};
      
      Object.keys(selectedFields).forEach(key => {
        if (selectedFields[key as keyof typeof selectedFields] && data[key] !== undefined) {
          filteredData[key] = data[key];
        }
      });
      
      // Mettre à jour les champs
      onDataGenerated(filteredData);
      
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
            Optimiser l'outil avec l'IA
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
            <Settings className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-600 mb-1">
                L'IA va générer du contenu pour votre outil <strong>{toolName}</strong>.
              </p>
              <p className="text-xs text-gray-500">
                Sélectionnez les éléments à générer ci-dessous.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="field-description"
                checked={selectedFields.description}
                onChange={() => handleCheckboxChange('description')}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="field-description" className="ml-2 block text-sm text-gray-700">
                Description complète
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="field-summary"
                checked={selectedFields.summary}
                onChange={() => handleCheckboxChange('summary')}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="field-summary" className="ml-2 block text-sm text-gray-700">
                Résumé court
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="field-seoTitle"
                checked={selectedFields.seoTitle}
                onChange={() => handleCheckboxChange('seoTitle')}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="field-seoTitle" className="ml-2 block text-sm text-gray-700">
                Titre SEO
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="field-metaDescription"
                checked={selectedFields.metaDescription}
                onChange={() => handleCheckboxChange('metaDescription')}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="field-metaDescription" className="ml-2 block text-sm text-gray-700">
                Méta-description
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="field-pros"
                checked={selectedFields.pros}
                onChange={() => handleCheckboxChange('pros')}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="field-pros" className="ml-2 block text-sm text-gray-700">
                Avantages
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="field-cons"
                checked={selectedFields.cons}
                onChange={() => handleCheckboxChange('cons')}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="field-cons" className="ml-2 block text-sm text-gray-700">
                Inconvénients
              </label>
            </div>
          </div>
          
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
                placeholder={buildPrompt()}
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
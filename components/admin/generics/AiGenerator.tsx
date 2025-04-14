'use client';

import {
  Sparkles,
  ArrowRight,
  AlertCircle,
  Settings,
  FileText,
  CheckCircle
} from 'lucide-react';
import { useAiGenerator } from '@/hooks/useAiGenerator';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type Field = {
  key: string;
  label: string;
};

type AiGeneratorProps<T> = {
  title: string;
  icon?: React.ReactNode;
  entityName: string;
  entityUrl?: string;
  initialDescription?: string;
  fields: Field[];
  initialFields?: { [key: string]: boolean };
  buildPromptCallback: (config: any) => string;
  onDataGenerated: (data: Partial<T>) => void;
  additionalContext?: string;
  apiEndpoint?: string;
};

export default function AiGenerator<T>({
  title,
  icon = <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />,
  entityName,
  entityUrl,
  initialDescription,
  fields,
  initialFields,
  buildPromptCallback,
  onDataGenerated,
  additionalContext,
  apiEndpoint
}: AiGeneratorProps<T>) {
  // Créer un objet initialFields si non fourni
  const defaultFields = initialFields || 
    fields.reduce((acc, field) => ({
      ...acc,
      [field.key]: true
    }), {});

  // Utiliser notre hook
  const {
    isExpanded,
    setIsExpanded,
    isGenerating,
    error,
    selectedFields,
    handleCheckboxChange,
    customPrompt,
    setCustomPrompt,
    additionalPrompt,
    setAdditionalPrompt,
    selectedModel,
    setSelectedModel,
    showSystemPrompt,
    setShowSystemPrompt,
    buildPrompt,
    generateContent
  } = useAiGenerator<T>({
    entityName,
    entityUrl,
    initialDescription,
    initialFields: defaultFields,
    buildPromptCallback,
    onDataGenerated,
    additionalContext,
    apiEndpoint
  });

  return (
    <div className="mt-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          {icon}
          <h3 className="text-lg font-medium text-gray-800">
            {title}
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
            <Settings className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-gray-600 mb-1">
                L'IA va générer du contenu pour <strong>{entityName}</strong>.
              </p>
              <p className="text-xs text-gray-500">
                Sélectionnez les éléments à générer ci-dessous.
              </p>
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Sélection des champs */}
          <div className="grid grid-cols-2 gap-2">
            {fields.map(field => (
              <div key={field.key} className="flex items-center">
                <input
                  type="checkbox"
                  id={`field-${field.key}`}
                  checked={selectedFields[field.key] || false}
                  onChange={() => handleCheckboxChange(field.key)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor={`field-${field.key}`} className="ml-2 block text-sm text-gray-700">
                  {field.label}
                </label>
              </div>
            ))}
          </div>
          
          {/* Sélection du modèle */}
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
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Meilleur)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Rapide)</option>
            </select>
          </div>
          
          {/* Instructions supplémentaires */}
          <div>
            <label htmlFor="additional-prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Instructions supplémentaires (optionnel)
            </label>
            <textarea
              id="additional-prompt"
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              placeholder="Ajoutez des instructions spécifiques pour la génération..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
              rows={2}
            />
          </div>
          
          {/* Prompt personnalisé */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700">
                Prompt personnalisé (avancé)
              </label>
              <button
                type="button"
                onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                className="text-xs text-primary hover:text-primary/80"
              >
                {showSystemPrompt ? "Masquer" : "Afficher"}
              </button>
            </div>
            
            {showSystemPrompt && (
              <textarea
                id="custom-prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={buildPrompt()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
                rows={5}
              />
            )}
          </div>
          
          {/* Bouton de génération */}
          <div className="flex justify-end">
            <Button
              onClick={generateContent}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Générer avec l'IA
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 
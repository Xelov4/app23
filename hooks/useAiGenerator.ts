import { useState } from 'react';

type FieldSelection = {
  [key: string]: boolean;
};

type AiGeneratorResult<T> = {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  isGenerating: boolean;
  error: string | null;
  selectedFields: FieldSelection;
  handleCheckboxChange: (field: string) => void;
  customPrompt: string;
  setCustomPrompt: (value: string) => void;
  additionalPrompt: string;
  setAdditionalPrompt: (value: string) => void;
  selectedModel: string;
  setSelectedModel: (value: string) => void;
  showSystemPrompt: boolean;
  setShowSystemPrompt: (value: boolean) => void;
  buildPrompt: () => string;
  generateContent: () => Promise<void>;
};

type AiGeneratorConfig<T> = {
  entityName: string;
  entityUrl?: string;
  initialDescription?: string;
  initialFields: FieldSelection;
  buildPromptCallback: (config: {
    entityName: string;
    entityUrl?: string;
    initialDescription?: string;
    selectedFields: FieldSelection;
    customPrompt: string;
    additionalPrompt: string;
    additionalContext?: string;
  }) => string;
  onDataGenerated: (data: Partial<T>) => void;
  additionalContext?: string;
  apiEndpoint?: string;
};

/**
 * Hook réutilisable pour tous les composants de génération IA
 */
export function useAiGenerator<T>({
  entityName,
  entityUrl = '',
  initialDescription = '',
  initialFields,
  buildPromptCallback,
  onDataGenerated,
  additionalContext = '',
  apiEndpoint = '/api/admin/gemini-ia',
}: AiGeneratorConfig<T>): AiGeneratorResult<T> {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [selectedFields, setSelectedFields] = useState<FieldSelection>(initialFields);

  const handleCheckboxChange = (field: string) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const buildPrompt = () => {
    return buildPromptCallback({
      entityName,
      entityUrl,
      initialDescription,
      selectedFields,
      customPrompt,
      additionalPrompt,
      additionalContext
    });
  };

  const generateContent = async () => {
    if (!entityName) {
      setError(`Veuillez d'abord entrer un nom pour cet élément`);
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
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: finalPrompt,
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
        if (selectedFields[key] && data[key] !== undefined) {
          filteredData[key] = data[key];
        }
      });
      
      // Mettre à jour les champs
      onDataGenerated(filteredData as Partial<T>);
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la génération de contenu');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
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
  };
} 
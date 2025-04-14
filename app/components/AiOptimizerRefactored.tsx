'use client';

import { Sparkles } from 'lucide-react';
import AiGenerator from '@/components/admin/generics/AiGenerator.refactored';

// Type des données à générer
interface GenericAiData {
  description?: string;
  seoTitle?: string;
  metaDescription?: string;
  summary?: string;
  keywords?: string[];
  pros?: string[];
  cons?: string[];
}

interface AiOptimizerProps {
  title: string;
  entityName: string;
  onDataGenerated: (data: Partial<GenericAiData>) => void;
  additionalContext?: string;
  fields?: Array<{ key: string; label: string }>;
}

// Définition des champs disponibles par défaut
const DEFAULT_AI_FIELDS = [
  { key: 'description', label: 'Description complète' },
  { key: 'summary', label: 'Résumé court' },
  { key: 'seoTitle', label: 'Titre SEO' },
  { key: 'metaDescription', label: 'Méta-description' },
  { key: 'keywords', label: 'Mots-clés' }
];

export default function AiOptimizer({
  title,
  entityName,
  onDataGenerated,
  additionalContext = '',
  fields = DEFAULT_AI_FIELDS
}: AiOptimizerProps) {

  // Fonction de construction du prompt générique
  const buildGenericPrompt = (config: any) => {
    const { entityName, selectedFields, customPrompt, additionalPrompt, additionalContext } = config;
    
    if (customPrompt) return customPrompt;

    let prompt = `Génère pour "${entityName}" les éléments suivants:\n`;
    
    if (selectedFields.description) {
      prompt += `- Une description détaillée (maximum 300 mots).\n`;
    }
    
    if (selectedFields.summary) {
      prompt += `- Un résumé court et concis (50 mots maximum).\n`;
    }
    
    if (selectedFields.seoTitle) {
      prompt += `- Un titre SEO optimisé pour le référencement (60-70 caractères maximum).\n`;
    }
    
    if (selectedFields.metaDescription) {
      prompt += `- Une méta-description optimisée de 150 caractères maximum.\n`;
    }
    
    if (selectedFields.keywords) {
      prompt += `- Une liste de 5-10 mots-clés pertinents.\n`;
    }
    
    if (selectedFields.pros) {
      prompt += `- Une liste de 3-5 avantages principaux.\n`;
    }
    
    if (selectedFields.cons) {
      prompt += `- Une liste de 2-3 inconvénients ou limitations.\n`;
    }
    
    if (additionalContext) {
      prompt += `\nContexte supplémentaire: ${additionalContext}\n`;
    }
    
    if (additionalPrompt) {
      prompt += `\nConsignes additionnelles: ${additionalPrompt}\n`;
    }
    
    // Construire dynamiquement le format de réponse JSON
    prompt += `\nFormat de réponse:\n{\n`;
    
    const responseFields = [];
    if (selectedFields.description) responseFields.push(`  "description": "La description détaillée de ${entityName}"`);
    if (selectedFields.summary) responseFields.push(`  "summary": "Un résumé court de ${entityName}"`);
    if (selectedFields.seoTitle) responseFields.push(`  "seoTitle": "Titre SEO pour ${entityName}"`);
    if (selectedFields.metaDescription) responseFields.push(`  "metaDescription": "La méta-description optimisée"`);
    if (selectedFields.keywords) responseFields.push(`  "keywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"]`);
    if (selectedFields.pros) responseFields.push(`  "pros": ["Avantage 1", "Avantage 2", "Avantage 3"]`);
    if (selectedFields.cons) responseFields.push(`  "cons": ["Inconvénient 1", "Inconvénient 2"]`);
    
    prompt += responseFields.join(',\n') + '\n}';
    
    return prompt;
  };

  return (
    <AiGenerator<GenericAiData>
      title={title || "Générer du contenu avec l'IA"}
      icon={<Sparkles className="h-5 w-5 mr-2 text-yellow-300" />}
      entityName={entityName}
      fields={fields}
      buildPromptCallback={buildGenericPrompt}
      onDataGenerated={onDataGenerated}
      additionalContext={additionalContext}
    />
  );
} 
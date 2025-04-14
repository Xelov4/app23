'use client';

import { Settings } from 'lucide-react';
import AiGenerator from '@/components/admin/generics/AiGenerator.refactored';

// Type des données à générer
interface ToolAiData {
  description?: string;
  summary?: string;
  seoTitle?: string;
  metaDescription?: string;
  pros?: string[];
  cons?: string[];
}

interface ToolAiOptimizerProps {
  toolName: string;
  toolUrl?: string;
  initialDescription?: string;
  onDataGenerated: (data: Partial<ToolAiData>) => void;
  additionalContext?: string;
}

// Définition des champs disponibles
const TOOL_AI_FIELDS = [
  { key: 'description', label: 'Description complète' },
  { key: 'summary', label: 'Résumé court' },
  { key: 'seoTitle', label: 'Titre SEO' },
  { key: 'metaDescription', label: 'Méta-description' },
  { key: 'pros', label: 'Avantages (liste)' },
  { key: 'cons', label: 'Inconvénients (liste)' }
];

export default function ToolAiOptimizer({
  toolName,
  toolUrl = '',
  initialDescription = '',
  onDataGenerated,
  additionalContext = ''
}: ToolAiOptimizerProps) {

  // Fonction de construction du prompt spécifique pour les outils
  const buildToolPrompt = (config: any) => {
    const { entityName, selectedFields, customPrompt, additionalPrompt, additionalContext } = config;
    
    if (customPrompt) return customPrompt;

    const toolUrl = additionalContext.includes('URL:') 
      ? additionalContext.split('URL:')[1].trim().split(' ')[0]
      : '';
      
    let prompt = `Génère une fiche descriptive pour l'outil d'IA "${entityName}"`;
    
    if (toolUrl) {
      prompt += ` dont le site officiel est ${toolUrl}.`;
    } else {
      prompt += '.';
    }
    
    prompt += '\n\nInclus les éléments suivants:\n';
    
    if (selectedFields.description) {
      prompt += `- Une description détaillée (maximum 300 mots) expliquant les fonctionnalités principales, les cas d'utilisation et le public cible.\n`;
    }
    
    if (selectedFields.summary) {
      prompt += `- Un résumé court et concis (50 mots maximum) expliquant l'essentiel de l'outil.\n`;
    }
    
    if (selectedFields.seoTitle) {
      prompt += `- Un titre SEO optimisé pour le référencement (60-70 caractères maximum).\n`;
    }
    
    if (selectedFields.metaDescription) {
      prompt += `- Une méta-description optimisée de 150 caractères maximum pour attirer les utilisateurs intéressés par cet outil.\n`;
    }
    
    if (selectedFields.pros) {
      prompt += `- Une liste de 3-5 avantages principaux de l'outil.\n`;
    }
    
    if (selectedFields.cons) {
      prompt += `- Une liste de 2-3 inconvénients ou limitations de l'outil.\n`;
    }
    
    if (additionalContext) {
      prompt += `\nInformations supplémentaires: ${additionalContext}\n`;
    }
    
    if (additionalPrompt) {
      prompt += `\nConsignes additionnelles: ${additionalPrompt}\n`;
    }
    
    // Format de réponse JSON
    prompt += '\nFormat de réponse JSON:\n{\n';
    
    const responseFields = [];
    if (selectedFields.description) responseFields.push(`  "description": "Description détaillée de l'outil"`);
    if (selectedFields.summary) responseFields.push(`  "summary": "Résumé court et précis"`);
    if (selectedFields.seoTitle) responseFields.push(`  "seoTitle": "Titre SEO optimisé | IA Outils"`);
    if (selectedFields.metaDescription) responseFields.push(`  "metaDescription": "Meta description optimisée de 150 caractères maximum"`);
    if (selectedFields.pros) responseFields.push(`  "pros": ["Avantage 1", "Avantage 2", "Avantage 3"]`);
    if (selectedFields.cons) responseFields.push(`  "cons": ["Inconvénient 1", "Inconvénient 2"]`);
    
    prompt += responseFields.join(',\n') + '\n}';
    
    return prompt;
  };

  // Préparation du contexte additionnel avec l'URL si disponible
  const fullContext = toolUrl 
    ? `URL: ${toolUrl} ${additionalContext}`
    : additionalContext;

  return (
    <AiGenerator<ToolAiData>
      title="Optimiser l'outil avec l'IA"
      icon={<Settings className="h-5 w-5 mr-2 text-red-500" />}
      entityName={toolName}
      fields={TOOL_AI_FIELDS}
      buildPromptCallback={buildToolPrompt}
      onDataGenerated={onDataGenerated}
      additionalContext={fullContext}
    />
  );
} 
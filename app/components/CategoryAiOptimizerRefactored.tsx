'use client';

import { FileText } from 'lucide-react';
import AiGenerator from '@/components/admin/generics/AiGenerator.refactored';

// Type des données à générer
interface CategoryAiData {
  description?: string;
  seoTitle?: string;
  metaDescription?: string;
  relatedTags?: string[];
}

interface CategoryAiOptimizerProps {
  name: string;
  onUpdateFields: (data: Partial<CategoryAiData>) => void;
  additionalContext?: string;
}

// Définition des champs disponibles
const CATEGORY_AI_FIELDS = [
  { key: 'description', label: 'Description' },
  { key: 'seoTitle', label: 'Titre SEO' },
  { key: 'metaDescription', label: 'Méta-description' },
  { key: 'relatedTags', label: 'Tags associés' }
];

export default function CategoryAiOptimizer({
  name,
  onUpdateFields,
  additionalContext = ''
}: CategoryAiOptimizerProps) {

  // Fonction de construction du prompt spécifique pour les catégories
  const buildCategoryPrompt = (config: any) => {
    const { entityName, selectedFields, customPrompt, additionalPrompt, additionalContext } = config;
    
    if (customPrompt) return customPrompt;

    let prompt = `Génère pour une catégorie d'outils d'IA nommée "${entityName}" les éléments suivants:\n`;
    
    if (selectedFields.description) {
      prompt += `- Une description concise (maximum 150 mots) expliquant ce que représente cette catégorie d'outils et quels types d'outils on y trouve.\n`;
    }
    
    if (selectedFields.seoTitle) {
      prompt += `- Un titre SEO optimisé pour le référencement (60-70 caractères maximum).\n`;
    }
    
    if (selectedFields.metaDescription) {
      prompt += `- Une méta-description optimisée de 150 caractères maximum.\n`;
    }
    
    if (selectedFields.relatedTags) {
      prompt += `- Une liste de 5-8 tags pertinents qui pourraient être associés à cette catégorie.\n`;
    }
    
    if (additionalContext) {
      prompt += `\nContexte supplémentaire: ${additionalContext}\n`;
    }
    
    if (additionalPrompt) {
      prompt += `\nConsignes additionnelles: ${additionalPrompt}\n`;
    }
    
    // Format de réponse JSON
    prompt += '\nFormat de réponse JSON:\n{\n';
    
    const responseFields = [];
    if (selectedFields.description) responseFields.push(`  "description": "Description concise de la catégorie ${entityName}"`);
    if (selectedFields.seoTitle) responseFields.push(`  "seoTitle": "Titre SEO pour la catégorie ${entityName} | IA Outils"`);
    if (selectedFields.metaDescription) responseFields.push(`  "metaDescription": "Méta-description optimisée pour la catégorie ${entityName}"`);
    if (selectedFields.relatedTags) responseFields.push(`  "relatedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"]`);
    
    prompt += responseFields.join(',\n') + '\n}';
    
    return prompt;
  };

  return (
    <AiGenerator<CategoryAiData>
      title="Optimiser la catégorie avec l'IA"
      icon={<FileText className="h-5 w-5 mr-2 text-amber-500" />}
      entityName={name}
      fields={CATEGORY_AI_FIELDS}
      buildPromptCallback={buildCategoryPrompt}
      onDataGenerated={onUpdateFields}
      additionalContext={additionalContext}
    />
  );
} 
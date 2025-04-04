'use client';

import { useState } from 'react';
import { 
  Wand2, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Code,
  Sparkles,
  Bot
} from 'lucide-react';

// Interface pour les champs à optimiser
export interface Field {
  id: string;
  label: string;
  value: string;
  description?: string;
  selectable?: boolean;
}

// Interface pour les props du composant
export interface AiOptimizerProps {
  title?: string;
  entityName: string;
  entityType: string;
  contextDescription: string;
  fields: Field[];
  onFieldsUpdate: (updatedFields: Field[]) => void;
  apiKey?: string;
}

export default function AiOptimizer({
  title = "Optimiser avec l'IA",
  entityName,
  entityType,
  contextDescription,
  fields,
  onFieldsUpdate,
  apiKey = "AIzaSyB5Jku7K8FwTM0LcC3Iihfo4btAJ6IgCcA" // Clé API par défaut
}: AiOptimizerProps) {
  // États
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(buildDefaultSystemPrompt());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  
  // Générer le système prompt par défaut
  function buildDefaultSystemPrompt() {
    return `Tu es un expert SEO et rédacteur web pour un site appelé vidéo-ia.net. 
Ce site répertorie et compare différents outils d'IA pour la création de contenu vidéo, audio et visuel.

Tu dois optimiser le contenu d'une ${entityType} nommée "${entityName}".
Contexte: ${contextDescription}

GUIDELINES SEO ET RÉDACTIONNELLES :
1. Le mot-clé principal à optimiser est "${entityName}" - il doit apparaître dans les titres et les premiers paragraphes
2. Inclure des mots-clés secondaires liés à l'IA, aux vidéos et aux effets dans la description et meta description
3. Pour le titre SEO: maximum 55 caractères (en comptant "- Video IA" qui sera ajouté automatiquement à la fin)
4. Pour la meta description: entre 145-155 caractères avec des mots-clés pertinents et un appel à l'action
5. Structure hiérarchique pour la description avec H2, H3, listes à puces (ul/li) et paragraphes courts
6. Ton professionnel mais accessible, éviter le jargon excessif
7. Les balises HTML doivent être correctement formatées pour le champ description (fermées et bien structurées)
8. Inclure 2-3 mots-clés connexes/secondaires liés à "${entityName}" dans la meta description

LIMITES DE CARACTÈRES:
- Titre SEO: max 55 caractères (sans compter "- Video IA" qui sera ajouté automatiquement)
- Meta description: idéalement 145-155 caractères
- Description: bien structurée avec des sous-titres (h2, h3), paragraphes et listes

Pour chaque champ, fournis une version optimisée en gardant l'essence du contenu original mais en l'améliorant.`;
  }

  // Gérer la sélection des champs
  const handleFieldSelection = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter(id => id !== fieldId));
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  // Construire le prompt pour l'IA
  const buildPrompt = () => {
    // Inclure les informations de contexte
    let prompt = `${systemPrompt}

Voici les informations actuelles:
`;

    // Ajouter le contenu actuel des champs sélectionnés
    const selectedFieldsData = fields.filter(field => selectedFields.includes(field.id));
    selectedFieldsData.forEach(field => {
      prompt += `\n* ${field.label}: ${field.value || '(vide)'}\n  Description: ${field.description || 'Aucune description'}\n`;
    });

    // Ajouter les instructions spécifiques
    prompt += `\n${customPrompt || 'Optimise ces champs en respectant leur objectif et les bonnes pratiques SEO. Pour chaque champ, génère du contenu pertinent, engageant et optimisé pour les moteurs de recherche.'}\n`;

    // Ajouter des consignes spécifiques par type de champ
    prompt += `\nConsignes spécifiques:`;

    selectedFieldsData.forEach(field => {
      if (field.id.toLowerCase().includes('title') || field.id.toLowerCase().includes('titre')) {
        prompt += `\n- Pour "${field.label}": Crée un titre accrocheur de 50-60 caractères incluant les mots-clés pertinents.`;
      } else if (field.id.toLowerCase().includes('description')) {
        if (field.id.toLowerCase().includes('meta')) {
          prompt += `\n- Pour "${field.label}": Rédige une description concise de 145-155 caractères qui résume le contenu et incite à l'action. Inclure 2-3 mots-clés connexes à "${entityName}".`;
        } else {
          prompt += `\n- Pour "${field.label}": Génère une description détaillée et bien structurée en HTML valide qui commence toujours par des balises HTML (<p>, <h2>, etc.). Voici un exemple de format attendu:
          
<h2>Titre principal</h2>
<p>Paragraphe d'introduction avec le mot-clé principal "${entityName}" mentionné tôt.</p>

<h3>Sous-titre avec un aspect important</h3>
<p>Explication détaillée avec des termes pertinents...</p>

<h3>Caractéristiques principales</h3>
<ul>
  <li>Point important 1</li>
  <li>Point important 2</li>
  <li>Point important 3</li>
</ul>

<p>Conclusion avec appel à l'action ou résumé.</p>

Assure-toi que toutes les balises HTML sont correctement ouvertes et fermées.`;
        }
      } else if (field.id.toLowerCase().includes('name') || field.id.toLowerCase().includes('nom')) {
        prompt += `\n- Pour "${field.label}": Suggère un nom clair, concis et mémorable.`;
      }
    });
    
    prompt += `\n\nIMPORTANT: Réponds UNIQUEMENT avec un objet JSON au format suivant, sans aucun texte avant ou après:
{
  ${selectedFields.map(fieldId => `"${fieldId}": "contenu optimisé pour ${fieldId}"`).join(',\n  ')}
}

N'oublie pas que chaque valeur de propriété doit être sous forme de chaîne de caractères (entre guillemets). N'utilise pas de structure imbriquée ou de tableau results.`;

    return prompt;
  };

  // Optimiser les champs sélectionnés
  const optimizeFields = async () => {
    if (selectedFields.length === 0) {
      setError('Veuillez sélectionner au moins un champ à optimiser');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const prompt = buildPrompt();
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          model: 'gemini-1.5-pro',
          prompt,
          temperature: 0.7,
          maxOutputTokens: 4096
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'optimisation');
      }

      const data = await response.json();
      
      // Extraire le contenu généré
      let jsonResponse;
      try {
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textContent) throw new Error('Réponse vide de l\'API');
        
        // Extraire uniquement la partie JSON de la réponse
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Format de réponse invalide');
        
        jsonResponse = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Erreur parsing JSON:', parseError);
        throw new Error('Impossible de traiter la réponse de l\'IA');
      }

      console.log('Réponse JSON brute:', jsonResponse);

      // Adaptation pour supporter plusieurs formats de réponse JSON
      let resultsArray = [];
      
      if (jsonResponse?.results && Array.isArray(jsonResponse.results)) {
        // Format avec un tableau "results"
        resultsArray = jsonResponse.results;
      } else {
        // Format où les champs sont directement à la racine de l'objet
        resultsArray = Object.entries(jsonResponse).map(([key, value]) => {
          // Si la valeur est déjà un objet avec fieldId et content
          if (typeof value === 'object' && value !== null && 'fieldId' in value && 'content' in value) {
            return value;
          }
          // Sinon, on crée un objet au format attendu
          return {
            fieldId: key,
            content: value
          };
        });
      }

      console.log('Tableau de résultats:', resultsArray);

      if (resultsArray.length === 0) {
        throw new Error('Aucun résultat exploitable dans la réponse de l\'IA');
      }

      // Mettre à jour les champs
      const updatedFields = fields.map(field => {
        // Chercher dans les formats possibles (fieldId ou id direct)
        const result = resultsArray.find((r: any) => 
          (r.fieldId === field.id) || (r.id === field.id) || (r[field.id])
        );
        
        if (result && selectedFields.includes(field.id)) {
          let content = '';
          
          // Déterminer où se trouve la valeur
          if (typeof result.content === 'string') {
            content = result.content;
          } else if (typeof result[field.id] === 'string') {
            content = result[field.id];
          } else if (typeof result === 'string') {
            content = result;
          } else {
            content = JSON.stringify(result);
          }
            
          console.log(`Mise à jour du champ ${field.id} avec:`, content);
          
          return {
            ...field,
            value: content
          };
        }
        return field;
      });

      console.log('Champs mis à jour:', updatedFields);
      onFieldsUpdate(updatedFields);
      setSuccess('Champs optimisés avec succès');
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  // Liste filtrée des champs (sans le champ "nom")
  const filteredFields = fields.filter(field => field.selectable !== false);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <div 
        className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-700 to-blue-600 text-white cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-md font-medium flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
          {title}
        </h3>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-white" />
        ) : (
          <ChevronDown className="h-5 w-5 text-white" />
        )}
      </div>

      {isExpanded && (
        <div className="p-5">
          <div className="flex items-center mb-4">
            <Bot className="h-6 w-6 text-indigo-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              Assistant IA - Optimisation de contenu
            </h3>
          </div>
          
          <p className="text-gray-600 mb-6 bg-blue-50 p-3 rounded-md border-l-4 border-blue-500">
            L'assistant vous aide à optimiser le contenu de votre catégorie <strong>{entityName}</strong>. 
            Sélectionnez les champs à améliorer et laissez l'intelligence artificielle vous proposer des versions optimisées pour le SEO.
          </p>

          {/* Sélection des champs */}
          <div className="mb-6 bg-white p-4 rounded-md shadow-sm">
            <label className="block text-md font-medium text-gray-800 mb-3">
              Champs à optimiser
            </label>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {filteredFields.map(field => (
                <div key={field.id} className="flex items-start p-2 hover:bg-gray-50 rounded-md">
                  <input
                    type="checkbox"
                    id={`field-${field.id}`}
                    checked={selectedFields.includes(field.id)}
                    onChange={() => handleFieldSelection(field.id)}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-0.5"
                  />
                  <div className="ml-3">
                    <label htmlFor={`field-${field.id}`} className="block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    {field.description && (
                      <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Système prompt (collapsible) */}
          <div className="mb-6 border border-gray-200 rounded-md">
            <div 
              className="flex items-center justify-between p-3 bg-gray-100 cursor-pointer"
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            >
              <h4 className="text-sm font-medium flex items-center text-gray-700">
                <Code className="h-4 w-4 mr-1.5 text-gray-600" />
                Système prompt (instructions à l'IA)
              </h4>
              {showSystemPrompt ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
            
            {showSystemPrompt && (
              <div className="p-3">
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ce prompt système définit le comportement général de l'IA et les instructions principales.
                </p>
              </div>
            )}
          </div>

          {/* Instructions personnalisées */}
          <div className="mb-6">
            <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <MessageSquare className="h-4 w-4 mr-1.5 text-gray-600" />
              Instructions spécifiques (optionnel)
            </label>
            <textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Instructions spécifiques pour l'IA (ex: 'Mets l'accent sur les aspects techniques', 'Adopte un ton plus commercial'...)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Ces instructions seront ajoutées au prompt pour personnaliser la réponse de l'IA.
            </p>
          </div>

          {/* Messages d'erreur et de succès */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-50 border-l-4 border-green-500 rounded-md flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Bouton d'action */}
          <button
            onClick={optimizeFields}
            disabled={isLoading || selectedFields.length === 0}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-md hover:from-indigo-700 hover:to-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Optimisation en cours...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Optimiser avec l'IA
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
} 
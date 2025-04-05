'use client';

import { useState } from 'react';
import {
  Globe,
  Search,
  ArrowRight,
  AlertCircle,
  Loader2,
  Bot,
  ExternalLink,
  FileText,
  Link,
  Sparkles
} from 'lucide-react';

interface ContentCrawlerProps {
  onDataGenerated: (data: {
    description?: string;
    name?: string;
    summary?: string;
    seoTitle?: string;
    seoDescription?: string;
    pros?: string[];
    cons?: string[];
  }) => void;
  initialUrl?: string;
  socialLinks?: string[];
  imageUrl?: string;
  apiKey: string;
}

interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

export default function ContentCrawler({
  onDataGenerated,
  initialUrl = '',
  socialLinks = [],
  imageUrl = '',
  apiKey
}: ContentCrawlerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [url, setUrl] = useState(initialUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [detailedDescription, setDetailedDescription] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    pagesDiscovered: number;
    pagesProcessed: number;
    contentLength: number;
  }>({
    pagesDiscovered: 0,
    pagesProcessed: 0,
    contentLength: 0
  });

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setLogs(prevLogs => [...prevLogs, { message, type, timestamp: new Date() }]);
  };

  const startCrawling = async () => {
    if (!url) {
      setError('Veuillez entrer une URL');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setStatus('Initialisation du crawler...');
    setLogs([{ message: 'Démarrage du crawler pour extraction de contenu...', type: 'info', timestamp: new Date() }]);
    setProgress({
      pagesDiscovered: 0,
      pagesProcessed: 0,
      contentLength: 0
    });

    try {
      // Assurer que l'URL est bien formatée
      let normalizedUrl = url;
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
        setUrl(normalizedUrl);
        addLog(`URL normalisée en ${normalizedUrl}`, 'info');
      }

      // Lancer le crawler pour extraction de contenu
      setStatus('Exploration et extraction du contenu...');
      addLog('Initialisation de Puppeteer pour explorer le site...', 'info');
      
      const crawlResponse = await fetch('/api/admin/content-crawler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: normalizedUrl,
          imageUrl: imageUrl,
          socialLinks: socialLinks
        }),
      });

      if (!crawlResponse.ok) {
        const errorData = await crawlResponse.json();
        throw new Error(errorData.error || 'Erreur lors du crawling de contenu');
      }

      const crawlData = await crawlResponse.json();
      
      addLog(`Site exploré avec succès. Trouvé ${crawlData.pagesDiscovered} pages, traité ${crawlData.pagesProcessed} pages.`, 'success');
      addLog(`Longueur du contenu extrait: ${crawlData.contentLength} caractères`, 'info');
      
      if (crawlData.geminiAnalysis) {
        addLog('Analyse Gemini terminée avec succès', 'success');
      } else {
        addLog('L\'analyse avec Gemini n\'a pas pu être effectuée', 'warning');
      }
      
      setProgress(prev => ({
        ...prev,
        pagesDiscovered: crawlData.pagesDiscovered,
        pagesProcessed: crawlData.pagesProcessed,
        contentLength: crawlData.contentLength
      }));

      // Mise à jour des champs du formulaire avec l'analyse Gemini
      if (crawlData.geminiAnalysis && crawlData.geminiAnalysis.rawResponse) {
        // Analyse de la réponse brute pour extraire les informations structurées
        const rawResponse = crawlData.geminiAnalysis.rawResponse;
        
        // Logs pour déboguer
        addLog(`Réponse Gemini reçue (${rawResponse.length} caractères)`, 'info');
        
        // On extrait le nom (ligne qui commence par "1.")
        const nameMatch = rawResponse.match(/1\.\s*(.*)/);
        const name = nameMatch ? nameMatch[1].replace(/\*\*(.*?)\*\*/g, '$1') : '';
        
        // On extrait la description (ligne qui commence par "2.")
        const descMatch = rawResponse.match(/2\.\s*([\s\S]*?)(?=3\.|\n\d+\.|\Z)/);
        let description = descMatch ? descMatch[1].trim() : '';
        
        if (!description || description.length < 10) {
          addLog("Description détaillée non trouvée ou trop courte dans l'analyse Gemini", 'warning');
          // Utiliser le contenu brut comme fallback
          description = `<p>Voici une description détaillée de ${name}:</p>\n<p>${crawlData.content.substring(0, 1000)}...</p>`;
        }
        
        // Formater la description en HTML structuré
        if (description) {
          // Supprimer les marqueurs ** qui entourent les variables
          description = description.replace(/\*\*(.*?)\*\*/g, '$1');
          
          // Vérifier que la description a au moins 300 mots
          const wordCount = description.split(/\s+/).length;
          if (wordCount < 300) {
            addLog(`La description générée est trop courte (${wordCount} mots), ajout de détails supplémentaires...`, 'warning');
            
            // Si on a des sections, c'est déjà structuré, sinon on le structure
            if (!/(<h[23]|<ul|<li)/.test(description)) {
              // Transformation de la description en HTML structuré
              const paragraphs = description.split(/\n\n+/).filter(Boolean);
              const formattedDescription = paragraphs.map((para: string, index: number) => {
                if (index === 0) {
                  return `<p>${para}</p>`;
                } else if (para.startsWith('- ') || para.startsWith('• ')) {
                  const items = para.split(/\n/).filter(Boolean)
                    .map((item: string) => item.replace(/^[•\-]\s*/, '').trim())
                    .map((item: string) => `<li>${item}</li>`)
                    .join('');
                  return `<ul>${items}</ul>`;
                } else if (para.length < 100) {
                  return `<h2>${para}</h2>`;
                } else {
                  return `<p>${para}</p>`;
                }
              }).join('');
              
              description = formattedDescription;
            }
          } else {
            addLog(`Description générée avec ${wordCount} mots`, 'success');
            
            // Structure la description en HTML si ce n'est pas déjà fait
            if (!/(<h[23]|<ul|<li|<p)/.test(description)) {
              const paragraphs = description.split(/\n\n+/).filter(Boolean);
              description = paragraphs.map((para: string, index: number) => {
                if (para.startsWith('- ') || para.startsWith('• ')) {
                  const items = para.split(/\n/).filter(Boolean)
                    .map((item: string) => item.replace(/^[•\-]\s*/, '').trim())
                    .map((item: string) => `<li>${item}</li>`)
                    .join('');
                  return `<ul>${items}</ul>`;
                } else if (para.length < 100 && index > 0) {
                  return `<h2>${para}</h2>`;
                } else {
                  return `<p>${para}</p>`;
                }
              }).join('');
            }
          }
          
          // Stocker la description formatée
          setDetailedDescription(description);
        }
        
        // Extraire les autres champs...
        const summaryMatch = rawResponse.match(/3\.\s*([\s\S]*?)(?=4\.|\n\d+\.|\Z)/);
        const summary = summaryMatch ? summaryMatch[1].trim().replace(/\*\*(.*?)\*\*/g, '$1') : '';
        
        const seoTitleMatch = rawResponse.match(/4\.\s*([\s\S]*?)(?=5\.|\n\d+\.|\Z)/);
        const seoTitle = seoTitleMatch ? seoTitleMatch[1].trim().replace(/\*\*(.*?)\*\*/g, '$1') : '';
        
        const seoDescMatch = rawResponse.match(/5\.\s*([\s\S]*?)(?=6\.|\n\d+\.|\Z)/);
        const seoDescription = seoDescMatch ? seoDescMatch[1].trim().replace(/\*\*(.*?)\*\*/g, '$1') : '';
        
        // On extrait les avantages
        const prosMatch = rawResponse.match(/6\.\s*([\s\S]*?)(?=7\.|\n\d+\.|\Z)/);
        const prosText = prosMatch ? prosMatch[1].trim() : '';
        const pros = prosText.split(/\n+/)
          .map((line: string) => line.replace(/^[•\-\*]\s*/, '').trim())
          .map((line: string) => line.replace(/\*\*(.*?)\*\*/g, '$1'))
          .filter(Boolean);
        
        // On extrait les inconvénients
        const consMatch = rawResponse.match(/7\.\s*([\s\S]*?)(?=8\.|\n\d+\.|\Z)/);
        const consText = consMatch ? consMatch[1].trim() : '';
        const cons = consText.split(/\n+/)
          .map((line: string) => line.replace(/^[•\-\*]\s*/, '').trim())
          .map((line: string) => line.replace(/\*\*(.*?)\*\*/g, '$1'))
          .filter(Boolean);

        // Mise à jour des champs du formulaire
        onDataGenerated({
          description: description,
          name: name,
          summary: summary,
          seoTitle: seoTitle,
          seoDescription: seoDescription,
          pros: pros,
          cons: cons
        });
        
        // Ajouter un log pour confirmer la longueur de la description envoyée
        const descriptionWordCount = description ? description.split(/\s+/).length : 0;
        addLog(`Description détaillée envoyée (${descriptionWordCount} mots)`, 'success');
        
        addLog(`Informations extraites: nom, description structurée, résumé, SEO, ${pros.length} avantages, ${cons.length} inconvénients`, 'success');
      }

      addLog('Extraction de contenu et analyse Gemini terminées', 'success');
      setStatus('Terminé');
    } catch (err) {
      console.error('Erreur:', err);
      setError((err as Error).message || 'Une erreur est survenue');
      addLog(`Erreur: ${(err as Error).message}`, 'error');
      setStatus('Erreur');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Extraction de contenu et analyse Gemini
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? 'Réduire' : 'Développer'}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                Ce module va explorer votre site web jusqu'à 2 niveaux de profondeur, extraire le contenu textuel et utiliser Gemini AI pour analyser ce contenu et générer une description détaillée.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex-grow">
                <label htmlFor="contentUrl" className="sr-only">URL à explorer</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="contentUrl"
                    id="contentUrl"
                    className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
              </div>
              <button
                onClick={startCrawling}
                disabled={isProcessing || !url}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyser
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Journal d'activité */}
            {logs.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Journal d'activité</h4>
                <div className="bg-gray-50 rounded-md p-3 max-h-60 overflow-y-auto text-sm">
                  {logs.map((log, index) => (
                    <div key={index} className={`mb-1 flex items-start ${
                      log.type === 'error' ? 'text-red-600' :
                      log.type === 'success' ? 'text-green-600' :
                      log.type === 'warning' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      <span className="text-xs text-gray-400 mr-2">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progrès et résultats */}
            {status === 'Terminé' && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Résultats</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-green-50 rounded-md p-3 text-green-700 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    <span>{progress.pagesProcessed} pages analysées sur {progress.pagesDiscovered} découvertes</span>
                  </div>
                  <div className="bg-blue-50 rounded-md p-3 text-blue-700 flex items-center">
                    <Bot className="h-5 w-5 mr-2" />
                    <span>Analyse AI terminée</span>
                  </div>
                  
                  {detailedDescription && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Aperçu de la description générée</h4>
                      <div className="border border-gray-200 rounded-md p-4 bg-white">
                        <div className="prose prose-sm max-h-60 overflow-y-auto">
                          <div dangerouslySetInnerHTML={{ __html: detailedDescription }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
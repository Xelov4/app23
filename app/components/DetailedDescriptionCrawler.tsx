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
  BookOpen
} from 'lucide-react';

interface DetailedDescriptionCrawlerProps {
  onDataGenerated: (data: {
    detailedDescription?: string;
  }) => void;
  initialUrl?: string;
  apiKey: string;
}

interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

export default function DetailedDescriptionCrawler({
  onDataGenerated,
  initialUrl = '',
  apiKey
}: DetailedDescriptionCrawlerProps) {
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
    setLogs([{ message: 'Démarrage du crawler pour extraction du contenu principal...', type: 'info', timestamp: new Date() }]);
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

      // Lancer le crawler pour extraction du contenu principal
      setStatus('Exploration et extraction du contenu principal...');
      addLog('Initialisation de Puppeteer pour extraire le contenu principal...', 'info');
      
      const crawlResponse = await fetch('/api/admin/detailed-description-crawler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: normalizedUrl
        }),
      });

      if (!crawlResponse.ok) {
        const errorData = await crawlResponse.json();
        throw new Error(errorData.error || 'Erreur lors de l\'extraction du contenu principal');
      }

      const crawlData = await crawlResponse.json();
      
      addLog(`Site exploré avec succès. Trouvé ${crawlData.pagesDiscovered} pages, traité ${crawlData.pagesProcessed} pages.`, 'success');
      addLog(`Longueur du contenu extrait: ${crawlData.contentLength} caractères`, 'info');
      
      if (crawlData.geminiAnalysis) {
        addLog('Analyse Gemini et génération de description détaillée terminées avec succès', 'success');
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
      if (crawlData.geminiAnalysis && crawlData.geminiAnalysis.detailedDescription) {
        setDetailedDescription(crawlData.geminiAnalysis.detailedDescription);
        
        // Mise à jour des champs du formulaire
        onDataGenerated({
          detailedDescription: crawlData.geminiAnalysis.detailedDescription
        });
        
        // Ajouter un log pour confirmer la longueur de la description envoyée
        const wordCount = crawlData.geminiAnalysis.detailedDescription
          ? crawlData.geminiAnalysis.detailedDescription.split(/\s+/).length
          : 0;
        addLog(`Description détaillée générée (${wordCount} mots)`, 'success');
      } else if (crawlData.geminiAnalysis && crawlData.geminiAnalysis.rawResponse) {
        // Utiliser la réponse brute si l'analyse structurée n'est pas disponible
        setDetailedDescription(crawlData.geminiAnalysis.rawResponse);
        onDataGenerated({
          detailedDescription: crawlData.geminiAnalysis.rawResponse
        });
        addLog(`Description détaillée générée (format brut)`, 'success');
      }

      addLog('Génération de la description détaillée terminée', 'success');
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
            <BookOpen className="h-5 w-5 mr-2 text-primary" />
            Génération de description détaillée optimisée SEO
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
                Ce module va extraire le contenu principal des pages de votre site web et générer une description détaillée optimisée SEO d'au moins 300 mots, avec structure HTML (titres, sous-titres et paragraphes).
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex-grow">
                <label htmlFor="descriptionUrl" className="sr-only">URL à explorer</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="descriptionUrl"
                    id="descriptionUrl"
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
                disabled={isProcessing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Générer description
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {status && !error && (
              <div className="rounded-md bg-blue-50 p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                    ) : (
                      <Bot className="h-5 w-5 text-blue-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Statut</h3>
                    <div className="mt-2 text-sm text-blue-700">{status}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Logs et progrès */}
            {logs.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Journal d'activité</h4>
                <div className="bg-gray-50 p-3 rounded-md h-36 overflow-y-auto text-xs">
                  {logs.map((log, index) => (
                    <div key={index} className={`mb-1 ${
                      log.type === 'success' ? 'text-green-700' :
                      log.type === 'error' ? 'text-red-700' :
                      log.type === 'warning' ? 'text-yellow-700' :
                      'text-gray-700'
                    }`}>
                      <span className="text-gray-500">[{log.timestamp.toLocaleTimeString()}]</span> {log.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aperçu de la description détaillée */}
            {detailedDescription && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu de la description détaillée</h4>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-80 overflow-y-auto">
                  <div 
                    className="text-xs prose prose-sm max-w-none" 
                    dangerouslySetInnerHTML={{ __html: detailedDescription }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
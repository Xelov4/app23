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
  CreditCard
} from 'lucide-react';

interface PricingCrawlerProps {
  onDataGenerated: (data: {
    pricingDetails?: string;
    pricingType?: 'FREE' | 'FREEMIUM' | 'PAID';
  }) => void;
  initialUrl?: string;
  apiKey: string;
}

interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

export default function PricingCrawler({
  onDataGenerated,
  initialUrl = '',
  apiKey
}: PricingCrawlerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [url, setUrl] = useState(initialUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pricingDetails, setPricingDetails] = useState<string | null>(null);
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
    setLogs([{ message: 'Démarrage du crawler pour extraction des informations de prix...', type: 'info', timestamp: new Date() }]);
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

      // Lancer le crawler pour extraction des informations de prix
      setStatus('Exploration des pages de prix...');
      addLog('Initialisation de Puppeteer pour explorer les pages de tarification...', 'info');
      
      const crawlResponse = await fetch('/api/admin/pricing-crawler', {
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
        throw new Error(errorData.error || 'Erreur lors du crawling des prix');
      }

      const crawlData = await crawlResponse.json();
      
      addLog(`Site exploré avec succès. Trouvé ${crawlData.pagesDiscovered} pages, traité ${crawlData.pagesProcessed} pages de tarification.`, 'success');
      addLog(`Longueur du contenu extrait: ${crawlData.contentLength} caractères`, 'info');
      
      if (crawlData.geminiAnalysis) {
        addLog('Analyse Gemini des prix terminée avec succès', 'success');
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
      if (crawlData.geminiAnalysis && crawlData.geminiAnalysis.pricingDetails) {
        setPricingDetails(crawlData.geminiAnalysis.pricingDetails);
        
        // Déterminer le type de tarification (FREE, FREEMIUM, PAID)
        const pricingType = crawlData.geminiAnalysis.pricingType || 'PAID';
        
        // Mise à jour des champs du formulaire
        onDataGenerated({
          pricingDetails: crawlData.geminiAnalysis.pricingDetails,
          pricingType: pricingType
        });
        
        addLog(`Détails de tarification extraits (${crawlData.geminiAnalysis.pricingDetails.length} caractères)`, 'success');
      } else if (crawlData.geminiAnalysis && crawlData.geminiAnalysis.rawResponse) {
        // Utiliser la réponse brute si l'analyse structurée n'est pas disponible
        setPricingDetails(crawlData.geminiAnalysis.rawResponse);
        onDataGenerated({
          pricingDetails: crawlData.geminiAnalysis.rawResponse
        });
        addLog(`Détails de tarification extraits (format brut)`, 'success');
      }

      addLog('Extraction des informations de prix terminée', 'success');
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
            <CreditCard className="h-5 w-5 mr-2 text-primary" />
            Extraction des informations de tarification
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
                Ce module va visiter les pages de tarification de votre site web et extraire les informations de prix et d'offres. Il analysera les différents plans tarifaires et générera une description détaillée des options disponibles.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex-grow">
                <label htmlFor="pricingUrl" className="sr-only">URL à explorer</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="pricingUrl"
                    id="pricingUrl"
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
                    Analyser les prix
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

            {/* Résultats après le crawl */}
            {pricingDetails && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Résultat de l'analyse des prix</h4>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-80 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap">{pricingDetails}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
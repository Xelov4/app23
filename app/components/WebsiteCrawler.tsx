'use client';

import { useState } from 'react';
import {
  Globe,
  Search,
  ArrowRight,
  AlertCircle,
  Loader2,
  ImageIcon,
  ExternalLink,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Github,
  Youtube,
  Smartphone,
  Camera,
  Link
} from 'lucide-react';

interface WebsiteCrawlerProps {
  onDataGenerated: (data: {
    websiteUrl?: string;
    description?: string;
    name?: string;
    summary?: string;
    seoTitle?: string;
    seoDescription?: string;
    pros?: string[];
    cons?: string[];
    twitterUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    youtubeUrl?: string;
    appStoreUrl?: string;
    playStoreUrl?: string;
    affiliateUrl?: string;
    hasAffiliateProgram?: boolean;
    logoUrl?: string;
    httpCode?: number;
    httpChain?: string;
  }) => void;
  initialUrl?: string;
  apiKey: string;
}

interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

export default function WebsiteCrawler({
  onDataGenerated,
  initialUrl = '',
  apiKey
}: WebsiteCrawlerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [url, setUrl] = useState(initialUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState<{
    pagesDiscovered: number;
    pagesProcessed: number;
    contentLength: number;
    screenshotTaken: boolean;
    socialLinksFound: number;
  }>({
    pagesDiscovered: 0,
    pagesProcessed: 0,
    contentLength: 0,
    screenshotTaken: false,
    socialLinksFound: 0
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
    setLogs([{ message: 'Démarrage du crawler...', type: 'info', timestamp: new Date() }]);
    setProgress({
      pagesDiscovered: 0,
      pagesProcessed: 0,
      contentLength: 0,
      screenshotTaken: false,
      socialLinksFound: 0
    });

    try {
      // Assurer que l'URL est bien formatée
      let normalizedUrl = url;
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
        setUrl(normalizedUrl);
        addLog(`URL normalisée en ${normalizedUrl}`, 'info');
      }

      // Étape 1: Lancer le crawler avec Playwright
      setStatus('Exploration du site web avec Playwright...');
      addLog('Initialisation de Playwright pour explorer le site...', 'info');
      
      const crawlResponse = await fetch('/api/admin/crawler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: normalizedUrl,
          maxDepth: 2,
        }),
      });

      if (!crawlResponse.ok) {
        const errorData = await crawlResponse.json();
        throw new Error(errorData.error || 'Erreur lors du crawling');
      }

      const crawlData = await crawlResponse.json();
      
      addLog(`Site exploré avec succès. Trouvé ${crawlData.pagesDiscovered} pages.`, 'success');
      addLog(`Capture d'écran ${crawlData.screenshotTaken ? 'prise avec succès' : 'échouée'}`, 
        crawlData.screenshotTaken ? 'success' : 'warning');
      
      const socialCount = Object.values(crawlData.socialLinks).filter(Boolean).length;
      addLog(`Trouvé ${socialCount} liens vers des réseaux sociaux`, 'info');
      
      if (crawlData.hasAffiliateProgram) {
        addLog('Programme d\'affiliation détecté', 'success');
      }
      
      setProgress(prev => ({
        ...prev,
        pagesDiscovered: crawlData.pagesDiscovered,
        pagesProcessed: crawlData.pagesProcessed,
        contentLength: crawlData.contentLength,
        screenshotTaken: crawlData.screenshotTaken,
        socialLinksFound: socialCount
      }));

      // Étape 2: Analyse avec Gemini API
      setStatus('Analyse des données avec Gemini API...');
      addLog('Envoi des données à l\'API Gemini pour analyse intelligente...', 'info');
      
      const geminiResponse = await fetch('/api/admin/gemini-crawler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crawlData: crawlData,
          apiKey: apiKey
        }),
      });

      if (!geminiResponse.ok) {
        const errorData = await geminiResponse.json();
        throw new Error(errorData.error || 'Erreur lors de l\'analyse avec Gemini');
      }

      const geminiData = await geminiResponse.json();
      
      addLog('Analyse Gemini terminée avec succès', 'success');
      addLog(`Nom détecté : ${geminiData.name}`, 'info');
      addLog(`${geminiData.pros.length} avantages et ${geminiData.cons.length} inconvénients identifiés`, 'info');
      
      // Mise à jour des champs du formulaire
      onDataGenerated({
        websiteUrl: crawlData.finalUrl || normalizedUrl,
        description: geminiData.description,
        name: geminiData.name,
        summary: geminiData.summary,
        seoTitle: geminiData.seoTitle,
        seoDescription: geminiData.seoDescription,
        pros: geminiData.pros,
        cons: geminiData.cons,
        twitterUrl: crawlData.socialLinks.twitter,
        instagramUrl: crawlData.socialLinks.instagram,
        facebookUrl: crawlData.socialLinks.facebook,
        linkedinUrl: crawlData.socialLinks.linkedin,
        githubUrl: crawlData.socialLinks.github,
        youtubeUrl: crawlData.socialLinks.youtube,
        appStoreUrl: crawlData.socialLinks.appStore,
        playStoreUrl: crawlData.socialLinks.playStore,
        affiliateUrl: crawlData.socialLinks.affiliate,
        hasAffiliateProgram: crawlData.hasAffiliateProgram,
        logoUrl: crawlData.screenshotPath,
        httpCode: crawlData.httpCode,
        httpChain: crawlData.httpChain
      });

      setStatus('Crawling et analyse terminés avec succès!');
      addLog('Données générées avec succès et appliquées au formulaire', 'success');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors du crawling');
      addLog(`ERREUR: ${err.message || 'Erreur inconnue'}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSocialIcon = (type: string) => {
    switch (type) {
      case 'twitter': return <Twitter className="h-4 w-4 text-blue-400" />;
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'facebook': return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'linkedin': return <Linkedin className="h-4 w-4 text-blue-700" />;
      case 'github': return <Github className="h-4 w-4 text-gray-800" />;
      case 'youtube': return <Youtube className="h-4 w-4 text-red-600" />;
      case 'appStore': return <Smartphone className="h-4 w-4 text-gray-500" />;
      case 'playStore': return <Smartphone className="h-4 w-4 text-green-500" />;
      case 'affiliate': return <Link className="h-4 w-4 text-purple-500" />;
      default: return <ExternalLink className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="mt-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          <Globe className="h-5 w-5 mr-2 text-blue-500" />
          <h3 className="text-lg font-medium text-gray-800">
            Crawler de site web
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
            <Camera className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Ce crawler va explorer le site web (jusqu'à 3 niveaux de profondeur), prendre une capture d'écran, et extraire des informations pour remplir automatiquement les champs.
              </p>
              <p className="text-xs text-gray-500">
                Il détectera aussi les liens vers les réseaux sociaux et les programmes d'affiliation.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Entrez l'URL du site web"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isProcessing}
            />
            <button
              type="button"
              onClick={startCrawling}
              disabled={isProcessing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Traitement...
                </>
              ) : (
                <>
                  <Search className="-ml-1 mr-2 h-4 w-4" />
                  Démarrer
                </>
              )}
            </button>
          </div>

          {/* Affichage des logs en temps réel */}
          {logs.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-md bg-gray-50 p-2 h-48 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Logs de crawl:</h4>
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`text-xs py-1 px-2 rounded ${
                      log.type === 'info' ? 'text-blue-700 bg-blue-50' : 
                      log.type === 'success' ? 'text-green-700 bg-green-50' : 
                      log.type === 'warning' ? 'text-yellow-700 bg-yellow-50' : 
                      'text-red-700 bg-red-50'
                    }`}
                  >
                    <span className="font-medium">[{log.timestamp.toLocaleTimeString()}]</span> {log.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Affichage de la progression */}
          {status && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Progression:</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Pages découvertes</span>
                  <span className="text-xs font-medium">{progress.pagesDiscovered}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Pages analysées</span>
                  <span className="text-xs font-medium">{progress.pagesProcessed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Capture d'écran</span>
                  <span className={`text-xs font-medium ${progress.screenshotTaken ? 'text-green-600' : 'text-gray-400'}`}>
                    {progress.screenshotTaken ? 'Réussie ✓' : 'En attente...'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Liens sociaux trouvés</span>
                  <span className="text-xs font-medium">{progress.socialLinksFound}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
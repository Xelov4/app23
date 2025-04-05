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

interface ImageSocialCrawlerProps {
  onDataGenerated: (data: {
    websiteUrl?: string;
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
    imageUrl?: string;
    httpCode?: number;
    httpChain?: string;
  }) => void;
  initialUrl?: string;
}

interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

export default function ImageSocialCrawler({
  onDataGenerated,
  initialUrl = '',
}: ImageSocialCrawlerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [url, setUrl] = useState(initialUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [screenshotPath, setScreenshotPath] = useState<string | null>(null);
  const [crawlData, setCrawlData] = useState<any>(null);
  const [progress, setProgress] = useState<{
    screenshotTaken: boolean;
    socialLinksFound: number;
  }>({
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
    setLogs([{ message: 'Démarrage du crawler pour screenshot et liens sociaux...', type: 'info', timestamp: new Date() }]);
    setProgress({
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

      // Lancer le crawler pour capture d'écran et liens sociaux
      setStatus('Capture d\'écran et recherche de liens sociaux...');
      addLog('Initialisation de Puppeteer...', 'info');
      
      const crawlResponse = await fetch('/api/admin/crawler', {
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
        throw new Error(errorData.error || 'Erreur lors du crawling');
      }

      const crawlData = await crawlResponse.json();
      
      // Mettre à jour l'état de crawlData
      setCrawlData(crawlData);
      
      addLog(`Capture d'écran ${crawlData.screenshotTaken ? 'prise avec succès' : 'échouée'}`, 
        crawlData.screenshotTaken ? 'success' : 'warning');
      
      if (crawlData.screenshotTaken && crawlData.screenshotPath) {
        addLog(`Chemin de la capture d'écran: ${crawlData.screenshotPath}`, 'info');
        setScreenshotPath(crawlData.screenshotPath);
      }
      
      const socialCount = Object.values(crawlData.socialLinks).filter(Boolean).length;
      addLog(`Trouvé ${socialCount} liens vers des réseaux sociaux`, 'info');
      
      if (crawlData.hasAffiliateProgram) {
        addLog('Programme d\'affiliation détecté', 'success');
      }
      
      setProgress(prev => ({
        ...prev,
        screenshotTaken: crawlData.screenshotTaken,
        socialLinksFound: socialCount
      }));

      // Mise à jour des champs du formulaire
      onDataGenerated({
        websiteUrl: crawlData.finalUrl || normalizedUrl,
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
        imageUrl: crawlData.imageUrl || null,
        logoUrl: crawlData.screenshotPath || null,
        httpCode: crawlData.httpCode,
        httpChain: crawlData.httpChain
      });

      addLog('Capture d\'écran et extraction des liens sociaux terminés', 'success');
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

  const getSocialIcon = (type: string) => {
    switch (type) {
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'github': return <Github className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      case 'appStore':
      case 'playStore': return <Smartphone className="h-4 w-4" />;
      case 'affiliate': return <Link className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  // Ajouter une fonction d'aide pour afficher les résultats des liens sociaux
  const formatSocialLinks = (socialLinks: any) => {
    // Créer un tableau des résultats formatés
    const formattedLinks = Object.entries(socialLinks)
      .filter(([key]) => key !== 'affiliate') // Exclure le lien d'affiliation qui est traité séparément
      .map(([platform, url]) => {
        return (
          <div key={platform} className="flex items-center text-sm">
            {getSocialIcon(platform)}
            <span className="ml-2 font-medium">{platform}:</span>
            <span className="ml-2">{url ? url : 'nulle'}</span>
          </div>
        );
      });
      
    return formattedLinks;
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-primary" />
            Capture d'écran et liens sociaux
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
                Ce module va visiter la page d'accueil de votre site web, prendre une capture d'écran et rechercher les liens vers les réseaux sociaux.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex-grow">
                <label htmlFor="crawlUrl" className="sr-only">URL à explorer</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="crawlUrl"
                    id="crawlUrl"
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
                    <Search className="h-4 w-4 mr-2" />
                    Explorer
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
                    <Camera className="h-5 w-5 mr-2" />
                    <span>
                      {progress.screenshotTaken 
                        ? 'Capture d\'écran réussie' 
                        : 'Capture d\'écran non disponible'}
                    </span>
                  </div>
                  <div className="bg-blue-50 rounded-md p-3 text-blue-700 flex items-center">
                    <Link className="h-5 w-5 mr-2" />
                    <span>{progress.socialLinksFound} liens vers des réseaux sociaux trouvés</span>
                  </div>
                  
                  {/* Afficher la liste complète des liens sociaux avec "nulle" pour ceux non trouvés */}
                  <div className="bg-white border border-gray-200 rounded-md p-3">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Liens sociaux détectés</h5>
                    <div className="space-y-2">
                      {crawlData && formatSocialLinks(crawlData.socialLinks)}
                      
                      <div className="flex items-center text-sm">
                        <Link className="h-4 w-4" />
                        <span className="ml-2 font-medium">Programme d'affiliation:</span>
                        <span className="ml-2">
                          {crawlData?.hasAffiliateProgram ? 'Oui' : 'Non détecté'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {screenshotPath && (
                    <div>
                      <div className="mb-2 flex items-center">
                        <h4 className="text-sm font-medium text-gray-900">Aperçu et chemin de l'image</h4>
                      </div>
                      <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chemin du logo
                          </label>
                          <input
                            type="text"
                            value={screenshotPath}
                            readOnly
                            className="bg-white focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        {screenshotPath && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-2">Aperçu de l'image:</p>
                            <div className="border border-gray-300 rounded-md overflow-hidden">
                              <img 
                                src={screenshotPath} 
                                alt="Logo capturé" 
                                className="max-w-full h-auto"
                              />
                            </div>
                          </div>
                        )}
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
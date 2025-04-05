'use client';

import { useState } from 'react';
import {
  Globe,
  Search,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

interface UrlValidatorProps {
  onValidationComplete: (data: {
    websiteUrl?: string;
    httpStatus?: number;
    httpChain?: string;
    isValid: boolean;
    isActive?: boolean;
  }) => void;
  initialUrl?: string;
  toolId?: string;
  toolSlug?: string;
}

interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

export default function UrlValidator({
  onValidationComplete,
  initialUrl = '',
  toolId,
  toolSlug
}: UrlValidatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [url, setUrl] = useState(initialUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setLogs(prevLogs => [...prevLogs, { message, type, timestamp: new Date() }]);
  };

  const validateUrl = async () => {
    if (!url) {
      setError('Veuillez entrer une URL');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setStatus('Vérification de l\'URL...');
    setLogs([{ message: 'Démarrage de la validation d\'URL...', type: 'info', timestamp: new Date() }]);
    setValidationResult(null);

    try {
      // Assurer que l'URL est bien formatée
      let normalizedUrl = url;
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
        setUrl(normalizedUrl);
        addLog(`URL normalisée en ${normalizedUrl}`, 'info');
      }

      // Appeler l'API de validation d'URL
      setStatus('Vérification en cours...');
      addLog('Analyse de l\'URL...', 'info');
      
      const validationResponse = await fetch('/api/admin/url-validator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: normalizedUrl,
          toolId: toolId,
          slug: toolSlug
        }),
      });

      if (!validationResponse.ok) {
        const errorData = await validationResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la validation');
      }

      const result = await validationResponse.json();
      setValidationResult(result);
      
      // Ajouter les logs appropriés en fonction du résultat
      if (result.isValid) {
        addLog(`L'URL est valide (HTTP ${result.statusCode})`, 'success');
        
        if (result.isRedirected) {
          addLog(`Redirection détectée: ${result.originalUrl} → ${result.finalUrl}`, 'info');
          
          // Si l'URL finale est différente, montrer les 2 URL
          if (result.originalUrl !== result.finalUrl) {
            addLog(`URL finale: ${result.finalUrl}`, 'success');
          }
        }
      } else {
        // Gérer les différents cas d'erreur
        if (result.statusCode === -1) {
          // Erreur DNS ou connexion
          addLog(`Erreur DNS ou de connexion : Le domaine ne peut pas être résolu ou le serveur n'est pas accessible`, 'error');
          addLog(`L'outil a été désactivé (isActive = false) en raison de l'échec de résolution du domaine`, 'warning');
        } else if (result.statusCode >= 400) {
          // Erreur HTTP
          addLog(`L'URL a répondu avec le code HTTP ${result.statusCode}`, 'error');
          addLog(`L'outil a été désactivé (isActive = false) en raison de l'URL invalide`, 'warning');
        } else {
          // Autre erreur
          addLog(`Problème avec l'URL (code: ${result.statusCode})`, 'error');
          addLog(`${result.message}`, 'error');
        }
      }
      
      // Journaliser la chaîne de redirections si présente
      if (result.chainOfRedirects && result.chainOfRedirects.length > 1) {
        addLog(`Chaîne de redirections: ${result.chainOfRedirects.join(' → ')}`, 'info');
      }
      
      // Envoyer le résultat au parent
      onValidationComplete({
        websiteUrl: result.isValid && result.isRedirected ? result.finalUrl : undefined,
        httpStatus: result.statusCode,
        httpChain: result.chainOfRedirects.join(' → '),
        isValid: result.isValid,
        isActive: result.isValid
      });

      setStatus(result.isValid ? 'URL valide' : 'URL invalide');
    } catch (err) {
      console.error('Erreur:', err);
      setError((err as Error).message || 'Une erreur est survenue');
      addLog(`Erreur: ${(err as Error).message}`, 'error');
      setStatus('Erreur');
      
      // Informer le parent de l'échec
      onValidationComplete({
        isValid: false
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-primary" />
            Validation d'URL
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
                Ce module vérifie si l'URL du site est accessible et gère les redirections. Si l'URL répond avec une erreur (4xx ou 5xx) ou si le domaine n'est pas résolvable (erreur DNS), l'outil sera automatiquement désactivé (isActive = false).
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex-grow">
                <label htmlFor="validateUrl" className="sr-only">URL à valider</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="validateUrl"
                    id="validateUrl"
                    className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
              </div>
              <button
                onClick={validateUrl}
                disabled={isProcessing || !url}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Vérifier
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

            {/* Résultat de la validation */}
            {validationResult && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Résultat de la validation</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className={`rounded-md p-3 flex items-center ${
                    validationResult.isValid 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {validationResult.isValid ? (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 mr-2" />
                    )}
                    <span>
                      {validationResult.isValid 
                        ? 'URL valide et accessible' 
                        : 'URL invalide ou inaccessible'}
                    </span>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-md p-3">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Détails de la requête</h5>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Globe className="h-4 w-4" />
                        <span className="ml-2 font-medium">URL d'origine:</span>
                        <span className="ml-2">{validationResult.originalUrl}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <ArrowRight className="h-4 w-4" />
                        <span className="ml-2 font-medium">Code HTTP:</span>
                        <span className={`ml-2 ${
                          validationResult.statusCode === -1
                            ? 'text-red-600'
                            : validationResult.statusCode >= 200 && validationResult.statusCode < 300
                            ? 'text-green-600'
                            : validationResult.statusCode >= 300 && validationResult.statusCode < 400
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {validationResult.statusCode === -1 ? 'Erreur DNS/Connexion' : validationResult.statusCode}
                        </span>
                      </div>
                      
                      {validationResult.isRedirected && (
                        <div className="flex items-center text-sm">
                          <ExternalLink className="h-4 w-4" />
                          <span className="ml-2 font-medium">URL finale:</span>
                          <span className="ml-2">{validationResult.finalUrl}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {validationResult.chainOfRedirects && validationResult.chainOfRedirects.length > 1 && (
                    <div className="bg-white border border-gray-200 rounded-md p-3">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Chaîne de redirections</h5>
                      <div className="space-y-1 text-sm">
                        {validationResult.chainOfRedirects.map((url: string, index: number) => (
                          <div key={index} className="flex items-center">
                            {index > 0 && <ArrowRight className="h-3 w-3 mx-2 text-gray-400" />}
                            <span className={index === validationResult.chainOfRedirects.length - 1 ? 'text-green-600 font-medium' : ''}>
                              {url}
                            </span>
                          </div>
                        ))}
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
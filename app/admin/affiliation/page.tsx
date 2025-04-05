'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ExternalLink, Search } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  hasAffiliateProgram?: boolean;
  affiliateUrl?: string | null;
  isActive: boolean;
}

interface AffiliateResult {
  url: string;
  foundKeywords: string[];
  content: string;
  path: string;
}

export default function AffiliationPage() {
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCrawling, setIsCrawling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [affiliateResults, setAffiliateResults] = useState<AffiliateResult[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [crawlDepth, setCrawlDepth] = useState<number>(2);
  const [affiliateKeywords, setAffiliateKeywords] = useState<string>(
    'affiliation, affiliate, referral, referrer, partenaire, commission, partner'
  );
  
  const keywordList = affiliateKeywords.split(',').map(k => k.trim().toLowerCase());

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session');
        const data = await response.json();
        
        if (!data.authenticated) {
          router.push('/admin');
        } else {
          fetchTools();
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de session:', err);
        router.push('/admin');
      }
    };
    
    checkSession();
  }, [router]);

  // Récupérer les outils
  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tools');
      if (!response.ok) throw new Error('Erreur lors du chargement des outils');
      const data = await response.json();
      
      setTools(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur de récupération des outils:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les outils selon le terme de recherche
  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.websiteUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Crawler le site web pour rechercher des programmes d'affiliation
  const crawlForAffiliation = async () => {
    if (!selectedUrl) {
      setError('Veuillez sélectionner un outil ou entrer une URL');
      return;
    }
    
    setError(null);
    setIsCrawling(true);
    setAffiliateResults([]);
    
    try {
      const response = await fetch('/api/admin/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: selectedUrl,
          depth: crawlDepth
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors du crawl: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        setError(`Erreur: ${result.message || result.error}`);
        return;
      }
      
      // Analyser le contenu à la recherche de mots-clés d'affiliation
      const contentLower = result.content.toLowerCase();
      const matchedKeywords = keywordList.filter(keyword => contentLower.includes(keyword));
      
      if (matchedKeywords.length > 0) {
        // Extraire des extraits autour des mots-clés trouvés
        const snippets = matchedKeywords.map(keyword => {
          const keywordIndex = contentLower.indexOf(keyword);
          const start = Math.max(0, keywordIndex - 100);
          const end = Math.min(contentLower.length, keywordIndex + keyword.length + 100);
          return contentLower.substring(start, end).replace(keyword, `<mark>${keyword}</mark>`);
        });
        
        setAffiliateResults([
          {
            url: selectedUrl,
            foundKeywords: matchedKeywords,
            content: snippets.join(' [...] '),
            path: 'homepage'
          }
        ]);
        
        // Analyser les liens externes trouvés
        if (result.externalLinks && result.externalLinks.length > 0) {
          const affiliateLinks = result.externalLinks.filter((link: string) => {
            const linkLower = link.toLowerCase();
            return keywordList.some(keyword => linkLower.includes(keyword));
          });
          
          if (affiliateLinks.length > 0) {
            setAffiliateResults(prev => [
              ...prev,
              ...affiliateLinks.map((link: string) => ({
                url: link,
                foundKeywords: keywordList.filter(keyword => link.toLowerCase().includes(keyword)),
                content: `Lien externe contenant des mots-clés d'affiliation`,
                path: 'external link'
              }))
            ]);
          }
        }
      } else {
        setError('Aucun programme d\'affiliation détecté sur ce site.');
      }
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur lors du crawl:', err);
    } finally {
      setIsCrawling(false);
    }
  };

  // Mettre à jour le statut d'affiliation d'un outil
  const updateAffiliationStatus = async (toolId: string, hasProgram: boolean, affiliateUrl: string) => {
    try {
      const tool = tools.find(t => t.id === toolId);
      if (!tool) return;
      
      const response = await fetch(`/api/tools/${tool.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hasAffiliateProgram: hasProgram,
          affiliateUrl: affiliateUrl || null
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut d\'affiliation');
      }
      
      // Mettre à jour l'état local
      setTools(prevTools => 
        prevTools.map(t => 
          t.id === toolId 
            ? { ...t, hasAffiliateProgram: hasProgram, affiliateUrl: affiliateUrl || null } 
            : t
        )
      );
      
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des programmes d'affiliation</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4">Détecter les programmes d'affiliation</h2>
        
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label className="block mb-2">URL à explorer</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={selectedUrl}
                  onChange={(e) => setSelectedUrl(e.target.value)}
                  placeholder="https://exemple.com"
                  className="px-4 py-2 border rounded w-full"
                />
                {selectedUrl && (
                  <a 
                    href={selectedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink size={20} />
                  </a>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-32">
              <label className="block mb-2">Profondeur</label>
              <select 
                value={crawlDepth} 
                onChange={(e) => setCrawlDepth(Number(e.target.value))}
                className="px-4 py-2 border rounded w-full"
              >
                <option value={1}>1 niveau</option>
                <option value={2}>2 niveaux</option>
                <option value={3}>3 niveaux</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block mb-2">Mots-clés d'affiliation (séparés par des virgules)</label>
            <textarea
              value={affiliateKeywords}
              onChange={(e) => setAffiliateKeywords(e.target.value)}
              className="px-4 py-2 border rounded w-full"
              rows={2}
            />
          </div>
          
          <div>
            <button
              onClick={crawlForAffiliation}
              disabled={isCrawling || !selectedUrl}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isCrawling ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Détecter le programme d'affiliation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {affiliateResults.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <h2 className="text-xl font-semibold mb-4">Résultats de l'analyse</h2>
          
          {affiliateResults.map((result, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 mb-4 last:border-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                    {result.url.length > 60 ? result.url.substring(0, 60) + '...' : result.url}
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </h3>
                <span className="text-sm text-gray-500">Chemin: {result.path}</span>
              </div>
              
              <div className="mt-2 mb-3">
                <span className="text-sm font-semibold">Mots-clés trouvés: </span>
                {result.foundKeywords.map((keyword, idx) => (
                  <span key={idx} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2 mb-1">
                    {keyword}
                  </span>
                ))}
              </div>
              
              <div 
                className="bg-gray-50 p-3 text-sm rounded" 
                dangerouslySetInnerHTML={{ __html: result.content }}
              />
              
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const toolId = tools.find(t => t.websiteUrl === selectedUrl)?.id;
                    if (toolId) {
                      updateAffiliationStatus(toolId, true, result.url);
                    }
                  }}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Marquer comme programme d'affiliation
                </button>
                
                {result.path === 'external link' && (
                  <button
                    onClick={() => setSelectedUrl(result.url)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Explorer ce lien
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4">Liste des outils</h2>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher un outil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded w-full"
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Nom</th>
                  <th className="py-2 px-4 text-left">URL</th>
                  <th className="py-2 px-4 text-center">Programme d'affiliation</th>
                  <th className="py-2 px-4 text-left">URL d'affiliation</th>
                  <th className="py-2 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTools.map((tool) => (
                  <tr key={tool.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <Link href={`/admin/tools/edit/${tool.slug}`} className="text-blue-600 hover:underline">
                        {tool.name}
                      </Link>
                    </td>
                    <td className="py-2 px-4">
                      <a 
                        href={tool.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                      >
                        {tool.websiteUrl.length > 30 ? tool.websiteUrl.substring(0, 30) + '...' : tool.websiteUrl}
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        tool.hasAffiliateProgram 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tool.hasAffiliateProgram ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {tool.affiliateUrl ? (
                        <a 
                          href={tool.affiliateUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 flex items-center"
                        >
                          {tool.affiliateUrl.length > 30 ? tool.affiliateUrl.substring(0, 30) + '...' : tool.affiliateUrl}
                          <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => setSelectedUrl(tool.websiteUrl)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 mr-2"
                      >
                        Analyser
                      </button>
                      <button
                        onClick={() => updateAffiliationStatus(tool.id, !tool.hasAffiliateProgram, tool.affiliateUrl || '')}
                        className={`px-3 py-1 text-white text-sm rounded ${
                          tool.hasAffiliateProgram
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {tool.hasAffiliateProgram ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredTools.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      Aucun outil trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
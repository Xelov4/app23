'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Edit, 
  Search, 
  Plus, 
  RefreshCw,
  Info,
  Settings,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
type PricingType = 'FREE' | 'FREEMIUM' | 'PAID';

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  websiteUrl: string;
  pricingType: PricingType;
  pricingDetails: string | null;
  rating: number | null;
  reviewCount: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Charger les outils
  const fetchTools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tools');
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }
      const data = await response.json();
      setTools(data);
    } catch (err) {
      setError('Erreur lors du chargement des outils');
      console.error('Erreur lors du chargement des outils:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les outils au chargement de la page
  useEffect(() => {
    fetchTools();
  }, []);

  // Filtrer les outils selon le terme de recherche
  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.websiteUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir le label du type de tarification
  const getPricingLabel = (pricingType: PricingType) => {
    switch(pricingType) {
      case 'FREE':
        return 'Gratuit';
      case 'FREEMIUM':
        return 'Freemium';
      case 'PAID':
        return 'Payant';
      default:
        return pricingType;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-2 h-6 w-6 text-primary" />
            Tous les outils
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez les outils d'IA vidéo de la plateforme
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={fetchTools}
            className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
          
          <Link
            href="/admin/tools/new"
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel outil
          </Link>
        </div>
      </div>
      
      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un outil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>
      
      {/* Affichage du statut */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 flex items-start">
          <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-500">Aucun outil trouvé</p>
        </div>
      ) : (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white shadow rounded-md p-4 border-l-4 border-blue-500">
              <p className="text-gray-500 text-sm">Nombre d'outils</p>
              <p className="text-2xl font-bold">{tools.length}</p>
            </div>
            <div className="bg-white shadow rounded-md p-4 border-l-4 border-green-500">
              <p className="text-gray-500 text-sm">Outils actifs</p>
              <p className="text-2xl font-bold">
                {tools.filter(tool => tool.isActive).length}
              </p>
            </div>
            <div className="bg-white shadow rounded-md p-4 border-l-4 border-amber-500">
              <p className="text-gray-500 text-sm">Outils sans logo</p>
              <p className="text-2xl font-bold">
                {tools.filter(tool => !tool.logoUrl).length}
              </p>
            </div>
          </div>

          {/* Tableau des outils */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarification
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Évaluation
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mise à jour
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTools.map((tool) => (
                    <tr key={tool.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {tool.logoUrl ? (
                              <img 
                                src={tool.logoUrl} 
                                alt={tool.name} 
                                className="h-8 w-8 rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = '/placeholder-image.png';
                                }}
                              />
                            ) : (
                              <Settings className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                            <div className="text-sm text-gray-500">{tool.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={tool.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {tool.websiteUrl}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tool.pricingType === 'FREE' ? 'bg-green-100 text-green-800' : 
                          tool.pricingType === 'FREEMIUM' ? 'bg-blue-100 text-blue-800' : 
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {getPricingLabel(tool.pricingType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {tool.rating ? (
                            <>
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-sm text-gray-700">{tool.rating.toFixed(1)}</span>
                              {tool.reviewCount && (
                                <span className="text-xs text-gray-500 ml-2">({tool.reviewCount})</span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">Non évalué</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tool.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tool.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(tool.updatedAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/tools/edit/${tool.slug}`}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-md mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 
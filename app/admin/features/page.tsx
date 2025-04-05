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
  ListChecks,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
interface Feature {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  iconName: string | null;
  _count?: {
    FeaturesOnTools: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Charger les fonctionnalités
  const fetchFeatures = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/features');
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }
      const data = await response.json();
      setFeatures(data);
    } catch (err) {
      setError('Erreur lors du chargement des fonctionnalités');
      console.error('Erreur lors du chargement des fonctionnalités:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les fonctionnalités au chargement de la page
  useEffect(() => {
    fetchFeatures();
  }, []);

  // Filtrer les fonctionnalités selon le terme de recherche
  const filteredFeatures = features.filter(feature =>
    feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour afficher l'icône
  const DynamicIcon = ({ iconName }: { iconName: string | null }) => {
    if (!iconName) {
      return <ListChecks className="h-5 w-5 text-gray-500" />;
    }
    
    // Ici, vous pourriez implémenter une logique pour choisir l'icône en fonction du nom
    return <ListChecks className="h-5 w-5 text-primary" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ListChecks className="mr-2 h-6 w-6 text-primary" />
            Toutes les fonctionnalités
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez les fonctionnalités des outils d'IA vidéo
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={fetchFeatures}
            className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
          
          <Link
            href="/admin/features/new"
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle fonctionnalité
          </Link>
        </div>
      </div>
      
      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une fonctionnalité..."
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
      ) : filteredFeatures.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-500">Aucune fonctionnalité trouvée</p>
        </div>
      ) : (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white shadow rounded-md p-4 border-l-4 border-blue-500">
              <p className="text-gray-500 text-sm">Nombre de fonctionnalités</p>
              <p className="text-2xl font-bold">{features.length}</p>
            </div>
            <div className="bg-white shadow rounded-md p-4 border-l-4 border-green-500">
              <p className="text-gray-500 text-sm">Fonctionnalités utilisées</p>
              <p className="text-2xl font-bold">
                {features.filter(feature => feature._count && feature._count.FeaturesOnTools > 0).length}
              </p>
            </div>
            <div className="bg-white shadow rounded-md p-4 border-l-4 border-amber-500">
              <p className="text-gray-500 text-sm">Fonctionnalités non utilisées</p>
              <p className="text-2xl font-bold">
                {features.filter(feature => !feature._count || feature._count.FeaturesOnTools === 0).length}
              </p>
            </div>
          </div>

          {/* Tableau des fonctionnalités */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outils
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière mise à jour
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFeatures.map((feature) => (
                    <tr key={feature.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {feature.iconName ? (
                              <DynamicIcon iconName={feature.iconName} />
                            ) : (
                              <ListChecks className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{feature.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{feature.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          feature._count && feature._count.FeaturesOnTools > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {feature._count ? feature._count.FeaturesOnTools : 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(feature.updatedAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/features/edit/${feature.slug}`}
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
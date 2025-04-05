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
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
interface UserType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  _count?: {
    UserTypesOnTools: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function UserTypesPage() {
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Charger les types d'utilisateurs
  const fetchUserTypes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user-types');
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }
      const data = await response.json();
      setUserTypes(data);
    } catch (err) {
      setError('Erreur lors du chargement des types d\'utilisateurs');
      console.error('Erreur lors du chargement des types d\'utilisateurs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les types d'utilisateurs au chargement de la page
  useEffect(() => {
    fetchUserTypes();
  }, []);

  // Filtrer les types d'utilisateurs selon le terme de recherche
  const filteredUserTypes = userTypes.filter(userType =>
    userType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userType.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (userType.description && userType.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="mr-2 h-6 w-6 text-primary" />
            Types d'utilisateurs
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez les types d'utilisateurs pour les outils d'IA vidéo
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={fetchUserTypes}
            className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
          
          <Link
            href="/admin/users/new"
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau type d'utilisateur
          </Link>
        </div>
      </div>
      
      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un type d'utilisateur..."
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
      ) : filteredUserTypes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-500">Aucun type d'utilisateur trouvé</p>
        </div>
      ) : (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white shadow rounded-md p-4 border-l-4 border-blue-500">
              <p className="text-gray-500 text-sm">Nombre de types d'utilisateurs</p>
              <p className="text-2xl font-bold">{userTypes.length}</p>
            </div>
            <div className="bg-white shadow rounded-md p-4 border-l-4 border-green-500">
              <p className="text-gray-500 text-sm">Types d'utilisateurs utilisés</p>
              <p className="text-2xl font-bold">
                {userTypes.filter(userType => userType._count && userType._count.UserTypesOnTools > 0).length}
              </p>
            </div>
            <div className="bg-white shadow rounded-md p-4 border-l-4 border-amber-500">
              <p className="text-gray-500 text-sm">Types d'utilisateurs non utilisés</p>
              <p className="text-2xl font-bold">
                {userTypes.filter(userType => !userType._count || userType._count.UserTypesOnTools === 0).length}
              </p>
            </div>
          </div>

          {/* Tableau des types d'utilisateurs */}
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
                  {filteredUserTypes.map((userType) => (
                    <tr key={userType.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{userType.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{userType.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{userType.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userType._count && userType._count.UserTypesOnTools > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {userType._count ? userType._count.UserTypesOnTools : 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(userType.updatedAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/users/edit/${userType.slug}`}
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
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface SearchPage {
  id: string;
  keyword: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SearchPagesPage() {
  const router = useRouter();
  const [searchPages, setSearchPages] = useState<SearchPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session');
        const data = await response.json();
        
        if (!data.authenticated) {
          router.push('/admin');
        } else {
          fetchSearchPages();
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de session:', err);
        router.push('/admin');
      }
    };
    
    checkSession();
  }, [router]);

  // Récupérer les pages de recherche
  const fetchSearchPages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/search/pages');
      
      if (!response.ok) {
        throw new Error(`Erreur lors du chargement des pages de recherche: ${response.status}`);
      }
      
      const data = await response.json();
      setSearchPages(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur de récupération des pages de recherche:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les pages selon le terme de recherche
  const filteredSearchPages = searchPages.filter(page => 
    page.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (page.description && page.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Supprimer une page de recherche
  const deleteSearchPage = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page de recherche? Cette action est irréversible.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/search/pages/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      setSearchPages(prev => prev.filter(page => page.id !== id));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur lors de la suppression:', err);
    }
  };

  // Changer le statut actif/inactif
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/search/pages/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }
      
      // Mettre à jour l'état local
      setSearchPages(prev => 
        prev.map(page => 
          page.id === id ? { ...page, isActive: !currentStatus } : page
        )
      );
      
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur lors de la mise à jour du statut:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pages de recherche</h1>
        <Link 
          href="/admin/search/pages/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
        >
          <Plus className="mr-1 h-5 w-5" />
          Nouvelle page
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher une page..."
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
                  <th className="py-2 px-4 text-left">Mot-clé</th>
                  <th className="py-2 px-4 text-left">Slug</th>
                  <th className="py-2 px-4 text-left">Description</th>
                  <th className="py-2 px-4 text-center">Statut</th>
                  <th className="py-2 px-4 text-left">Date de création</th>
                  <th className="py-2 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSearchPages.map((page) => (
                  <tr key={page.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-4 font-medium">{page.keyword}</td>
                    <td className="py-2 px-4">{page.slug}</td>
                    <td className="py-2 px-4">
                      {page.description ? 
                        (page.description.length > 50 ? page.description.substring(0, 50) + '...' : page.description) 
                        : <span className="text-gray-400">-</span>
                      }
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        page.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {page.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-600">
                      {new Date(page.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => toggleStatus(page.id, page.isActive)}
                          className={`p-1.5 rounded hover:bg-gray-200`}
                          title={page.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {page.isActive ? 
                            <ToggleRight className="h-5 w-5 text-green-600" /> : 
                            <ToggleLeft className="h-5 w-5 text-gray-600" />
                          }
                        </button>
                        <Link
                          href={`/admin/search/pages/edit/${page.slug}`}
                          className="p-1.5 rounded hover:bg-gray-200"
                          title="Éditer"
                        >
                          <Edit className="h-5 w-5 text-blue-600" />
                        </Link>
                        <button
                          onClick={() => deleteSearchPage(page.id)}
                          className="p-1.5 rounded hover:bg-gray-200"
                          title="Supprimer"
                        >
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredSearchPages.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
                      Aucune page de recherche trouvée
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
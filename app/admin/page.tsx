'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Types pour les données
interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  pricingType: string;
  category: string;
  categoryId: string;
  websiteUrl: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  toolCount: number;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  toolCount: number;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('outils');
  
  // Données depuis l'API
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les données
  const fetchData = async (activeTab: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (activeTab === 'outils') {
        const response = await fetch('/api/tools');
        if (!response.ok) throw new Error('Erreur lors du chargement des outils');
        const data = await response.json();
        setTools(data);
      } 
      else if (activeTab === 'categories') {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Erreur lors du chargement des catégories');
        const data = await response.json();
        setCategories(data);
      } 
      else if (activeTab === 'tags') {
        const response = await fetch('/api/tags');
        if (!response.ok) throw new Error('Erreur lors du chargement des tags');
        const data = await response.json();
        setTags(data);
      }
    } catch (err) {
      setError((err as Error).message);
      console.error('Erreur de récupération des données:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement initial des données et lorsque l'onglet change
  useEffect(() => {
    if (isLoggedIn) {
      fetchData(activeTab);
    }
  }, [isLoggedIn, activeTab]);

  // Gestion du changement d'onglet
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Dans un cas réel, cela serait géré par une API et un système d'authentification
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler une authentification (à remplacer par une vraie authentification)
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
    } else {
      alert('Identifiants incorrects');
    }
  };

  // Rendu du formulaire de connexion
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Administration Video-IA.net</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="username">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Rendu de l'interface d'administration
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Administration Video-IA.net</h1>
          </div>
          <div>
            <Link href="/" className="text-blue-600 hover:underline mr-4">
              Voir le site
            </Link>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-red-600 hover:underline"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              className={`px-4 py-3 font-medium ${
                activeTab === 'outils' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
              onClick={() => handleTabChange('outils')}
            >
              Outils
            </button>
            <button
              className={`px-4 py-3 font-medium ${
                activeTab === 'categories' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
              onClick={() => handleTabChange('categories')}
            >
              Catégories
            </button>
            <button
              className={`px-4 py-3 font-medium ${
                activeTab === 'tags' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
              onClick={() => handleTabChange('tags')}
            >
              Tags
            </button>
          </div>

          {/* Affichage du message d'erreur */}
          {error && (
            <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
              Erreur: {error}
            </div>
          )}

          {/* Affichage du chargement */}
          {isLoading && (
            <div className="p-6 text-center">
              <p className="text-gray-600">Chargement des données...</p>
            </div>
          )}

          {/* Onglet Outils */}
          {activeTab === 'outils' && !isLoading && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Gestion des outils</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  + Ajouter un outil
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tools.length > 0 ? (
                      tools.map(tool => (
                        <tr key={tool.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{tool.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{tool.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              tool.pricingType === 'FREE' ? 'bg-green-100 text-green-800' :
                              tool.pricingType === 'PAID' ? 'bg-red-100 text-red-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {tool.pricingType === 'FREE' ? 'Gratuit' : 
                               tool.pricingType === 'PAID' ? 'Payant' : 
                               tool.pricingType === 'FREEMIUM' ? 'Freemium' : 
                               'Abonnement'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Modifier</button>
                            <button className="text-red-600 hover:text-red-900">Supprimer</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          Aucun outil trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Onglet Catégories */}
          {activeTab === 'categories' && !isLoading && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Gestion des catégories</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  + Ajouter une catégorie
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nb. Outils
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.length > 0 ? (
                      categories.map(category => (
                        <tr key={category.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{category.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{category.slug}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{category.toolCount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Modifier</button>
                            <button className="text-red-600 hover:text-red-900">Supprimer</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          Aucune catégorie trouvée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Onglet Tags */}
          {activeTab === 'tags' && !isLoading && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Gestion des tags</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  + Ajouter un tag
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nb. Outils
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tags.length > 0 ? (
                      tags.map(tag => (
                        <tr key={tag.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{tag.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{tag.slug}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{tag.toolCount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Modifier</button>
                            <button className="text-red-600 hover:text-red-900">Supprimer</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          Aucun tag trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
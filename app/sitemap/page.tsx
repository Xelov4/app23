'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tool {
  id: string;
  name: string;
  slug: string;
  category: string;
}

export default function SitemapPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Récupérer les catégories
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Erreur lors du chargement des catégories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        
        // Récupérer les outils
        const toolsResponse = await fetch('/api/tools');
        if (!toolsResponse.ok) {
          throw new Error('Erreur lors du chargement des outils');
        }
        const toolsData = await toolsResponse.json();
        setTools(toolsData);
      } catch (err) {
        setError((err as Error).message);
        console.error('Erreur de récupération des données:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Organiser les outils par catégorie
  const toolsByCategory: Record<string, Tool[]> = {};
  
  tools.forEach(tool => {
    if (!toolsByCategory[tool.category]) {
      toolsByCategory[tool.category] = [];
    }
    
    toolsByCategory[tool.category].push(tool);
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Plan du site</h1>
        <div className="text-center">Chargement en cours...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Plan du site</h1>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8">
          Erreur: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Plan du site</h1>
      
      <div className="max-w-4xl mx-auto">
        {/* Pages principales */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-gray-200">Pages principales</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Accueil
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Catégories */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-gray-200">Catégories</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(category => (
              <li key={category.id}>
                <Link 
                  href={`/categories/${category.slug}`} 
                  className="text-blue-600 hover:underline"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Outils par catégorie */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-gray-200">Outils par catégorie</h2>
          
          {categories.map(category => (
            <div key={category.id} className="mb-8">
              <h3 className="text-xl font-medium mb-3">
                {category.name}
              </h3>
              
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                {toolsByCategory[category.name]?.map(tool => (
                  <li key={tool.id}>
                    <Link 
                      href={`/tools/${tool.slug}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {tool.name}
                    </Link>
                  </li>
                ))}
                
                {(!toolsByCategory[category.name] || toolsByCategory[category.name].length === 0) && (
                  <li className="text-gray-500 italic">Aucun outil dans cette catégorie</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  websiteUrl: string;
  logoUrl: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorCode?: string;
  dbUpdated?: boolean;
  slug: string;
}

const ITEMS_PER_PAGE = 10;

export default function BulkActionsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageCount, setImageCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Charger les outils depuis l'API
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/tools');
        const data = await response.json();
        setTools(data.map((tool: any) => ({ ...tool, status: 'idle', dbUpdated: false })));
      } catch (error) {
        console.error('Erreur lors du chargement des outils:', error);
      }
    };

    // Compter les images
    const countImages = async () => {
      try {
        const response = await fetch('/api/count-images');
        const data = await response.json();
        setImageCount(data.count);
      } catch (error) {
        console.error('Erreur lors du comptage des images:', error);
      }
    };

    fetchTools();
    countImages();
  }, []);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        let completed = true;
        tools.forEach(async (tool, index) => {
          if (tool.status === 'idle') {
            completed = false;
            setTools(prevTools => {
              const newTools = [...prevTools];
              newTools[index].status = 'loading';
              return newTools;
            });

            try {
              const response = await fetch('/api/screenshot', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  url: tool.websiteUrl,
                  slug: tool.slug 
                }),
              });

              const responseData = await response.json();

              if (!response.ok || !responseData.success || !responseData.imageUrl) {
                throw new Error(responseData.error || 'Erreur lors de la capture d\'écran');
              }

              const imageUrl = responseData.imageUrl;
              setTools(prevTools => {
                const newTools = [...prevTools];
                newTools[index].status = 'success';
                newTools[index].logoUrl = imageUrl;
                return newTools;
              });
            } catch (error) {
              setTools(prevTools => {
                const newTools = [...prevTools];
                newTools[index].status = 'error';
                newTools[index].errorCode = error.message;
                return newTools;
              });
            }
          }
        });

        if (completed) {
          setIsRunning(false);
          setIsCompleted(true);
          clearInterval(interval);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isRunning, tools]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleUpdateDatabase = async () => {
    try {
      for (const tool of tools) {
        if (tool.status === 'success' && !tool.dbUpdated) {
          try {
            const updateResponse = await fetch(`/api/tools/${tool.slug}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: tool.name,
                logoUrl: tool.logoUrl,
                websiteUrl: tool.websiteUrl
              }),
            });

            if (!updateResponse.ok) {
              const errorData = await updateResponse.json();
              console.error(`Erreur lors de la mise à jour de ${tool.name}:`, errorData);
              continue;
            }

            setTools(prevTools => {
              const newTools = [...prevTools];
              const index = newTools.findIndex(t => t.id === tool.id);
              if (index !== -1) {
                newTools[index].dbUpdated = true;
              }
              return newTools;
            });
          } catch (toolError) {
            console.error(`Erreur lors de la mise à jour de ${tool.name}:`, toolError);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la base de données:', error);
    }
  };

  const handlePurgeImages = async () => {
    try {
      await fetch('/api/purge-images', { method: 'POST' });
      setImageCount(0);
    } catch (error) {
      console.error('Erreur lors de la purge des images:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedTools = tools.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(tools.length / ITEMS_PER_PAGE);

  const totalTools = tools.length;
  const successfulScreenshots = tools.filter(tool => tool.status === 'success').length;
  const failedScreenshots = tools.filter(tool => tool.status === 'error').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Actions en masse</h1>
          <Link href="/admin" className="text-blue-600 hover:underline">
            Retour à l'administration
          </Link>
        </div>

        <div className="mb-4">
          <p>Total d'outils: {totalTools}</p>
          <p>Captures réussies: {successfulScreenshots}</p>
          <p>Captures échouées: {failedScreenshots}</p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleStart}
            disabled={isRunning || isCompleted}
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${
              isRunning || isCompleted ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isRunning ? 'En cours...' : isCompleted ? 'Terminé' : 'Lancer la capture d\'écran pour tous les outils'}
          </button>

          <button
            onClick={handlePurgeImages}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Purger les images
          </button>

          <span className="text-gray-700">Images: {imageCount}</span>
        </div>

        {isCompleted && (
          <button
            onClick={handleUpdateDatabase}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mb-4"
          >
            Mettre à jour la base de données pour les outils
          </button>
        )}

        <div className="mt-4">
          {paginatedTools.map(tool => (
            <div key={tool.id} className="flex justify-between items-center mb-2 p-2 border rounded-lg">
              <div>
                <p className="font-bold">
                  <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {tool.name}
                  </a>
                </p>
                <p className="text-sm text-gray-600">{tool.websiteUrl}</p>
                {tool.logoUrl && (
                  <div className="flex items-center">
                    <img src={tool.logoUrl} alt="logo" className="w-8 h-8 mr-2" />
                    <span className="text-xs text-gray-500">{tool.logoUrl}</span>
                  </div>
                )}
              </div>
              <div>
                {tool.status === 'loading' && <span className="text-yellow-500">Chargement...</span>}
                {tool.status === 'success' && <span className="text-green-500">✔️</span>}
                {tool.status === 'error' && <span className="text-red-500">❌ {tool.errorCode}</span>}
                {tool.dbUpdated && <span className="text-blue-500 ml-2">db updated</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 
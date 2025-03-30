"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface Tool {
  id: string;
  name: string;
  websiteUrl: string;
  logoUrl: string;
  slug: string;
  httpCode?: number | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
  dbUpdated?: boolean;
}

// Configuration
const BATCH_SIZE = 3; // Nombre d'outils traités simultanément
const PROCESSING_DELAY = 500; // Délai entre chaque lot (en ms)

export default function UpdateScreenshotsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  // Vérifier l'authentification
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session');
        const data = await response.json();
        
        if (!data.authenticated) {
          router.push('/admin');
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de session:', err);
        router.push('/admin');
      }
    };
    
    checkSession();
  }, [router]);

  // Charger tous les outils
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/tools');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des outils');
        }
        
        const data = await response.json();
        const formattedTools = data.map((tool: any) => ({
          ...tool,
          status: 'idle',
          dbUpdated: false
        }));
        
        setTools(formattedTools);
        
        // Filtrer pour garder seulement les outils avec httpCode = 200
        const toolsWith200Status = formattedTools.filter((tool: Tool) => tool.httpCode === 200);
        setFilteredTools(toolsWith200Status);
      } catch (error) {
        console.error('Erreur lors du chargement des outils:', error);
      }
    };

    fetchTools();
  }, []);

  // Traiter un outil individuel
  const processOneTool = async (index: number): Promise<boolean> => {
    const tool = filteredTools[index];
    if (!tool || tool.status !== 'idle') return false;

    setFilteredTools(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status: 'loading' };
      return updated;
    });

    try {
      // Appel à l'API de capture d'écran
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

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la capture d\'écran');
      }

      // Mise à jour de l'outil avec la nouvelle image
      setFilteredTools(prev => {
        const updated = [...prev];
        updated[index] = { 
          ...updated[index], 
          status: 'success', 
          logoUrl: data.imageUrl,
          httpCode: data.httpCode,
        };
        return updated;
      });

      // Mise à jour en base de données
      const updateResponse = await fetch(`/api/tools/${tool.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logoUrl: data.imageUrl,
          httpCode: data.httpCode,
        }),
      });

      if (updateResponse.ok) {
        setFilteredTools(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], dbUpdated: true };
          return updated;
        });
      }

      return true;
    } catch (error) {
      console.error(`Erreur pour ${tool.name}:`, error);
      setFilteredTools(prev => {
        const updated = [...prev];
        updated[index] = { 
          ...updated[index], 
          status: 'error', 
          errorMessage: error instanceof Error ? error.message : 'Erreur inconnue' 
        };
        return updated;
      });
      return false;
    }
  };

  // Traiter un lot d'outils
  const processBatch = async () => {
    if (!isRunning) return;

    // Trouver les outils en attente
    const pendingIndices = filteredTools
      .map((tool, index) => tool.status === 'idle' ? index : -1)
      .filter(index => index !== -1);

    if (pendingIndices.length === 0) {
      // Tous les outils ont été traités
      setIsRunning(false);
      setIsCompleted(true);
      setCurrentBatch([]);
      setProgress(100);
      return;
    }

    // Sélectionner le prochain lot
    const batch = pendingIndices.slice(0, BATCH_SIZE);
    setCurrentBatch(batch);

    // Traiter le lot en parallèle
    await Promise.all(batch.map(index => processOneTool(index)));

    // Calculer la progression
    const processedCount = filteredTools.filter(tool => 
      tool.status === 'success' || tool.status === 'error'
    ).length;
    const progressValue = Math.round((processedCount / filteredTools.length) * 100);
    setProgress(progressValue);

    // Attendre un peu avant de passer au lot suivant
    setTimeout(() => {
      processBatch();
    }, PROCESSING_DELAY);
  };

  // Démarrer le traitement
  const startProcessing = () => {
    setIsRunning(true);
    setIsCompleted(false);
    setProgress(0);
    processBatch();
  };

  // Statistiques
  const stats = {
    total: filteredTools.length,
    success: filteredTools.filter(tool => tool.status === 'success').length,
    error: filteredTools.filter(tool => tool.status === 'error').length,
    pending: filteredTools.filter(tool => tool.status === 'idle').length,
    inProgress: filteredTools.filter(tool => tool.status === 'loading').length,
  };

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/admin');
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur">
          <div className="container flex h-14 items-center">
            <div className="mr-4 flex">
              <Link className="mr-2 flex items-center space-x-2" href="/admin/dashboard">
                <span className="font-bold">Vidéo IA Admin</span>
              </Link>
            </div>
            <div className="flex flex-1 items-center space-x-2 justify-end">
              <Button onClick={handleLogout} variant="outline" size="sm">
                Déconnexion
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Mise à jour des captures d'écran</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link href="/admin/dashboard">Retour</Link>
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border bg-card p-3">
                    <div className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <span className="text-sm font-medium">Total</span>
                      <span>{stats.total} outils</span>
                    </div>
                    <div className="text-2xl font-bold">Status HTTP 200</div>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <div className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <span className="text-sm font-medium">Succès</span>
                      <Badge variant="success">{stats.success}</Badge>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${(stats.success / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <div className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <span className="text-sm font-medium">Erreurs</span>
                      <Badge variant="destructive">{stats.error}</Badge>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500" 
                        style={{ width: `${(stats.error / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <div className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <span className="text-sm font-medium">En attente</span>
                      <Badge variant="outline">{stats.pending}</Badge>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p>Cette page permet de mettre à jour automatiquement les captures d'écran de tous les outils ayant un statut HTTP 200. Le processus traitera {BATCH_SIZE} outils à la fois.</p>
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      onClick={startProcessing}
                      disabled={isRunning || filteredTools.length === 0 || isCompleted}
                      className="w-40"
                    >
                      {isRunning ? 'En cours...' : (isCompleted ? 'Terminé' : 'Démarrer')}
                    </Button>
                  </div>
                </div>
                
                {isRunning && (
                  <div className="mt-4 space-y-2">
                    <p>Progression: {progress}%</p>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300 ease-in-out" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Liste des outils ({stats.total})</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTools.map((tool, index) => (
                      <div 
                        key={tool.id} 
                        className={`border rounded-lg p-4 ${
                          currentBatch.includes(index) ? 'bg-blue-50' : 
                          tool.status === 'success' ? 'bg-green-50' : 
                          tool.status === 'error' ? 'bg-red-50' : 
                          'bg-card'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-12 h-12 relative rounded-md overflow-hidden border">
                            {tool.logoUrl ? (
                              <Image
                                src={tool.logoUrl}
                                alt={tool.name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <span className="text-lg font-bold">{tool.name.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{tool.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{tool.websiteUrl}</p>
                          </div>
                          <div>
                            {tool.status === 'idle' && <Badge variant="outline">En attente</Badge>}
                            {tool.status === 'loading' && <Badge variant="secondary">En cours</Badge>}
                            {tool.status === 'success' && <Badge variant="success">Réussi</Badge>}
                            {tool.status === 'error' && <Badge variant="destructive">Erreur</Badge>}
                          </div>
                        </div>
                        
                        {tool.status === 'error' && (
                          <p className="mt-2 text-xs text-red-600">{tool.errorMessage}</p>
                        )}
                        
                        {tool.status === 'success' && tool.dbUpdated && (
                          <p className="mt-2 text-xs text-green-600">Base de données mise à jour</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
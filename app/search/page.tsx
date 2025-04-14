'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

// Composant intérieur qui utilise useSearchParams
function SearchRedirector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Récupérer le paramètre q de l'URL
    const query = searchParams.get('q');
    
    // Construire les nouveaux paramètres pour la redirection
    const params = new URLSearchParams();
    if (query) {
      params.set('search', query);
    }
    
    // Rediriger vers /tools avec les paramètres
    router.push(`/tools?${params.toString()}`);
  }, [router, searchParams]);
  
  return (
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
      <h1 className="text-xl font-semibold">Redirection vers les résultats de recherche...</h1>
    </div>
  );
}

// Page principale avec Suspense boundary
export default function SearchPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Suspense fallback={
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-xl font-semibold">Chargement...</h1>
        </div>
      }>
        <SearchRedirector />
      </Suspense>
    </div>
  );
} 
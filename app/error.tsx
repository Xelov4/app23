'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Vous pouvez logger l'erreur sur un service d'analytics en production
    console.error('Erreur de page:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-3xl font-bold mb-4">Quelque chose s'est mal passé</h2>
      <p className="text-gray-600 mb-6">
        Désolé, une erreur s'est produite lors du chargement de cette page.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
} 
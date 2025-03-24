import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-3xl font-bold mb-4">Page non trouvée</h2>
      <p className="text-gray-600 mb-8">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link 
        href="/" 
        className="bg-blue-600 text-white px-6 py-2 rounded-md inline-block hover:bg-blue-700 transition-colors"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
} 
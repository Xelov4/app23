import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Video-IA.net</h3>
            <p className="text-gray-600">
              Le répertoire définitif des outils d'IA pour la vidéo et l'image.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Catégories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories/generation-images" className="text-gray-600 hover:text-blue-600">
                  Génération d'images
                </Link>
              </li>
              <li>
                <Link href="/categories/edition-video" className="text-gray-600 hover:text-blue-600">
                  Édition vidéo
                </Link>
              </li>
              <li>
                <Link href="/categories/montage-automatique" className="text-gray-600 hover:text-blue-600">
                  Montage automatique
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-600 hover:text-blue-600">
                  Administration
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Video-IA.net - Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
}
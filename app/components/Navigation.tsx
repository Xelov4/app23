import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl text-blue-600">
              Video-IA.net
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link 
                href="/categories/generation-images" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              >
                Génération d'images
              </Link>
              <Link 
                href="/categories/edition-video" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              >
                Édition vidéo
              </Link>
              <Link 
                href="/categories/montage-automatique" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              >
                Montage automatique
              </Link>
              <Link 
                href="/admin" 
                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md"
              >
                Admin
              </Link>
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              type="button"
              className="bg-gray-100 p-2 rounded-md"
              aria-label="Menu principal"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 
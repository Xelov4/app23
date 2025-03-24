import Image from "next/image";
import Link from "next/link";

export default function Home() {
  // Données factices pour la démonstration
  const featuredCategories = [
    { id: "1", name: "Génération d'images", slug: "generation-images" },
    { id: "2", name: "Édition vidéo", slug: "edition-video" },
    { id: "3", name: "Montage automatique", slug: "montage-automatique" },
  ];

  const featuredTools = [
    {
      id: "1",
      name: "Midjourney",
      description: "Générateur d'images IA avancé avec des résultats artistiques exceptionnels",
      imageUrl: "/placeholder.jpg",
      category: "Génération d'images",
      pricing: "PAID"
    },
    {
      id: "2",
      name: "Runway",
      description: "Plateforme complète d'édition vidéo et création visuelle propulsée par l'IA",
      imageUrl: "/placeholder.jpg",
      category: "Édition vidéo",
      pricing: "FREEMIUM"
    },
    {
      id: "3",
      name: "DALL-E 3",
      description: "Générateur d'images IA par OpenAI avec une compréhension avancée du texte",
      imageUrl: "/placeholder.jpg",
      category: "Génération d'images",
      pricing: "PAID"
    },
    {
      id: "4",
      name: "Descript",
      description: "Éditeur vidéo basé sur le texte avec des fonctionnalités IA puissantes",
      imageUrl: "/placeholder.jpg",
      category: "Montage automatique",
      pricing: "FREEMIUM"
    },
    {
      id: "5",
      name: "Stable Diffusion",
      description: "Générateur d'images open-source hautement personnalisable",
      imageUrl: "/placeholder.jpg",
      category: "Génération d'images",
      pricing: "FREE"
    },
    {
      id: "6",
      name: "Pika Labs",
      description: "Plateforme de création vidéo IA à partir d'images ou de texte",
      imageUrl: "/placeholder.jpg",
      category: "Édition vidéo",
      pricing: "FREEMIUM"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-center mb-6">Video-IA.net</h1>
        <p className="text-xl text-center text-gray-600 max-w-2xl mx-auto">
          Le répertoire définitif des outils d'IA pour la vidéo et l'image
        </p>
        
        <div className="mt-8 max-w-xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un outil IA..."
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-md">
              Rechercher
            </button>
          </div>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Catégories populaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="p-6 border rounded-lg hover:shadow-md transition-shadow bg-gray-50"
            >
              <h3 className="text-xl font-semibold">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Outils IA en vedette</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTools.map((tool) => (
            <div key={tool.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {tool.pricing === "FREE" ? "Gratuit" : 
                   tool.pricing === "PAID" ? "Payant" : 
                   tool.pricing === "FREEMIUM" ? "Freemium" : 
                   "Abonnement"}
                </div>
              </div>
              <div className="p-4">
                <span className="text-sm text-gray-500">{tool.category}</span>
                <h3 className="text-xl font-semibold mb-2">{tool.name}</h3>
                <p className="text-gray-600 line-clamp-2">{tool.description}</p>
                <Link 
                  href={`/tools/${tool.id}`}
                  className="mt-4 inline-block text-blue-600 hover:underline"
                >
                  Voir plus →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

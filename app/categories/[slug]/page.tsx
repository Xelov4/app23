import Link from "next/link";

// Cette fonction serait remplacée par une requête à la base de données
const getCategoryBySlug = (slug: string) => {
  const categories = [
    {
      id: "1",
      name: "Génération d'images",
      slug: "generation-images",
      description: "Les outils de génération d'images par IA permettent de créer des visuels uniques à partir de descriptions textuelles. Ces technologies utilisent principalement des modèles de diffusion et des réseaux antagonistes génératifs (GAN) pour produire des images de haute qualité dans une variété de styles et de contextes. Ces outils sont particulièrement utiles pour les artistes, designers, marketeurs et créateurs de contenu cherchant à produire rapidement des visuels personnalisés."
    },
    {
      id: "2",
      name: "Édition vidéo",
      slug: "edition-video",
      description: "Les outils d'édition vidéo alimentés par l'IA simplifient et automatisent le processus de montage vidéo traditionnel. Ces solutions permettent de manipuler, modifier et améliorer des contenus vidéo avec une assistance intelligente, réduisant considérablement le temps et les compétences techniques nécessaires à la production de vidéos professionnelles."
    },
    {
      id: "3",
      name: "Montage automatique",
      slug: "montage-automatique",
      description: "Les outils de montage automatique utilisent l'intelligence artificielle pour assembler des séquences vidéo brutes en productions finalisées, sans intervention humaine significative. Ces technologies analysent le contenu, identifient les meilleurs segments, synchronisent avec l'audio et appliquent des transitions cohérentes pour créer rapidement des vidéos engageantes."
    }
  ];
  
  return categories.find(category => category.slug === slug);
};

// Cette fonction serait remplacée par une requête à la base de données
const getToolsByCategory = (categoryId: string) => {
  const tools = [
    {
      id: "1",
      name: "Midjourney",
      description: "Générateur d'images IA avancé avec des résultats artistiques exceptionnels",
      imageUrl: "/placeholder.jpg",
      categoryId: "1",
      pricing: "PAID"
    },
    {
      id: "3",
      name: "DALL-E 3",
      description: "Générateur d'images IA par OpenAI avec une compréhension avancée du texte",
      imageUrl: "/placeholder.jpg",
      categoryId: "1",
      pricing: "PAID"
    },
    {
      id: "5",
      name: "Stable Diffusion",
      description: "Générateur d'images open-source hautement personnalisable",
      imageUrl: "/placeholder.jpg",
      categoryId: "1",
      pricing: "FREE"
    },
    {
      id: "2",
      name: "Runway",
      description: "Plateforme complète d'édition vidéo et création visuelle propulsée par l'IA",
      imageUrl: "/placeholder.jpg",
      categoryId: "2",
      pricing: "FREEMIUM"
    },
    {
      id: "6",
      name: "Pika Labs",
      description: "Plateforme de création vidéo IA à partir d'images ou de texte",
      imageUrl: "/placeholder.jpg",
      categoryId: "2", 
      pricing: "FREEMIUM"
    },
    {
      id: "4", 
      name: "Descript",
      description: "Éditeur vidéo basé sur le texte avec des fonctionnalités IA puissantes",
      imageUrl: "/placeholder.jpg",
      categoryId: "3",
      pricing: "FREEMIUM"
    }
  ];
  
  return tools.filter(tool => tool.categoryId === categoryId);
};

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = getCategoryBySlug(params.slug);
  
  if (!category) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Catégorie non trouvée</h1>
        <p className="mb-6">La catégorie que vous recherchez n'existe pas ou a été supprimée.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const tools = getToolsByCategory(category.id);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Retour à l'accueil
        </Link>
      </div>
      
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
        <p className="text-lg text-gray-600 max-w-3xl">{category.description}</p>
      </header>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Outils dans cette catégorie</h2>
          <div className="flex gap-2">
            <select className="border rounded-md px-3 py-1">
              <option>Trier par</option>
              <option>Popularité</option>
              <option>Alphabétique</option>
              <option>Prix (croissant)</option>
              <option>Prix (décroissant)</option>
            </select>
            <select className="border rounded-md px-3 py-1">
              <option>Tous les prix</option>
              <option>Gratuit</option>
              <option>Freemium</option>
              <option>Payant</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.length > 0 ? (
            tools.map((tool) => (
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
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">Aucun outil trouvé dans cette catégorie.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
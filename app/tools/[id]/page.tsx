import Link from "next/link";

// Cette fonction serait remplacée par une requête à la base de données
const getToolById = (id: string) => {
  const tools = [
    {
      id: "1",
      name: "Midjourney",
      description: "Midjourney est un laboratoire de recherche indépendant qui a créé un programme d'IA générative capable de produire des images à partir de descriptions textuelles. Ce programme, accessible via Discord, utilise des réseaux antagonistes génératifs pour créer des images artistiques haute résolution à partir de prompts textuels. Il est particulièrement reconnu pour ses rendus esthétiques et sa capacité à produire des images de style photographie, peinture ou illustration très détaillées.",
      imageUrl: "/placeholder.jpg",
      url: "https://www.midjourney.com",
      category: "Génération d'images",
      pricing: "PAID",
      price: 10,
      features: [
        "Génération d'images haute résolution",
        "Interface Discord intuitive",
        "Styles artistiques variés",
        "Modifications et variations d'images",
        "Résolution jusqu'à 1792x1024 pixels"
      ]
    },
    {
      id: "2",
      name: "Runway",
      description: "Runway est une plateforme de création visuelle alimentée par l'IA qui offre des outils avancés pour l'édition vidéo, la génération d'images et la création de contenu visuel. La plateforme propose des fonctionnalités comme la génération de vidéos à partir de texte, l'extension d'images, la retouche vidéo intelligente et bien plus encore.",
      imageUrl: "/placeholder.jpg",
      url: "https://runwayml.com",
      category: "Édition vidéo",
      pricing: "FREEMIUM",
      price: 12,
      features: [
        "Génération de vidéos à partir de texte",
        "Retouche vidéo par IA",
        "Suppression d'objets dans les vidéos",
        "Extension d'images",
        "Outils de collaboration en ligne"
      ]
    }
  ];
  
  return tools.find(tool => tool.id === id);
};

export default function ToolPage({ params }: { params: { id: string } }) {
  const tool = getToolById(params.id);
  
  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Outil non trouvé</h1>
        <p className="mb-6">L'outil que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Retour à l'accueil
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gray-200 h-64 md:h-auto"></div>
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${tool.pricing === "FREE" ? "bg-green-100 text-green-800" : 
                  tool.pricing === "PAID" ? "bg-red-100 text-red-800" :
                  "bg-blue-100 text-blue-800"}`}>
                {tool.pricing === "FREE" ? "Gratuit" : 
                 tool.pricing === "PAID" ? `Payant (${tool.price}€/mois)` : 
                 tool.pricing === "FREEMIUM" ? "Freemium" : 
                 "Abonnement"}
              </span>
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              Catégorie: <Link href={`/categories/${tool.category.toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-600 hover:underline">
                {tool.category}
              </Link>
            </div>
            
            <p className="text-gray-700 mb-6">{tool.description}</p>
            
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-6 py-2 rounded-md inline-block hover:bg-blue-700 transition-colors"
            >
              Visiter le site
            </a>
          </div>
        </div>
        
        <div className="p-6 border-t">
          <h2 className="text-xl font-bold mb-4">Fonctionnalités</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {tool.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Outils similaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-40 bg-gray-200"></div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">DALL-E 3</h3>
              <p className="text-gray-600 text-sm line-clamp-2">Générateur d'images IA par OpenAI avec une compréhension avancée du texte</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export const revalidate = 3600; // Revalider les données au maximum toutes les heures

async function getCategoryBySlug(slug: string) {
  try {
    const category = await db.category.findUnique({
      where: { slug }
    });
    
    return category;
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error);
    return null;
  }
}

async function getToolsByCategory(categoryId: string) {
  try {
    const tools = await db.tool.findMany({
      where: {
        CategoriesOnTools: {
          some: {
            categoryId
          }
        }
      },
      include: {
        CategoriesOnTools: {
          include: {
            Category: true
          }
        }
      }
    });
    
    return tools.map(tool => ({
      id: tool.id,
      slug: tool.slug,
      name: tool.name,
      description: tool.description,
      imageUrl: tool.logoUrl,
      pricing: tool.pricingType,
      category: tool.CategoriesOnTools[0]?.Category.name
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des outils par catégorie:", error);
    return [];
  }
}

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const category = await getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const tools = await getToolsByCategory(category.id);

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
                  {tool.imageUrl && (
                    <img 
                      src={tool.imageUrl} 
                      alt={tool.name}
                      className="w-full h-full object-cover"
                    />
                  )}
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
                    href={`/tools/${tool.slug}`}
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
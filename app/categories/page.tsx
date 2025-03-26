import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/ui/category-card";
import { getCategoryEmoji, getCategoryColor } from "@/lib/design-system/primitives";

export const revalidate = 3600; // Revalider les données toutes les heures
export const dynamic = 'force-dynamic';

// Récupérer toutes les catégories
async function getCategories() {
  try {
    return await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { CategoriesOnTools: true }
        }
      }
    });
  } catch (error) {
    console.error("Échec de la récupération des catégories:", error);
    return [];
  }
}

// Fonction pour regrouper les catégories par type/groupe
function groupCategories(categories: any[]) {
  // Définir les groupes principales
  const groups: Record<string, string[]> = {
    "Création de contenu": [
      "generation-videos", "image-generation", "3d", "animation"
    ],
    "Édition et montage": [
      "edition-videos", "montage", "effets-speciaux"
    ],
    "Audio et voix": [
      "audio", "voix", "musique"
    ],
    "Accessibilité": [
      "transcription", "sous-titres", "traduction"
    ],
    "Réalité virtuelle et augmentée": [
      "realite-virtuelle", "realite-augmentee", "avatars"
    ],
    "Analytics et diffusion": [
      "analytics", "diffusion", "marketing", "monetisation"
    ],
    "Autres": [] // Pour les catégories qui ne correspondent à aucun groupe
  };

  // Initialiser les groupes avec des arrays vides
  const groupedCategories: Record<string, any[]> = {};
  Object.keys(groups).forEach(group => {
    groupedCategories[group] = [];
  });

  // Placer chaque catégorie dans son groupe
  categories.forEach(category => {
    let placed = false;
    
    // Chercher dans quel groupe cette catégorie devrait aller
    for (const [groupName, slugs] of Object.entries(groups)) {
      if (slugs.includes(category.slug)) {
        groupedCategories[groupName].push(category);
        placed = true;
        break;
      }
    }
    
    // Si elle n'appartient à aucun groupe, la mettre dans "Autres"
    if (!placed) {
      groupedCategories["Autres"].push(category);
    }
  });

  // Supprimer les groupes vides
  Object.keys(groupedCategories).forEach(key => {
    if (groupedCategories[key].length === 0) {
      delete groupedCategories[key];
    }
  });

  return groupedCategories;
}

export default async function CategoriesPage() {
  // Récupérer toutes les catégories
  const categories = await getCategories();
  
  // Grouper les catégories par type
  const groupedCategories = groupCategories(categories);
  
  return (
    <>
      {/* En-tête de la page */}
      <section className="bg-gradient-to-b from-primary-50 to-background py-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 animate-fade-in">
              Catégories d'outils d'IA vidéo
            </h1>
            <p className="text-lg text-muted-foreground mb-6 animate-fade-in">
              Explorez notre sélection d'outils d'IA classés par catégorie pour trouver exactement ce dont vous avez besoin
            </p>
          </div>
        </div>
      </section>
      
      <div className="container px-4 mx-auto py-8">
        {/* Barre de navigation rapide des groupes */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            {Object.keys(groupedCategories).map((groupName) => (
              <a 
                key={groupName} 
                href={`#group-${groupName.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
              >
                {groupName}
              </a>
            ))}
          </div>
        </div>
        
        {/* Liste des catégories par groupe */}
        {Object.entries(groupedCategories).map(([groupName, groupCategories]) => (
          <div 
            key={groupName} 
            id={`group-${groupName.toLowerCase().replace(/\s+/g, '-')}`}
            className="mb-12 scroll-mt-8"
          >
            <h2 className="text-2xl font-bold mb-6 animate-fade-in">{groupName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {groupCategories.map((category) => (
                <CategoryCard 
                  key={category.id} 
                  category={category} 
                />
              ))}
            </div>
          </div>
        ))}
        
        {/* CTA - Ajout d'une catégorie */}
        <div className="mt-16 bg-muted/50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Vous ne trouvez pas ce que vous cherchez?</h3>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Si vous connaissez un outil d'IA qui n'est pas répertorié ou si vous pensez qu'une catégorie manque, n'hésitez pas à nous le faire savoir.
          </p>
          <Button asChild size="lg">
            <Link href="/contact">Suggérer une catégorie</Link>
          </Button>
        </div>
      </div>
    </>
  );
} 
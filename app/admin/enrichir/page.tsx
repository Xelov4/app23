import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Récupérer tous les outils pour les afficher dans une liste
async function getTools() {
  try {
    return await db.tool.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        CategoriesOnTools: {
          include: {
            Category: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Échec de la récupération des outils:", error);
    return [];
  }
}

export default async function EnrichirPage() {
  // Vérification de la présence du cookie de session admin
  const cookiesStore = cookies();
  const adminSessionCookie = cookiesStore.get('admin_session');
  
  if (!adminSessionCookie) {
    console.log("Redirection vers /admin: cookie admin_session manquant");
    redirect('/admin');
  }

  const tools = await getTools();

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Enrichir les outils</h1>
          <p className="text-muted-foreground mt-2">
            Sélectionnez un outil pour enrichir ses informations à l'aide de l'IA
          </p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline">Retour au tableau de bord</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Liste des outils ({tools.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nom</th>
                  <th className="text-left py-3 px-4">Catégorie</th>
                  <th className="text-left py-3 px-4">Site Web</th>
                  <th className="text-center py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr key={tool.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4">{tool.name}</td>
                    <td className="py-3 px-4">
                      {tool.CategoriesOnTools[0]?.Category.name || "Non catégorisé"}
                    </td>
                    <td className="py-3 px-4">
                      <a 
                        href={tool.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {tool.websiteUrl}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link href={`/admin/enrichir/${tool.slug}`}>
                        <Button size="sm">Enrichir</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 
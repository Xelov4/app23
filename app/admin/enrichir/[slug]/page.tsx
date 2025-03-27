import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import EnrichToolForm from "@/app/admin/enrichir/_components/EnrichToolForm";

// Récupérer un outil spécifique par son slug avec tous les détails
async function getToolBySlug(slug: string) {
  try {
    const tool = await db.tool.findUnique({
      where: { slug },
      include: {
        CategoriesOnTools: {
          include: {
            Category: true,
          },
        },
        TagsOnTools: {
          include: {
            Tag: true,
          },
        },
        UseCasesOnTools: {
          include: {
            UseCase: true,
          },
        },
        Review: true,
      },
    });

    if (!tool) {
      return null;
    }

    return tool;
  } catch (error) {
    console.error("Échec de la récupération de l'outil:", error);
    return null;
  }
}

// Récupérer toutes les catégories pour le formulaire
async function getAllCategories() {
  try {
    return await db.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error("Échec de la récupération des catégories:", error);
    return [];
  }
}

// Récupérer tous les tags pour le formulaire
async function getAllTags() {
  try {
    return await db.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error("Échec de la récupération des tags:", error);
    return [];
  }
}

// Récupérer tous les cas d'usage pour le formulaire
async function getAllUseCases() {
  try {
    return await db.useCase.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error("Échec de la récupération des cas d'usage:", error);
    return [];
  }
}

export default async function EnrichToolPage({ params }: { params: { slug: string } }) {
  // Vérification de la présence du cookie de session admin
  const cookiesStore = cookies();
  const adminSessionCookie = await cookiesStore.get('admin_session');
  
  if (!adminSessionCookie) {
    console.log("Redirection vers /admin: cookie admin_session manquant");
    redirect('/admin');
  }

  const slug = params.slug;
  const tool = await getToolBySlug(slug);
  
  if (!tool) {
    notFound();
  }

  const categories = await getAllCategories();
  const tags = await getAllTags();
  const useCases = await getAllUseCases();
  
  // Extraire les IDs des catégories, tags et cas d'usage associés à l'outil
  const selectedCategoryIds = tool.CategoriesOnTools.map(ct => ct.categoryId);
  const selectedTagIds = tool.TagsOnTools.map(tt => tt.tagId);
  const selectedUseCaseIds = tool.UseCasesOnTools.map(ut => ut.useCaseId);

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Enrichir: {tool.name}</h1>
            {tool.logoUrl && (
              <div className="relative w-12 h-12 rounded-md overflow-hidden border">
                <Image
                  src={tool.logoUrl}
                  alt={tool.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            Utiliser l'IA pour enrichir les informations de cet outil
          </p>
        </div>
        <Link href="/admin/enrichir">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <EnrichToolForm 
          tool={tool} 
          categories={categories} 
          tags={tags} 
          useCases={useCases}
          selectedCategoryIds={selectedCategoryIds}
          selectedTagIds={selectedTagIds}
          selectedUseCaseIds={selectedUseCaseIds}
        />
      </div>
    </div>
  );
} 
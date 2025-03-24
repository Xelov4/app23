import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: {
            CategoriesOnTools: true
          }
        }
      }
    });

    // Transformer les données pour l'API
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      toolCount: category._count.CategoriesOnTools,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les catégories" },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";

// GET /api/categories - Récupère toutes les catégories
export async function GET(request: NextRequest) {
  try {
    // Récupérer toutes les catégories avec le nombre d'outils associés
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: {
            CategoriesOnTools: true
          }
        }
      }
    });

    // Formater les résultats
    const formattedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      toolCount: category._count.CategoriesOnTools
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Crée une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      slug, 
      description, 
      imageUrl 
    } = body;

    // Vérification si une catégorie avec ce slug existe déjà
    const existingCategory = await db.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: 'Une catégorie avec ce slug existe déjà' },
        { status: 400 }
      );
    }

    // Création de la catégorie
    const newCategory = await db.category.create({
      data: {
        name,
        slug,
        description,
        imageUrl: imageUrl || null
      }
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    );
  }
} 
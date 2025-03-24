import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";

// GET /api/categories/[slug] - Récupère une catégorie spécifique par son slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = await params.slug;

    // Récupérer la catégorie avec le slug spécifié
    const category = await db.category.findUnique({
      where: { slug },
      include: {
        CategoriesOnTools: {
          include: {
            Tool: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { message: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Formatter la réponse
    const formattedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      tools: category.CategoriesOnTools.map((cat: any) => cat.Tool)
    };

    return NextResponse.json(formattedCategory);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la catégorie' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[slug] - Met à jour une catégorie spécifique
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = await params.slug;
    const body = await request.json();
    const { name, description, imageUrl, newSlug } = body;

    // Vérifier si la catégorie existe
    const existingCategory = await db.category.findUnique({
      where: { slug }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Si un nouveau slug est fourni et différent, vérifier qu'il n'existe pas déjà
    if (newSlug && newSlug !== slug) {
      const categoryWithNewSlug = await db.category.findUnique({
        where: { slug: newSlug }
      });

      if (categoryWithNewSlug) {
        return NextResponse.json(
          { message: 'Une catégorie avec ce slug existe déjà' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour la catégorie
    const updatedCategory = await db.category.update({
      where: { slug },
      data: {
        name: name || undefined,
        slug: newSlug || undefined,
        description: description !== undefined ? description : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined
      }
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la catégorie' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[slug] - Supprime une catégorie spécifique
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = await params.slug;
    
    // Vérifier si la catégorie existe
    const existingCategory = await db.category.findUnique({
      where: { slug },
      include: {
        CategoriesOnTools: true
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer d'abord les relations avec les outils
    await db.categoriesOnTools.deleteMany({
      where: {
        categoryId: existingCategory.id
      }
    });

    // Supprimer la catégorie
    await db.category.delete({
      where: { slug }
    });

    return NextResponse.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    );
  }
} 
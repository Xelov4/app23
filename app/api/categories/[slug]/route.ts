import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";

// GET /api/categories/[slug] - Récupère une catégorie spécifique
export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const slug = params.slug;

    // Récupérer la catégorie avec le slug spécifié, incluant le nombre d'outils associés
    const category = await db.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            CategoriesOnTools: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    // Formater la réponse pour inclure le nombre d'outils
    const categoryWithCounts = {
      ...category,
      toolCount: category._count.CategoriesOnTools
    };
    
    // Supprimer le champ _count de la réponse
    delete (categoryWithCounts as any)._count;

    return NextResponse.json(categoryWithCounts);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/categories/[slug] - Met à jour une catégorie spécifique
export async function PUT(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const slug = params.slug;
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
export async function DELETE(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const slug = params.slug;
    
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
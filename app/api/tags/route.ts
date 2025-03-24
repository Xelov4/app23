import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";

// GET /api/tags - Récupère tous les tags
export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les tags avec le nombre d'outils associés
    const tags = await db.tag.findMany({
      include: {
        _count: {
          select: {
            TagsOnTools: true
          }
        }
      }
    });

    // Formater les résultats
    const formattedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      toolCount: tag._count.TagsOnTools
    }));

    return NextResponse.json(formattedTags);
  } catch (error) {
    console.error('Erreur lors de la récupération des tags:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des tags' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Crée un nouveau tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug } = body;

    // Vérification si un tag avec ce slug existe déjà
    const existingTag = await db.tag.findUnique({
      where: { slug }
    });

    if (existingTag) {
      return NextResponse.json(
        { message: 'Un tag avec ce slug existe déjà' },
        { status: 400 }
      );
    }

    // Création du tag
    const newTag = await db.tag.create({
      data: {
        name,
        slug
      }
    });

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du tag:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du tag' },
      { status: 500 }
    );
  }
} 
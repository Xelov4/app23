import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";

// GET /api/tags/[slug] - Récupère un tag spécifique par son slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = await params.slug;

    // Récupérer le tag avec le slug spécifié
    const tag = await db.tag.findUnique({
      where: { slug },
      include: {
        TagsOnTools: {
          include: {
            Tool: true
          }
        }
      }
    });

    if (!tag) {
      return NextResponse.json(
        { message: 'Tag non trouvé' },
        { status: 404 }
      );
    }

    // Formatter la réponse
    const formattedTag = {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      tools: tag.TagsOnTools.map((tagOnTool: any) => tagOnTool.Tool)
    };

    return NextResponse.json(formattedTag);
  } catch (error) {
    console.error('Erreur lors de la récupération du tag:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du tag' },
      { status: 500 }
    );
  }
}

// PUT /api/tags/[slug] - Met à jour un tag spécifique
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = await params.slug;
    const body = await request.json();
    const { name, newSlug } = body;

    // Vérifier si le tag existe
    const existingTag = await db.tag.findUnique({
      where: { slug }
    });

    if (!existingTag) {
      return NextResponse.json(
        { message: 'Tag non trouvé' },
        { status: 404 }
      );
    }

    // Si un nouveau slug est fourni et différent, vérifier qu'il n'existe pas déjà
    if (newSlug && newSlug !== slug) {
      const tagWithNewSlug = await db.tag.findUnique({
        where: { slug: newSlug }
      });

      if (tagWithNewSlug) {
        return NextResponse.json(
          { message: 'Un tag avec ce slug existe déjà' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le tag
    const updatedTag = await db.tag.update({
      where: { slug },
      data: {
        name: name || undefined,
        slug: newSlug || undefined
      }
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du tag:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du tag' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[slug] - Supprime un tag spécifique
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = await params.slug;
    
    // Vérifier si le tag existe
    const existingTag = await db.tag.findUnique({
      where: { slug },
      include: {
        TagsOnTools: true
      }
    });

    if (!existingTag) {
      return NextResponse.json(
        { message: 'Tag non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer d'abord les relations avec les outils
    await db.tagsOnTools.deleteMany({
      where: {
        tagId: existingTag.id
      }
    });

    // Supprimer le tag
    await db.tag.delete({
      where: { slug }
    });

    return NextResponse.json({ message: 'Tag supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du tag:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du tag' },
      { status: 500 }
    );
  }
} 
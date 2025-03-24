import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";

// PUT /api/tools/[slug]/toggle-status - Bascule le statut isActive d'un outil par slug
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  try {
    const slug = params.slug;
    const body = await request.json();
    const { isActive } = body;

    if (isActive === undefined) {
      return NextResponse.json(
        { message: 'Le statut isActive est requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'outil existe
    const existingTool = await db.tool.findUnique({
      where: { slug }
    });

    if (!existingTool) {
      return NextResponse.json(
        { message: 'Outil non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour le statut de l'outil
    const updatedTool = await db.tool.update({
      where: { id: existingTool.id },
      data: { isActive }
    });

    return NextResponse.json(updatedTool);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de l\'outil:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du statut de l\'outil' },
      { status: 500 }
    );
  }
} 
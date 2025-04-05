import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { slugify } from '@/lib/utils';

// Schéma de validation pour la mise à jour des tags
const updateTagSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }).optional(),
  description: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

// GET /api/tags/[slug] - Récupère un tag spécifique par son slug
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    // Récupérer le tag avec le slug spécifié
    const tag = await db.tag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { TagsOnTools: true },
        },
        TagsOnTools: {
          include: {
            Tool: true
          }
        }
      }
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Erreur lors de la récupération du tag:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération du tag' },
      { status: 500 }
    );
  }
}

// PUT /api/tags/[slug] - Met à jour un tag spécifique
export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    
    // Vérification de l'authentification et des autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Vous n\'avez pas les autorisations pour effectuer cette action.' },
        { status: 403 }
      );
    }

    // Récupération et validation des données
    const data = await request.json();
    const validationResult = updateTagSchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // Vérifier si le tag existe
    const existingTag = await db.tag.findUnique({
      where: { slug }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag non trouvé' },
        { status: 404 }
      );
    }

    // Déterminer le nouveau slug s'il y a un changement de nom
    let newSlug = slug;
    if (data.name && data.name !== existingTag.name) {
      newSlug = slugify(data.name);
      
      // Vérifier si le nouveau slug existe déjà (mais pas pour ce tag)
      if (newSlug !== slug) {
        const tagWithSameSlug = await db.tag.findUnique({
          where: { slug: newSlug }
        });
        
        if (tagWithSameSlug) {
          return NextResponse.json(
            { error: `Un tag avec le nom "${data.name}" existe déjà` },
            { status: 409 }
          );
        }
      }
    }

    // Mettre à jour le tag
    const updatedTag = await db.tag.update({
      where: { slug },
      data: {
        name: data.name,
        slug: newSlug,
        description: data.description,
        seoTitle: data.seoTitle,
        metaDescription: data.metaDescription,
      }
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du tag:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour du tag' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[slug] - Supprime un tag spécifique
export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    
    // Vérification de l'authentification et des autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Vous n\'avez pas les autorisations pour effectuer cette action.' },
        { status: 403 }
      );
    }
    
    // Vérifier si le tag existe
    const existingTag = await db.tag.findUnique({
      where: { slug },
      include: {
        TagsOnTools: true
      }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le tag est associé à des outils
    if (existingTag.TagsOnTools.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer ce tag car il est associé à des outils' },
        { status: 400 }
      );
    }

    // Supprimer le tag
    await db.tag.delete({
      where: { slug }
    });

    return NextResponse.json({ message: 'Tag supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du tag:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression du tag' },
      { status: 500 }
    );
  }
} 
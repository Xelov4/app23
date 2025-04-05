import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import slugify from 'slugify';

// Schéma de validation pour la mise à jour de fonctionnalités
const updateFeatureSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  description: z.string().optional(),
});

// GET /api/features/[slug]
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    const feature = await db.feature.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            FeaturesOnTools: true,
          },
        },
      },
    });
    
    if (!feature) {
      return NextResponse.json(
        { message: 'Fonctionnalité non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(feature);
  } catch (error) {
    console.error('Erreur lors de la récupération de la fonctionnalité:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la fonctionnalité' },
      { status: 500 }
    );
  }
}

// PUT /api/features/[slug]
export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Vérifier si la fonctionnalité existe
    const existingFeature = await db.feature.findUnique({
      where: { slug },
    });
    
    if (!existingFeature) {
      return NextResponse.json(
        { message: 'Fonctionnalité non trouvée' },
        { status: 404 }
      );
    }
    
    // Récupérer les données de la requête
    const data = await req.json();
    
    // Valider les données
    const validation = updateFeatureSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validation.error.format() },
        { status: 400 }
      );
    }
    
    // Construire les données de mise à jour
    const updateData: any = {};
    
    if (data.name !== undefined) {
      updateData.name = data.name;
      
      // Générer un nouveau slug si le nom a changé
      const newSlug = slugify(data.name, { lower: true });
      
      // Vérifier si le nouveau slug existe déjà (sauf s'il s'agit du même)
      if (newSlug !== slug) {
        const slugExists = await db.feature.findUnique({
          where: { slug: newSlug },
        });
        
        if (slugExists) {
          return NextResponse.json(
            { message: 'Une fonctionnalité avec ce nom existe déjà' },
            { status: 409 }
          );
        }
        
        updateData.slug = newSlug;
      }
    }
    
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    
    // Mettre à jour la fonctionnalité
    const updatedFeature = await db.feature.update({
      where: { id: existingFeature.id },
      data: updateData,
      include: {
        _count: {
          select: {
            FeaturesOnTools: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedFeature);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la fonctionnalité:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la fonctionnalité' },
      { status: 500 }
    );
  }
}

// DELETE /api/features/[slug]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Vérifier si la fonctionnalité existe
    const existingFeature = await db.feature.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            FeaturesOnTools: true,
          },
        },
      },
    });
    
    if (!existingFeature) {
      return NextResponse.json(
        { message: 'Fonctionnalité non trouvée' },
        { status: 404 }
      );
    }
    
    // Vérifier s'il y a des outils associés
    if (existingFeature._count && existingFeature._count.FeaturesOnTools > 0) {
      return NextResponse.json(
        { 
          message: 'Cette fonctionnalité est utilisée par des outils et ne peut pas être supprimée',
          count: existingFeature._count.FeaturesOnTools
        },
        { status: 409 }
      );
    }
    
    // Supprimer la fonctionnalité
    await db.feature.delete({
      where: { id: existingFeature.id },
    });
    
    return NextResponse.json(
      { message: 'Fonctionnalité supprimée avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de la fonctionnalité:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la fonctionnalité' },
      { status: 500 }
    );
  }
} 
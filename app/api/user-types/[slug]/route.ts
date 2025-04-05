import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import slugify from 'slugify';

// Schéma de validation pour la mise à jour de types d'utilisateurs
const updateUserTypeSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  description: z.string().optional(),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

// GET /api/user-types/[slug]
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    const userType = await db.userType.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            UserTypesOnTools: true,
          },
        },
      },
    });
    
    if (!userType) {
      return NextResponse.json(
        { message: 'Type d\'utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(userType);
  } catch (error) {
    console.error('Erreur lors de la récupération du type d\'utilisateur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du type d\'utilisateur' },
      { status: 500 }
    );
  }
}

// PUT /api/user-types/[slug]
export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Vérifier si le type d'utilisateur existe
    const existingUserType = await db.userType.findUnique({
      where: { slug },
    });
    
    if (!existingUserType) {
      return NextResponse.json(
        { message: 'Type d\'utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Récupérer les données de la requête
    const data = await req.json();
    
    // Valider les données
    const validation = updateUserTypeSchema.safeParse(data);
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
        const slugExists = await db.userType.findUnique({
          where: { slug: newSlug },
        });
        
        if (slugExists) {
          return NextResponse.json(
            { message: 'Un type d\'utilisateur avec ce nom existe déjà' },
            { status: 409 }
          );
        }
        
        updateData.slug = newSlug;
      }
    }
    
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    
    if (data.seoTitle !== undefined) {
      updateData.seoTitle = data.seoTitle;
    }
    
    if (data.metaDescription !== undefined) {
      updateData.metaDescription = data.metaDescription;
    }
    
    // Mettre à jour le type d'utilisateur
    const updatedUserType = await db.userType.update({
      where: { id: existingUserType.id },
      data: updateData,
      include: {
        _count: {
          select: {
            UserTypesOnTools: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedUserType);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du type d\'utilisateur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du type d\'utilisateur' },
      { status: 500 }
    );
  }
}

// DELETE /api/user-types/[slug]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Vérifier si le type d'utilisateur existe
    const existingUserType = await db.userType.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            UserTypesOnTools: true,
          },
        },
      },
    });
    
    if (!existingUserType) {
      return NextResponse.json(
        { message: 'Type d\'utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier s'il y a des outils associés
    if (existingUserType._count && existingUserType._count.UserTypesOnTools > 0) {
      return NextResponse.json(
        { 
          message: 'Ce type d\'utilisateur est utilisé par des outils et ne peut pas être supprimé',
          count: existingUserType._count.UserTypesOnTools
        },
        { status: 409 }
      );
    }
    
    // Supprimer le type d'utilisateur
    await db.userType.delete({
      where: { id: existingUserType.id },
    });
    
    return NextResponse.json(
      { message: 'Type d\'utilisateur supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression du type d\'utilisateur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du type d\'utilisateur' },
      { status: 500 }
    );
  }
} 
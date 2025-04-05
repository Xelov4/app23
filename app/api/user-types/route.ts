import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import slugify from 'slugify';

// Schéma de validation pour la création de types d'utilisateurs
const userTypeSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

// GET /api/user-types
export async function GET() {
  try {
    const userTypes = await db.userType.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            UserTypesOnTools: true,
          },
        },
      },
    });

    return NextResponse.json(userTypes);
  } catch (error) {
    console.error('Erreur lors de la récupération des types d\'utilisateurs:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des types d\'utilisateurs' },
      { status: 500 }
    );
  }
}

// POST /api/user-types
export async function POST(req: NextRequest) {
  try {
    // Récupérer les données de la requête
    const data = await req.json();
    
    // Valider les données
    const validation = userTypeSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validation.error.format() },
        { status: 400 }
      );
    }

    // Générer le slug à partir du nom
    const slug = slugify(data.name, { lower: true });

    // Vérifier si un type d'utilisateur avec ce slug existe déjà
    const existingUserType = await db.userType.findUnique({
      where: { slug },
    });

    if (existingUserType) {
      return NextResponse.json(
        { message: 'Un type d\'utilisateur avec ce nom existe déjà' },
        { status: 409 }
      );
    }

    // Créer le type d'utilisateur
    const userType = await db.userType.create({
      data: {
        name: data.name,
        slug,
        description: data.description || '',
        seoTitle: data.seoTitle || null,
        metaDescription: data.metaDescription || null,
      },
    });

    return NextResponse.json(userType, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du type d\'utilisateur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du type d\'utilisateur' },
      { status: 500 }
    );
  }
} 
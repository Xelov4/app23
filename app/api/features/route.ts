import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import slugify from 'slugify';

// Schéma de validation pour la création de fonctionnalités
const featureSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
});

// GET /api/features
export async function GET() {
  try {
    const features = await db.feature.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            FeaturesOnTools: true,
          },
        },
      },
    });

    return NextResponse.json(features);
  } catch (error) {
    console.error('Erreur lors de la récupération des fonctionnalités:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des fonctionnalités' },
      { status: 500 }
    );
  }
}

// POST /api/features
export async function POST(req: NextRequest) {
  try {
    // Récupérer les données de la requête
    const data = await req.json();
    
    // Valider les données
    const validation = featureSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validation.error.format() },
        { status: 400 }
      );
    }

    // Générer le slug à partir du nom
    const slug = slugify(data.name, { lower: true });

    // Vérifier si une fonctionnalité avec ce slug existe déjà
    const existingFeature = await db.feature.findUnique({
      where: { slug },
    });

    if (existingFeature) {
      return NextResponse.json(
        { message: 'Une fonctionnalité avec ce nom existe déjà' },
        { status: 409 }
      );
    }

    // Créer la fonctionnalité
    const feature = await db.feature.create({
      data: {
        name: data.name,
        slug,
        description: data.description || '',
      },
    });

    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la fonctionnalité:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la fonctionnalité' },
      { status: 500 }
    );
  }
} 
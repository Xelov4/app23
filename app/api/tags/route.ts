import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { z } from 'zod';
import { slugify } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Schéma de validation pour les tags
const tagSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  description: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

// GET /api/tags - Récupère tous les tags
export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les tags avec le compte d'outils associés
    const tags = await db.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { TagsOnTools: true },
        },
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Erreur lors de la récupération des tags:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des tags' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Crée un nouveau tag
export async function POST(request: NextRequest) {
  try {
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
    const validationResult = tagSchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { name, description, seoTitle, metaDescription } = validationResult.data;
    const slug = slugify(name);
    
    // Vérifier si un tag avec ce slug existe déjà
    const existingTag = await db.tag.findUnique({
      where: { slug },
    });
    
    if (existingTag) {
      return NextResponse.json(
        { error: `Un tag avec le nom "${name}" existe déjà` },
        { status: 409 }
      );
    }
    
    // Créer le nouveau tag
    const newTag = await db.tag.create({
      data: {
        name,
        slug,
        description,
        seoTitle,
        metaDescription,
      },
    });
    
    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du tag:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du tag' },
      { status: 500 }
    );
  }
} 
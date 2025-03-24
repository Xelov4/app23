import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";

// GET /api/tools - Récupère tous les outils
export async function GET(request: NextRequest) {
  try {
    const tools = await db.tool.findMany({
      include: {
        CategoriesOnTools: {
          include: {
            Category: true
          }
        },
        TagsOnTools: {
          include: {
            Tag: true
          }
        }
      }
    });

    // Formater les résultats
    const formattedTools = tools.map((tool: any) => ({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      logoUrl: tool.logoUrl,
      imageUrl: tool.imageUrl,
      websiteUrl: tool.websiteUrl,
      pricingType: tool.pricingType,
      pricingDetails: tool.pricingDetails,
      features: tool.features,
      category: tool.CategoriesOnTools[0]?.Category.name || "Non catégorisé",
      categoryId: tool.CategoriesOnTools[0]?.categoryId
    }));

    return NextResponse.json(formattedTools);
  } catch (error) {
    console.error('Erreur lors de la récupération des outils:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des outils' },
      { status: 500 }
    );
  }
}

// POST /api/tools - Crée un nouvel outil
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      slug, 
      description, 
      logoUrl, 
      imageUrl, 
      websiteUrl, 
      pricingType, 
      pricingDetails, 
      features, 
      categoryId 
    } = body;

    // Vérification si un outil avec ce slug existe déjà
    const existingTool = await db.tool.findUnique({
      where: { slug }
    });

    if (existingTool) {
      return NextResponse.json(
        { message: 'Un outil avec ce slug existe déjà' },
        { status: 400 }
      );
    }

    // Vérification si la catégorie existe
    const categoryExists = await db.category.findUnique({
      where: { id: categoryId }
    });

    if (!categoryExists) {
      return NextResponse.json(
        { message: 'La catégorie spécifiée n\'existe pas' },
        { status: 400 }
      );
    }

    // Création de l'outil avec association de catégorie
    const newTool = await db.tool.create({
      data: {
        name,
        slug,
        description,
        logoUrl: logoUrl || null,
        imageUrl: imageUrl || null,
        websiteUrl: websiteUrl || null,
        pricingType: pricingType || 'FREE',
        pricingDetails: pricingDetails || null,
        features: features || [],
        CategoriesOnTools: {
          create: {
            categoryId
          }
        }
      }
    });

    return NextResponse.json(newTool, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'outil:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de l\'outil' },
      { status: 500 }
    );
  }
} 
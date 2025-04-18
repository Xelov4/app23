import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";

// GET /api/tools - Récupère tous les outils
export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les outils depuis la base de données
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
        },
        Review: true,
        _count: {
          select: {
            Review: true,
          },
        },
      }
    });

    // Formater les résultats
    const formattedTools = tools.map((tool: any) => {
      // Calculer la note moyenne
      const rating = tool.Review && tool.Review.length > 0
        ? tool.Review.reduce((acc, review) => acc + review.rating, 0) / tool.Review.length
        : 0;

      return {
        id: tool.id,
        name: tool.name,
        slug: tool.slug,
        description: tool.description,
        logoUrl: tool.logoUrl,
        websiteUrl: tool.websiteUrl,
        pricingType: tool.pricingType,
        pricingDetails: tool.pricingDetails,
        features: tool.features,
        isActive: tool.isActive,
        httpCode: tool.httpCode || null,
        httpChain: tool.httpChain || null,
        twitterUrl: tool.twitterUrl || null,
        instagramUrl: tool.instagramUrl || null,
        facebookUrl: tool.facebookUrl || null,
        linkedinUrl: tool.linkedinUrl || null,
        githubUrl: tool.githubUrl || null,
        category: tool.CategoriesOnTools[0]?.Category.name || "Non catégorisé",
        categoryId: tool.CategoriesOnTools[0]?.categoryId,
        categories: tool.CategoriesOnTools.map((c: any) => ({
          id: c.categoryId,
          name: c.Category.name,
          slug: c.Category.slug
        })),
        tags: tool.TagsOnTools.map((t: any) => ({
          id: t.tagId,
          name: t.Tag.name,
          slug: t.Tag.slug
        })),
        rating,
        reviewCount: tool._count.Review,
        createdAt: tool.createdAt,
        updatedAt: tool.updatedAt
      };
    });

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
      categoryId,
      twitterUrl,
      instagramUrl,
      facebookUrl,
      linkedinUrl,
      githubUrl
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
        features: JSON.stringify(features || []),
        twitterUrl: twitterUrl || null,
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
        linkedinUrl: linkedinUrl || null,
        githubUrl: githubUrl || null,
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
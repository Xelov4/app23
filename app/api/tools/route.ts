import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tools = await db.tool.findMany({
      include: {
        CategoriesOnTools: {
          include: {
            Category: true
          }
        }
      }
    });

    // Transformer les données pour l'API
    const transformedTools = tools.map(tool => ({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      logoUrl: tool.logoUrl,
      websiteUrl: tool.websiteUrl,
      pricingType: tool.pricingType,
      pricingDetails: tool.pricingDetails,
      features: tool.features,
      category: tool.CategoriesOnTools[0]?.Category.name || "Non catégorisé",
      categoryId: tool.CategoriesOnTools[0]?.categoryId,
      createdAt: tool.createdAt,
      updatedAt: tool.updatedAt
    }));

    return NextResponse.json(transformedTools);
  } catch (error) {
    console.error("Erreur lors de la récupération des outils:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les outils" },
      { status: 500 }
    );
  }
} 
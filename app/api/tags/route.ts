import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tags = await db.tag.findMany({
      include: {
        _count: {
          select: {
            TagsOnTools: true
          }
        }
      }
    });

    // Transformer les données pour l'API
    const transformedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      toolCount: tag._count.TagsOnTools,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt
    }));

    return NextResponse.json(transformedTags);
  } catch (error) {
    console.error("Erreur lors de la récupération des tags:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les tags" },
      { status: 500 }
    );
  }
} 
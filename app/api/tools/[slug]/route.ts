import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/tools/[slug]
export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const slug = params.slug;
    
    const tool = await db.tool.findUnique({
      where: { slug },
      include: {
        CategoriesOnTools: {
          include: {
            Category: true,
          },
        },
        TagsOnTools: {
          include: {
            Tag: true,
          },
        },
      },
    });

    if (!tool) {
      return NextResponse.json(
        { error: "Outil non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      logoUrl: tool.logoUrl,
      websiteUrl: tool.websiteUrl,
      pricingType: tool.pricingType,
      pricingDetails: tool.pricingDetails,
      features: typeof tool.features === 'string' ? JSON.parse(tool.features) : tool.features,
      httpCode: tool.httpCode,
      categories: tool.CategoriesOnTools.map(ct => ({
        id: ct.Category.id,
        name: ct.Category.name
      })),
      tags: tool.TagsOnTools.map(tt => ({
        id: tt.Tag.id,
        name: tt.Tag.name
      }))
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'outil:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/tools/[slug]
export async function PUT(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const slug = params.slug;
    const data = await request.json();
    
    console.log('Mise à jour de l\'outil:', slug, data);
    
    // Vérifier si l'outil existe
    const existingTool = await db.tool.findUnique({
      where: { slug },
    });

    if (!existingTool) {
      return NextResponse.json(
        { error: "Outil non trouvé" },
        { status: 404 }
      );
    }

    // Créer un objet avec uniquement les champs fournis
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl;
    if (data.pricingType !== undefined) updateData.pricingType = data.pricingType;
    if (data.pricingDetails !== undefined) updateData.pricingDetails = data.pricingDetails;
    if (data.features !== undefined) {
      updateData.features = Array.isArray(data.features) ? JSON.stringify(data.features) : data.features;
    }
    if (data.httpCode !== undefined) updateData.httpCode = data.httpCode;

    console.log('Données de mise à jour:', updateData);

    // Mettre à jour l'outil avec uniquement les champs fournis
    const updatedTool = await db.tool.update({
      where: { id: existingTool.id },
      data: updateData,
    });

    console.log('Outil mis à jour avec succès:', updatedTool);

    return NextResponse.json(updatedTool);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'outil:", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour l'outil" },
      { status: 500 }
    );
  }
}

// DELETE /api/tools/[slug]
export async function DELETE(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const slug = params.slug;
    
    // Vérifier si l'outil existe
    const existingTool = await db.tool.findUnique({
      where: { slug },
    });

    if (!existingTool) {
      return NextResponse.json(
        { error: "Outil non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer les relations d'abord
    await db.categoriesOnTools.deleteMany({
      where: { toolId: existingTool.id },
    });

    await db.tagsOnTools.deleteMany({
      where: { toolId: existingTool.id },
    });

    // Puis supprimer l'outil
    await db.tool.delete({
      where: { id: existingTool.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'outil:", error);
    return NextResponse.json(
      { error: "Impossible de supprimer l'outil" },
      { status: 500 }
    );
  }
} 
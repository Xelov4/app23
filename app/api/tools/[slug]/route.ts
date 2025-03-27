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
      twitterUrl: tool.twitterUrl,
      instagramUrl: tool.instagramUrl,
      facebookUrl: tool.facebookUrl,
      linkedinUrl: tool.linkedinUrl,
      githubUrl: tool.githubUrl,
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
    
    // Gestion améliorée des features
    if (data.features !== undefined) {
      // Si c'est déjà une chaîne, la conserver
      if (typeof data.features === 'string') {
        // Si la chaîne contient des caractères ';', on la traite comme une liste de fonctionnalités
        if (data.features.includes(';')) {
          // Convertir en tableau puis en JSON
          const featuresArray = data.features.split(';').map(item => item.trim()).filter(item => item);
          updateData.features = JSON.stringify(featuresArray);
        } else {
          // Sinon, on vérifie si c'est déjà un JSON valide
          try {
            JSON.parse(data.features);
            // Si pas d'erreur, c'est un JSON valide, on le garde tel quel
            updateData.features = data.features;
          } catch (e) {
            // Ce n'est pas un JSON valide, on le convertit en tableau d'un seul élément
            updateData.features = JSON.stringify([data.features]);
          }
        }
      } else if (Array.isArray(data.features)) {
        // Si c'est un tableau, le convertir en JSON
        updateData.features = JSON.stringify(data.features);
      } else {
        // Fallback: si c'est autre chose, essayez de le transformer en chaîne
        updateData.features = JSON.stringify([String(data.features)]);
      }
    }
    
    if (data.httpCode !== undefined) updateData.httpCode = data.httpCode;
    if (data.twitterUrl !== undefined) updateData.twitterUrl = data.twitterUrl;
    if (data.instagramUrl !== undefined) updateData.instagramUrl = data.instagramUrl;
    if (data.facebookUrl !== undefined) updateData.facebookUrl = data.facebookUrl;
    if (data.linkedinUrl !== undefined) updateData.linkedinUrl = data.linkedinUrl;
    if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl;

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
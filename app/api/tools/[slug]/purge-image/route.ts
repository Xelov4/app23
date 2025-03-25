import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import * as fs from 'fs';
import * as path from 'path';

// POST /api/tools/[slug]/purge-image
export async function POST(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
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
    
    // Vérifier si l'outil a une image
    if (!existingTool.logoUrl) {
      return NextResponse.json(
        { error: "Cet outil n'a pas d'image à purger" },
        { status: 400 }
      );
    }
    
    // Chemin de l'image à supprimer
    const imagePath = path.join(process.cwd(), 'public', existingTool.logoUrl);
    
    // Supprimer le fichier physique
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`Image supprimée: ${imagePath}`);
      } else {
        console.log(`Le fichier n'existe pas: ${imagePath}`);
      }
    } catch (fileError) {
      console.error("Erreur lors de la suppression du fichier:", fileError);
      // On continue même si le fichier ne peut pas être supprimé
    }
    
    // Mettre à jour la base de données
    const updatedTool = await db.tool.update({
      where: { id: existingTool.id },
      data: { 
        logoUrl: '' 
      },
    });
    
    console.log('Image purgée pour l\'outil:', updatedTool.name);
    
    return NextResponse.json({ 
      success: true,
      message: "Image purgée avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la purge de l'image:", error);
    return NextResponse.json(
      { error: "Impossible de purger l'image" },
      { status: 500 }
    );
  }
} 